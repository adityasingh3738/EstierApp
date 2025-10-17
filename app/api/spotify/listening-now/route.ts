import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getValidSpotifyToken } from '@/lib/spotify';

export async function GET() {
  try {
    // Get all users with Spotify connected
    const users = await prisma.user.findMany({
      where: {
        spotifyAccessToken: { not: null },
        spotifyRefreshToken: { not: null },
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
      },
    });

    const listeningNow = await Promise.all(
      users.map(async (user) => {
        try {
          const accessToken = await getValidSpotifyToken(user.id);
          if (!accessToken) return null;

          const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (response.status === 204 || response.status === 404 || !response.ok) {
            return null;
          }

          const data = await response.json();

          if (!data.is_playing || !data.item) {
            return null;
          }

          return {
            user: {
              id: user.id,
              username: user.username,
              displayName: user.displayName,
              avatarUrl: user.avatarUrl,
            },
            track: {
              name: data.item.name,
              artist: data.item.artists.map((artist: any) => artist.name).join(', '),
              album: data.item.album.name,
              albumArt: data.item.album.images[0]?.url,
              url: data.item.external_urls.spotify,
            },
          };
        } catch (error) {
          console.error(`Error fetching now playing for user ${user.id}:`, error);
          return null;
        }
      })
    );

    // Filter out null values
    const activeListeners = listeningNow.filter((item) => item !== null);

    return NextResponse.json({ listeners: activeListeners });
  } catch (error) {
    console.error('Error fetching listening now:', error);
    return NextResponse.json({ error: 'Failed to fetch listening data' }, { status: 500 });
  }
}
