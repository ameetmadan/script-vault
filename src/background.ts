import { matchesUrl } from "./matcher";
import { getScripts } from "./storage";
import type { BackgroundRequest, RunScriptResult, SavedScript } from "./types";

const BADGE_COLOR = "#945b25";

async function getActiveTab(): Promise<chrome.tabs.Tab> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    throw new Error("No active tab found.");
  }
  return tab;
}

function ensureRunnableTab(url?: string): string {
  if (!url) {
    throw new Error("Active tab has no URL.");
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error("Active tab URL is invalid.");
  }

  if (!["http:", "https:", "file:"].includes(parsedUrl.protocol)) {
    throw new Error("This tab URL cannot be scripted.");
  }

  return url;
}

async function clearBadge(tabId: number): Promise<void> {
  await chrome.action.setBadgeText({ tabId, text: "" });
  await chrome.action.setTitle({ tabId, title: "Script Vault" });
}

async function updateBadgeForTab(tab: chrome.tabs.Tab): Promise<void> {
  const tabId = tab.id;
  if (typeof tabId !== "number") {
    return;
  }

  let url = "";

  try {
    url = ensureRunnableTab(tab.url);
  } catch {
    await clearBadge(tabId);
    return;
  }

  const scripts = await getScripts();
  const matchCount = scripts.filter((script) => matchesUrl(script.urlPattern, url)).length;

  if (matchCount === 0) {
    await clearBadge(tabId);
    return;
  }

  await chrome.action.setBadgeBackgroundColor({ tabId, color: BADGE_COLOR });
  await chrome.action.setBadgeText({ tabId, text: String(matchCount) });
  await chrome.action.setTitle({ tabId, title: `Script Vault: ${matchCount} matching script${matchCount === 1 ? "" : "s"}` });
}

async function refreshActiveTabBadge(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) {
    return;
  }
  await updateBadgeForTab(tab);
}

async function refreshAllTabBadges(): Promise<void> {
  const tabs = await chrome.tabs.query({});
  await Promise.all(tabs.map((tab) => updateBadgeForTab(tab)));
}

async function runScriptById(scriptId: string): Promise<RunScriptResult> {
  const scripts = await getScripts();
  const savedScript = scripts.find((script) => script.id === scriptId);

  if (!savedScript) {
    throw new Error("Script not found.");
  }

  const tab = await getActiveTab();
  const currentUrl = ensureRunnableTab(tab.url);
  const tabId = tab.id;

  if (typeof tabId !== "number") {
    throw new Error("Active tab has no usable tab id.");
  }

  if (!matchesUrl(savedScript.urlPattern, currentUrl)) {
    throw new Error(`Current tab does not match ${savedScript.urlPattern}`);
  }

  await injectScript(tabId, savedScript);

  return {
    ok: true,
    message: `Ran "${savedScript.name}" on ${currentUrl}`,
    matchedUrl: currentUrl
  };
}

async function injectScript(tabId: number, savedScript: SavedScript): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    func: (code: string) => {
      const script = document.createElement("script");
      script.textContent = code;
      const parent = document.documentElement || document.head || document.body;
      if (!parent) {
        throw new Error("Document is not ready for script injection.");
      }
      parent.appendChild(script);
      script.remove();
    },
    args: [savedScript.code]
  });
}

chrome.runtime.onMessage.addListener((message: BackgroundRequest, _sender, sendResponse) => {
  void (async () => {
    try {
      if (message.type === "run-script") {
        sendResponse(await runScriptById(message.scriptId));
        return;
      }

      if (message.type === "get-active-tab-url") {
        const tab = await getActiveTab();
        sendResponse({ ok: true, url: tab.url });
        return;
      }

      sendResponse({ ok: false, message: "Unsupported message type." });
    } catch (error) {
      sendResponse({
        ok: false,
        message: error instanceof Error ? error.message : "Unknown background error."
      });
    }
  })();

  return true;
});

chrome.runtime.onInstalled.addListener(() => {
  void refreshAllTabBadges();
});

chrome.runtime.onStartup.addListener(() => {
  void refreshAllTabBadges();
});

chrome.tabs.onActivated.addListener(() => {
  void refreshActiveTabBadge();
});

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" || typeof changeInfo.url === "string") {
    void updateBadgeForTab(tab);
  }
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId !== chrome.windows.WINDOW_ID_NONE) {
    void refreshActiveTabBadge();
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && "savedScripts" in changes) {
    void refreshAllTabBadges();
  }
});
