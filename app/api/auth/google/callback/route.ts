import { NextRequest } from 'next/server';
import { GOOGLE_CONFIG } from '@/lib/oauth';
import { redirect } from 'next/navigation';
import { User } from '@/models/User';
import { connectDB } from '@/lib/db';
import { login, encrypt } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    redirect('/login?error=No authorization code received');
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(GOOGLE_CONFIG.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CONFIG.clientId,
        client_secret: GOOGLE_CONFIG.clientSecret,
        redirect_uri: GOOGLE_CONFIG.redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token');
    }

    // Get user info using access token
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    // Connect to database
    await connectDB();

    // Find or create user
    let user = await User.findOne({ email: userData.email });

    if (!user) {
      user = await User.create({
        email: userData.email,
        name: userData.name,
        profileImage: userData.picture,
        googleId: userData.id,
      });
    } else {
      // Update existing user's Google-specific info
      user.googleId = userData.id;
      user.name = userData.name;
      user.profileImage = userData.picture;
      await user.save();
    }

    // Create session token
    const token = await encrypt({
      id: user._id,
      email: user.email,
      name: user.name,
    });

    // Set cookie
    await login(token);

    redirect('/profile');
  } catch (error) {
    console.error('Google OAuth error:', error);
    redirect('/login?error=Failed to authenticate with Google');
  }
}
