# Reddit playbook — Vlyt

**Goal:** helpful SA small-business answers that occasionally point to `vlyt.app`.  
**Not a Quora replay:** max **1–2 comments per day**, link in maybe **1 of 3** replies. Karma first.

Profile: create/use a normal personal account (not “VlytBot”). Username can be neutral. Bio optional: “Building vlyt.app — SA phone quoting tools” — put site in profile, not every comment.

---

## Rules (read once)

1. Read the subreddit sidebar + recent posts before commenting.  
2. Answer the question fully **without** a link first. Add a link only if someone would actually click it for the next step.  
3. Disclose when pitching: “I work on Vlyt…”  
4. Never drop the same link in 5 threads the same day.  
5. If mods remove a post, stop that sub for 2 weeks — don’t argue in modmail with a pitch.  
6. No sockpuppets after bans.

---

## Subs to use

| Sub | Fit | How to show up |
| --- | --- | --- |
| [r/southafrica](https://www.reddit.com/r/southafrica/) | Broad SA | Comment on business / side-hustle / tradie threads |
| [r/askSouthAfrica](https://www.reddit.com/r/askSouthAfrica/) | Advice asks | Answer “how do I start / quote / get clients” |
| [r/south_africa](https://www.reddit.com/r/south_africa/) | Alt SA | Same as above; check which is more active |
| [r/smallbusiness](https://www.reddit.com/r/smallbusiness/) | Global SMB | WhatsApp/quote ops tips; SA context OK |
| [r/Entrepreneur](https://www.reddit.com/r/Entrepreneur/) | Broader | Only high-signal threads; stricter on promo |
| [r/SweatyStartup](https://www.reddit.com/r/SweatyStartup/) | Service businesses | Quote/ops/cashflow advice fits well |
| [r/freelance](https://www.reddit.com/r/freelance/) | Freelancers | Quoting, clients, scope creep |
| [r/consulting](https://www.reddit.com/r/consulting/) | Service pricing | Proposals / rates (careful, US-heavy) |
| [r/Flipping](https://www.reddit.com/r/Flipping/) | Buy/sell ops | Catalog + WhatsApp pricing discipline |
| [r/ycombinator](https://www.reddit.com/r/ycombinator/) / [r/startups](https://www.reddit.com/r/startups/) | Founders | Only if thread is about SMB tools / GTM — rare |
| [r/Android](https://www.reddit.com/r/Android/) | Weak fit | Skip unless someone asks for business apps |

Search inside each: `quote`, `WhatsApp`, `invoice`, `spreadsheet`, `side hustle`, `plumber`, `electrician`.

### If SA subs feel empty — search better, don’t only scroll New

Reddit search (desktop): put the query in the sub search box, sort by **New** or **Relevance**, time **Past month**.

Try these queries on r/smallbusiness + r/SweatyStartup + r/freelance:

- `whatsapp quote` OR `whatsapp price`
- `how do you quote` OR `estimate template`
- `spreadsheet invoice` OR `excel quoting`
- `losing track of quotes` OR `follow up quotes`
- `cashflow` `small business`
- `catalog` OR `price list` clients

Google (often better than Reddit search):

```
site:reddit.com/r/smallbusiness whatsapp quote
site:reddit.com/r/SweatyStartup quote clients
site:reddit.com/r/freelance send quote
site:reddit.com (plumber OR electrician) (whatsapp OR quote) 
site:reddit.com/r/southafrica (business OR quote OR invoice)
```

### Off-Reddit if Reddit is dry today

- Facebook Groups: “South Africa Small Business”, local tradie / plumber / electrician groups  
- LinkedIn: comment on SA SME posts (safer than Quora volume)  
- Come back to Reddit tomorrow — SA subs are low volume; feast/famine is normal

---

## Comment A — no link (use most often)

COPY:

WhatsApp is fine for closing the job. It is a bad place to store prices.

If you quote from chat history you will eventually send the wrong total. Keep a simple catalog (even a notes list at first): item, ZAR price, whether VAT is incl/excl. When they negotiate, update that list and resend — do not only type a new number in the thread.

Also write “valid until” on every quote. Materials move.

END COPY

---

## Comment B — soft checklist (1x / day max)

COPY:

Same problem as half the SA solo operators I talk to: the customer decides on WhatsApp, but the numbers live nowhere solid.

Minimum before you send:
• Prices in a list (ZAR)
• VAT labelled
• Valid-until date
• What is NOT included
• Share from a saved quote, not memory

I put that as a free checklist here if useful:
https://vlyt.app/resources/sa-quoting-checklist/

(I work on Vlyt — phone quoting for SA small businesses. Disclosure.)

END COPY

---

## Comment C — cashflow / awaiting payment

COPY:

Profit on a job is not the same as cash in the account.

Each week know three numbers: income received, expenses paid, and still awaiting payment. Open WhatsApp “yes” messages are not cash until paid.

Short SA trades write-up:
https://vlyt.app/blog/cashflow-basics-trades-sa/

(I build tools in this space — Vlyt — disclosure.)

END COPY

---

## Comment D — spreadsheet rant (no hard sell)

COPY:

Spreadsheets work until you are on site and version 3 of the quote is in Downloads.

If your source of truth only opens on a laptop, you do not have a quoting system — you have a file. Phone between jobs needs prices + stock you can trust without emailing yourself an xlsx.

END COPY

(Add the spreadsheet article link only if they ask “what instead?”)

---

## Do not lead with

- “Best quoting apps 2026” listicle dumps  
- Play Store CTA (not live)  
- Multiple URLs in one comment  

---

## Reddit API app (local search) — mostly blocked

Anonymous `.json` scraping gets **403**. Self-serve **script** apps at `/prefs/apps` are also largely closed under Reddit’s [Responsible Builder Policy](https://support.reddithelp.com/hc/en-us/articles/42728983564564-Responsible-Builder-Policy) (updated 2026): **API access needs explicit approval**; the create-app form often only shows that policy link (CAPTCHA or not).

**What Reddit wants instead**
- **Devvit** — apps *inside* Reddit (mod tools), not a local thread finder  
- **Data Access Request ticket** — rare approvals; commercial / marketing / scraping use cases are a poor fit  
- Existing OAuth apps keep working; **new** ones need approval  

**Vlyt default:** do **not** depend on API approval. Find threads in the browser (or paste URLs here). Cap stays ≤2 helpful comments/day.

**If you still want to try approval** (low odds for a marketing searcher):  
https://support.reddithelp.com/hc/en-us/requests/new?ticket_form_id=14868593862164&tf_42139884615700=api_request_type_developer_clone  
Describe: read-only search of public posts in named subs for personal commenting; no bots, no auto-post, no AI training, no resale of data.

**If approval + credentials ever land**, `npm run ops:reddit-find` + `.env.example` `REDDIT_*` keys are ready. Never commit `.env`.

---

## First session (today, ~20 min)

1. Create/login Reddit; fill bio lightly.  
2. Run `npm run ops:reddit-find` (or sort r/askSouthAfrica + r/smallbusiness by New).  
3. Leave **two Comment A** replies (no link).  
4. Leave **one Comment B** only if the thread is clearly about quoting/WhatsApp/prices.  
5. Log threads in OUTREACH.md.

---

## Weekly cap

- ≤10 helpful comments  
- ≤3 with links  
- 0 promotional standalone posts until you have karma + feel for each sub  
