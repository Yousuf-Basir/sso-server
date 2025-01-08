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
  
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  if (payload && payload.userId) {
    cookieStore.set('userId', payload.userId as string, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  cookieStore.delete('userId');
}

export async function getSession() {
  const token = (await cookies()).get('token')?.value;
  if (!token) return null;
  return await decrypt(token);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  return session;
}
