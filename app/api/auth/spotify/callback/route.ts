import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // This is the userId
  const error = searchParams.get('error');

  if (error || !code || !state) {
    console.error('Spotify auth failed:', { error, hasCode: !!code, hasState: !!state });
    return NextResponse.redirect(new URL('/?error=spotify_auth_failed', request.url));
  }

  try {
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

    // Calculate expiry time
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    // Update user with Spotify tokens
    await prisma.user.update({
      where: { id: state },
      data: {
        spotifyAccessToken: access_token,
        spotifyRefreshToken: refresh_token,
        spotifyExpiresAt: expiresAt,
      },
    });

    return NextResponse.redirect(new URL('/?spotify=connected', request.url));
  } catch (error) {
    console.error('Spotify callback error:', error);
    console.error('Full error details:', error instanceof Error ? error.message : String(error));
    return NextResponse.redirect(new URL('/?error=spotify_auth_failed', request.url));
  }
}
