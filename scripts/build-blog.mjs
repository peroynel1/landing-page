/**
 * Reads content/blog/*.md and content/resources/*.md, writes HTML into blog/
 * and resources/, and regenerates public/sitemap.xml + public/llms.txt.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { marked } from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const SITE = 'https://vlyt.app';

marked.setOptions({ gfm: true, breaks: false });

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function clearHtmlDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      const indexPath = path.join(full, 'index.html');
      if (fs.existsSync(indexPath)) fs.unlinkSync(indexPath);
      try {
        fs.rmdirSync(full);
      } catch {
        /* not empty */
      }
    } else if (name.endsWith('.html') && name !== 'index.html') {
      fs.unlinkSync(full);
    }
  }
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function formatDate(value) {
  if (!value) return undefined;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return s;
}

function loadMarkdownCollection(relDir) {
  const dir = path.join(root, relDir);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8');
      const { data, content } = matter(raw);
      if (data.draft) return null;
      const slug = data.slug || file.replace(/\.md$/, '');
      const date = formatDate(data.date) || '2026-09-29';
      return {
        ...data,
        slug,
        date,
        updated: formatDate(data.updated) || date,
        file,
        bodyHtml: marked.parse(content),
        faqs: Array.isArray(data.faq) ? data.faq : [],
        related: Array.isArray(data.related) ? data.related : [],
      };
    })
    .filter(Boolean)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

function layoutShell({ title, description, canonical, ogType, jsonLd, body, scriptSrc }) {
  const ld = jsonLd ? `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n    </script>` : '';
  return `<!doctype html>
<html lang="en-ZA">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${canonical}" />
    <link rel="icon" type="image/svg+xml" href="/images/favicon.svg" />
    <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32.png" />
    <link rel="icon" type="image/png" sizes="512x512" href="/images/favicon.png" />
    <link rel="apple-touch-icon" href="/images/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <meta name="theme-color" content="#3ee8a0" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${SITE}/images/og-image.png" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:site_name" content="Vlyt" />
    <meta property="og:locale" content="en_ZA" />
    <meta property="og:type" content="${ogType}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${SITE}/images/og-image.png" />
    ${ld}
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Syne:wght@700;800&display=swap"
      rel="stylesheet"
    />
  </head>
  <body class="site-bg text-ink font-sans antialiased">
${body}
    <script>
      document.getElementById('y') && (document.getElementById('y').textContent = String(new Date().getFullYear()));
    </script>
    <script type="module" src="${scriptSrc}"></script>
  </body>
</html>
`;
}

function siteHeader(active = '') {
  const blogActive = active === 'blog' ? ' text-ink' : '';
  return `    <header class="border-b border-white/10">
      <div class="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-4">
        <a href="/" class="wordmark" aria-label="Vlyt home">
          <span class="wordmark-pu">Vlyt</span>
        </a>
        <nav class="flex flex-wrap items-center gap-4 text-sm text-ink-muted">
          <a href="/blog/" class="hover:text-ink${blogActive}">Blog</a>
          <a href="/#features" class="hover:text-ink">Features</a>
          <a href="/#faq" class="hover:text-ink">Support</a>
          <a data-play href="#" class="play-btn play-btn-sm">Get the app</a>
        </nav>
      </div>
    </header>`;
}

function siteFooter() {
  return `    <footer class="border-t border-white/10">
      <div class="mx-auto flex max-w-3xl flex-col gap-4 px-5 py-8 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© <span id="y"></span> Vlyt</p>
        <nav class="flex flex-wrap gap-5">
          <a href="/blog/" class="hover:text-ink">Blog</a>
          <a href="/resources/sa-quoting-checklist/" class="hover:text-ink">Quoting checklist</a>
          <a href="/privacy/" class="hover:text-ink">Privacy</a>
          <a href="/terms/" class="hover:text-ink">Terms</a>
        </nav>
      </div>
    </footer>`;
}

