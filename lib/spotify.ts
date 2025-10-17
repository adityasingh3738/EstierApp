import { prisma } from './prisma';

export async function refreshSpotifyToken(userId: string, refreshToken: string) {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
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

    // Update user with new token
    await prisma.user.update({
      where: { id: userId },
      data: {
        spotifyAccessToken: data.access_token,
        spotifyExpiresAt: expiresAt,
        // Update refresh token if a new one is provided
        ...(data.refresh_token && { spotifyRefreshToken: data.refresh_token }),
      },
    });

    return data.access_token;
  } catch (error) {
    console.error('Error refreshing Spotify token:', error);
    throw error;
  }
}

export async function getValidSpotifyToken(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      spotifyAccessToken: true,
      spotifyRefreshToken: true,
      spotifyExpiresAt: true,
    },
  });

  if (!user?.spotifyAccessToken || !user?.spotifyRefreshToken) {
    return null;
  }

  // Check if token is expired or will expire in the next 5 minutes
  const now = new Date();
  const expiresAt = user.spotifyExpiresAt;
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

  if (!expiresAt || expiresAt < fiveMinutesFromNow) {
    // Token is expired or about to expire, refresh it
    return await refreshSpotifyToken(userId, user.spotifyRefreshToken);
  }

  return user.spotifyAccessToken;
}
