import { createSecretKey } from 'crypto';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET_KEY || 'your-secret-key';
const key = createSecretKey(JWT_SECRET, 'utf-8');

export async function signToken(payload: any) {
  const expirationTime = payload.isRefreshToken ? '7d' : '15m';
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(key);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload;
  } catch (err) {
    console.error('Error verifying token:', err);
    return null;
  }
}
