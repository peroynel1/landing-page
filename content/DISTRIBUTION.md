# Owned distribution playbook

For each strong article, publish once per channel below within 7 days of going live. Always link back to the canonical `vlyt.app` URL.

## Per-article checklist

- [ ] Quora (or similar Q&A): answer a real question; link the guide once in context
- [ ] LinkedIn or X: short thread with one concrete tip + link
- [ ] Optional Medium: paste adapted article; set canonical / first line link to vlyt.app

## Quora answer skeleton

Question match: [buyer question]

Short direct answer in the first two lines.
2–4 practical steps from the article.
One link: https://vlyt.app/blog/[slug]/
Disclose: “I work on Vlyt, a SA quoting app” when relevant.

## LinkedIn / X skeleton

Hook: the failure mode (prices lost in WhatsApp / stock surprise / VAT shock).
One tip from the article.
Link: https://vlyt.app/blog/[slug]/
CTA soft: free while we grow / checklist https://vlyt.app/resources/sa-quoting-checklist/

## Medium

Drafts live in [`content/medium/`](./medium/) — regenerate with `npm run medium:export`.

**Preferred:** Medium → Write → Import a story → paste `https://vlyt.app/blog/[slug]/`  
Import usually keeps the original as canonical. Tags: South Africa, Small Business, Quoting, WhatsApp.

**Fallback:** paste from `content/medium/[slug].md`. Keep the “Originally published at…” line. Set Canonical link to the vlyt.app URL if Medium shows that field.

Pace: 1–2 articles per week (start with pillar → WhatsApp → write-quote → spreadsheet → best-apps).  
Log posts in [OUTREACH.md](./OUTREACH.md) owned-distribution table.

LinkedIn/X: skip until the Vlyt company/personal page exists; then use the skeleton above.
