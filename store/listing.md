# Chrome Web Store listing copy

Copy/paste source for the Chrome Web Store developer dashboard. Keep in sync with
`README.md` and `manifest.json` when features change.

## Basics

| Field | Value |
| --- | --- |
| Name | Script Vault |
| Category | Developer Tools |
| Language | English |
| Pricing | Free (see [monetization.md](monetization.md)) |
| Privacy policy URL | `https://ameetmadan.github.io/script-vault/privacy-policy` (requires GitHub Pages, see [submission-checklist.md](submission-checklist.md)) |
| Support / homepage URL | `https://github.com/ameetmadan/script-vault` |

## Short description (max 132 chars; also the manifest `description`)

```
Save personal JavaScript snippets, match them to URL patterns, and run them manually on the current tab. Local-first, no tracking.
```

## Detailed description

```
Script Vault is a local-first home for the JavaScript snippets you reuse on the web.

Save a snippet once, give it a URL pattern, and run it with one click whenever you land on a matching page. Nothing runs automatically: you are always in control.

WHAT YOU CAN DO
• Save scripts with a name, URL pattern, and code body
• Match scripts to pages with simple wildcard patterns (https://app.example.com/*, https://*.example.com/*, *://localhost:3000/*)
• See at a glance how many saved scripts match the current tab via the toolbar badge
• Search your library from the popup, with matching scripts listed first
• Run a script on the active tab with one click, only when its pattern matches
• Copy script code to the clipboard
• Edit and delete scripts from the popup or the options page
• Import and export your whole library as JSON for backup or moving between machines

PRIVATE BY DESIGN
• Your scripts are stored locally in your browser (chrome.storage.local)
• No account, no sign-in, no servers
• No analytics, telemetry, ads, or tracking
• No network requests and no remote code
• Page content is never read; the extension only runs the script you saved, when you click Run

BUILT FOR
Developers, QA engineers, and power users who keep small helper scripts: clearing a banner, filling a test form, toggling a feature flag, tweaking a page layout, or debugging a web app.

IMPORTANT
Scripts run in the page's context with the same access as the page's own code. Only run code you wrote or trust. Script Vault never runs a script unless you click Run, and only on pages that match the pattern you saved.

Open source: https://github.com/ameetmadan/script-vault
```

## Single purpose statement

> Script Vault lets the user save their own JavaScript snippets, associate them with URL patterns, and manually run them on matching pages.

## Permission justifications (dashboard "Privacy practices" tab)

| Permission | Justification |
| --- | --- |
| `storage` | Stores the user's saved scripts locally in `chrome.storage.local`. |
| `scripting` | Required to execute a user-saved script in the active tab when the user clicks Run (`chrome.scripting.executeScript`). |
| `activeTab` | Lets the extension act on the tab the user is currently viewing when they trigger a script. |
| Host permission `<all_urls>` | Users can write patterns for any site. The extension reads tab URLs to compare them against those patterns (toolbar badge count, popup ordering, pre-run check) and injects the user's script only into a tab whose URL matches. No page content is read or transmitted. |

## Remote code declaration

- "Are you using remote code?" → **No.** All extension code is bundled in the package; nothing is fetched or `eval`'d from a remote host.
- The extension does run **user-authored** code that the user typed or imported and saved locally. This is the product's single purpose. It is injected via `chrome.scripting.executeScript` as a `<script>` element's text in the page's main world, only on explicit user action.

> **Review risk:** the README already notes that Chrome Web Store review may question extensions that execute arbitrary user-provided code. Be explicit about user-authored, user-triggered, local-only execution in the listing and the reviewer notes below. Expect a possible rejection/appeal cycle.

## Data-usage disclosures (dashboard checkboxes)

- Collects no user data categories (leave all "data collected" boxes unchecked).
- Certify: not sold to third parties; not used for unrelated purposes; not used for creditworthiness/lending.

## Notes for reviewers (test instructions field)

```
No account or credentials are needed.
1. Click the toolbar icon, then "Options".
2. Add a script: Name "Outline test", URL pattern "https://example.com/*", code:
   document.body.style.outline = "4px solid red";
3. Visit https://example.com/ — the toolbar badge shows "1".
4. Open the popup and click "Run" — the page gets a red outline.
Scripts never run automatically; they only run when the user clicks Run on a page matching the saved pattern. All data stays in chrome.storage.local; the extension makes no network requests.
```

## Release notes (first version)

```
Initial release: save scripts, match them to URL patterns, run them manually, badge count for matches, search, copy, edit/delete, and JSON import/export.
```

## Images

Specs and the shot list are in [submission-checklist.md](submission-checklist.md). The 128x128 store icon is `icons/icon-128.png`.
