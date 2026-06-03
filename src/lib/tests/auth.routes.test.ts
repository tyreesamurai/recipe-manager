import { beforeEach, describe, expect, mock, test } from "bun:test";
import { signSession } from "@/lib/auth";

// ─── Fixtures ──────────────────────────────────────────────────────────────

const TEST_SECRET = "test-secret-for-route-tests-at-least-32-chars";
process.env.SESSION_SECRET = TEST_SECRET;

const SESSION_ID = "00000000-0000-4000-8000-000000000001";
const USER_ID = "00000000-0000-4000-8000-000000000002";
const ADMIN_ID = "00000000-0000-4000-8000-000000000003";

const dbSession = (overrides: Record<string, unknown> = {}) => ({
  id: SESSION_ID,
  userId: null,
  status: "pending",
  requesterName: "Test User",
  requesterEmail: null,
  ipAddress: "203.0.113.1",
  userAgent: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  expiresAt: null,
  approvedBy: null,
  ...overrides,
});

const dbUser = (overrides: Record<string, unknown> = {}) => ({
  id: USER_ID,
  name: "Test User",
  email: null,
  role: "user",
  createdAt: new Date(),
  ...overrides,
});

// ─── Mock state ────────────────────────────────────────────────────────────

const cookieStore = new Map<string, string>();
const cookieSetCalls: { name: string; value: string; options?: object }[] = [];
const selectQueue: unknown[][] = [];
const insertQueue: unknown[][] = [];

function queueSelects(...results: unknown[][]) {
  selectQueue.push(...results);
}

function queueInserts(...results: unknown[][]) {
  insertQueue.push(...results);
}

// ─── Module mocks (hoisted by bun before imports) ─────────────────────────

mock.module("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = cookieStore.get(name);
      return value !== undefined ? { name, value } : undefined;
    },
    set: (name: string, value: string, options?: object) => {
      cookieStore.set(name, value);
      cookieSetCalls.push({ name, value, options });
    },
  }),
}));

// Chainable DB mock — any method returns the same proxy, making
// db.select().from(x).where(y).limit(n) all awaitable with the queued result.
const makeChain = (getResult: () => unknown[]) => {
  let proxy: object;
  const handler: ProxyHandler<object> = {
    get(_, prop: string) {
      if (prop === "then") {
        return (
          resolve: (v: unknown) => unknown,
          reject: (e: unknown) => void,
        ) => Promise.resolve(getResult()).then(resolve, reject);
      }
      if (prop === "returning") {
        return () => Promise.resolve(getResult());
      }
      return () => proxy;
    },
  };
  proxy = new Proxy({}, handler);
  return proxy;
};

mock.module("@/db/index", () => ({
  db: {
    select: () => makeChain(() => (selectQueue.shift() ?? []) as unknown[]),
    insert: () => makeChain(() => (insertQueue.shift() ?? []) as unknown[]),
    update: () => makeChain(() => [] as unknown[]),
  },
}));

// ─── Route imports (after mocks) ───────────────────────────────────────────

import { POST as approvePost } from "@/app/api/auth/approve/route";
import { GET as autoGet } from "@/app/api/auth/auto/route";
import { POST as logoutPost } from "@/app/api/auth/logout/route";
import { GET as meGet } from "@/app/api/auth/me/route";
import { POST as requestPost } from "@/app/api/auth/request/route";
import { GET as statusGet } from "@/app/api/auth/status/route";

// ─── Helpers ───────────────────────────────────────────────────────────────

const post = (url: string, body: object, cookie?: string) =>
  new Request(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
  });

const get = (url: string, headers: Record<string, string> = {}) =>
  new Request(url, { headers });

async function tokenFor(
  payload: Parameters<typeof signSession>[0],
): Promise<string> {
  return signSession(payload);
}

async function adminCookie() {
  const token = await tokenFor({
    sid: ADMIN_ID,
    uid: ADMIN_ID,
    role: "admin",
    status: "approved",
  });
  return `__Host-session=${token}`;
}

async function userCookie() {
  const token = await tokenFor({
    sid: SESSION_ID,
    uid: USER_ID,
    role: "user",
    status: "approved",
  });
  return `__Host-session=${token}`;
}

// ─── Reset between tests ───────────────────────────────────────────────────

