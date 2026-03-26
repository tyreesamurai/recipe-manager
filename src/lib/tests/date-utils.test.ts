import { describe, expect, test } from "bun:test";
import {
  addDays,
  formatWeekRange,
  getWeekStart,
  toISODate,
} from "../date-utils";

// ---------------------------------------------------------------------------
// toISODate
// ---------------------------------------------------------------------------

describe("toISODate", () => {
  test("formats a date as YYYY-MM-DD", () => {
    expect(toISODate(new Date(2025, 5, 3))).toBe("2025-06-03"); // month is 0-indexed
  });

  test("pads single-digit month and day with a leading zero", () => {
    expect(toISODate(new Date(2025, 0, 7))).toBe("2025-01-07");
  });

  test("does NOT flip to the next day for a late-night local time (the UTC-bug)", () => {
    // Simulate 8 PM EST on 2025-06-03. toISOString() would return
    // 2025-06-04 (midnight UTC) — our fix must return 2025-06-03.
    const eightPmLocal = new Date(2025, 5, 3, 20, 0, 0); // 20:00 local
    expect(toISODate(eightPmLocal)).toBe("2025-06-03");
  });

  test("returns the local date even at 23:59 local time", () => {
    const nearMidnight = new Date(2025, 5, 3, 23, 59, 59);
    expect(toISODate(nearMidnight)).toBe("2025-06-03");
  });

  test("returns the correct date at midnight local time", () => {
    const midnight = new Date(2025, 5, 4, 0, 0, 0);
    expect(toISODate(midnight)).toBe("2025-06-04");
  });
});

// ---------------------------------------------------------------------------
// getWeekStart
// ---------------------------------------------------------------------------

describe("getWeekStart", () => {
  test("returns Monday for a Wednesday input", () => {
    const wed = new Date(2025, 5, 4); // Wednesday June 4 2025
    expect(toISODate(getWeekStart(wed))).toBe("2025-06-02"); // Monday June 2
  });

  test("returns Monday for a Monday input (no change)", () => {
    const mon = new Date(2025, 5, 2); // Monday June 2 2025
    expect(toISODate(getWeekStart(mon))).toBe("2025-06-02");
  });

  test("returns previous Monday for a Sunday input", () => {
    const sun = new Date(2025, 5, 8); // Sunday June 8 2025
    expect(toISODate(getWeekStart(sun))).toBe("2025-06-02"); // Monday June 2
  });

  test("returns Monday for a Saturday input", () => {
    const sat = new Date(2025, 5, 7); // Saturday June 7 2025
    expect(toISODate(getWeekStart(sat))).toBe("2025-06-02"); // Monday June 2
  });

  test("zeroes out the time component", () => {
    const wed = new Date(2025, 5, 4, 15, 30, 45, 123);
    const result = getWeekStart(wed);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  test("does not mutate the input date", () => {
    const input = new Date(2025, 5, 4);
    const inputTime = input.getTime();
    getWeekStart(input);
    expect(input.getTime()).toBe(inputTime);
  });

  test("handles year boundary correctly (Sunday Dec 29 → Monday Dec 23)", () => {
    const sun = new Date(2024, 11, 29); // Sunday Dec 29 2024
    expect(toISODate(getWeekStart(sun))).toBe("2024-12-23"); // Monday Dec 23
  });
});

// ---------------------------------------------------------------------------
// addDays
// ---------------------------------------------------------------------------

describe("addDays", () => {
  test("adds positive days", () => {
    const d = new Date(2025, 5, 2); // June 2
    expect(toISODate(addDays(d, 5))).toBe("2025-06-07");
  });

  test("subtracts days with a negative value", () => {
    const d = new Date(2025, 5, 7); // June 7
    expect(toISODate(addDays(d, -5))).toBe("2025-06-02");
  });

  test("handles zero", () => {
    const d = new Date(2025, 5, 4);
    expect(toISODate(addDays(d, 0))).toBe("2025-06-04");
  });

  test("crosses month boundary", () => {
    const d = new Date(2025, 5, 28); // June 28
    expect(toISODate(addDays(d, 5))).toBe("2025-07-03");
  });

  test("crosses year boundary", () => {
    const d = new Date(2025, 11, 30); // Dec 30
    expect(toISODate(addDays(d, 3))).toBe("2026-01-02");
  });

  test("does not mutate the input date", () => {
    const d = new Date(2025, 5, 2);
    const original = d.getTime();
    addDays(d, 7);
    expect(d.getTime()).toBe(original);
  });
});

// ---------------------------------------------------------------------------
// formatWeekRange
// ---------------------------------------------------------------------------

describe("formatWeekRange", () => {
  test("returns a range from Monday to Sunday", () => {
    const weekStart = new Date(2025, 5, 2); // Monday June 2 2025
    const result = formatWeekRange(weekStart);
    expect(result).toContain("June 2");
    expect(result).toContain("June 8, 2025");
    expect(result).toContain("–");
  });

  test("includes the year only in the end date", () => {
    const weekStart = new Date(2025, 5, 2);
    const result = formatWeekRange(weekStart);
    // Start should NOT have year, end should have year
    const parts = result.split("–");
    expect(parts[0]).not.toContain("2025");
    expect(parts[1]).toContain("2025");
  });
});
