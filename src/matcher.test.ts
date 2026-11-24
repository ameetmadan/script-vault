import assert from "node:assert/strict";
import { test } from "node:test";
import { matchesUrl, wildcardToRegex } from "./matcher";

const cases: [string, string, string, boolean][] = [
  ["exact match", "https://example.com/page", "https://example.com/page", true],
  ["different path", "https://example.com/page", "https://example.com/other", false],
  ["start anchor", "https://example.com/page", "prefixhttps://example.com/page", false],
  ["end anchor", "https://example.com/page", "https://example.com/page/suffix", false],
  ["pattern whitespace", " \t https://example.com/page\n ", "https://example.com/page", true],
  ["URL whitespace is preserved", "https://example.com/page", " https://example.com/page", false],
  ["empty wildcard", "https://example.com/a*b", "https://example.com/ab", true],
  ["long wildcard", "https://example.com/a*b", "https://example.com/a/path/b", true],
  ["multiple wildcards", "*://*.example.com/*/edit*", "https://app.example.com/item/edit/123", true],
  ["multiple empty wildcards", "a**b*c", "abc", true],
  ["required literal between wildcards", "a*b*c", "axyzc", false],
  ["wildcard only", "*", "", true],
  ["wildcard matches URL", "*", "https://example.com/", true],
  ["literal dots", "https://example.com/", "https://exampleXcom/", false],
  ["literal question mark", "https://example.com/a?b", "https://example.com/ab", false],
  ["literal brackets", "https://example.com/[ab]", "https://example.com/a", false],
  ["literal backslash", String.raw`https://example.com/\d`, "https://example.com/7", false],
];

for (const character of [".", "?", "[", "]", "\\", "|", "{", "}", "(", ")", "^", "$", "+"]) {
  cases.push([`literal ${character}`, `https://example.com/a${character}b`, `https://example.com/a${character}b`, true]);
}

for (const [name, pattern, url, expected] of cases) {
  test(`wildcardToRegex: ${name}`, () => {
    assert.equal(wildcardToRegex(pattern).test(url), expected);
  });
  test(`matchesUrl: ${name}`, () => {
    assert.equal(matchesUrl(pattern, url), expected);
  });
}

for (const pattern of ["", " ", "\t\n\r"]) {
  test(`wildcardToRegex rejects ${JSON.stringify(pattern)}`, () => {
    assert.throws(() => wildcardToRegex(pattern), /URL pattern is required/);
  });
  test(`matchesUrl rejects ${JSON.stringify(pattern)}`, () => {
    assert.equal(matchesUrl(pattern, "https://example.com/"), false);
  });
}
