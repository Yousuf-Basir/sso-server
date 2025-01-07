import { FACEBOOK_CONFIG } from '@/lib/oauth';
import { redirect } from 'next/navigation';

export async function GET() {
  const params = new URLSearchParams({
    client_id: FACEBOOK_CONFIG.clientId,
    redirect_uri: FACEBOOK_CONFIG.redirectUri,
    response_type: 'code',
    scope: FACEBOOK_CONFIG.scope,
  });

  redirect(`${FACEBOOK_CONFIG.authUrl}?${params.toString()}`);
}
