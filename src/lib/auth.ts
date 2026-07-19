import { createHash } from "crypto";

export const AUTH_COOKIE = "reminder-app-auth";

export function expectedToken(): string {
  return createHash("sha256").update(process.env.APP_PASSPHRASE ?? "").digest("hex");
}
