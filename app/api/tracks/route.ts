import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getWeekStart } from '@/lib/utils';

export async function GET() {
  try {
    const weekStart = getWeekStart();
    
    const tracks = await prisma.track.findMany({
      where: {
        weekStart: weekStart,
      },
      include: {
        votes: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Calculate vote counts
    const tracksWithVotes = tracks.map(track => {
      const voteCount = track.votes.reduce((sum, vote) => sum + vote.value, 0);
      return {
        id: track.id,
        title: track.title,
        artist: track.artist,
        spotifyUrl: track.spotifyUrl,
        youtubeUrl: track.youtubeUrl,
        imageUrl: track.imageUrl,
        voteCount,
        totalVotes: track.votes.length,
      };
    });

    // Sort by vote count
    tracksWithVotes.sort((a, b) => b.voteCount - a.voteCount);

    return NextResponse.json(tracksWithVotes);
  } catch (error) {
    console.error('Error fetching tracks:', error);
    return NextResponse.json({ error: 'Failed to fetch tracks' }, { status: 500 });
  }
}
