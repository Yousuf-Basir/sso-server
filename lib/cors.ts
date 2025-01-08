import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export function corsHeaders(req: NextRequest) {
  const origin = req.headers.get('origin') || '*';
  
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Id',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export async function corsResponse(response: NextResponse) {
  const headersList = await headers();
  const origin = headersList.get('origin') || '*';

  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Client-Id');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  return response;
}
