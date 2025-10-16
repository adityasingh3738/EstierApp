import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { isVotingLocked } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'You must be signed in to vote' },
        { status: 401 }
      );
    }

    // Check if voting is locked (Sunday)
    if (isVotingLocked()) {
      return NextResponse.json(
        { error: 'Voting is locked on Sundays' },
        { status: 403 }
      );
    }

    const { trackId, value } = await request.json();
    
    if (!trackId || (value !== 1 && value !== -1)) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Check if user has already voted for this track
    const existingVote = await prisma.vote.findUnique({
      where: {
        trackId_userId: {
          trackId,
          userId,
        },
      },
    });

    if (existingVote) {
      // If same vote, remove it (toggle off)
      if (existingVote.value === value) {
        await prisma.vote.delete({
          where: { id: existingVote.id },
        });
        return NextResponse.json({ action: 'removed', value: 0 });
      } else {
        // If different vote, update it
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { value },
        });
        return NextResponse.json({ action: 'updated', value });
      }
    } else {
      // Create new vote
      await prisma.vote.create({
        data: {
          trackId,
          userId,
          value,
        },
      });
      return NextResponse.json({ action: 'created', value });
    }
  } catch (error) {
    console.error('Error voting:', error);
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ value: 0 }); // Return neutral vote for unauthenticated users
    }

    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get('trackId');
    
    if (!trackId) {
      return NextResponse.json({ error: 'Track ID required' }, { status: 400 });
    }

    const vote = await prisma.vote.findUnique({
      where: {
        trackId_userId: {
          trackId,
          userId,
        },
      },
    });

    return NextResponse.json({ value: vote?.value || 0 });
  } catch (error) {
    console.error('Error fetching vote:', error);
    return NextResponse.json({ error: 'Failed to fetch vote' }, { status: 500 });
  }
}
