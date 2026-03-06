import { describe, expect, test } from "bun:test";
import { AppError, isAppError } from "../errors";

describe("AppError", () => {
  test("stores all provided properties", () => {
    const cause = new Error("original");
    const meta = { key: "value" };
    const err = new AppError({
      code: "INTERNAL",
      message: "something went wrong",
      status: 500,
      cause,
      meta,
    });

    expect(err.code).toBe("INTERNAL");
    expect(err.message).toBe("something went wrong");
    expect(err.status).toBe(500);
    expect(err.cause).toBe(cause);
    expect(err.meta).toBe(meta);
    expect(err.name).toBe("AppError");
  });

  test("is an instance of Error", () => {
    const err = new AppError({
      code: "NOT_FOUND",
      message: "not found",
      status: 404,
    });
    expect(err instanceof Error).toBe(true);
  });

  test("cause and meta default to undefined", () => {
    const err = new AppError({
      code: "NOT_FOUND",
      message: "not found",
      status: 404,
    });
    expect(err.cause).toBeUndefined();
    expect(err.meta).toBeUndefined();
  });

  test.each([
    ["MISCONFIGURATION", 500],
    ["VALIDATION", 400],
    ["NOT_FOUND", 404],
    ["UNAUTHORIZED", 401],
    ["FORBIDDEN", 403],
    ["CONFLICT", 409],
    ["INTERNAL", 500],
  ] as const)("accepts code %s with status %d", (code, status) => {
    const err = new AppError({ code, message: "test", status });
    expect(err.code).toBe(code);
    expect(err.status).toBe(status);
  });
});

describe("isAppError", () => {
  test("returns true for an AppError instance", () => {
    const err = new AppError({ code: "INTERNAL", message: "err", status: 500 });
    expect(isAppError(err)).toBe(true);
  });

  test("returns false for a plain Error", () => {
    expect(isAppError(new Error("plain"))).toBe(false);
  });

  test("returns false for null", () => {
    expect(isAppError(null)).toBe(false);
  });

  test("returns false for undefined", () => {
    expect(isAppError(undefined)).toBe(false);
  });

  test("returns false for a string", () => {
    expect(isAppError("error string")).toBe(false);
  });

  test("returns false for a number", () => {
    expect(isAppError(42)).toBe(false);
  });

  test("returns false for a plain object", () => {
    expect(isAppError({ code: "INTERNAL", message: "fake" })).toBe(false);
  });
});
