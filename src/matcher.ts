function escapeRegex(value: string): string {
  return value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
}

export function wildcardToRegex(pattern: string): RegExp {
  const trimmed = pattern.trim();
  if (!trimmed) {
    throw new Error("URL pattern is required.");
  }

  const regexSource = trimmed
    .split("*")
    .map((part) => escapeRegex(part))
    .join(".*");

  return new RegExp(`^${regexSource}$`);
}

export function matchesUrl(pattern: string, url: string): boolean {
  try {
    return wildcardToRegex(pattern).test(url);
  } catch {
    return false;
  }
}
