# Monetization decision

**Status:** recommended default, decided unattended by the night-shift agent. The repo
owner should confirm or override before launch.

## Decision: launch free, with an optional "support the project" link

Do not ship a paid tier or license check in v1.

### Why

- **Payments:** the Chrome Web Store's own licensing/payments API was deprecated, so any
  paid model means building and operating an external license server, checkout, and
  support flow. That is far more work than the extension itself.
- **Review risk:** the extension runs user-supplied code. That is already the most likely
  cause of review friction (see [listing.md](listing.md)). Adding license checks, remote
  calls, or paywalls on top raises the risk of a rejection and conflicts with the
  "no network requests" claim in the privacy policy.
- **Audience and trust:** the audience is developers, who strongly prefer local-first,
  open-source tools. The privacy story ("no account, no servers, no tracking") is the
  main selling point and a paywall undercuts it.
- **Distribution first:** there is no user base yet. Revenue depends on installs, so
  reducing friction first is the quickest route to any revenue.

### Options considered

| Model | Verdict |
| --- | --- |
| Free + donation (GitHub Sponsors / Ko-fi / Buy Me a Coffee link in the listing description and README) | **Chosen.** No code, no review impact, no ongoing ops. Low revenue, but nonzero and consistent with the product's brand. |
| One-time payment | Rejected for v1. Needs an external checkout and license validation (e.g. Gumroad/Lemon Squeezy/Stripe plus a license endpoint). Requires network calls from the extension. |
| Freemium (feature-gated) | Revisit later. Candidate paid features once there is demand: cloud sync/backup across devices, shared team libraries, script versioning, an unlimited script count. Would need a license check via an external service, and a privacy policy update. |

### Revisit triggers

Reopen this decision once any of these is true:

- 500+ weekly active users (Chrome dashboard stats), or
- repeated user requests for sync/backup/team sharing, or
- the extension is approved and stable on the Web Store for 2+ release cycles.

### Follow-ups if freemium is chosen later

- Keep the free tier fully local and fully functional (no feature regression).
- Use an external license-key check (key entered in the options page, validated against a
  small endpoint, cached locally, with offline grace period).
- Update the privacy policy, the Web Store "data usage" disclosures, and the permission
  justifications (a new network host) before shipping.

### Open question for the owner

- Which donation platform do you want to use? Add its URL to the listing's detailed
  description and to the README; none is set up yet, so none is linked.
