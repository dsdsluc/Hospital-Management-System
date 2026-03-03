import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/token'
import { profileService } from '@/lib/services/profile.service'

export async function PATCH() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const payload = await verifyToken(token)
    await profileService.deactivateAccount(payload.id)
    const res = NextResponse.json({ success: true })
    res.cookies.set('token', '', { maxAge: 0, path: '/' })
    return res
  } catch (e: any) {
    const msg = e instanceof Error ? e.message : 'Invalid input'
    const status = e instanceof Error ? 400 : 401
    return NextResponse.json({ error: msg }, { status })
  }
}

