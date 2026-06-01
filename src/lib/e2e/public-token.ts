import { randomBytes } from "node:crypto";

/** Token opaco para URL pública (32 bytes hex = 64 chars). */
export function generateE2ePublicToken(): string {
  return randomBytes(32).toString("hex");
}

export function buildPublicE2eUrl(origin: string, token: string): string {
  return `${origin.replace(/\/$/, "")}/public/e2e/${token}`;
}
