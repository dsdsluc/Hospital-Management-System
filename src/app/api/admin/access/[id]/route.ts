import { NextResponse } from "next/server";
import { requireAdmin, AuthenticatedRequest } from "@/lib/permissions/admin.permission";
import { prisma } from "@/lib/prisma";
import { UserStatus, Role } from "@prisma/client";

export async function PATCH(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { status, role } = body;

    // Basic validation
    if (status && !Object.values(UserStatus).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    if (role && !Object.values(Role).includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Prevent modifying self (optional but recommended)
    if (id === request.user!.id) {
       return NextResponse.json({ error: "Cannot modify own access" }, { status: 403 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(role && { role }),
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      }
    });

    return NextResponse.json({ data: updatedUser });
  } catch (error) {
    console.error("Failed to update user access", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
