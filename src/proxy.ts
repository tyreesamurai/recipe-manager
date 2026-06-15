import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { signSession, verifySession } from "@/lib/auth";

// Routes that require admin role to access
const ADMIN_ONLY_PATHS = ["/management", "/admin"];

function isAdminOnly(pathname: string): boolean {
  return ADMIN_ONLY_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

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

  // ── Unauthenticated ──────────────────────────────────────────────────────
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

    // Rolling refresh — re-sign cookie on every approved request so the
    // 15-day window resets on each visit. Only expires if unused for 15 days.
    const response = NextResponse.next();
    try {
      const freshToken = await signSession(session);
      response.cookies.set("__Host-session", freshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 15,
      });
    } catch {
      // Still let the request through if re-signing fails
    }
    return response;
  }

  // Fallback (shouldn't normally reach here)
  return NextResponse.redirect(
    new URL(`/auth/request${search ? `?${search}` : ""}`, request.url),
  );
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
