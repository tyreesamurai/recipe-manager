import { type JWTPayload, jwtVerify, SignJWT } from "jose";
import { AppError } from "@/lib/errors";
import { type Session, sessionSchema } from "@/lib/session";

export const signSession = async (payload: Session) => {
  if (!process.env.SESSION_SECRET) {
    throw new AppError({
      code: "MISCONFIGURATION",
      message: "SESSION_SECRET not set",
      status: 500,
    });
  }

  const secret = new TextEncoder().encode(process.env.SESSION_SECRET);

  const token = await new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  return token;
};

export const verifySession = async (token: string) => {
  if (!process.env.SESSION_SECRET) {
    throw new AppError({
      code: "MISCONFIGURATION",
      message: "SESSION_SECRET not set",
      status: 500,
    });
  }

  const secret = new TextEncoder().encode(process.env.SESSION_SECRET);

  try {
    const { payload } = await jwtVerify(token, secret);
    const result = sessionSchema.safeParse(payload);
    return result.success ? result.data : null;
  } catch (_err) {
    return null;
  }
};

export const requireAuth = async (request: Request, role?: "admin") => {
  const cookieHeader = request.headers.get("cookie") ?? "";

  const sessionCookie = cookieHeader
    .split("; ")
    .find((cookie) => cookie.startsWith("__Host-session="));

  const token = sessionCookie?.split("=").slice(1).join("=").trim();

  if (!token) {
    throw new AppError({
      code: "UNAUTHORIZED",
      status: 401,
      message: "User is UNAUTHORIZED",
    });
  }

  const session = await verifySession(token);

  if (!session) {
    throw new AppError({
      code: "UNAUTHORIZED",
      status: 401,
      message: "User is UNAUTHORIZED",
    });
  }

  if (role && session.role !== role) {
    throw new AppError({
      code: "FORBIDDEN",
      message: "Insufficient permissions",
      status: 403,
    });
  }

  return session;
};
