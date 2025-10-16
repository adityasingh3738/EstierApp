import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function to refresh Spotify token if expired
async function refreshSpotifyToken(userId: string, refreshToken: string) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();
  const expiresAt = new Date(Date.now() + data.expires_in * 1000);

  // Update tokens in database
  await prisma.user.update({
    where: { id: userId },
    data: {
      spotifyAccessToken: data.access_token,
      spotifyExpiresAt: expiresAt,
      // Spotify might not always return a new refresh token
      ...(data.refresh_token && { spotifyRefreshToken: data.refresh_token }),
    },
  });

  return data.access_token;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        spotifyAccessToken: true,
        spotifyRefreshToken: true,
        spotifyExpiresAt: true,
      },
    });

    if (!user?.spotifyAccessToken) {
      return NextResponse.json({ connected: false });
    }

    let accessToken = user.spotifyAccessToken;

    // Check if token is expired
    if (user.spotifyExpiresAt && new Date() >= user.spotifyExpiresAt) {
      if (!user.spotifyRefreshToken) {
        return NextResponse.json({ connected: false, error: 'Token expired' });
      }
      accessToken = await refreshSpotifyToken(userId, user.spotifyRefreshToken);
    }

    // Try to get currently playing first
    const currentlyPlayingRes = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (currentlyPlayingRes.status === 200) {
      const data = await currentlyPlayingRes.json();
      if (data.item) {
        return NextResponse.json({
          connected: true,
          currentlyPlaying: {
            name: data.item.name,
            artist: data.item.artists.map((a: any) => a.name).join(', '),
            album: data.item.album.name,
            imageUrl: data.item.album.images[0]?.url,
            spotifyUrl: data.item.external_urls.spotify,
            isPlaying: data.is_playing,
          },
        });
      }
    }

    // If nothing currently playing, get recently played
    const recentlyPlayedRes = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (recentlyPlayedRes.ok) {
      const data = await recentlyPlayedRes.json();
      if (data.items && data.items.length > 0) {
        const track = data.items[0].track;
        return NextResponse.json({
          connected: true,
          recentlyPlayed: {
            name: track.name,
            artist: track.artists.map((a: any) => a.name).join(', '),
            album: track.album.name,
            imageUrl: track.album.images[0]?.url,
            spotifyUrl: track.external_urls.spotify,
            playedAt: data.items[0].played_at,
          },
        });
      }
    }

    return NextResponse.json({ connected: true, noActivity: true });
  } catch (error) {
    console.error('Error fetching Spotify listening:', error);
    return NextResponse.json({ error: 'Failed to fetch listening activity' }, { status: 500 });
  }
}
