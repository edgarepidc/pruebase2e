import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "e2e_public_unlock";

function cookieSecret(): string {
  return (
    process.env.E2E_PUBLIC_COOKIE_SECRET?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    "dev-e2e-public-cookie"
  );
}

function signToken(token: string): string {
  return createHmac("sha256", cookieSecret()).update(token).digest("hex");
}

/** Valor de cookie: token.hmac */
export function buildPublicUnlockCookieValue(token: string): string {
  return `${token}.${signToken(token)}`;
}

export function verifyPublicUnlockCookieValue(
  token: string,
  raw: string | undefined,
): boolean {
  if (!raw) return false;
  const dot = raw.indexOf(".");
  if (dot <= 0) return false;
  const cookieToken = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  if (cookieToken !== token) return false;
  const expected = signToken(token);
  try {
    return timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(sig, "hex"),
    );
  } catch {
    return false;
  }
}

export const E2E_PUBLIC_UNLOCK_COOKIE = COOKIE_NAME;

export function publicUnlockCookieOptions(maxAgeSeconds = 60 * 60 * 24 * 7) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
