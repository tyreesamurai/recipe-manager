import { describe, expect, test } from "bun:test";
import { helpers } from "../helpers";

describe("parseOptionalInt", () => {
  test("returns undefined for undefined input", () => {
    expect(helpers.parseOptionalInt(undefined)).toBeUndefined();
  });

  test("returns undefined for empty string", () => {
    expect(helpers.parseOptionalInt("")).toBeUndefined();
  });

  test("parses a valid integer", () => {
    expect(helpers.parseOptionalInt("42")).toBe(42);
  });

  test("parses a valid float", () => {
    expect(helpers.parseOptionalInt("3.14")).toBe(3.14);
  });

  test("returns undefined for a non-numeric string", () => {
    expect(helpers.parseOptionalInt("abc")).toBeUndefined();
  });

  test("returns undefined for mixed alphanumeric", () => {
    expect(helpers.parseOptionalInt("34f1")).toBeUndefined();
  });

  test("takes the first value from an array", () => {
    expect(helpers.parseOptionalInt(["10", "20"])).toBe(10);
  });

  test("returns undefined for an array whose first element is non-numeric", () => {
    expect(helpers.parseOptionalInt(["abc", "20"])).toBeUndefined();
  });

  test("returns undefined for an empty array", () => {
    expect(helpers.parseOptionalInt([])).toBeUndefined();
  });
});

describe("parseOptionalString", () => {
  test("returns undefined for undefined", () => {
    expect(helpers.parseOptionalString(undefined)).toBeUndefined();
  });

  test("returns undefined for an empty string", () => {
    expect(helpers.parseOptionalString("")).toBeUndefined();
  });

  test("returns undefined for a whitespace-only string", () => {
    expect(helpers.parseOptionalString("   ")).toBeUndefined();
  });

  test("returns the trimmed string", () => {
    expect(helpers.parseOptionalString("  hello  ")).toBe("hello");
  });

  test("takes the first value from an array", () => {
    expect(helpers.parseOptionalString(["hello", "world"])).toBe("hello");
  });

  test("returns undefined when the first array element is blank", () => {
    expect(helpers.parseOptionalString(["  ", "world"])).toBeUndefined();
  });
});

describe("parseStringArray", () => {
  test("returns undefined for undefined", () => {
    expect(helpers.parseStringArray(undefined)).toBeUndefined();
  });

  test("returns undefined for an empty string", () => {
    expect(helpers.parseStringArray("")).toBeUndefined();
  });

  test("wraps a non-empty string in an array", () => {
    expect(helpers.parseStringArray("hello")).toEqual(["hello"]);
  });

  test("passes through a plain array", () => {
    expect(helpers.parseStringArray(["hello", "world"])).toEqual([
      "hello",
      "world",
    ]);
  });

  test("filters out empty strings from an array", () => {
    expect(helpers.parseStringArray(["hello", "", "world"])).toEqual([
      "hello",
      "world",
    ]);
  });

  test("returns undefined for an array of only blank strings", () => {
    expect(helpers.parseStringArray(["", "  "])).toBeUndefined();
  });

  test("trims whitespace from each entry", () => {
    expect(helpers.parseStringArray(["  hello  ", "  world  "])).toEqual([
      "hello",
      "world",
    ]);
  });
});

describe("parseNumberOr", () => {
  test("returns the fallback for null", () => {
    expect(helpers.parseNumberOr(null, 5)).toBe(5);
  });

  test("returns the fallback for an empty string", () => {
    expect(helpers.parseNumberOr("", 5)).toBe(5);
  });

  test("returns the fallback for a whitespace-only string", () => {
    expect(helpers.parseNumberOr("  ", 5)).toBe(5);
  });

  test("parses a valid number", () => {
    expect(helpers.parseNumberOr("42", 0)).toBe(42);
  });

  test("parses a valid float", () => {
    expect(helpers.parseNumberOr("3.14", 0)).toBe(3.14);
  });

  test("returns the fallback for a non-numeric string", () => {
    expect(helpers.parseNumberOr("abc", 0)).toBe(0);
  });

  test("returns the fallback value itself when 0", () => {
    expect(helpers.parseNumberOr(null, 0)).toBe(0);
  });
});
