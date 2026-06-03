import { describe, expect, test } from "bun:test";
import { extractClientIp, isLocalIp, isTailscaleIp } from "../ip";

const makeRequest = (headers: Record<string, string>) =>
  new Request("http://localhost", { headers });

describe("isLocalIp", () => {
  describe("loopback (127.0.0.0/8)", () => {
    test("127.0.0.1 is local", () => expect(isLocalIp("127.0.0.1")).toBe(true));
    test("127.1.2.3 is local", () => expect(isLocalIp("127.1.2.3")).toBe(true));
    test("127.255.255.255 is local", () =>
      expect(isLocalIp("127.255.255.255")).toBe(true));
  });

  describe("IPv6 loopback", () => {
    test("::1 is local", () => expect(isLocalIp("::1")).toBe(true));
  });

  describe("class A private (10.0.0.0/8)", () => {
    test("10.0.0.1 is local", () => expect(isLocalIp("10.0.0.1")).toBe(true));
    test("10.50.100.200 is local", () =>
      expect(isLocalIp("10.50.100.200")).toBe(true));
    test("10.255.255.255 is local", () =>
      expect(isLocalIp("10.255.255.255")).toBe(true));
  });

  describe("class C private (192.168.0.0/16)", () => {
    test("192.168.0.1 is local", () =>
      expect(isLocalIp("192.168.0.1")).toBe(true));
    test("192.168.1.1 is local", () =>
      expect(isLocalIp("192.168.1.1")).toBe(true));
    test("192.168.100.50 is local", () =>
      expect(isLocalIp("192.168.100.50")).toBe(true));
    test("192.0.0.1 is not local", () =>
      expect(isLocalIp("192.0.0.1")).toBe(false));
    test("192.169.0.1 is not local", () =>
      expect(isLocalIp("192.169.0.1")).toBe(false));
  });

  describe("class B private (172.16.0.0/12)", () => {
    test("172.16.0.1 is local", () =>
      expect(isLocalIp("172.16.0.1")).toBe(true));
    test("172.24.0.1 is local", () =>
      expect(isLocalIp("172.24.0.1")).toBe(true));
    test("172.31.255.255 is local", () =>
      expect(isLocalIp("172.31.255.255")).toBe(true));
    test("172.15.0.1 is not local (below range)", () =>
      expect(isLocalIp("172.15.0.1")).toBe(false));
    test("172.32.0.1 is not local (above range)", () =>
      expect(isLocalIp("172.32.0.1")).toBe(false));
  });

  describe("public IPs", () => {
    test("8.8.8.8 is not local", () =>
      expect(isLocalIp("8.8.8.8")).toBe(false));
    test("203.0.113.1 is not local", () =>
      expect(isLocalIp("203.0.113.1")).toBe(false));
    test("1.1.1.1 is not local", () =>
      expect(isLocalIp("1.1.1.1")).toBe(false));
  });

  describe("Tailscale IPs are not local", () => {
    test("100.64.0.1 is not local", () =>
      expect(isLocalIp("100.64.0.1")).toBe(false));
    test("100.100.10.5 is not local", () =>
      expect(isLocalIp("100.100.10.5")).toBe(false));
  });

  describe("invalid input", () => {
    test("empty string returns false", () => expect(isLocalIp("")).toBe(false));
    test("non-IP string returns false", () =>
      expect(isLocalIp("not-an-ip")).toBe(false));
    test("partial IP returns false", () =>
      expect(isLocalIp("192.168.1")).toBe(false));
  });
});