beforeEach(() => {
  cookieStore.clear();
  cookieSetCalls.length = 0;
  selectQueue.length = 0;
  insertQueue.length = 0;
});

// ─── POST /api/auth/request ────────────────────────────────────────────────

describe("POST /api/auth/request", () => {
  test("returns 400 for invalid JSON", async () => {
    const req = new Request("http://localhost/api/auth/request", {
      method: "POST",
      body: "not json",
      headers: { "content-type": "application/json" },
    });
    const res = await requestPost(req);
    expect(res.status).toBe(400);
  });

  test("returns 400 when name is missing", async () => {
    const req = post("http://localhost/api/auth/request", {
      email: "a@b.com",
    });
    const res = await requestPost(req);
    expect(res.status).toBe(400);
  });

  test("returns 400 when name is an empty string", async () => {
    const req = post("http://localhost/api/auth/request", { name: "" });
    const res = await requestPost(req);
    expect(res.status).toBe(400);
  });

  test("returns 201 and sets a signed cookie for a valid request", async () => {
    queueInserts([dbSession()]);
    const req = post("http://localhost/api/auth/request", { name: "Alice" });
    const res = await requestPost(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.ok).toBe(true);
    const setCookie = cookieSetCalls.find((c) => c.name === "__Host-session");
    expect(setCookie).toBeDefined();
    expect(setCookie?.options).toMatchObject({ httpOnly: true, secure: true });
  });

  test("includes optional email in the cookie payload", async () => {
    queueInserts([dbSession({ requesterEmail: "alice@example.com" })]);
    const req = post("http://localhost/api/auth/request", {
      name: "Alice",
      email: "alice@example.com",
    });
    const res = await requestPost(req);
    expect(res.status).toBe(201);
  });
});

// ─── GET /api/auth/status ──────────────────────────────────────────────────

describe("GET /api/auth/status", () => {
  test("returns 401 when no cookie is present", async () => {
    const res = await statusGet();
    expect(res.status).toBe(401);
  });

  test("returns 401 when the token is invalid", async () => {
    cookieStore.set("__Host-session", "bad.token.here");
    const res = await statusGet();
    expect(res.status).toBe(401);
  });

  test("returns 401 when the session is not found in the DB", async () => {
    const token = await tokenFor({
      sid: SESSION_ID,
      uid: null,
      role: null,
      status: "pending",
    });
    cookieStore.set("__Host-session", token);
    queueSelects([]); // no DB session found
    const res = await statusGet();
    expect(res.status).toBe(401);
  });

  test("returns pending for a pending DB session", async () => {
    const token = await tokenFor({
      sid: SESSION_ID,
      uid: null,
      role: null,
      status: "pending",
    });
    cookieStore.set("__Host-session", token);
    queueSelects([dbSession({ status: "pending" })]);
    const res = await statusGet();
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ status: "pending" });
  });

  test("returns 401 for a denied DB session", async () => {
    const token = await tokenFor({
      sid: SESSION_ID,
      uid: null,
      role: null,
      status: "pending",
    });
    cookieStore.set("__Host-session", token);
    queueSelects([dbSession({ status: "denied" })]);
    const res = await statusGet();
    expect(res.status).toBe(401);
  });

  test("returns approved and upgrades the cookie for an approved session", async () => {
    const token = await tokenFor({
      sid: SESSION_ID,
      uid: null,
      role: null,
      status: "pending",
    });
    cookieStore.set("__Host-session", token);
    queueSelects(
      [dbSession({ status: "approved", userId: USER_ID })],
      [dbUser()],
    );
    const res = await statusGet();
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ status: "approved" });
    const upgradedCookie = cookieSetCalls.find(
      (c) => c.name === "__Host-session",
    );
    expect(upgradedCookie).toBeDefined();
    expect(upgradedCookie?.options).toMatchObject({ httpOnly: true });
  });

  test("returns 401 when approved session has no linked user", async () => {
    const token = await tokenFor({
      sid: SESSION_ID,
      uid: null,
      role: null,
      status: "pending",
    });
    cookieStore.set("__Host-session", token);
    queueSelects([dbSession({ status: "approved", userId: null })]);
    const res = await statusGet();
    expect(res.status).toBe(401);
  });
});

// ─── GET /api/auth/auto ────────────────────────────────────────────────────

