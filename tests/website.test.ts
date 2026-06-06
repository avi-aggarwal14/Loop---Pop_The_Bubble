import { test } from "node:test";
import assert from "node:assert/strict";
import { htmlToText, normalizeStartUrl } from "../lib/website/fetch";

test("normalizeStartUrl adds https only when missing", () => {
  assert.equal(normalizeStartUrl("example.com"), "https://example.com");
  assert.equal(normalizeStartUrl("  example.com "), "https://example.com");
  assert.equal(normalizeStartUrl("http://x.com"), "http://x.com");
  assert.equal(normalizeStartUrl("https://x.com"), "https://x.com");
});

test("htmlToText strips scripts, styles and tags, decodes entities", () => {
  const html =
    "<html><head><style>a{color:red}</style><title>T</title></head>" +
    "<body><script>doEvil()</script><h1>Hi</h1><p>World &amp; more</p></body></html>";
  const text = htmlToText(html);
  assert.ok(!text.includes("doEvil"));
  assert.ok(!text.includes("color:red"));
  assert.match(text, /Hi/);
  assert.match(text, /World & more/);
});
