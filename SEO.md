# SEO & analytics setup (Phase 0)

Manual steps for the Google account that owns Vlyt. Do these once, then keep `VITE_GA_MEASUREMENT_ID` in GitHub Actions.

Ops after the blog ships:

- Biweekly GSC rewrites → [content/GSC_REWRITE_LOOP.md](./content/GSC_REWRITE_LOOP.md)
- Monthly AI citation checks → [content/AI_VISIBILITY.md](./content/AI_VISIBILITY.md)
- Listicle outreach → [content/OUTREACH.md](./content/OUTREACH.md)

## 1. Google Search Console

1. Open [Google Search Console](https://search.google.com/search-console) and add a property.
2. Prefer a **Domain** property for `vlyt.app` (covers `https://` and `www`). If DNS TXT is awkward, use **URL prefix** `https://vlyt.app`.
3. **Verify ownership**
   - Domain: add the TXT record Google shows at Cloudflare (DNS for `vlyt.app`).
   - URL prefix alternative: download the HTML verification file into `public/` (e.g. `googleXXXX.html`), push to `main`, wait for Pages deploy, then click Verify.
4. After the site deploys with a sitemap: **Sitemaps →** submit `https://vlyt.app/sitemap.xml`.
5. **URL Inspection** → enter `https://vlyt.app/` and `https://vlyt.app/blog/` → **Request indexing**.

## 2. Google Analytics 4

1. Open [Google Analytics](https://analytics.google.com) → Admin → create account/property **Vlyt Marketing** if needed.
2. Add a **Web** data stream with URL `https://vlyt.app`.
3. Copy the **Measurement ID** (`G-XXXXXXXX`).
4. In the GitHub repo **landing-page**: Settings → Secrets and variables → Actions → Variables (or Secrets) → add `VITE_GA_MEASUREMENT_ID` = that ID.
5. Redeploy Pages (push to `main` or run **Deploy GitHub Pages**). Confirm Realtime shows a hit when you open the site.

## 3. Link GA4 ↔ Search Console

In GA4: **Admin → Product links → Search Console links → Link**, choose the `vlyt.app` property.  
In Search Console you can also associate the GA4 property under Settings.

## 4. Optional

- **Google Business Profile** — only if you have a public business address; skip for a fully remote product.
- Social debuggers after deploy (see **Post-deploy checks** below).
- `https://vlyt.app/llms.txt` is generated for AI crawlers (hygiene only — not a ranking lever).

## Env var

| Name | Where | Purpose |
| --- | --- | --- |
| `VITE_GA_MEASUREMENT_ID` | GitHub Actions env on `npm run build` | Loads gtag only when set; local `.env` for preview |

Never commit a real Measurement ID into the repo if you prefer secrets; a repo Variable is fine (it is not a private credential like an API secret).

## Post-deploy checks

After merging to `main` and Pages is live:

1. Confirm `https://vlyt.app/robots.txt` and `https://vlyt.app/sitemap.xml` load (**200**, not 500).
2. Confirm `https://vlyt.app/blog/` and at least one article HTML load.
3. [Rich Results Test](https://search.google.com/test/rich-results) on `https://vlyt.app/` — FAQ / SoftwareApplication; spot-check one blog article for Article + FAQPage.
4. [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) — scrape `https://vlyt.app/` (absolute OG image).
5. [Twitter Card Validator](https://cards-dev.twitter.com/validator) — same URL.
6. GSC: submit sitemap `https://vlyt.app/sitemap.xml`; URL Inspection for home + blog → Request indexing.
7. With `VITE_GA_MEASUREMENT_ID` set on the Actions variable, open the site and confirm a Realtime hit in GA4; click a Play CTA and look for `play_store_click`.

### Local build verification (pre-push)

```bash
npm run build
```

Confirm `dist/` contains `robots.txt`, `sitemap.xml`, `llms.txt`, `blog/index.html`, blog articles, and `resources/sa-quoting-checklist/`.

### Manual checklist (owner — not automatable in git)

- [ ] GSC property verified
- [ ] Sitemap submitted and fetched without error
- [ ] GA4 ↔ GSC linked
- [ ] `VITE_GA_MEASUREMENT_ID` set in Actions
- [ ] First AI visibility pass logged in `content/AI_VISIBILITY.md`
- [ ] First 5 outreach rows researched in `content/OUTREACH.md`
