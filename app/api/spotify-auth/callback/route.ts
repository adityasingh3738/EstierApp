import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('=== Spotify callback route hit ===');
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // This is the userId
  const error = searchParams.get('error');
  console.log('Callback params:', { code: code?.substring(0, 10), state, error });

  if (error || !code || !state) {
    console.error('Spotify auth failed:', { error, hasCode: !!code, hasState: !!state });
    console.log('Redirecting to error page');
    return NextResponse.redirect(new URL('/?error=spotify_auth_failed', request.url));
  }

  try {
    console.log('Step 1: Starting token exchange...');
    // Exchange code for tokens
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_OAUTH_CLIENT_ID}:${process.env.SPOTIFY_OAUTH_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', tokenResponse.status, errorData);
      throw new Error(`Failed to exchange code for tokens: ${errorData}`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;
    console.log('Step 2: Got tokens successfully');

    // Calculate expiry time
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    // Update user with Spotify tokens
    console.log('Step 3: Updating user in database...');
    const updatedUser = await prisma.user.update({
      where: { id: state },
      data: {
        spotifyAccessToken: access_token,
        spotifyRefreshToken: refresh_token,
        spotifyExpiresAt: expiresAt,
      },
    });
    console.log('Step 4: User updated successfully:', updatedUser.id);

    console.log('Step 5: Redirecting to success page');
    return NextResponse.redirect(new URL('/?spotify=connected', request.url));
  } catch (error) {
    console.error('Spotify callback error:', error);
    console.error('Full error details:', error instanceof Error ? error.message : String(error));
    return NextResponse.redirect(new URL('/?error=spotify_auth_failed', request.url));
  }
}
