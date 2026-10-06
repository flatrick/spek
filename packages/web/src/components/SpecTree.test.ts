import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import type { SpecInfo } from "@spekjs/core";
import { SpecTree } from "./SpecTree";

const spec = (topic: string, historyChanges: string[] = []): SpecInfo => ({
  topic,
  path: `/r/${topic}/spec.md`,
  historyCount: historyChanges.length,
  historyChanges,
});

const SPECS = [
  spec("auth"),
  spec("contracts/pagination", ["add-pagination"]),
  spec("contracts/pagination/streaming-search", ["add-pagination", "add-streaming-search"]),
  spec("guides/pagination"),
];

const render = (filter = "", specs = SPECS): string =>
  renderToStaticMarkup(createElement(MemoryRouter, null, createElement(SpecTree, { specs, filter })));

const links = (html: string): string[] => [...html.matchAll(/<a [^>]*href="([^"]*)"/g)].map((m) => m[1]);

test("a spec-bearing parent is a link and expands to its child", () => {
  const html = render();
  assert.ok(links(html).includes("/specs/contracts/pagination"));
  assert.ok(links(html).includes("/specs/contracts/pagination/streaming-search"));
  assert.match(html, /aria-label="Collapse contracts\/pagination"/);
  assert.match(html, /title="contracts\/pagination\/streaming-search"[^>]*>streaming-search</);
});

test("a grouping-only folder links nowhere", () => {
  const html = render();
  assert.ok(!links(html).some((href) => href === "/specs/contracts" || href === "/specs/guides"));
  assert.match(html, /<span title="guides"[^>]*>guides\/<\/span>/);
});

test("duplicate basenames stay distinct by full topic", () => {
  const html = render();
  assert.match(html, /<a title="contracts\/pagination"[^>]*href="\/specs\/contracts\/pagination"[^>]*>pagination</);
  assert.match(html, /<a title="guides\/pagination"[^>]*href="\/specs\/guides\/pagination"[^>]*>pagination</);
});

test("filtering matches the full topic and keeps the folders above a match", () => {
  assert.deepEqual(links(render("guides/pag")), ["/specs/guides/pagination"]);
  // The parent did not match on its own but stays openable as the way to its matching child.
  assert.deepEqual(links(render("STREAMING")), [
    "/specs/contracts/pagination",
    "/specs/contracts/pagination/streaming-search",
  ]);
  assert.match(render("nothing-matches"), /No specs found/);
});

test("siblings order per segment by code unit", () => {
  const html = render("", [spec("ab"), spec("a/c"), spec("a-b"), spec("a")]);
  assert.deepEqual(links(html), ["/specs/a", "/specs/a/c", "/specs/a-b", "/specs/ab"]);
});

test("a leaf spec shows only its own count", () => {
  assert.match(render(), /streaming-search<\/a><span[^>]*>2 changes<\/span>/);
});

test("a spec-bearing parent shows its own count and its folder's distinct total", () => {
  // The child's two changes include the parent's one, so the total is 2, not 3.
  assert.match(render(), /href="\/specs\/contracts\/pagination"[^>]*>pagination<\/a><span[^>]*>1 change · 2 total<\/span>/);
});

test("a grouping-only folder shows a total and no count of its own, even a zero one", () => {
  assert.match(render(), /contracts\/<\/span><span[^>]*>— · 2 total<\/span>/);
  assert.match(render(), /guides\/<\/span><span[^>]*>— · 0 total<\/span>/);
});

test("a parent with no changes of its own still shows its own count beside the total", () => {
  assert.match(render("", [spec("a"), spec("a/b", ["c1"])]), /href="\/specs\/a"[^>]*>a<\/a><span[^>]*>0 changes · 1 total<\/span>/);
});

test("a filter does not shrink a folder's total", () => {
  const specs = [...SPECS, spec("contracts/sorting", ["add-sorting"])];
  assert.match(render("", specs), /contracts\/<\/span><span[^>]*>— · 3 total<\/span>/);
  const filtered = render("streaming", specs);
  assert.ok(!links(filtered).includes("/specs/contracts/sorting"));
  assert.match(filtered, /contracts\/<\/span><span[^>]*>— · 3 total<\/span>/);
});

test("while filtering, the toggles are inert, so no collapse is recorded to surface later", () => {
  const toggles = (html: string) => [...html.matchAll(/<button[^>]*>/g)].map((m) => m[0]);
  assert.ok(toggles(render("pag")).length > 0);
  for (const button of toggles(render("pag"))) assert.match(button, /\sdisabled=""/);
  for (const button of toggles(render())) assert.doesNotMatch(button, /\sdisabled/);
});
