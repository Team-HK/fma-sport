import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function logAdminAction(params: {
  adminId: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.adminActionLog.create({
      data: {
        adminId: params.adminId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: params.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (error) {
    console.error("Failed to write admin action log:", error);
  }
}
