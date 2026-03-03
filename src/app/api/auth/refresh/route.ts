import { NextResponse, NextRequest } from 'next/server';
import { refreshSession } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  const oldRefreshToken = req.cookies.get('refresh_token')?.value;

  if (!oldRefreshToken) {
    return NextResponse.json({ error: 'Missing refresh token' }, { status: 401 });
  }

  try {
    const userAgent = req.headers.get('user-agent') || undefined;
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

    const { accessToken, refreshToken } = await refreshSession(oldRefreshToken, userAgent, ip);

    const res = NextResponse.json({ success: true });

    // Set Access Token Cookie (Short-lived)
    res.cookies.set('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 mins
      path: '/',
    });

    // Set Refresh Token Cookie (Long-lived)
    res.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/api/auth',
    });

    return res;
  } catch (error: any) {
    // Clear cookies if refresh fails (token reuse, expired, etc.)
    const res = NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    res.cookies.delete('token');
    res.cookies.delete('refresh_token');
    return res;
  }
}
