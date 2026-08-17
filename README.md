# landing-page

Public marketing site for PocketBusiness. Hosted on GitHub Pages:

https://peroynel1.github.io/landing-page/

The app itself lives in a separate private repo. This repo only has the site, brand assets, and screenshots.

## Local

```bash
npm install
npm run dev
```

## Play Store URL

Set `PLAY_STORE_URL` in `src/config.ts`. Leave `#` until the listing is live.

## Public order form

`order.html?t=<token>` is the customer form (PUBO-95). It calls the `public-order` Edge function.
Set these as GitHub Actions variables (anon key is public; never a service-role key):

- `VITE_PUBLIC_ORDER_FUNCTION_URL`
- `VITE_SUPABASE_ANON_KEY`

Locally, copy them into `.env` as the same names.

## Custom domain later

1. Add a `CNAME` file with the domain.
2. Change `base` in `vite.config.ts` from `'/landing-page/'` to `'/'`.
3. Point DNS at GitHub Pages and enforce HTTPS.
