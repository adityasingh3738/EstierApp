import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getWeekStart } from '@/lib/utils';

// Get Spotify access token
async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}

// Extract Spotify track ID from URL or ID
function extractSpotifyId(input: string): string {
  const match = input.match(/track\/([a-zA-Z0-9]+)/);
  return match ? match[1] : input;
}

// Fetch track details from Spotify
async function fetchSpotifyTrack(spotifyInput: string) {
  const trackId = extractSpotifyId(spotifyInput);
  const token = await getSpotifyToken();

  const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Spotify track: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    title: data.name,
    artist: data.artists.map((a: any) => a.name).join(', '),
    spotifyUrl: data.external_urls.spotify,
    imageUrl: data.album.images[0]?.url || null,
  };
}

export async function POST(req: NextRequest) {
  try {
    // Simple auth - check for admin key
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { tracks, spotifyUrls } = body;

    let trackData = [];

    // If spotifyUrls provided, fetch from Spotify API
    if (spotifyUrls && Array.isArray(spotifyUrls)) {
      const fetchPromises = spotifyUrls.map((url: string) => fetchSpotifyTrack(url));
      trackData = await Promise.all(fetchPromises);
    }
    // Otherwise use manually provided track data
    else if (tracks && Array.isArray(tracks)) {
      trackData = tracks;
    } else {
      return NextResponse.json(
        { error: 'Invalid request. Expected { spotifyUrls: [...] } or { tracks: [...] }' },
        { status: 400 }
      );
    }

    // Use current week's Monday as weekStart
    const weekStart = getWeekStart(new Date());

    // Create all tracks
    const createdTracks = await prisma.track.createMany({
      data: trackData.map((track: any) => ({
        title: track.title,
        artist: track.artist,
        spotifyUrl: track.spotifyUrl || null,
        youtubeUrl: track.youtubeUrl || null,
        imageUrl: track.imageUrl || null,
        weekStart: weekStart,
      })),
    });

    return NextResponse.json({
      success: true,
      count: createdTracks.count,
      weekStart: weekStart.toISOString(),
    });
  } catch (error) {
    console.error('Error creating tracks:', error);
    return NextResponse.json(
      { error: 'Failed to create tracks', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