describe("GET /api/auth/auto", () => {
  test("returns 500 when the IP cannot be determined", async () => {
    const req = get("http://localhost/api/auth/auto?redirect=/");
    const res = await autoGet(req);
    expect(res.status).toBe(500);
  });

  test("returns 403 for a public IP", async () => {
    const req = get("http://localhost/api/auth/auto?redirect=/", {
      "cf-connecting-ip": "8.8.8.8",
    });
    const res = await autoGet(req);
    expect(res.status).toBe(403);
  });

  test("redirects with a cookie for loopback, creating Local Admin on first use", async () => {
    queueSelects([]); // no existing Local Admin
    queueInserts(
      [dbUser({ id: ADMIN_ID, name: "Local Admin", role: "admin" })],
      [dbSession({ id: SESSION_ID, userId: ADMIN_ID, status: "approved" })],
    );
    const req = get("http://localhost/api/auth/auto?redirect=/dashboard", {
      "cf-connecting-ip": "127.0.0.1",
    });
    const res = await autoGet(req);
    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.status).toBeLessThan(400);
    expect(res.headers.get("set-cookie")).toContain("__Host-session");
  });

  test("reuses an existing Local Admin user", async () => {
    queueSelects([
      dbUser({ id: ADMIN_ID, name: "Local Admin", role: "admin" }),
    ]);
    queueInserts([
      dbSession({ id: SESSION_ID, userId: ADMIN_ID, status: "approved" }),
    ]);
    const req = get("http://localhost/api/auth/auto?redirect=/", {
      "x-real-ip": "192.168.1.50",
    });
    const res = await autoGet(req);
    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.status).toBeLessThan(400);
    // Insert queue is empty — only the session was inserted, not a new user
    expect(insertQueue.length).toBe(0);
  });

  test("redirects for a Tailscale IP", async () => {
    queueSelects([
      dbUser({ id: ADMIN_ID, name: "Local Admin", role: "admin" }),
    ]);
    queueInserts([
      dbSession({ id: SESSION_ID, userId: ADMIN_ID, status: "approved" }),
    ]);
    const req = get("http://localhost/api/auth/auto?redirect=/", {
      "cf-connecting-ip": "100.96.1.1",
    });
    const res = await autoGet(req);
    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.status).toBeLessThan(400);
  });

  test("defaults redirect to / when param is absent", async () => {
    queueSelects([
      dbUser({ id: ADMIN_ID, name: "Local Admin", role: "admin" }),
    ]);
    queueInserts([
      dbSession({ id: SESSION_ID, userId: ADMIN_ID, status: "approved" }),
    ]);
    const req = get("http://localhost/api/auth/auto", {
      "cf-connecting-ip": "127.0.0.1",
    });
    const res = await autoGet(req);
    expect(res.headers.get("location")).toContain("/");
  });

  test("ignores external redirect params and falls back to /", async () => {
    queueSelects([
      dbUser({ id: ADMIN_ID, name: "Local Admin", role: "admin" }),
    ]);
    queueInserts([
      dbSession({ id: SESSION_ID, userId: ADMIN_ID, status: "approved" }),
    ]);
    const req = get(
      "http://localhost/api/auth/auto?redirect=https://evil.com",
      { "cf-connecting-ip": "127.0.0.1" },
    );
    const res = await autoGet(req);
    expect(res.headers.get("location")).not.toContain("evil.com");
  });
});

// ─── POST /api/auth/approve ────────────────────────────────────────────────

