#!/usr/bin/env node
/**
 * Persist a task completion into content/ops/schedule.json and append an
 * OUTREACH.md owned-distribution row.
 *
 * Usage:
 *   npm run ops:complete -- --id li-post-4 --url https://linkedin.com/...
 *   npm run ops:complete -- --id wa-tip-1 --status skipped
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schedulePath = path.join(root, 'content/ops/schedule.json');
const outreachPath = path.join(root, 'content/OUTREACH.md');

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseArgs(argv) {
  const out = { id: null, url: null, status: 'done' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--id') out.id = argv[++i];
    else if (a === '--url') out.url = argv[++i];
    else if (a === '--status') out.status = argv[++i];
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
if (!args.id) {
  console.error('Usage: npm run ops:complete -- --id <task-id> [--url <post-url>] [--status done|skipped]');
  process.exit(1);
}

const schedule = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));
const task = schedule.tasks.find((t) => t.id === args.id);
if (!task) {
  console.error(`Unknown task id: ${args.id}`);
  process.exit(1);
}

const date = todayISO();
task.status = args.status === 'skipped' ? 'skipped' : 'done';
task.doneAt = date;
if (args.url) task.postUrl = args.url;
schedule.updated = date;

fs.writeFileSync(schedulePath, JSON.stringify(schedule, null, 2) + '\n');

const source = task.sourceSlug ?? '—';
const url = task.postUrl ?? '';
const row = `| ${date} | ${task.platform} | ${source} | ${url} | ${task.status} |`;

let outreach = fs.readFileSync(outreachPath, 'utf8');
const marker = '## Owned distribution log';
const idx = outreach.indexOf(marker);
if (idx === -1) {
  console.warn('OUTREACH.md missing owned distribution section; schedule updated only.');
} else {
  // Append after the table header block: find last table row under that section
  const after = outreach.slice(idx);
  const nextH2 = after.indexOf('\n## ', marker.length);
  const section = nextH2 === -1 ? after : after.slice(0, nextH2);
  const sectionEnd = idx + section.length;
  if (!section.includes(row)) {
    const insertAt = sectionEnd;
    const needsNewline = outreach[insertAt - 1] === '\n' ? '' : '\n';
    outreach =
      outreach.slice(0, insertAt) + needsNewline + row + '\n' + outreach.slice(insertAt);
    fs.writeFileSync(outreachPath, outreach);
  }
}

console.log(`Updated ${path.relative(root, schedulePath)}`);
console.log(row);
