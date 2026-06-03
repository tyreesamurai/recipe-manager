import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { extractClientIp, isLocalIp, isTailscaleIp } from "@/lib/ip";

// Routes that require admin role to access
const ADMIN_ONLY_PATHS = ["/management", "/admin"];

function isAdminOnly(pathname: string): boolean {
  return ADMIN_ONLY_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const ip = extractClientIp(request) ?? "";
  const isTrustedIp = isLocalIp(ip) || isTailscaleIp(ip);

  // Safely verify the session — never throw from middleware
  let session = null;
  const token = request.cookies.get("__Host-session")?.value;
  if (token) {
    try {
      session = await verifySession(token);
    } catch {
      // Missing SESSION_SECRET or corrupted token — treat as unauthenticated
    }
  }

  // ── Trusted IP (local network / Tailscale) ──────────────────────────────
  if (isTrustedIp) {
    // Already holding a valid admin session — let them through
    if (session?.status === "approved" && session.role === "admin") {
      return NextResponse.next();
    }
    // No valid admin session — auto-issue one and redirect back
    const autoUrl = new URL("/api/auth/auto", request.url);
    autoUrl.searchParams.set("redirect", pathname + search);
    return NextResponse.redirect(autoUrl);
  }

  // ── Public traffic ───────────────────────────────────────────────────────
  if (!session) {
    const url = new URL("/auth/request", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (session.status === "pending") {
    return NextResponse.redirect(new URL("/auth/pending", request.url));
  }

  if (session.status === "denied" || session.status === "expired") {
    return NextResponse.redirect(new URL("/auth/denied", request.url));
  }

  if (session.status === "approved") {
    // Guard admin-only routes
    if (isAdminOnly(pathname) && session.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Fallback (shouldn't normally reach here)
  return NextResponse.redirect(new URL("/auth/request", request.url));
}

export const config = {
  matcher: [
    /*
     * Match everything EXCEPT:
     *   - _next/static  (Next.js static assets)
     *   - _next/image   (Next.js image optimisation)
     *   - favicon.ico
     *   - api/auth/     (auth API — handles its own access)
     *   - auth/         (auth pages — unauthenticated by definition)
     *   - public static files (sw.js, icons, manifest, etc.)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|api/auth/|auth/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
