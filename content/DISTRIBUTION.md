# Owned distribution playbook

For each strong article, publish once per channel below within 7 days of going live. Always link back to the canonical `vlyt.app` URL.

New / gap articles: draft from [CONTENT_BACKLOG.md](./CONTENT_BACKLOG.md) (1 every 7–10 days), then run this checklist.

## Per-article checklist

- [ ] Quora (or similar Q&A): answer a real question; link the guide once in context  
  **Paused 2026-09-30:** Quora account banned after high-volume answers. Appeal only; no new accounts to evade. Shift Q&A energy to LinkedIn comments / niche Facebook groups later.
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

LinkedIn: profile https://www.linkedin.com/in/vlyt-app-b2479443b/ — paste-ready posts in [LINKEDIN_POSTS.md](./LINKEDIN_POSTS.md) (1 every 1–2 days).

X: [@Vlytapp](https://x.com/Vlytapp) — [X_POSTS.md](./X_POSTS.md) (3–5/week; pin checklist tip).

WhatsApp Channel: [WHATSAPP_CHANNEL.md](./WHATSAPP_CHANNEL.md) — create → Tip 1 → announce on LI/X → set repo var `VITE_WHATSAPP_CHANNEL_URL` so footer “WhatsApp tips” appears.

Daily stack: `npm run ops` (local dashboard; schedule in [ops/schedule.json](./ops/schedule.json)).

Reddit: [REDDIT.md](./REDDIT.md) — comments first, ≤1–2/day with links; Quora-style dumps banned.

**Full platform pool** (expand / hold / skip): [PLATFORMS.md](./PLATFORMS.md).  
Facebook Groups (spam walls / auto-decline — skip for now): [FACEBOOK_GROUPS.md](./FACEBOOK_GROUPS.md). Keep Page posts only: [FACEBOOK_POSTS.md](./FACEBOOK_POSTS.md).  
Indie Hackers: [INDIE_HACKERS.md](./INDIE_HACKERS.md).  
Launch Ground (SA): [LAUNCH_GROUND.md](./LAUNCH_GROUND.md).  
Hashnode: paused — [HASHNODE.md](./HASHNODE.md).  
Hackernoon (next): [HACKERNOON.md](./HACKERNOON.md).

