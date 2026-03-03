import { NextRequest, NextResponse } from "next/server";
import { verifyTokenNullable, JWTPayload } from "@/lib/auth/token";
import { prisma } from "@/lib/prisma";

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export async function requireDoctor(req: AuthenticatedRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyTokenNullable(token);

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (payload.role !== "DOCTOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  req.user = payload;
  return null;
}

export async function auditLog(
  userId: string | null,
  action: string,
  entity: string,
  entityId?: string,
  metadata?: any,
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        metadata: metadata || {},
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}
