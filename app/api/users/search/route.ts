import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const { userId: currentUserId } = await auth();

    let users;

    if (query) {
      // Search users by username or display name
      users = await prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: query.toLowerCase() } },
            { displayName: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          followers: true,
          following: true,
          posts: true,
        },
      });
    } else {
      // Get all users
      users = await prisma.user.findMany({
        include: {
          followers: true,
          following: true,
          posts: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    const usersWithStats = users.map(user => ({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      postsCount: user.posts.length,
      isFollowing: currentUserId
        ? user.followers.some(f => f.followerId === currentUserId)
        : false,
    }));

    return NextResponse.json(usersWithStats);
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
  }
}