function renderPost(post, allPosts) {
  const url = `${SITE}/blog/${post.slug}/`;
  const related = post.related
    .map((slug) => allPosts.find((p) => p.slug === slug))
    .filter(Boolean);

  const relatedHtml =
    related.length > 0
      ? `<aside class="mt-14 border-t border-white/10 pt-10">
          <h2 class="font-display text-2xl text-ink">Keep reading</h2>
          <ul class="mt-4 space-y-3">
            ${related
              .map(
                (r) =>
                  `<li><a class="text-accent underline" href="/blog/${r.slug}/">${escapeHtml(r.title)}</a>
                  <p class="mt-1 text-sm text-ink-muted">${escapeHtml(r.description)}</p></li>`,
              )
              .join('\n')}
          </ul>
        </aside>`
      : '';

  const faqHtml =
    post.faqs.length > 0
      ? `<section class="mt-14 border-t border-white/10 pt-10" id="faq">
          <h2 class="font-display text-2xl text-ink">FAQ</h2>
          <div class="mt-6 divide-y divide-white/10 border-y border-white/10">
            ${post.faqs
              .map(
                (f) => `<details class="faq py-5">
              <summary class="cursor-pointer font-medium text-ink">${escapeHtml(f.q)}</summary>
              <p class="mt-3 text-sm text-ink-muted">${escapeHtml(f.a)}</p>
            </details>`,
              )
              .join('\n')}
          </div>
        </section>`
      : '';

  const graph = [
    {
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.updated || post.date,
      mainEntityOfPage: url,
      author: { '@type': 'Organization', name: 'Vlyt', url: SITE },
      publisher: {
        '@type': 'Organization',
        name: 'Vlyt',
        logo: { '@type': 'ImageObject', url: `${SITE}/images/favicon.png` },
      },
      keywords: post.keyword || undefined,
      inLanguage: 'en-ZA',
    },
  ];
  if (post.faqs.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: post.faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }

  const body = `${siteHeader('blog')}
    <main class="mx-auto max-w-3xl px-5 py-16">
      <p class="eyebrow">Vlyt Learn</p>
      <h1 class="mt-4 font-display text-4xl tracking-tight text-ink md:text-5xl">${escapeHtml(post.title)}</h1>
      <p class="mt-4 text-lg text-ink-muted">${escapeHtml(post.description)}</p>
      <p class="mt-3 text-sm text-ink-faint">
        <time datetime="${escapeHtml(post.date)}">${escapeHtml(post.date)}</time>
        ${post.keyword ? ` · Targeting: ${escapeHtml(post.keyword)}` : ''}
      </p>
      <article class="prose mt-10">
        ${post.bodyHtml}
      </article>
      ${faqHtml}
      ${relatedHtml}
      <section class="mt-14 rounded-[13px] border border-white/10 bg-white/[0.03] p-8 text-center">
        <h2 class="font-display text-2xl text-ink">Run quotes from your pocket</h2>
        <p class="mt-3 text-sm text-ink-muted">Vlyt is free while we grow — catalog, stock, VAT-aware quotes and cashflow on Android.</p>
        <a data-play href="#" class="play-btn mt-6">Get it on Google Play</a>
      </section>
    </main>
${siteFooter()}`;

  return layoutShell({
    title: `${post.title} — Vlyt`,
    description: post.description,
    canonical: url,
    ogType: 'article',
    jsonLd: { '@context': 'https://schema.org', '@graph': graph },
    body,
    scriptSrc: '/src/main.ts',
  });
}

function renderBlogIndex(posts) {
  const list = posts
    .map(
      (p) => `<li class="border-b border-white/10 py-8">
        <p class="text-xs uppercase tracking-widest text-ink-faint">${escapeHtml(p.role || 'guide')} · <time datetime="${escapeHtml(p.date)}">${escapeHtml(p.date)}</time></p>
        <h2 class="mt-2 font-display text-2xl text-ink">
          <a class="hover:text-accent" href="/blog/${p.slug}/">${escapeHtml(p.title)}</a>
        </h2>
        <p class="mt-2 text-ink-muted">${escapeHtml(p.description)}</p>
        <a class="mt-3 inline-block text-sm text-accent underline" href="/blog/${p.slug}/">Read article</a>
      </li>`,
    )
    .join('\n');

  const body = `${siteHeader('blog')}
    <main class="mx-auto max-w-3xl px-5 py-16">
      <p class="eyebrow">Vlyt Learn</p>
      <h1 class="mt-4 font-display text-4xl tracking-tight md:text-5xl">Guides for SA quote-based businesses</h1>
      <p class="mt-4 text-lg text-ink-muted">
        Practical writing on quotes, WhatsApp selling, VAT, stock and cashflow — written for solo operators who work from a phone.
      </p>
      <ul class="mt-10 list-none p-0">${list}</ul>
    </main>
${siteFooter()}`;

  return layoutShell({
    title: 'Blog — Vlyt Learn',
    description:
      'Guides for South African solo operators: quotes, WhatsApp selling, VAT, stock tracking and cashflow.',
    canonical: `${SITE}/blog/`,
    ogType: 'website',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Vlyt Learn',
      url: `${SITE}/blog/`,
      publisher: { '@type': 'Organization', name: 'Vlyt', url: SITE },
    },
    body,
    scriptSrc: '/src/main.ts',
  });
}

