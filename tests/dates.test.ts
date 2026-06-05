import { test } from "node:test";
import assert from "node:assert/strict";
import {
  formatWeekLabel,
  previousFullWeek,
  priorWeek,
  toISODateString,
} from "../lib/util/dates.js";

// 2026-06-10 is a Wednesday; the most recent completed week is Mon 1 Jun → Mon 8 Jun.
const NOW = new Date("2026-06-10T12:00:00Z");

test("previousFullWeek returns the most recent completed Mon–Mon week", () => {
  const w = previousFullWeek(NOW);
  assert.equal(toISODateString(w.start), "2026-06-01");
  assert.equal(toISODateString(w.end), "2026-06-08"); // exclusive
  assert.equal(w.label, "Week of 1 June");
});

test("priorWeek steps back exactly one week", () => {
  const w = priorWeek(previousFullWeek(NOW));
  assert.equal(toISODateString(w.start), "2026-05-25");
  assert.equal(toISODateString(w.end), "2026-06-01");
});

test("formatWeekLabel renders day + long month in UTC", () => {
  assert.equal(formatWeekLabel(new Date("2026-06-01T00:00:00Z")), "Week of 1 June");
  assert.equal(formatWeekLabel(new Date("2026-12-25T00:00:00Z")), "Week of 25 December");
});

test("a Monday input resolves to its own week", () => {
  // Mon 8 Jun → most recent completed week is the one before it.
  const w = previousFullWeek(new Date("2026-06-08T00:00:00Z"));
  assert.equal(toISODateString(w.start), "2026-06-01");
});
