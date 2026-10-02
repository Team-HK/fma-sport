"use server";

import QRCode from "qrcode";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/audit-log";
import { generateTotpSecret, totpUri, verifyTotpCode } from "@/lib/totp";

export type MfaSetupResult = { secret: string; qrCodeDataUrl: string };

export async function startMfaSetup(): Promise<MfaSetupResult> {
  const admin = await requireAdmin();
  const secret = generateTotpSecret();
  const uri = totpUri(secret, admin.email);
  const qrCodeDataUrl = await QRCode.toDataURL(uri);
  return { secret, qrCodeDataUrl };
}

export type MfaActionState = { success: boolean; message: string };

export async function confirmMfaSetup(
  _prevState: MfaActionState,
  formData: FormData
): Promise<MfaActionState> {
  const admin = await requireAdmin();
  const secret = String(formData.get("secret") ?? "");
  const code = String(formData.get("code") ?? "");

  if (!secret || !code) {
    return { success: false, message: "Code manquant." };
  }

  if (!verifyTotpCode(secret, admin.email, code)) {
    return { success: false, message: "Code invalide. Vérifiez l'heure de votre téléphone et réessayez." };
  }

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { totpSecret: secret, totpEnabled: true },
  });
  await logAdminAction({ adminId: admin.id, action: "mfa_enable", entityType: "admin_user", entityId: admin.id });

  return { success: true, message: "Authentification à deux facteurs activée." };
}

export async function disableMfa(
  _prevState: MfaActionState,
  formData: FormData
): Promise<MfaActionState> {
  const admin = await requireAdmin();
  const password = String(formData.get("password") ?? "");

  const user = await prisma.adminUser.findUnique({ where: { id: admin.id } });
  if (!user) return { success: false, message: "Compte introuvable." };

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { success: false, message: "Mot de passe incorrect." };
  }

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { totpSecret: null, totpEnabled: false },
  });
  await logAdminAction({ adminId: admin.id, action: "mfa_disable", entityType: "admin_user", entityId: admin.id });

  return { success: true, message: "Authentification à deux facteurs désactivée." };
}
