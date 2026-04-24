# Script Vault

Script Vault is a local-first Chrome Extension for saving personal JavaScript snippets, matching them against URL patterns, and running them manually on the active tab.

It is built with Manifest V3, TypeScript, and Vite. Scripts are stored in `chrome.storage.local`, never auto-run in the MVP, and are injected only after the current tab URL matches the saved wildcard pattern.

## Features

- Save scripts with a name, URL pattern, and code body
- Search scripts from the popup
- Prioritize scripts matching the current tab URL
- Show a badge count for the number of matching scripts on the active tab
- Copy script code from the popup
- Run a script manually on the active matching tab
- Edit and delete scripts from the popup or options page
- Import and export the full script library as JSON

## Tech Stack

- Chrome Extension Manifest V3
- TypeScript
- Vite
- `chrome.storage.local`
- `chrome.scripting.executeScript`

## Project Structure

```txt
manifest.json
src/
  background.ts
  matcher.ts
  options.html
  options.ts
  popup.html
  popup.ts
  storage.ts
  types.ts
vite.config.ts
```

## Local Development

### Prerequisites

- Node.js 20+ recommended
- Google Chrome or another Chromium browser with extension developer mode

### Install

```bash
npm install
```

### Build

```bash
npm run build
```

### Typecheck

```bash
npm run typecheck
```

### Load the extension

1. Open `chrome://extensions`
2. Enable `Developer mode`
3. Click `Load unpacked`
4. Select the `dist/` directory from this repository

## How to Test

1. Build the extension with `npm run build`
2. Load `dist/` as an unpacked extension in Chrome
3. Open the extension popup and click `Options`
4. Add a script such as:

```js
document.body.style.outline = "4px solid red";
console.log("Script Vault test");
```

5. Use a matching pattern such as `https://example.com/*`
6. Visit `https://example.com/`
7. Confirm the extension icon badge shows `1`
8. Open the popup and click `Run`
9. Verify the page outline changes and the console message appears in DevTools

## URL Pattern Examples

Supported wildcard patterns include:

```txt
https://app.example.com/*
https://*.example.com/*
*://localhost:3000/*
```

## Security Notes

- The MVP never auto-runs saved scripts
- A script only runs when triggered manually by the user
- The active tab URL must match the stored pattern before execution
- Injection uses `chrome.scripting.executeScript` in the page's main world
- This project is intended for personal or unpacked use

Chrome Web Store review may reject extensions that allow arbitrary user-provided code execution, even when stored locally by the user.

## Release Checklist

- Run `npm run typecheck`
- Run `npm run build`
- Reload the unpacked extension in Chrome
- Test create, edit, delete, import, export, copy, run, and badge-count behavior
- Review `manifest.json` permissions before publishing

## Repository Notes

`dist/` and `node_modules/` are intentionally ignored. Build artifacts should be generated locally or in CI rather than committed.
