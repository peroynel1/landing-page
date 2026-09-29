# landing-page

Public marketing site for Vlyt. Hosted on GitHub Pages at:

https://vlyt.app

The app itself lives in a separate private repo. This repo only has the site, brand assets, and screenshots.

## Local

```bash
npm install
npm run dev
```

## Play Store URL

Set `PLAY_STORE_URL` in `src/config.ts`. Leave `#` until the listing is live.

## Public order form

`/order/?t=<token>` is the customer form (PUBO-95). It calls the `public-order` Edge function.
Set these as GitHub Actions variables (anon key is public; never a service-role key):

- `VITE_PUBLIC_ORDER_FUNCTION_URL`
- `VITE_SUPABASE_ANON_KEY`

Locally, copy them into `.env` as the same names.

## Blog & content engine

Markdown posts live in `content/blog/`. Free resources live in `content/resources/`.
`npm run content` (also run before `dev` / `build`) generates HTML into `blog/` and
`resources/`, plus `public/sitemap.xml`, `public/robots.txt`, and `public/llms.txt`.

Cocoon map: [content/COCOON.md](./content/COCOON.md)  
Outreach tracker: [content/OUTREACH.md](./content/OUTREACH.md)  
Owned distribution: [content/DISTRIBUTION.md](./content/DISTRIBUTION.md)  
AI visibility prompts: [content/AI_VISIBILITY.md](./content/AI_VISIBILITY.md)  
GSC rewrite loop: [content/GSC_REWRITE_LOOP.md](./content/GSC_REWRITE_LOOP.md)

## Analytics (GA4)

Set `VITE_GA_MEASUREMENT_ID` (`G-XXXXXXXX`) as a GitHub Actions variable so the Pages build injects Google Analytics. Omit it locally if you do not want hits from `npm run dev`.

Setup steps for Search Console + GA4 are in [SEO.md](./SEO.md).

## Custom domain

Domain: `vlyt.app` (GoDaddy registration, Cloudflare DNS → GitHub Pages).

- Root `CNAME` file contains `vlyt.app`
- Vite `base` is `/`
- In the GitHub repo: Settings → Pages → custom domain `vlyt.app` → Enforce HTTPS once DNS is green