describe("isTailscaleIp", () => {
  describe("Tailscale range (100.64.0.0/10)", () => {
    test("100.64.0.1 is Tailscale (start of range)", () =>
      expect(isTailscaleIp("100.64.0.1")).toBe(true));
    test("100.100.10.5 is Tailscale (middle)", () =>
      expect(isTailscaleIp("100.100.10.5")).toBe(true));
    test("100.127.255.255 is Tailscale (end of range)", () =>
      expect(isTailscaleIp("100.127.255.255")).toBe(true));
  });

  describe("outside Tailscale range", () => {
    test("100.63.0.1 is not Tailscale (second octet below 64)", () =>
      expect(isTailscaleIp("100.63.0.1")).toBe(false));
    test("100.128.0.1 is not Tailscale (second octet above 127)", () =>
      expect(isTailscaleIp("100.128.0.1")).toBe(false));
    test("101.64.0.1 is not Tailscale (wrong first octet)", () =>
      expect(isTailscaleIp("101.64.0.1")).toBe(false));
  });

  describe("other IP types are not Tailscale", () => {
    test("10.0.0.1 is not Tailscale", () =>
      expect(isTailscaleIp("10.0.0.1")).toBe(false));
    test("192.168.1.1 is not Tailscale", () =>
      expect(isTailscaleIp("192.168.1.1")).toBe(false));
    test("8.8.8.8 is not Tailscale", () =>
      expect(isTailscaleIp("8.8.8.8")).toBe(false));
    test("::1 is not Tailscale", () =>
      expect(isTailscaleIp("::1")).toBe(false));
  });

  describe("invalid input", () => {
    test("empty string returns false", () =>
      expect(isTailscaleIp("")).toBe(false));
    test("non-IP string returns false", () =>
      expect(isTailscaleIp("not-an-ip")).toBe(false));
  });
});

describe("extractClientIp", () => {
  describe("CF-Connecting-IP (highest priority)", () => {
    test("returns CF-Connecting-IP when present", () => {
      const req = makeRequest({ "cf-connecting-ip": "203.0.113.1" });
      expect(extractClientIp(req)).toBe("203.0.113.1");
    });

    test("trims whitespace from CF-Connecting-IP", () => {
      const req = makeRequest({ "cf-connecting-ip": "  203.0.113.1  " });
      expect(extractClientIp(req)).toBe("203.0.113.1");
    });

    test("strips ::ffff: prefix from CF-Connecting-IP", () => {
      const req = makeRequest({ "cf-connecting-ip": "::ffff:192.168.1.1" });
      expect(extractClientIp(req)).toBe("192.168.1.1");
    });

    test("ignores invalid CF-Connecting-IP and falls through", () => {
      const req = makeRequest({
        "cf-connecting-ip": "not-an-ip",
        "x-real-ip": "203.0.113.2",
      });
      expect(extractClientIp(req)).toBe("203.0.113.2");
    });
  });

  describe("X-Real-IP (second priority)", () => {
    test("returns X-Real-IP when CF header is absent", () => {
      const req = makeRequest({ "x-real-ip": "10.0.0.5" });
      expect(extractClientIp(req)).toBe("10.0.0.5");
    });

    test("strips ::ffff: prefix from X-Real-IP", () => {
      const req = makeRequest({ "x-real-ip": "::ffff:10.0.0.5" });
      expect(extractClientIp(req)).toBe("10.0.0.5");
    });

    test("ignores invalid X-Real-IP and falls through", () => {
      const req = makeRequest({
        "x-real-ip": "not-an-ip",
        "x-forwarded-for": "203.0.113.3",
      });
      expect(extractClientIp(req)).toBe("203.0.113.3");
    });
  });

  describe("X-Forwarded-For (third priority)", () => {
    test("returns first IP from X-Forwarded-For", () => {
      const req = makeRequest({
        "x-forwarded-for": "203.0.113.4, 10.0.0.1, 10.0.0.2",
      });
      expect(extractClientIp(req)).toBe("203.0.113.4");
    });

    test("handles single IP in X-Forwarded-For", () => {
      const req = makeRequest({ "x-forwarded-for": "203.0.113.5" });
      expect(extractClientIp(req)).toBe("203.0.113.5");
    });

    test("strips ::ffff: prefix from X-Forwarded-For", () => {
      const req = makeRequest({
        "x-forwarded-for": "::ffff:203.0.113.6, 10.0.0.1",
      });
      expect(extractClientIp(req)).toBe("203.0.113.6");
    });

    test("trims whitespace around IPs in X-Forwarded-For", () => {
      const req = makeRequest({
        "x-forwarded-for": "  203.0.113.7  , 10.0.0.1",
      });
      expect(extractClientIp(req)).toBe("203.0.113.7");
    });
  });

  describe("no headers present", () => {
    test("returns null when no IP headers are set", () => {
      const req = makeRequest({});
      expect(extractClientIp(req)).toBeNull();
    });

    test("returns null when all headers contain invalid values", () => {
      const req = makeRequest({
        "cf-connecting-ip": "bad",
        "x-real-ip": "also-bad",
        "x-forwarded-for": "still-bad",
      });
      expect(extractClientIp(req)).toBeNull();
    });
  });
});
