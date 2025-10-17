import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('=== Login route hit ===');
  const { userId } = await auth();
  console.log('User ID:', userId);

  if (!userId) {
    console.error('No user ID, returning 401');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clientId = process.env.SPOTIFY_OAUTH_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;
  const scopes = 'user-read-currently-playing user-read-playback-state';

  console.log('Spotify OAuth Config:', { clientId, redirectUri });

  if (!clientId || !redirectUri) {
    console.error('Missing Spotify OAuth credentials');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const authUrl = new URL('https://accounts.spotify.com/authorize');
  authUrl.searchParams.append('client_id', clientId!);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('redirect_uri', redirectUri!);
  authUrl.searchParams.append('scope', scopes);
  authUrl.searchParams.append('state', userId);

  const finalUrl = authUrl.toString();
  console.log('Redirecting to Spotify:', finalUrl.substring(0, 100) + '...');
  return NextResponse.redirect(finalUrl);
}
