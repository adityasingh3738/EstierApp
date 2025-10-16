import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getWeekStart } from '@/lib/utils';

export async function GET() {
  try {
    const currentWeekStart = getWeekStart();
    
    // Get all unique week starts before current week
    const weeks = await prisma.track.findMany({
      where: {
        weekStart: {
          lt: currentWeekStart,
        },
      },
      select: {
        weekStart: true,
      },
      distinct: ['weekStart'],
      orderBy: {
        weekStart: 'desc',
      },
    });

    // For each week, get top 10 tracks
    const archive = await Promise.all(
      weeks.map(async ({ weekStart }) => {
        const tracks = await prisma.track.findMany({
          where: {
            weekStart,
          },
          include: {
            votes: true,
          },
        });

        // Calculate vote counts and sort
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

        // Sort by vote count and take top 10
        tracksWithVotes.sort((a, b) => b.voteCount - a.voteCount);
        const top10 = tracksWithVotes.slice(0, 10);

        return {
          weekStart: weekStart.toISOString(),
          tracks: top10,
        };
      })
    );

    return NextResponse.json(archive);
  } catch (error) {
    console.error('Error fetching archive:', error);
    return NextResponse.json({ error: 'Failed to fetch archive' }, { status: 500 });
  }
}
