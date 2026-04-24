import { wildcardToRegex } from "./matcher";
import { deleteScript, exportScripts, getScripts, importScripts, saveScript } from "./storage";
import type { SavedScript } from "./types";

const form = document.querySelector<HTMLFormElement>("#script-form");
const titleEl = document.querySelector<HTMLHeadingElement>("#form-title");
const nameInput = document.querySelector<HTMLInputElement>("#name");
const urlPatternInput = document.querySelector<HTMLInputElement>("#url-pattern");
const codeInput = document.querySelector<HTMLTextAreaElement>("#code");
const deleteButton = document.querySelector<HTMLButtonElement>("#delete-script");
const newButton = document.querySelector<HTMLButtonElement>("#new-script");
const savedList = document.querySelector<HTMLDivElement>("#saved-list");
const statusEl = document.querySelector<HTMLParagraphElement>("#status");
const transferJson = document.querySelector<HTMLTextAreaElement>("#transfer-json");
const exportButton = document.querySelector<HTMLButtonElement>("#export-json");
const importButton = document.querySelector<HTMLButtonElement>("#import-json");

let scripts: SavedScript[] = [];
let editingId: string | null = null;

function setStatus(message: string): void {
  if (statusEl) {
    statusEl.textContent = message;
  }
}

function emptyDraft(): SavedScript {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    name: "",
    urlPattern: "",
    code: "",
    createdAt: now,
    updatedAt: now
  };
}

function currentScript(): SavedScript {
  return {
    id: editingId ?? crypto.randomUUID(),
    name: nameInput?.value.trim() ?? "",
    urlPattern: urlPatternInput?.value.trim() ?? "",
    code: codeInput?.value ?? "",
    createdAt: scripts.find((script) => script.id === editingId)?.createdAt ?? Date.now(),
    updatedAt: Date.now()
  };
}

function fillForm(script: SavedScript): void {
  editingId = script.id;
  if (titleEl) {
    titleEl.textContent = "Edit Script";
  }
  if (nameInput) {
    nameInput.value = script.name;
  }
  if (urlPatternInput) {
    urlPatternInput.value = script.urlPattern;
  }
  if (codeInput) {
    codeInput.value = script.code;
  }
  if (deleteButton) {
    deleteButton.disabled = false;
  }
}

function resetForm(): void {
  editingId = null;
  form?.reset();
  if (titleEl) {
    titleEl.textContent = "Add Script";
  }
  if (deleteButton) {
    deleteButton.disabled = true;
  }
}

function renderScriptList(): void {
  if (!savedList) {
    return;
  }

  savedList.replaceChildren();

  if (scripts.length === 0) {
    const empty = document.createElement("p");
    empty.className = "hint";
    empty.textContent = "No saved scripts yet.";
    savedList.appendChild(empty);
    return;
  }

  for (const script of scripts) {
    const item = document.createElement("div");
    item.className = `script-item${editingId === script.id ? " active" : ""}`;

    const button = document.createElement("button");
    button.type = "button";
    button.innerHTML = `<strong>${escapeHtml(script.name)}</strong><p>${escapeHtml(script.urlPattern)}</p>`;
    button.addEventListener("click", () => {
      fillForm(script);
      renderScriptList();
      setStatus(`Editing "${script.name}".`);
    });

    item.appendChild(button);
    savedList.appendChild(item);
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
    }
  });
}

async function reloadScripts(): Promise<void> {
  scripts = await getScripts();
  renderScriptList();
}

function validateScript(script: SavedScript): void {
  if (!script.name) {
    throw new Error("Name is required.");
  }
  if (!script.urlPattern) {
    throw new Error("URL pattern is required.");
  }
  wildcardToRegex(script.urlPattern);
  if (!script.code.trim()) {
    throw new Error("Code is required.");
  }
}

async function loadFromQuery(): Promise<void> {
  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get("edit");

  if (!requestedId) {
    resetForm();
    return;
  }

  const existing = scripts.find((script) => script.id === requestedId);
  if (existing) {
    fillForm(existing);
    renderScriptList();
  } else {
    resetForm();
    setStatus(`Script ${requestedId} was not found.`);
  }
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const script = currentScript();
    validateScript(script);
    await saveScript(script);
    await reloadScripts();
    fillForm(script);
    renderScriptList();
    setStatus(`Saved "${script.name}".`);
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Failed to save script.");
  }
});

deleteButton?.addEventListener("click", async () => {
  if (!editingId) {
    return;
  }

  const script = scripts.find((item) => item.id === editingId);
  if (!script) {
    resetForm();
    return;
  }

  const confirmed = window.confirm(`Delete "${script.name}"?`);
  if (!confirmed) {
    return;
  }

  await deleteScript(script.id);
  await reloadScripts();
  resetForm();
  setStatus(`Deleted "${script.name}".`);
});

newButton?.addEventListener("click", () => {
  resetForm();
  setStatus("Ready for a new script.");
});

exportButton?.addEventListener("click", async () => {
  const json = await exportScripts();
  if (transferJson) {
    transferJson.value = json;
  }
  setStatus("Exported scripts to JSON.");
});

importButton?.addEventListener("click", async () => {
  try {
    await importScripts(transferJson?.value ?? "");
    await reloadScripts();
    await loadFromQuery();
    setStatus("Imported scripts from JSON.");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Failed to import scripts.");
  }
});

void (async () => {
  await reloadScripts();
  await loadFromQuery();
  if (!editingId) {
    resetForm();
  }
})();
