import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt, encrypt } from '@/lib/auth';
import { validateClient } from '@/lib/sso';
import { corsHeaders, corsResponse } from '@/lib/cors';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;
    const clientId = request.headers.get('X-Client-Id');

    if (!refreshToken || !clientId) {
      return corsResponse(NextResponse.json(
        { error: 'Missing refresh token or client ID' },
        { status: 401 }
      ));
    }

    // Validate client
    const isValidClient = validateClient(clientId, request.headers.get('Origin') || '');
    if (!isValidClient) {
      return corsResponse(NextResponse.json(
        { error: 'Invalid client' },
        { status: 403 }
      ));
    }

    // Verify refresh token
    const payload = await decrypt(refreshToken);
    if (!payload || !payload.userId || !payload.isRefreshToken) {
      return corsResponse(NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      ));
    }

    // Generate new access token
    const newAccessToken = await encrypt({
      userId: payload.userId,
      isAccessToken: true
    });

    // Generate new refresh token
    const newRefreshToken = await encrypt({
      userId: payload.userId,
      isRefreshToken: true
    });

    // Set new refresh token cookie
    const cookieStore = await cookies();
    cookieStore.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return corsResponse(NextResponse.json({
      accessToken: newAccessToken,
    }));
  } catch (error) {
    console.error('Error refreshing token:', error);
    return corsResponse(NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    ));
  }
}

export async function OPTIONS(request: NextRequest) {
  return corsResponse(new NextResponse(null, { status: 204 }));
}
