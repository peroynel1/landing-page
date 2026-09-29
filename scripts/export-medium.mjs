/**
 * Builds paste-ready Medium drafts from content/blog/*.md into content/medium/.
 * Absolute vlyt.app links + canonical intro so Medium points SEO credit home.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://vlyt.app';
const blogDir = path.join(root, 'content', 'blog');
const outDir = path.join(root, 'content', 'medium');

function absify(md) {
  return String(md)
    .replace(/\]\((\/[^)]+)\)/g, (_m, p) => `](${SITE}${p})`)
    .replace(/src="(\/[^"]+)"/g, (_m, p) => `src="${SITE}${p}"`)
    .replace(/!\[([^\]]*)\]\((\/[^)]+)\)/g, (_m, alt, p) => `![${alt}](${SITE}${p})`);
}

function faqBlock(faq) {
  if (!Array.isArray(faq) || faq.length === 0) return '';
  const items = faq
    .map((item) => `### ${item.q}\n\n${item.a}`)
    .join('\n\n');
  return `\n\n## FAQ\n\n${items}`;
}

fs.mkdirSync(outDir, { recursive: true });

const files = fs.readdirSync(blogDir).filter((f) => f.endsWith('.md')).sort();
const indexRows = [];

for (const name of files) {
  const raw = fs.readFileSync(path.join(blogDir, name), 'utf8');
  const { data, content } = matter(raw);
  const slug = data.slug || name.replace(/\.md$/, '');
  const title = data.title || slug;
  const canonical = `${SITE}/blog/${slug}/`;
  const body = absify(content.trim());
  const faq = faqBlock(data.faq);

  const draft = `# ${title}

*Originally published at [${canonical}](${canonical}).*

${body}${faq}

---

*I work on [Vlyt](${SITE}) — a phone-first quoting, catalog, stock and cashflow app for South African solo operators. Free while we grow.*

*Free quoting checklist: [${SITE}/resources/sa-quoting-checklist/](${SITE}/resources/sa-quoting-checklist/)*
`;

  const outName = `${slug}.md`;
  fs.writeFileSync(path.join(outDir, outName), draft, 'utf8');
  indexRows.push(`| ${title} | \`${outName}\` | ${canonical} |`);
}

const readme = `# Medium drafts (generated)

Do not edit by hand for long — re-run \`npm run medium:export\` after blog changes.

## Preferred publish path

1. Medium → **Write** → ⋮ menu → **Import a story**
2. Paste the canonical URL from the table (or from the draft’s first line)
3. Medium usually keeps the original as the canonical source
4. Add tags: \`South Africa\`, \`Small Business\`, \`Quoting\`, \`WhatsApp\`, \`Entrepreneurs\`
5. Publish, then log the Medium URL in [OUTREACH.md](../OUTREACH.md)

If import mangling happens, paste from the matching \`.md\` below (title = H1; strip the H1 if Medium asks for a separate title field). In story settings set **Canonical link** to the vlyt.app URL when Medium offers it.

## Publish order (pace: 1–2 / week)

1. \`run-sa-business-from-phone.md\` (pillar)
2. \`send-quote-whatsapp-without-losing-numbers.md\`
3. \`how-to-write-professional-quote-south-africa.md\`
4. \`spreadsheet-quoting-problems.md\`
5. \`best-quoting-apps-south-africa-2026.md\`
6. Then remaining spokes

## Drafts

| Title | File | Canonical |
| --- | --- | --- |
${indexRows.join('\n')}
`;

fs.writeFileSync(path.join(outDir, 'README.md'), readme, 'utf8');
console.log(`Exported ${files.length} Medium drafts → content/medium/`);
