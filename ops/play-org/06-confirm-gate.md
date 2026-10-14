# Phase 6 — Confirm you are past the 12×14 tester gate

The closed-test rule (12 testers opted in continuously for 14 days before first production) targets **personal** developer accounts created after 13 Nov 2023. After a successful org conversion, confirm your app Dashboard no longer blocks production on that gate.

Official: https://support.google.com/googleplay/android-developer/answer/14151465

## Checks

1. Play Console → your app → **Dashboard**.
2. [ ] Note whether production / “apply for production” still requires closed testing with 12 testers × 14 days.
3. If the gate is **gone** or production is already available:
   - [ ] Ship updates on the **production** track (optional internal/open testing for QA only)
   - [ ] You do **not** re-run 12×14 for each deploy once production access exists
4. If the gate is **still shown**:
   - [ ] Confirm org conversion finished (About you = Organization, payments verified)
   - [ ] Play Console **Help** with your 19-digit Account ID (About you)
   - [ ] Do not recruit a full tester panel until Help clarifies

## Ongoing release habit

- Prefer **production** (or staged rollout) for real users
- Use **internal testing** for your own devices / small QA — not as a substitute for clearing a mandated closed-test gate
