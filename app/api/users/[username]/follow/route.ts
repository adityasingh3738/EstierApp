import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { userId: followerId } = await auth();
    if (!followerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { username } = await params;
    const userToFollow = await prisma.user.findUnique({ where: { username } });

    if (!userToFollow) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (userToFollow.id === followerId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    // Check if already following
    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: userToFollow.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Already following' }, { status: 400 });
    }

    await prisma.follow.create({
      data: {
        followerId,
        followingId: userToFollow.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error following user:', error);
    return NextResponse.json({ error: 'Failed to follow' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { userId: followerId } = await auth();
    if (!followerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { username } = await params;
    const userToUnfollow = await prisma.user.findUnique({ where: { username } });

    if (!userToUnfollow) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId: userToUnfollow.id,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return NextResponse.json({ error: 'Failed to unfollow' }, { status: 500 });
  }
}
