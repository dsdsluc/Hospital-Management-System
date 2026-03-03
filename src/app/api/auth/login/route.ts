import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth.service';
import { LoginSchema } from '@/lib/validators/auth.validator';
import { createSession } from '@/lib/auth/session';
import { signToken } from '@/lib/auth/token';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = LoginSchema.parse(body);
    
    // Verify credentials
    const user = await AuthService.login(validated);

    // Get client info
    const userAgent = req.headers.get('user-agent') || undefined;
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

    // Create Refresh Token (DB Session)
    const refreshToken = await createSession(user.id, userAgent, ip);

    // Create Access Token (JWT)
    const accessToken = await signToken({
      userId: user.id,
      role: user.role,
      status: user.status,
      email: user.email,
    });

    const res = NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      } 
    });

    // Set Access Token Cookie (Short-lived)
    res.cookies.set('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 mins matches ACCESS_TOKEN_EXPIRY
      path: '/',
    });

    // Set Refresh Token Cookie (Long-lived)
    res.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days matches REFRESH_TOKEN_EXPIRY_DAYS
      path: '/api/auth', // Scoped to auth routes for extra security
    });

    return res;
  } catch (error: any) {
    if (error.issues) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    const status = error.message === 'Account is not active' || error.message.includes('locked') ? 403 : 401;
    return NextResponse.json({ error: error.message }, { status });
  }
}
