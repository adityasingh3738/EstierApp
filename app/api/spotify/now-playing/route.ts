import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getValidSpotifyToken } from '@/lib/spotify';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const accessToken = await getValidSpotifyToken(userId);

    if (!accessToken) {
      return NextResponse.json({ error: 'Spotify not connected' }, { status: 403 });
    }

    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 204 || response.status === 404) {
      return NextResponse.json({ isPlaying: false });
    }

    if (!response.ok) {
      throw new Error('Failed to fetch currently playing track');
    }

    const data = await response.json();

    return NextResponse.json({
      isPlaying: data.is_playing,
      track: data.item
        ? {
            name: data.item.name,
            artist: data.item.artists.map((artist: any) => artist.name).join(', '),
            album: data.item.album.name,
            albumArt: data.item.album.images[0]?.url,
            url: data.item.external_urls.spotify,
          }
        : null,
    });
  } catch (error) {
    console.error('Error fetching now playing:', error);
    return NextResponse.json({ error: 'Failed to fetch now playing' }, { status: 500 });
  }
}
