import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Get feed posts
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: true,
        likes: true,
        comments: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    const { userId } = await auth();

    const postsWithData = posts.map(post => ({
      ...post,
      likeCount: post.likes.length,
      commentCount: post.comments.length,
      isLiked: userId ? post.likes.some(like => like.userId === userId) : false,
    }));

    return NextResponse.json(postsWithData);
  } catch (error) {
    console.error('Error fetching feed:', error);
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
  }
}

// Create new post
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clerkUser = await currentUser();
    const username = clerkUser?.username || clerkUser?.firstName || 'User';

    // Ensure user exists in database
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          username: username.toLowerCase().replace(/\s/g, '_'),
          displayName: username,
        },
      });
    }

    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'Post must be 1000 characters or less' },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        userId,
        content: content.trim(),
      },
      include: {
        user: true,
        likes: true,
        comments: true,
      },
    });

    return NextResponse.json({
      ...post,
      likeCount: 0,
      commentCount: 0,
      isLiked: false,
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
