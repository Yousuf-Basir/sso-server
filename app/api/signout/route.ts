import { NextRequest, NextResponse } from 'next/server';
import { logout } from '@/lib/auth';
import { validateClient } from '@/lib/sso';
import { corsHeaders, corsResponse } from '@/lib/cors';

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders(request) });
}

export async function POST(request: NextRequest) {
  try {
    const clientId = request.headers.get('X-Client-Id');

    if (!clientId) {
      return corsResponse(NextResponse.json(
        { error: 'Missing client ID' },
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

    // Clear cookies
    await logout();

    return corsResponse(NextResponse.json({ 
      success: true,
      message: 'Successfully signed out' 
    }));
  } catch (error) {
    console.error('Error signing out:', error);
    return corsResponse(NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    ));
  }
}
