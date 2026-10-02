"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export type CheckCredentialsResult =
  | { ok: true; requiresTotp: boolean }
  | { ok: false };

/**
 * Pre-flight check used by the login form to decide whether to show the
 * second-step TOTP field, without creating a session. This is NOT the
 * security boundary — the real credential + TOTP validation happens again,
 * from scratch, in the NextAuth Credentials provider's authorize() when the
 * form finally calls signIn(). This only improves the UX of a 2-step form.
 */
export async function checkAdminCredentials(
  email: string,
  password: string
): Promise<CheckCredentialsResult> {
  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) return { ok: false };

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return { ok: false };

  return { ok: true, requiresTotp: admin.totpEnabled };
}
