import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/spotify/callback`;
    
    if (!clientId) {
      return NextResponse.json({ error: 'Spotify not configured' }, { status: 500 });
    }

    const scopes = [
      'user-read-currently-playing',
      'user-read-recently-played',
      'user-top-read',
    ].join(' ');

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: scopes,
      state: userId, // Pass userId for verification in callback
    });

    const spotifyAuthUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
    
    return NextResponse.redirect(spotifyAuthUrl);
  } catch (error) {
    console.error('Error initiating Spotify auth:', error);
    return NextResponse.json({ error: 'Failed to initiate Spotify auth' }, { status: 500 });
  }
}