function renderResource(page) {
  const url = `${SITE}/resources/${page.slug}/`;
  const body = `${siteHeader()}
    <main class="mx-auto max-w-3xl px-5 py-16">
      <p class="eyebrow">Free resource</p>
      <h1 class="mt-4 font-display text-4xl tracking-tight md:text-5xl">${escapeHtml(page.title)}</h1>
      <p class="mt-4 text-lg text-ink-muted">${escapeHtml(page.description)}</p>
      <article class="prose mt-10">${page.bodyHtml}</article>
      <section class="mt-14 rounded-[13px] border border-white/10 bg-white/[0.03] p-8 text-center">
        <h2 class="font-display text-2xl text-ink">Prefer this on your phone?</h2>
        <p class="mt-3 text-sm text-ink-muted">Vlyt turns the checklist into a live catalog, quote and stock loop.</p>
        <a data-play href="#" class="play-btn mt-6">Get it on Google Play</a>
      </section>
    </main>
${siteFooter()}`;

  return layoutShell({
    title: `${page.title} — Vlyt`,
    description: page.description,
    canonical: url,
    ogType: 'article',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: page.title,
      description: page.description,
      url,
      isPartOf: { '@type': 'WebSite', url: SITE, name: 'Vlyt' },
    },
    body,
    scriptSrc: '/src/main.ts',
  });
}

function writeSitemap(posts, resources) {
  const staticUrls = [
    { loc: `${SITE}/`, changefreq: 'weekly', priority: '1.0' },
    { loc: `${SITE}/blog/`, changefreq: 'weekly', priority: '0.9' },
    { loc: `${SITE}/privacy/`, changefreq: 'yearly', priority: '0.3' },
    { loc: `${SITE}/terms/`, changefreq: 'yearly', priority: '0.3' },
  ];
  for (const r of resources) {
    staticUrls.push({
      loc: `${SITE}/resources/${r.slug}/`,
      changefreq: 'monthly',
      priority: '0.7',
      lastmod: formatDate(r.date),
    });
  }
  for (const p of posts) {
    staticUrls.push({
      loc: `${SITE}/blog/${p.slug}/`,
      changefreq: 'monthly',
      priority: p.role === 'pillar' ? '0.9' : '0.8',
      lastmod: formatDate(p.updated || p.date),
    });
  }

  const body = staticUrls
    .map((u) => {
      const last = u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : '';
      return `  <url>
    <loc>${u.loc}</loc>${last}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
  fs.writeFileSync(path.join(root, 'public', 'sitemap.xml'), xml, 'utf8');
}

function writeLlmsTxt(posts, resources) {
  const lines = [
    '# Vlyt',
    '',
    '> Mobile business app for South African solo operators: quotes with VAT in ZAR, catalog, stock, expenses and cashflow.',
    '',
    `Site: ${SITE}/`,
    `Blog: ${SITE}/blog/`,
    '',
    '## Primary pages',
    '',
    `- [Home](${SITE}/): Product overview`,
    `- [Blog index](${SITE}/blog/): All guides`,
    ...resources.map((r) => `- [${r.title}](${SITE}/resources/${r.slug}/)`),
    '',
    '## Guides',
    '',
    ...posts.map((p) => `- [${p.title}](${SITE}/blog/${p.slug}/): ${p.description}`),
    '',
  ];
  fs.writeFileSync(path.join(root, 'public', 'llms.txt'), lines.join('\n'), 'utf8');
}

function writeRobots() {
  const robots = `User-agent: *
Allow: /
Disallow: /order/

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Bytespider
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;
  fs.writeFileSync(path.join(root, 'public', 'robots.txt'), robots, 'utf8');
}

const posts = loadMarkdownCollection('content/blog');
const resources = loadMarkdownCollection('content/resources');

const blogDir = path.join(root, 'blog');
const resourcesDir = path.join(root, 'resources');
ensureDir(blogDir);
ensureDir(resourcesDir);
clearHtmlDir(blogDir);
clearHtmlDir(resourcesDir);

fs.writeFileSync(path.join(blogDir, 'index.html'), renderBlogIndex(posts), 'utf8');
for (const post of posts) {
  const postDir = path.join(blogDir, post.slug);
  ensureDir(postDir);
  fs.writeFileSync(path.join(postDir, 'index.html'), renderPost(post, posts), 'utf8');
}
for (const page of resources) {
  const pageDir = path.join(resourcesDir, page.slug);
  ensureDir(pageDir);
  fs.writeFileSync(path.join(pageDir, 'index.html'), renderResource(page), 'utf8');
}

writeSitemap(posts, resources);
writeLlmsTxt(posts, resources);
writeRobots();

console.log(
  `Built ${posts.length} blog posts, ${resources.length} resources, sitemap + robots + llms.txt`,
);
