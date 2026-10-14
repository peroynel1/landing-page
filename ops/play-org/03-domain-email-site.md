# Phase 3 — Domain, email, company website

Google’s **organization website** is the company site (not the Play store listing). For Vlyt this is already **https://vlyt.app**.

## Already done (no new domain purchase)

- [x] Domain `vlyt.app` registered (GoDaddy) + Cloudflare DNS → GitHub Pages
- [x] Marketing site live
- [x] `support@vlyt.app` used on privacy/terms
- [x] Company page added at `/company/` for org verification details

## Still do

1. **Email**
   - [ ] Confirm you can send/receive at `support@vlyt.app` (required for Play OTP / contact)
   - [ ] Optional: create `play@vlyt.app` alias forwarding to you for Play Console org contact
   - [ ] Keep the **Google Account that owns Play Console** as-is; do not switch owner to Workspace unless you later transfer apps

2. **After CIPC** — put the **exact** legal entity on the public site:
   - [ ] Update [company/index.html](../../company/index.html) (name, reg number, full address, phone)
   - [ ] Replace “Peroy Nel, trading as Vlyt” in [privacy/index.html](../../privacy/index.html) and [terms/index.html](../../terms/index.html) with the Pty Ltd legal name
   - [ ] Deploy (push to the branch that feeds GitHub Pages)
   - [ ] Open https://vlyt.app/company/ and confirm name, address, email, phone match [IDENTITY.md](./IDENTITY.md)

3. **Play website verification** (when you reach Phase 5)
   - Play Console → Developer account → About you → organization website `https://vlyt.app`
   - Save → **Send verification request**
   - Wait until verified before **Change account type**

## App store listing URL (separate)

Per-app marketing / support URL stays under each app’s **Store settings** / store listing. That can remain `https://vlyt.app` — it is not a substitute for the org website field.
