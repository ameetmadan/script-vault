# Chrome Web Store submission checklist

Work through this top to bottom. Items marked **(owner)** need the repository owner's
accounts or hands; the rest are done in this repo.

## 0. Status

- [x] Store listing copy: [listing.md](listing.md)
- [x] Privacy policy text: [../docs/privacy-policy.md](../docs/privacy-policy.md)
- [x] Monetization decision: [monetization.md](monetization.md)
- [x] Extension icons (16/32/48/128) wired into `manifest.json` and copied to `dist/`
- [ ] Screenshots (1-5): **(owner)** capture, see shot list below
- [ ] Promo tile(s): **(owner)** design, see specs below
- [ ] Host the privacy policy **(owner)**
- [ ] Developer account **(owner)**
- [ ] Submit **(owner)**

## 1. Host the privacy policy

The policy lives in `docs/privacy-policy.md`. To host it:

1. GitHub repo → Settings → Pages → Source: *Deploy from a branch* → branch `main`,
   folder `/docs`.
2. After the first build, the URL will be
   `https://ameetmadan.github.io/script-vault/privacy-policy`. Open it and confirm it renders.
3. Paste that URL into the dashboard's *Privacy policy* field. If you use a different
   host or domain, update `listing.md`.

## 2. Screenshots (required: at least 1, up to 5)

Spec: **1280x800** (preferred) or 640x400, 24-bit PNG or JPEG, no alpha, full-bleed.

Suggested shot list (build with `npm run build`, load `dist/` unpacked, use realistic
example scripts, not placeholder text):

1. Popup on a matching page: badge count visible, matching scripts listed first.
2. Options page with the script editor (name, URL pattern, code).
3. Popup search filtering the library.
4. Result of clicking Run (the page effect, e.g. a red outline), with a caption.
5. Import/export section of the options page.

Existing captures in `assets/` can be reused as a starting point but are not store-sized.

## 3. Promo images

| Asset | Size | Required |
| --- | --- | --- |
| Small promo tile | 440x280 PNG/JPEG | Yes, to be featured; recommended |
| Marquee promo tile | 1400x560 PNG/JPEG | Optional |
| Store icon | 128x128 PNG | Yes, uses `icons/icon-128.png` |

Use the icon's palette (`#c97b42` to `#7a4a1e` gradient, `#fff8ee` glyph), the name
"Script Vault", and the tagline "Your snippets, one click away." Avoid screenshots with
tiny text; keep it readable at 220x140.

The icon source is `store/tools/icon.svg`. Regenerate the PNGs with
`python3 store/tools/generate-icons.py` (standard library only).

## 4. Developer account **(owner)**

1. Go to the [Chrome Web Store developer dashboard](https://chrome.google.com/webstore/devconsole).
2. Sign in with the Google account that should own the listing, and pay the $5 one-time
   registration fee.
3. Complete the account verification (contact email verification is required to publish).

## 5. Package and submit **(owner)**

1. Make sure `manifest.json` `version` is final. It must be higher than any previously
   uploaded version.
2. `npm ci && npm run typecheck && npm run build`
3. `cd dist && zip -r ../script-vault-chrome-extension.zip .` (or download the zip from the
   release CI job; the manifest must be at the zip root).
4. Dashboard → *Add new item* → upload the zip.
5. Fill in each tab using [listing.md](listing.md):
   - *Store listing*: description, category, screenshots, promo tile, icon.
   - *Privacy practices*: single purpose, permission justifications, remote-code
     answer (No), data usage (none), privacy policy URL.
   - *Distribution*: Free, visibility Public, regions All.
6. Paste the reviewer notes from `listing.md` into the *Test instructions* field.
7. *Submit for review*. Consider "Defer publishing" so approval doesn't auto-publish
   before you are ready.

## 6. After submission

- Review typically takes from a few days up to a few weeks for a new item, longer if
  the item has broad host permissions or runs user code. **Do not announce a launch date
  until the item shows as Published.**
- If rejected, read the stated violation, adjust the listing or notes, and resubmit or
  appeal. Likely topics: remote/arbitrary code, `<all_urls>` host permission, missing
  privacy policy.
- Consider (but this is a code change, not part of this task) narrowing permissions to
  `activeTab` plus optional host permissions if review pushes back on `<all_urls>`. The
  badge count currently depends on reading tab URLs, which is why the broad host
  permission is requested.

## 7. Release hygiene

- Bump `version` in `manifest.json` and `package.json` together for each store upload.
- Update the README Release Checklist item "Review `manifest.json` permissions before
  publishing" using the justifications in `listing.md`.
