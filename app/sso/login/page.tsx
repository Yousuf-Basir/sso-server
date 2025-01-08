import { redirect } from 'next/navigation';
import { validateRedirectUrl, isAuthenticated, generateToken, getClient } from '@/lib/sso';

export default async function SSOLogin({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const clientId = (await searchParams).client_id as string;
  const redirectUrl = (await searchParams).redirect_url as string;

  // Validate required parameters
  if (!clientId || !redirectUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-4 rounded-lg">
          <h1 className="text-red-700">Error: Missing required parameters</h1>
          <p className="text-red-600">Both client_id and redirect_url are required.</p>
        </div>
      </div>
    );
  }

  // Validate redirect URL
  if (!validateRedirectUrl(clientId, redirectUrl)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-4 rounded-lg">
          <h1 className="text-red-700">Error: Invalid redirect URL</h1>
          <p className="text-red-600">The provided redirect URL is not allowed.</p>
        </div>
      </div>
    );
  }

  // Check if user is already authenticated
  const userId = await isAuthenticated();
  if (userId) {
    console.log('User is already authenticated:', userId);
    // Generate token and redirect back to client
    const token = await generateToken(userId, clientId);
    const client = getClient(clientId);
    const finalRedirectUrl = `${redirectUrl}?token=${token}&client=${client?.name}`;
    redirect(finalRedirectUrl);
  }

  console.log('User is not authenticated');
  // If not authenticated, redirect to login page with return URL
  const returnUrl = encodeURIComponent(`/sso/login?client_id=${clientId}&redirect_url=${redirectUrl}`);
  redirect(`/login?return_url=${returnUrl}`);
}
