import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';
import { validateClient } from '@/lib/sso';
import { corsHeaders, corsResponse } from '@/lib/cors';

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders(request) });
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    const clientId = request.headers.get('X-Client-Id');

    if (!token || !clientId) {
      return corsResponse(NextResponse.json(
        { error: 'Missing token or client ID' },
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

    // Verify token
    const payload = await decrypt(token);
    if (!payload) {
      return corsResponse(NextResponse.json(
        { valid: false, error: 'Invalid token' },
        { status: 200 }
      ));
    }

    return corsResponse(NextResponse.json({ 
      valid: true, 
      userId: payload.userId 
    }));
  } catch (error) {
    console.error('Error validating token:', error);
    return corsResponse(NextResponse.json(
      { valid: false, error: 'Invalid token format' },
      { status: 200 }
    ));
  }
}
