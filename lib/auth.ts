import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { signToken, verifyToken } from './jwt';

export async function encrypt(payload: any) {
  return await signToken(payload);
}

export async function decrypt(token: string) {
  return await verifyToken(token);
}

export async function login(token: string) {
  const cookieStore = await cookies();
  const payload = await decrypt(token);
  
  if (!payload || !payload.userId) {
    throw new Error('Invalid token payload');
  }

  // Generate access token
  const accessToken = await encrypt({
    userId: payload.userId,
    isAccessToken: true
  });

  // Generate refresh token
  const refreshToken = await encrypt({
    userId: payload.userId,
    isRefreshToken: true
  });

  // Set access token
  cookieStore.set('token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
  });

  // Set refresh token
  cookieStore.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  cookieStore.set('userId', payload.userId as string, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  cookieStore.delete('refreshToken');
  cookieStore.delete('userId');
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) {
    const refreshToken = cookieStore.get('refreshToken')?.value;
    if (!refreshToken) return null;
    
    // Verify refresh token
    const refreshPayload = await decrypt(refreshToken);
    if (!refreshPayload || !refreshPayload.userId || !refreshPayload.isRefreshToken) {
      return null;
    }

    // Generate new access token
    const newAccessToken = await encrypt({
      userId: refreshPayload.userId,
      isAccessToken: true
    });

    // Set new access token
    cookieStore.set('token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    });

    return refreshPayload;
  }

  return await decrypt(token);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  return session;
}
