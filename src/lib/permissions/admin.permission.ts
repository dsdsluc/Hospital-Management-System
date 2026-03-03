import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/token";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export async function requireAdmin(request: AuthenticatedRequest) {
  const authHeader = request.headers.get("authorization");

  let token: string | undefined;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else {
    const cookieStore = await cookies();
    token = cookieStore.get("token")?.value;
  }

  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const payload = await verifyToken(token);

    if (payload.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    request.user = {
      id: payload.id,
      email: payload.email ?? "",
      role: payload.role,
    };
    return null;
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 },
    );
  }
}

export function auditLog(
  userId: string | null,
  action: string,
  entity: string,
  entityId?: string,
  metadata?: Record<string, any>,
) {
  // Placeholder for audit logging
  // In production, this would write to a logging service or database
  console.log(
    `[AUDIT] User: ${userId}, Action: ${action}, Entity: ${entity}, EntityId: ${entityId}`,
    metadata,
  );
}