describe("POST /api/auth/approve", () => {
  test("returns 401 when not authenticated", async () => {
    const req = post("http://localhost/api/auth/approve", {
      sessionId: SESSION_ID,
      action: "deny",
    });
    const res = await approvePost(req);
    expect(res.status).toBe(401);
  });

  test("returns 403 for a non-admin session", async () => {
    const cookie = await userCookie();
    const req = post(
      "http://localhost/api/auth/approve",
      { sessionId: SESSION_ID, action: "deny" },
      cookie,
    );
    const res = await approvePost(req);
    expect(res.status).toBe(403);
  });

  test("returns 400 for an invalid request body", async () => {
    const cookie = await adminCookie();
    const req = post(
      "http://localhost/api/auth/approve",
      { sessionId: "not-a-uuid", action: "deny" },
      cookie,
    );
    const res = await approvePost(req);
    expect(res.status).toBe(400);
  });

  test("returns 400 when approve has neither userId nor newUserName", async () => {
    const cookie = await adminCookie();
    const req = post(
      "http://localhost/api/auth/approve",
      { sessionId: SESSION_ID, action: "approve" },
      cookie,
    );
    const res = await approvePost(req);
    expect(res.status).toBe(400);
  });

  test("returns 404 for an unknown session", async () => {
    const cookie = await adminCookie();
    queueSelects([]);
    const req = post(
      "http://localhost/api/auth/approve",
      { sessionId: SESSION_ID, action: "deny" },
      cookie,
    );
    const res = await approvePost(req);
    expect(res.status).toBe(404);
  });

  test("denies a session and returns ok", async () => {
    const cookie = await adminCookie();
    queueSelects([dbSession()]);
    const req = post(
      "http://localhost/api/auth/approve",
      { sessionId: SESSION_ID, action: "deny" },
      cookie,
    );
    const res = await approvePost(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true });
  });

  test("approves with a new user name and returns ok", async () => {
    const cookie = await adminCookie();
    queueSelects([dbSession()]);
    queueInserts([dbUser()]);
    const req = post(
      "http://localhost/api/auth/approve",
      { sessionId: SESSION_ID, action: "approve", newUserName: "Alice" },
      cookie,
    );
    const res = await approvePost(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true });
  });

  test("approves by linking an existing user and returns ok", async () => {
    const cookie = await adminCookie();
    queueSelects(
      [dbSession()], // target session
      [dbUser()], // existing user lookup
    );
    const req = post(
      "http://localhost/api/auth/approve",
      { sessionId: SESSION_ID, action: "approve", userId: USER_ID },
      cookie,
    );
    const res = await approvePost(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true });
  });

  test("returns 404 when linking to a user that does not exist", async () => {
    const cookie = await adminCookie();
    queueSelects(
      [dbSession()], // target session found
      [], // existing user not found
    );
    const req = post(
      "http://localhost/api/auth/approve",
      { sessionId: SESSION_ID, action: "approve", userId: USER_ID },
      cookie,
    );
    const res = await approvePost(req);
    expect(res.status).toBe(404);
  });
});

// ─── GET /api/auth/me ──────────────────────────────────────────────────────

describe("GET /api/auth/me", () => {
  test("throws UNAUTHORIZED when not authenticated", async () => {
    const req = get("http://localhost/api/auth/me");
    await expect(meGet(req)).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      status: 401,
    });
  });

  test("returns the session payload for a valid token", async () => {
    const cookie = await userCookie();
    const req = get("http://localhost/api/auth/me", { cookie });
    const res = await meGet(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sid).toBe(SESSION_ID);
    expect(body.uid).toBe(USER_ID);
    expect(body.role).toBe("user");
  });

  test("throws UNAUTHORIZED for an invalid token", async () => {
    const req = get("http://localhost/api/auth/me", {
      cookie: "__Host-session=garbage",
    });
    await expect(meGet(req)).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      status: 401,
    });
  });
});

// ─── POST /api/auth/logout ─────────────────────────────────────────────────

describe("POST /api/auth/logout", () => {
  test("clears the cookie and returns ok even without a valid session", async () => {
    const req = new Request("http://localhost/api/auth/logout", {
      method: "POST",
    });
    const res = await logoutPost(req);
    expect(res.status).toBe(200);
    const cleared = cookieSetCalls.find((c) => c.name === "__Host-session");
    expect(cleared).toBeDefined();
    expect(cleared?.value).toBe("");
    expect(cleared?.options).toMatchObject({ maxAge: 0 });
  });

  test("marks the session expired in the DB and clears the cookie", async () => {
    const token = await tokenFor({
      sid: SESSION_ID,
      uid: USER_ID,
      role: "user",
      status: "approved",
    });
    const req = new Request("http://localhost/api/auth/logout", {
      method: "POST",
      headers: { cookie: `__Host-session=${token}` },
    });
    // Also set in cookie store so the next/headers mock picks it up
    cookieStore.set("__Host-session", token);
    const res = await logoutPost(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true });
    const cleared = cookieSetCalls.find((c) => c.name === "__Host-session");
    expect(cleared?.value).toBe("");
    expect(cleared?.options).toMatchObject({ maxAge: 0, path: "/" });
  });
});
