import { NextRequest, NextResponse } from "next/server";
import { departmentService } from "@/lib/services/department.service";
import { verifyTokenNullable } from "@/lib/auth/token";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const payload = await verifyTokenNullable(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const result = await departmentService.listDepartments({ limit: 100 });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 });
  }
}
