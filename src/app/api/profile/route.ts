import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/token'
import { profileService } from '@/lib/services/profile.service'
import { Role } from '@prisma/client'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const payload = await verifyToken(token)
    const data = await profileService.getProfile(payload.id, payload.role as Role)
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const payload = await verifyToken(token)
    const body = await request.json()
    await profileService.updateProfile(payload.id, payload.role as Role, body)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    const msg = e instanceof Error ? e.message : 'Invalid input'
    const status = e instanceof Error ? 400 : 401
    return NextResponse.json({ error: msg }, { status })
  }
}

