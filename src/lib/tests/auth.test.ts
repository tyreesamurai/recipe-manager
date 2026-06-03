import { beforeAll, describe, expect, test } from "bun:test";
import { requireAuth, signSession, verifySession } from "@/lib/auth";
import { AppError } from "@/lib/errors";

const TEST_SECRET = "test-secret-for-auth-tests-that-is-32-chars-long";

const approvedUser = {
  sid: "00000000-0000-4000-8000-000000000001",
  uid: "00000000-0000-4000-8000-000000000002",
  role: "user" as const,
  status: "approved" as const,
};

const adminUser = { ...approvedUser, role: "admin" as const };

const pendingSession = {
  sid: approvedUser.sid,
  uid: null,
  role: null,
  status: "pending" as const,
};

// ─── signSession ───────────────────────────────────────────────────────────

describe("signSession", () => {
  test("throws MISCONFIGURATION when SESSION_SECRET is not set", async () => {
    const prev = process.env.SESSION_SECRET;
    delete process.env.SESSION_SECRET;
    try {
      const err = await signSession(approvedUser).catch((e) => e);
      expect(err).toBeInstanceOf(AppError);
      expect(err.code).toBe("MISCONFIGURATION");
    } finally {
      process.env.SESSION_SECRET = prev;
    }
  });

  test("returns a three-part JWT string", async () => {
    process.env.SESSION_SECRET = TEST_SECRET;
    const token = await signSession(approvedUser);
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);
  });

  test("encodes the payload claims in the token", async () => {
    process.env.SESSION_SECRET = TEST_SECRET;
    const token = await signSession(approvedUser);
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString(),
    );
    expect(payload.sid).toBe(approvedUser.sid);
    expect(payload.uid).toBe(approvedUser.uid);
    expect(payload.role).toBe("user");
    expect(payload.status).toBe("approved");
  });

  test("encodes null uid and role for a pending session", async () => {
    process.env.SESSION_SECRET = TEST_SECRET;
    const token = await signSession(pendingSession);
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString(),
    );
    expect(payload.uid).toBeNull();
    expect(payload.role).toBeNull();
    expect(payload.status).toBe("pending");
  });

  test("includes iat and exp claims", async () => {
    process.env.SESSION_SECRET = TEST_SECRET;
    const token = await signSession(approvedUser);
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString(),
    );
    expect(typeof payload.iat).toBe("number");
    expect(typeof payload.exp).toBe("number");
    expect(payload.exp).toBeGreaterThan(payload.iat);
  });
});

// ─── verifySession ─────────────────────────────────────────────────────────

describe("verifySession", () => {
  beforeAll(() => {
    process.env.SESSION_SECRET = TEST_SECRET;
  });

  test("returns the session for a valid token", async () => {
    const token = await signSession(approvedUser);
    const result = await verifySession(token);
    expect(result).not.toBeNull();
    expect(result?.sid).toBe(approvedUser.sid);
    expect(result?.uid).toBe(approvedUser.uid);
    expect(result?.role).toBe("user");
    expect(result?.status).toBe("approved");
  });

  test("round-trips null uid and role for a pending session", async () => {
    const token = await signSession(pendingSession);
    const result = await verifySession(token);
    expect(result?.uid).toBeNull();
    expect(result?.role).toBeNull();
    expect(result?.status).toBe("pending");
  });

  test("returns null for a plain string", async () => {
    expect(await verifySession("not-a-token")).toBeNull();
  });

  test("returns null for a malformed JWT (a.b.c)", async () => {
    expect(await verifySession("a.b.c")).toBeNull();
  });

  test("returns null for an empty string", async () => {
    expect(await verifySession("")).toBeNull();
  });

  test("returns null for a token signed with a different secret", async () => {
    const original = process.env.SESSION_SECRET;
    process.env.SESSION_SECRET = "a-completely-different-secret-at-32-chars!";
    const foreignToken = await signSession(approvedUser);
    process.env.SESSION_SECRET = original;
    expect(await verifySession(foreignToken)).toBeNull();
  });

  test("returns null for a tampered payload", async () => {
    const token = await signSession(approvedUser);
    const [header, , sig] = token.split(".");
    const fakePayload = Buffer.from(
      JSON.stringify({ ...approvedUser, role: "admin" }),
    ).toString("base64url");
    expect(await verifySession(`${header}.${fakePayload}.${sig}`)).toBeNull();
  });

  test("sign → verify is a stable round-trip", async () => {
    const token = await signSession(adminUser);
    const result = await verifySession(token);
    expect(result?.sid).toBe(adminUser.sid);
    expect(result?.uid).toBe(adminUser.uid);
    expect(result?.role).toBe("admin");
    expect(result?.status).toBe("approved");
  });
});

// ─── requireAuth ───────────────────────────────────────────────────────────

describe("requireAuth", () => {
  const makeReq = (cookie?: string) =>
    new Request("http://localhost/api/test", {
      headers: cookie ? { cookie } : {},
    });

  beforeAll(() => {
    process.env.SESSION_SECRET = TEST_SECRET;
  });

  test("throws UNAUTHORIZED when no cookie header is present", async () => {
    await expect(requireAuth(makeReq())).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      status: 401,
    });
  });

  test("throws UNAUTHORIZED for a garbage token value", async () => {
    await expect(
      requireAuth(makeReq("__Host-session=garbage")),
    ).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      status: 401,
    });
  });

  test("throws UNAUTHORIZED when the cookie is present with a different name", async () => {
    const token = await signSession(approvedUser);
    await expect(
      requireAuth(makeReq(`wrong-cookie=${token}`)),
    ).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      status: 401,
    });
  });

  test("returns the session for a valid approved token", async () => {
    const token = await signSession(approvedUser);
    const session = await requireAuth(makeReq(`__Host-session=${token}`));
    expect(session.sid).toBe(approvedUser.sid);
    expect(session.uid).toBe(approvedUser.uid);
    expect(session.role).toBe("user");
  });

  test("throws FORBIDDEN when admin role is required but session is user", async () => {
    const token = await signSession(approvedUser);
    await expect(
      requireAuth(makeReq(`__Host-session=${token}`), "admin"),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      status: 403,
    });
  });

  test("passes when admin role is required and session is admin", async () => {
    const token = await signSession(adminUser);
    const session = await requireAuth(
      makeReq(`__Host-session=${token}`),
      "admin",
    );
    expect(session.role).toBe("admin");
  });

  test("extracts the correct cookie when multiple cookies are in the header", async () => {
    const token = await signSession(approvedUser);
    const session = await requireAuth(
      makeReq(`foo=bar; __Host-session=${token}; baz=qux`),
    );
    expect(session.sid).toBe(approvedUser.sid);
  });

  test("does not check role when no role argument is passed", async () => {
    const token = await signSession(approvedUser);
    const session = await requireAuth(makeReq(`__Host-session=${token}`));
    expect(session).toBeDefined();
  });
});
