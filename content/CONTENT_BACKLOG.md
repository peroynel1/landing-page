# Blog content backlog — continuous gaps

Ship **1 new spoke or major rewrite every 7–10 days**. Do not batch-publish five posts in a week — distribute each one (Medium, LI/X/WA tip) before the next draft.

Prefer [GSC_REWRITE_LOOP.md](./GSC_REWRITE_LOOP.md) when Search Console shows a live URL underperforming. Otherwise take the next `todo` row below.

Cluster map: [COCOON.md](./COCOON.md) · Distribution: [DISTRIBUTION.md](./DISTRIBUTION.md)

---

## Cadence

| Cadence | What |
| --- | --- |
| Every 7–10 days | One new spoke **or** one deep rewrite |
| Within 7 days of publish | Medium import + 1 owned tip (LI **or** X **or** WA) |
| Monthly | GSC pass → promote a rewrite above a new draft if needed |

---

## Gap queue (priority order)

| # | Status | Slug | Target keyword | Why it closes a gap | Depends on / links |
| --- | --- | --- | --- | --- | --- |
| 1 | **published** | `follow-up-open-quotes-south-africa` | follow up open quotes South Africa | Tip 2 / process leak has no canonical page | write-quote, whatsapp, cashflow |
| 2 | todo | `quote-deposit-whatsapp-south-africa` | quote deposit WhatsApp South Africa | “Yes” ≠ booked; deposits before materials | quote-vs-invoice, cashflow, whatsapp |
| 3 | todo | `negotiate-quote-discount-south-africa` | negotiate quote discount South Africa | Version chaos when they ask “cheaper?” | whatsapp, write-quote |
| 4 | todo | `quote-exclusions-scope-creep-sa` | quote exclusions scope creep | Checklist has exclusions; no spoke | write-quote, whatsapp |
| 5 | todo | `after-quote-accepted-south-africa` | after quote accepted next steps | Quote → job → invoice → paid | quote-vs-invoice, cashflow, stock |
| 6 | todo | `valid-until-dates-on-quotes-sa` | valid until date on quote South Africa | Validity mentioned everywhere; thin coverage | write-quote, vat |
| 7 | todo | `whatsapp-quote-follow-up-templates` | WhatsApp quote follow up message | Templates operators can paste | follow-up-open-quotes, whatsapp |
| 8 | later | `pricing-from-catalog-not-memory-sa` | price list for quoting South Africa | Catalog spoke exists; this is the “memory tax” angle | catalog, spreadsheet |
| 9 | later | Trade verticals (plumber / electrician quoting SA) | … quoting South Africa | Only after core ops spokes; keep thin + link to pillar | pillar + write-quote |

Statuses: `todo` → `drafting` → `published` → `syndicated`.

---

## When a row ships

1. Add the slug to the table in [COCOON.md](./COCOON.md).  
2. Link from the pillar + ≥1 sibling (no orphans).  
3. `npm run content` (OG + sitemap).  
4. Log distribute tasks in [ops/schedule.json](./ops/schedule.json).  
5. Mark this row `published`, then `syndicated` after Medium + one tip.

---

## Out of scope (for now)

- Listicle “best of” updates until Play Store (except refreshing the 2026 apps table).  
- Generic global “how to invoice” with no SA / WhatsApp angle.  
- Daily blog posts — tips stay on X / WA Channel.
