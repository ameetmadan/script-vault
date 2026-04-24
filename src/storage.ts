import type { SavedScript } from "./types";

const STORAGE_KEY = "savedScripts";

function sortScripts(scripts: SavedScript[]): SavedScript[] {
  return [...scripts].sort((a, b) => b.updatedAt - a.updatedAt);
}

function normalizeScript(script: SavedScript): SavedScript {
  return {
    ...script,
    name: script.name.trim(),
    urlPattern: script.urlPattern.trim()
  };
}

export async function getScripts(): Promise<SavedScript[]> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const scripts = Array.isArray(result[STORAGE_KEY]) ? (result[STORAGE_KEY] as SavedScript[]) : [];
  return sortScripts(scripts);
}

async function setScripts(scripts: SavedScript[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: sortScripts(scripts) });
}

export async function saveScript(script: SavedScript): Promise<void> {
  const scripts = await getScripts();
  const normalized = normalizeScript(script);
  const index = scripts.findIndex((item) => item.id === normalized.id);

  if (index >= 0) {
    scripts[index] = normalized;
  } else {
    scripts.push(normalized);
  }

  await setScripts(scripts);
}

export async function deleteScript(id: string): Promise<void> {
  const scripts = await getScripts();
  await setScripts(scripts.filter((script) => script.id !== id));
}

export async function exportScripts(): Promise<string> {
  const scripts = await getScripts();
  return JSON.stringify(scripts, null, 2);
}

export async function importScripts(json: string): Promise<void> {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("Import must be valid JSON.");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Import must be a JSON array.");
  }

  const seenIds = new Set<string>();
  const scripts = parsed.map((item, index) => {
    if (typeof item !== "object" || item === null) {
      throw new Error(`Script at index ${index} must be an object.`);
    }

    const script = item as Partial<SavedScript>;

    if (
      typeof script.id !== "string" ||
      typeof script.name !== "string" ||
      typeof script.urlPattern !== "string" ||
      typeof script.code !== "string" ||
      typeof script.createdAt !== "number" ||
      typeof script.updatedAt !== "number"
    ) {
      throw new Error(`Script at index ${index} is missing required fields.`);
    }

    if (seenIds.has(script.id)) {
      throw new Error(`Duplicate script id found: ${script.id}`);
    }

    seenIds.add(script.id);
    return normalizeScript(script as SavedScript);
  });

  await setScripts(scripts);
}
