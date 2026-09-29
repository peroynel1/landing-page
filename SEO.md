# SEO & analytics setup (Phase 0)

Manual steps for the Google account that owns Vlyt. Do these once, then keep `VITE_GA_MEASUREMENT_ID` in GitHub Actions.

## 1. Google Search Console

1. Open [Google Search Console](https://search.google.com/search-console) and add a property.
2. Prefer a **Domain** property for `vlyt.app` (covers `https://` and `www`). If DNS TXT is awkward, use **URL prefix** `https://vlyt.app`.
3. **Verify ownership**
   - Domain: add the TXT record Google shows at Cloudflare (DNS for `vlyt.app`).
   - URL prefix alternative: download the HTML verification file into `public/` (e.g. `googleXXXX.html`), push to `main`, wait for Pages deploy, then click Verify.
4. After the site deploys with a sitemap: **Sitemaps →** submit `https://vlyt.app/sitemap.xml`.
5. **URL Inspection** → enter `https://vlyt.app/` → **Request indexing**.

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

## Env var

| Name | Where | Purpose |
| --- | --- | --- |
| `VITE_GA_MEASUREMENT_ID` | GitHub Actions env on `npm run build` | Loads gtag only when set; local `.env` for preview |

Never commit a real Measurement ID into the repo if you prefer secrets; a repo Variable is fine (it is not a private credential like an API secret).

## Post-deploy checks

After merging to `main` and Pages is live:

1. Confirm `https://vlyt.app/robots.txt` and `https://vlyt.app/sitemap.xml` load.
2. [Rich Results Test](https://search.google.com/test/rich-results) on `https://vlyt.app/` — FAQ / SoftwareApplication.
3. [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) — scrape `https://vlyt.app/` (absolute OG image).
4. [Twitter Card Validator](https://cards-dev.twitter.com/validator) — same URL.
5. GSC: submit sitemap `https://vlyt.app/sitemap.xml`; URL Inspection for the home page → Request indexing.
6. With `VITE_GA_MEASUREMENT_ID` set on the Actions variable, open the site and confirm a Realtime hit in GA4; click a Play CTA and look for `play_store_click`.

### Local build verification (pre-push)

Already checked on a production `npm run build`:

- `dist/robots.txt`, `sitemap.xml`, `site.webmanifest`, favicons, `og-image.png`, Vlyt `hero-dark.png`
- Home HTML includes absolute `canonical` / `og:image`, Twitter cards, and FAQPage + SoftwareApplication JSON-LD
- GA event code is included in the JS bundle only when `VITE_GA_MEASUREMENT_ID` is set at build time (omit the var locally to avoid polluting Realtime)
