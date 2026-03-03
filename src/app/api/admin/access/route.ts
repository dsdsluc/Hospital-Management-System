import { NextResponse } from "next/server";
import { requireAdmin, AuthenticatedRequest } from "@/lib/permissions/admin.permission";
import { prisma } from "@/lib/prisma";
import { Role, UserStatus } from "@prisma/client";

export async function GET(request: AuthenticatedRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") as Role | undefined;
  const status = searchParams.get("status") as UserStatus | undefined;

  const skip = (page - 1) * limit;

  const where: any = {};

  if (role) where.role = role;
  if (status) where.status = status;
  
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { 
        doctor: { 
          name: { contains: search, mode: "insensitive" } 
        } 
      },
      { 
        patient: { 
          name: { contains: search, mode: "insensitive" } 
        } 
      }
    ];
  }

  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
          doctor: { select: { name: true } },
          patient: { select: { name: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      name: user.doctor?.name || user.patient?.name || "N/A", // Fallback for pure admins or pending users
    }));

    return NextResponse.json({
      data: formattedUsers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch users", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
