import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { validateClient } from '@/lib/sso';
import { corsHeaders, corsResponse } from '@/lib/cors';

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders(request) });
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
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
    if (!payload || !payload.userId) {
      return corsResponse(NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      ));
    }

    // Get user details
    await connectDB();
    const user = await User.findById(payload.userId).select('-password');
    
    if (!user) {
      return corsResponse(NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      ));
    }

    return corsResponse(NextResponse.json(user));
  } catch (error) {
    console.error('Error getting user details:', error);
    return corsResponse(NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    ));
  }
}
