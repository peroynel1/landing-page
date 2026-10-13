#!/usr/bin/env node
/**
 * Find Reddit threads that fit Vlyt Comment A / B (quoting, WhatsApp, invoices).
 * Uses a Reddit "script" app + password grant (local .env only).
 *
 * Setup: see content/REDDIT.md → "Reddit API app"
 *
 * Usage:
 *   node --env-file=.env scripts/ops-reddit-find.mjs
 *   npm run ops:reddit-find
 *   npm run ops:reddit-find -- --new
 *   npm run ops:reddit-find -- --sub smallbusiness --limit 15
 */
import process from 'node:process';

const USER_AGENT =
  process.env.REDDIT_USER_AGENT?.trim() ||
  `windows:vlyt-ops:1.0.0 (by /u/${process.env.REDDIT_USERNAME || 'unknown'})`;

const DEFAULT_SUBS = [
  'smallbusiness',
  'SweatyStartup',
  'askSouthAfrica',
  'freelance',
  'southafrica',
];

const DEFAULT_QUERY =
  'quote OR quoting OR whatsapp OR invoice OR estimate OR spreadsheet OR "price list"';

function parseArgs(argv) {
  const out = {
    subs: DEFAULT_SUBS,
    query: DEFAULT_QUERY,
    limit: 8,
    t: 'month',
    sort: 'new',
    scanNew: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--new') out.scanNew = true;
    else if (a === '--sub') out.subs = [argv[++i]];
    else if (a === '--subs') out.subs = argv[++i].split(',').map((s) => s.trim()).filter(Boolean);
    else if (a === '--query') out.query = argv[++i];
    else if (a === '--limit') out.limit = Number(argv[++i]) || 8;
    else if (a === '--t') out.t = argv[++i];
    else if (a === '--sort') out.sort = argv[++i];
  }
  return out;
}

function requireEnv(name) {
  const v = process.env[name]?.trim();
  if (!v) {
    console.error(`Missing ${name}. Copy .env.example → .env and fill Reddit app credentials.`);
    console.error('Create the app: https://www.reddit.com/prefs/apps → "create another app" → script');
    process.exit(1);
  }
  return v;
}

async function getAccessToken() {
  const clientId = requireEnv('REDDIT_CLIENT_ID');
  const clientSecret = requireEnv('REDDIT_CLIENT_SECRET');
  const username = requireEnv('REDDIT_USERNAME');
  const password = requireEnv('REDDIT_PASSWORD');

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const body = new URLSearchParams({
    grant_type: 'password',
    username,
    password,
  });

  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': USER_AGENT,
    },
    body,
  });

  const text = await res.text();
  if (!res.ok) {
    console.error(`Token request failed (${res.status}): ${text}`);
    if (res.status === 401) {
      console.error('Check client id/secret, username/password. If 2FA is on, use an app password.');
    }
    process.exit(1);
  }

  const data = JSON.parse(text);
  if (!data.access_token) {
    console.error('No access_token in response:', data);
    process.exit(1);
  }
  return data.access_token;
}

async function oauthGet(token, pathAndQuery) {
  const res = await fetch(`https://oauth.reddit.com${pathAndQuery}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': USER_AGENT,
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`GET ${pathAndQuery} → ${res.status}: ${text.slice(0, 300)}`);
  }
  return JSON.parse(text);
}

function keywordScore(title, selftext) {
  const hay = `${title}\n${selftext}`.toLowerCase();
  const weights = [
    [/whatsapp/, 5],
    [/\bquot(e|ing|es)\b/, 4],
    [/\bestimat(e|es|ing)\b/, 3],
    [/\binvoice/, 3],
    [/spreadsheet|excel/, 2],
    [/price list|catalog|pricelist/, 2],
    [/contractor|trad(ie|e)|plumber|electrician|handyman/, 2],
    [/jobber|freshbooks|quickbooks/, 1],
  ];
  let score = 0;
  const hits = [];
  for (const [re, w] of weights) {
    if (re.test(hay)) {
      score += w;
      hits.push(re.source);
    }
  }
  return { score, hits };
}

function formatPost(p, meta) {
  const created = new Date(p.created_utc * 1000).toISOString().slice(0, 10);
  const url = `https://www.reddit.com${p.permalink}`;
  const blurb = (p.selftext || '').replace(/\s+/g, ' ').trim().slice(0, 140);
  return [
    `### ${p.title}`,
    `- **Sub:** r/${p.subreddit} · **${created}** · score ${p.score} · comments ${p.num_comments}`,
    `- **Fit score:** ${meta.score}${meta.hits.length ? ` (${meta.hits.join(', ')})` : ''}`,
    `- **URL:** ${url}`,
    blurb ? `- **Snippet:** ${blurb}${p.selftext && p.selftext.length > 140 ? '…' : ''}` : '',
    meta.score >= 5
      ? '- **Suggest:** Comment A (no link). Comment B only if clearly about WhatsApp/prices.'
      : meta.score >= 3
        ? '- **Suggest:** Comment A if still on-topic; skip if tool-spam thread.'
        : '- **Suggest:** skim only — weak fit.',
    '',
  ]
    .filter(Boolean)
    .join('\n');
}

async function searchSub(token, sub, args) {
  const q = encodeURIComponent(args.query);
  const path = `/r/${sub}/search?q=${q}&restrict_sr=true&sort=${args.sort}&t=${args.t}&limit=${args.limit}&raw_json=1`;
  const data = await oauthGet(token, path);
  return (data.data?.children || []).map((c) => c.data);
}

async function newSub(token, sub, limit) {
  const data = await oauthGet(token, `/r/${sub}/new?limit=${limit}&raw_json=1`);
  return (data.data?.children || []).map((c) => c.data);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const token = await getAccessToken();

  /** @type {Map<string, { post: any, meta: { score: number, hits: string[] } }>} */
  const byId = new Map();

  for (const sub of args.subs) {
    try {
      const posts = args.scanNew
        ? await newSub(token, sub, args.limit)
        : await searchSub(token, sub, args);
      for (const p of posts) {
        if (!p?.id || p.locked || p.archived) continue;
        const meta = keywordScore(p.title || '', p.selftext || '');
        if (args.scanNew && meta.score < 2) continue;
        const prev = byId.get(p.id);
        if (!prev || meta.score > prev.meta.score) {
          byId.set(p.id, { post: p, meta });
        }
      }
    } catch (err) {
      console.error(`r/${sub}: ${err.message || err}`);
    }
  }

  const ranked = [...byId.values()].sort((a, b) => {
    if (b.meta.score !== a.meta.score) return b.meta.score - a.meta.score;
    return b.post.created_utc - a.post.created_utc;
  });

  const top = ranked.slice(0, 12);
  if (top.length === 0) {
    console.log('No matching threads. Try --new, --t year, or a broader --query.');
    process.exit(0);
  }

  console.log(
    `# Reddit finds (${args.scanNew ? 'New scan' : `search sort=${args.sort} t=${args.t}`})\n`,
  );
  console.log(`Subs: ${args.subs.map((s) => `r/${s}`).join(', ')}`);
  if (!args.scanNew) console.log(`Query: ${args.query}\n`);
  else console.log('Filter: keyword score ≥ 2 on New\n');

  for (const row of top) {
    console.log(formatPost(row.post, row.meta));
  }

  console.log('---');
  console.log('Cap: ≤2 comments today. Prefer Comment A (no link). Log URLs in OUTREACH.md.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
