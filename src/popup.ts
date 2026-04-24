import { matchesUrl } from "./matcher";
import { deleteScript, getScripts } from "./storage";
import type { BackgroundResponse, SavedScript } from "./types";

const searchInput = document.querySelector<HTMLInputElement>("#search");
const scriptList = document.querySelector<HTMLDivElement>("#script-list");
const statusEl = document.querySelector<HTMLParagraphElement>("#status");
const activeUrlEl = document.querySelector<HTMLParagraphElement>("#active-url");
const openOptionsButton = document.querySelector<HTMLButtonElement>("#open-options");

let activeUrl = "";
let scripts: SavedScript[] = [];

function setStatus(message: string): void {
  if (statusEl) {
    statusEl.textContent = message;
  }
}

function compareScripts(left: SavedScript, right: SavedScript): number {
  const leftMatch = activeUrl ? matchesUrl(left.urlPattern, activeUrl) : false;
  const rightMatch = activeUrl ? matchesUrl(right.urlPattern, activeUrl) : false;

  if (leftMatch !== rightMatch) {
    return leftMatch ? -1 : 1;
  }

  return right.updatedAt - left.updatedAt;
}

async function copyText(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

function openOptionsFor(scriptId?: string): void {
  const suffix = scriptId ? `?edit=${encodeURIComponent(scriptId)}` : "";
  void chrome.tabs.create({ url: chrome.runtime.getURL(`options.html${suffix}`) });
}

async function fetchActiveUrl(): Promise<void> {
  const response = (await chrome.runtime.sendMessage({
    type: "get-active-tab-url"
  })) as BackgroundResponse & { url?: string };

  if (response.ok && response.url) {
    activeUrl = response.url;
    if (activeUrlEl) {
      activeUrlEl.textContent = activeUrl;
    }
  } else {
    activeUrl = "";
    if (activeUrlEl) {
      activeUrlEl.textContent = response.message ?? "No active tab URL";
    }
  }
}

function scriptMeta(script: SavedScript): string {
  const updated = new Date(script.updatedAt).toLocaleString();
  return `Updated ${updated}`;
}

function filteredScripts(): SavedScript[] {
  const query = searchInput?.value.trim().toLowerCase() ?? "";
  const filtered = !query
    ? scripts
    : scripts.filter((script) => {
        return (
          script.name.toLowerCase().includes(query) ||
          script.urlPattern.toLowerCase().includes(query) ||
          script.code.toLowerCase().includes(query)
        );
      });

  return [...filtered].sort(compareScripts);
}

async function handleRun(script: SavedScript): Promise<void> {
  if (!activeUrl || !matchesUrl(script.urlPattern, activeUrl)) {
    setStatus(`Refused to run "${script.name}". Current tab must match ${script.urlPattern}.`);
    return;
  }

  const confirmed = window.confirm(`Run "${script.name}" on:\n${activeUrl}`);
  if (!confirmed) {
    return;
  }

  const response = (await chrome.runtime.sendMessage({
    type: "run-script",
    scriptId: script.id
  })) as BackgroundResponse;

  setStatus(response.message ?? (response.ok ? "Script ran." : "Script failed."));
}

async function handleDelete(script: SavedScript): Promise<void> {
  const confirmed = window.confirm(`Delete "${script.name}"?`);
  if (!confirmed) {
    return;
  }

  await deleteScript(script.id);
  await loadScripts();
  setStatus(`Deleted "${script.name}".`);
}

function renderScripts(): void {
  if (!scriptList) {
    return;
  }

  const items = filteredScripts();
  scriptList.replaceChildren();

  if (items.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No scripts found.";
    scriptList.appendChild(empty);
    return;
  }

  for (const script of items) {
    const matching = activeUrl ? matchesUrl(script.urlPattern, activeUrl) : false;
    const card = document.createElement("article");
    card.className = `script-card${matching ? " matching" : ""}`;

    const top = document.createElement("div");
    top.className = "script-top";

    const title = document.createElement("h2");
    title.className = "script-name";
    title.textContent = script.name;

    top.appendChild(title);

    if (matching) {
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = "Matches tab";
      top.appendChild(badge);
    }

    const pattern = document.createElement("p");
    pattern.className = "pattern";
    pattern.textContent = script.urlPattern;

    const meta = document.createElement("p");
    meta.className = "meta";
    meta.textContent = scriptMeta(script);

    const actions = document.createElement("div");
    actions.className = "actions";

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "secondary";
    copyButton.textContent = "Copy";
    copyButton.addEventListener("click", async () => {
      await copyText(script.code);
      setStatus(`Copied "${script.name}".`);
    });

    const runButton = document.createElement("button");
    runButton.type = "button";
    runButton.textContent = "Run";
    runButton.addEventListener("click", async () => {
      await handleRun(script);
    });

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "secondary";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => {
      openOptionsFor(script.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "danger";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", async () => {
      await handleDelete(script);
    });

    actions.append(copyButton, runButton, editButton, deleteButton);
    card.append(top, pattern, meta, actions);
    scriptList.appendChild(card);
  }
}

async function loadScripts(): Promise<void> {
  scripts = await getScripts();
  renderScripts();
}

searchInput?.addEventListener("input", () => {
  renderScripts();
});

openOptionsButton?.addEventListener("click", () => {
  openOptionsFor();
});

void (async () => {
  await fetchActiveUrl();
  await loadScripts();
})();
