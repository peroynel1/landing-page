# GSC rewrite loop (biweekly)

Connect Google Search Console for `vlyt.app` first — see [SEO.md](../SEO.md).

## Every two weeks

1. Open GSC → Performance → last 28 days.
2. Export or scan **Queries** and **Pages**.
3. Flag pages where:
   - Average position **8–20** and impressions ≥ 10 (striking distance)
   - High impressions + low CTR (title/meta problem)
   - Impressions falling week over week (decay)
4. Prefer rewriting those URLs before writing brand-new posts.
5. After rewrite: update `date`/`updated` in frontmatter, rebuild, request indexing in URL Inspection.

## Rewrite checklist

- [ ] Title leads with the query’s intent and year if time-sensitive
- [ ] Meta description invites a click without clickbait
- [ ] Opening answers the query in two sentences
- [ ] H2s match SERP format (listicle vs guide vs comparison)
- [ ] FAQ covers the long-tail questions now showing in GSC
- [ ] Internal links to pillar + 2 siblings still valid
- [ ] Unique table or first-party proof still accurate

## Cadence vs new content

| Priority | Work |
| --- | --- |
| P0 | Striking-distance rewrites |
| P1 | CTR underperformers |
| P2 | New cocoon spokes still missing |
| P3 | New clusters only after primary cocoon is healthy |

## Manual Phase 0 status (owner)

Complete in Google account (cannot be done from repo alone):

- [ ] Domain or URL-prefix property verified for vlyt.app
- [ ] Sitemap `https://vlyt.app/sitemap.xml` submitted
- [ ] GA4 linked to Search Console
- [ ] `VITE_GA_MEASUREMENT_ID` set in GitHub Actions variables
- [ ] Home + `/blog/` URL Inspection → Request indexing after deploy

## Pass log

### 2026-10-13 — early queries (0 clicks)

| Query | Impr. | Action |
| --- | --- | --- |
| vlyt | 12 | Homepage already branded; no change beyond FAQ |
| vlyt betekenis | 6 | About blurb + FAQ “What does Vlyt mean?” on `index.html` |
| tradiquote | 4 | H2 + FAQ “Vlyt vs TradiQuote” on best-apps spoke |
| whatsapp quote delivery / sending quotes via whatsapp | 4+1 | Title/meta/H2/FAQ rewrite on WhatsApp quote spoke |
| stock tutorial phone | 1 | Title/meta + “Phone stock tutorial” steps on stock spoke |

After deploy: URL Inspection → Request indexing for home, WhatsApp spoke, best-apps, stock spoke.
