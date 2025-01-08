import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { validateClient } from '@/lib/sso';
import { corsHeaders, corsResponse } from '@/lib/cors';
import bcrypt from 'bcryptjs';

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders(request) });
}

export async function PUT(request: NextRequest) {
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

    const updateData = await request.json();
    const allowedFields = ['name', 'email', 'password'];
    const sanitizedData: any = {};

    // Only allow updating specific fields
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key]) {
        sanitizedData[key] = updateData[key];
      }
    });

    // Hash password if it's being updated
    if (sanitizedData.password) {
      sanitizedData.password = await bcrypt.hash(sanitizedData.password, 10);
    }

    // Update user
    await connectDB();
    const updatedUser = await User.findByIdAndUpdate(
      payload.userId,
      { $set: sanitizedData },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return corsResponse(NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      ));
    }

    return corsResponse(NextResponse.json(updatedUser));
  } catch (error) {
    console.error('Error updating user:', error);
    return corsResponse(NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    ));
  }
}
