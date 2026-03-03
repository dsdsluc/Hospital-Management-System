import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth.service';
import { RegisterSchema } from '@/lib/validators/auth.validator';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = RegisterSchema.parse(body);
    const result = await AuthService.register(validated);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    if (error.issues) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
