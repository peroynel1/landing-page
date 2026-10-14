# Phase 5 — Convert Play Console personal → organization

**Account owner only.** Keep the current Google Account as owner; put `@vlyt.app` emails in org contact fields.

Official refs:

- Change account type / payments profile: https://support.google.com/googleplay/android-developer/answer/16260648  
- Org account info: https://support.google.com/googleplay/android-developer/answer/13634081  
- SA verification docs: https://support.google.com/googleplay/android-developer/answer/15633622?co=GENIE.CountryCode%3DZA  

## Prerequisites

- [ ] https://vlyt.app/company/ shows exact CIPC name, address, email, phone
- [ ] D-U-N-S in [IDENTITY.md](./IDENTITY.md)
- [ ] PDF/scan: CIPC extract or COR14.3
- [ ] Director government photo ID (Peroy Nel)
- [ ] Org phone in `+27…` form that receives SMS/OTP

## Steps

1. Open Play Console → **Developer account → About you**.
2. Enter **Organization website** `https://vlyt.app` → Save → **Send verification request**.
3. When the site is verified, use **Change account type** / convert to organization.
4. Create or select an **organization Google payments profile**.
5. Enter **D-U-N-S**, legal name, address, org phone — copy-paste from IDENTITY / COR14.3.
6. Complete identity verification uploads:
   - Org document (CIPC extract / registration)
   - Authorized representative photo ID
7. Set **developer email + phone** shown on Play to reachable org contacts (`support@vlyt.app` + org phone).
8. Watch email for review outcome; fix mismatches inside any deadline Google gives.

## Do not

- Change account type from org back to personal later (unsupported — would need a new account + app transfer)
- Enter a guessed D-U-N-S
- Use a personal Gmail as the only org contact email if Google asks for domain match

## Done when

- [ ] About you shows account type **Organization**
- [ ] Payments profile verified  
→ [06-confirm-gate.md](./06-confirm-gate.md)
