---
title: Script Vault Privacy Policy
---

# Script Vault Privacy Policy

_Last updated: 2026-11-12_

Script Vault is a local-first Chrome extension for saving personal JavaScript snippets, matching them against URL patterns, and running them manually on the current tab. This policy explains what data the extension handles. The short version: **Script Vault does not collect, transmit, sell, or share any of your data.**

## Data the extension stores

Script Vault stores the following on your device, in `chrome.storage.local`:

- The scripts you create: name, URL pattern, code, and created/updated timestamps.

This data never leaves your browser profile. It is not uploaded to any server, and it is not synced by the extension. (Chrome itself does not sync `chrome.storage.local` between devices.)

## Data the extension reads

- **The URL of your tabs.** The extension reads tab URLs locally to decide which saved scripts match the current page, to show the match count on the toolbar badge, and to check that a script's pattern matches before it runs. Tab URLs are processed in memory and are not stored or transmitted.
- **Page content is not read.** The extension does not read, scrape, or collect page content. The only thing it does on a page is execute a script **you** saved, **when you click Run**.

## Data the extension does not collect

Script Vault does not collect personal information, browsing history, analytics, telemetry, crash reports, cookies, identifiers, or any usage data. It makes no network requests, contains no advertising, and loads no remote code or third-party libraries.

## Import and export

Import and export are user-initiated. Export produces a JSON file that is saved to a location you choose; import reads a JSON file you select. The extension does not send either anywhere.

## Permissions

| Permission | Why it is needed |
| --- | --- |
| `storage` | Save your scripts locally. |
| `scripting` | Run a saved script in the current tab when you click Run. |
| `activeTab` | Act on the tab you are currently using. |
| Host access (`<all_urls>`) | Read tab URLs to match them against your patterns and show the badge count, and run your script on whichever matching site you choose. No page content is collected. |

## Scripts you run

Scripts execute only when you trigger them and only on pages that match the URL pattern you saved. You are responsible for the code you save and run. Script Vault does not inspect, modify, or transmit it. If your own script sends data over the network, that is the behavior of your script, not of the extension.

## Children

Script Vault is a developer-oriented tool and is not directed at children.

## Changes to this policy

If this policy changes, the updated version will be published at this URL with a new "Last updated" date. Any change that would involve collecting data would also be called out in the extension's release notes.

## Contact

Questions or concerns: open an issue at <https://github.com/ameetmadan/script-vault/issues>.
