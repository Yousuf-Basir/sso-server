import { GOOGLE_CONFIG } from '@/lib/oauth';
import { redirect } from 'next/navigation';

export async function GET() {
  const params = new URLSearchParams({
    client_id: GOOGLE_CONFIG.clientId,
    redirect_uri: GOOGLE_CONFIG.redirectUri,
    response_type: 'code',
    scope: GOOGLE_CONFIG.scope,
    access_type: 'offline',
    prompt: 'consent',
  });

  redirect(`${GOOGLE_CONFIG.authUrl}?${params.toString()}`);
}
