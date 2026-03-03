import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import z from "zod";
import bcrypt from "bcrypt";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 422 });
  }
  const existingAdmin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (existingAdmin) {
    return NextResponse.json({ error: "Admin already exists" }, { status: 409 });
  }
  const { email, password } = parsed.data;
  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, role: "ADMIN" },
  });
  return NextResponse.json({ id: user.id }, { status: 201 });
}
