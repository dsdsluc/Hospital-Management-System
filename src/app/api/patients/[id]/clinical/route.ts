import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { MedicalRecordService } from "@/lib/services/medical-record.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await getToken({ req: request });

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = token.role as string;
  if (role !== "ADMIN" && role !== "DOCTOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const history = await MedicalRecordService.getPatientMedicalHistory(id);
    return NextResponse.json(history);
  } catch (error: any) {
    console.error("Error fetching clinical data:", error);
    return NextResponse.json(
      { error: "Failed to fetch clinical data" },
      { status: 500 },
    );
  }
}
