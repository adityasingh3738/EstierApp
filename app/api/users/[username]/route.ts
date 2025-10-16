import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser as getClerkUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Get user profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const { userId: currentUserId } = await auth();

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        posts: {
          include: {
            likes: true,
            comments: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        followers: true,
        following: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isFollowing = currentUserId
      ? user.followers.some(f => f.followerId === currentUserId)
      : false;

    return NextResponse.json({
      ...user,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      postsCount: user.posts.length,
      isFollowing,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// Update user profile
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { username } = await params;
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user || user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { bio, avatarUrl } = await request.json();

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { bio, avatarUrl },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
