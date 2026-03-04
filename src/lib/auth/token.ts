import { SignJWT, jwtVerify } from 'jose';
import type { JWTPayload as JoseJWTPayload } from 'jose';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
export const ACCESS_TOKEN_EXPIRY = '15m';

export interface JWTPayload {
  id: string;
  role: string;
  status: string;
  email?: string;
  [key: string]: unknown;
}

function isJWTPayload(payload: JoseJWTPayload): payload is JWTPayload {
  const obj = payload as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.role === 'string' &&
    typeof obj.status === 'string'
  );
}

export async function signJWT(payload: { id?: string; userId?: string; role: string; status: string; email?: string }): Promise<string> {
  const normalized: JWTPayload = {
    id: payload.id ?? payload.userId!,
    role: payload.role,
    status: payload.status,
    email: payload.email,
  };

  return new SignJWT(normalized as JoseJWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (!isJWTPayload(payload)) {
      throw new Error('Invalid token structure');
    }
    return payload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export { signJWT as signToken };
export { verifyJWT as verifyTokenNullable };
