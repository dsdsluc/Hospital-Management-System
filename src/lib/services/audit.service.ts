import { prisma } from "@/lib/prisma";

export interface AuditLogInput {
  userId: string | null;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export class AuditService {
  async logAction(input: AuditLogInput): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: input.userId,
          action: input.action,
          entity: input.entity,
          entityId: input.entityId,
          metadata: (input.metadata as any) || {},
        },
      });
    } catch (error) {
      // Log to console for debugging, but don't throw to avoid breaking the main operation
      console.error("Failed to create audit log:", error);
    }
  }

  async getAuditLogs(params: {
    userId?: string;
    entity?: string;
    entityId?: string;
    action?: string;
    limit?: number;
    offset?: number;
  }) {
    const { limit = 50, offset = 0 } = params;

    const where: any = {};
    if (params.userId) where.userId = params.userId;
    if (params.entity) where.entity = params.entity;
    if (params.entityId) where.entityId = params.entityId;
    if (params.action) where.action = params.action;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        // user relation removed as AuditLog is now independent
        orderBy: { timestamp: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      total,
      limit,
      offset,
    };
  }
}

export const auditService = new AuditService();
