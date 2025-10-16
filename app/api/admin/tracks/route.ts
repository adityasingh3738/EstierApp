import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Spotify token error:', errorData);
    throw new Error(`Failed to get Spotify token: ${response.status}`);
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new Error('No access token in Spotify response');
  }
  return data.access_token;
}

// Extract Spotify ID and type from URL or ID
function extractSpotifyInfo(input: string): { type: 'track' | 'album' | 'playlist', id: string } {
  const trackMatch = input.match(/track\/([a-zA-Z0-9]+)/);
  if (trackMatch) return { type: 'track', id: trackMatch[1] };
  
  const albumMatch = input.match(/album\/([a-zA-Z0-9]+)/);
  if (albumMatch) return { type: 'album', id: albumMatch[1] };
  
  const playlistMatch = input.match(/playlist\/([a-zA-Z0-9]+)/);
  if (playlistMatch) return { type: 'playlist', id: playlistMatch[1] };
  
  // Default to track if no pattern matched
  return { type: 'track', id: input };
}

// Fetch track details from Spotify
async function fetchSpotifyTrack(trackId: string, token: string) {
  const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Spotify track fetch error:', errorData);
    throw new Error(`Failed to fetch Spotify track ${trackId}: ${response.status}`);
  }

  const data = await response.json();
  return {
    title: data.name,
    artist: data.artists.map((a: any) => a.name).join(', '),
    spotifyUrl: data.external_urls.spotify,
    imageUrl: data.album.images[0]?.url || null,
  };
}

// Fetch album tracks from Spotify
async function fetchSpotifyAlbum(albumId: string, token: string) {
  const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Spotify album fetch error:', errorData);
    throw new Error(`Failed to fetch Spotify album ${albumId}: ${response.status}`);
  }

  const data = await response.json();
  const albumImage = data.images[0]?.url || null;
  
  // Map all tracks in the album
  return data.tracks.items.map((track: any) => ({
    title: track.name,
    artist: track.artists.map((a: any) => a.name).join(', '),
    spotifyUrl: track.external_urls.spotify,
    imageUrl: albumImage, // Use album art for all tracks
  }));
}

// Fetch playlist tracks from Spotify
async function fetchSpotifyPlaylist(playlistId: string, token: string) {
  const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Spotify playlist fetch error:', errorData);
    throw new Error(`Failed to fetch Spotify playlist ${playlistId}: ${response.status}`);
  }

  const data = await response.json();
  
  // Map all tracks in the playlist
  return data.items
    .filter((item: any) => item.track) // Filter out null tracks
    .map((item: any) => {
      const track = item.track;
      return {
        title: track.name,
        artist: track.artists.map((a: any) => a.name).join(', '),
        spotifyUrl: track.external_urls.spotify,
        imageUrl: track.album.images[0]?.url || null,
      };
    });
}

// Fetch tracks from Spotify (track, album, or playlist)
async function fetchSpotifyContent(spotifyInput: string) {
  const { type, id } = extractSpotifyInfo(spotifyInput);
  console.log(`Fetching ${type}:`, id);
  const token = await getSpotifyToken();

  if (type === 'track') {
    const track = await fetchSpotifyTrack(id, token);
    return [track]; // Return as array for consistency
  } else if (type === 'album') {
    return await fetchSpotifyAlbum(id, token);
  } else if (type === 'playlist') {
    return await fetchSpotifyPlaylist(id, token);
  }
  
  throw new Error('Invalid Spotify URL type');
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
      const fetchPromises = spotifyUrls.map((url: string) => fetchSpotifyContent(url));
      const results = await Promise.all(fetchPromises);
      // Flatten array of arrays (since albums/playlists return multiple tracks)
      trackData = results.flat();
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
