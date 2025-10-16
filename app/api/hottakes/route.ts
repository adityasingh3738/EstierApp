import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const hotTakes = await prisma.hotTake.findMany({
      include: {
        comments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const hotTakesWithCount = hotTakes.map(take => ({
      id: take.id,
      userId: take.userId,
      userName: take.userName,
      title: take.title,
      content: take.content,
      createdAt: take.createdAt.toISOString(),
      commentCount: take.comments.length,
    }));

    return NextResponse.json(hotTakesWithCount);
  } catch (error) {
    console.error('Error fetching hot takes:', error);
    return NextResponse.json({ error: 'Failed to fetch hot takes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'You must be signed in to post a hot take' },
        { status: 401 }
      );
    }

    const user = await currentUser();
    const userName = user?.firstName || user?.username || 'Anonymous';

    const { title, content } = await request.json();

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    if (title.length > 200) {
      return NextResponse.json(
        { error: 'Title must be 200 characters or less' },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'Content must be 1000 characters or less' },
        { status: 400 }
      );
    }

    const hotTake = await prisma.hotTake.create({
      data: {
        userId,
        userName,
        title: title.trim(),
        content: content.trim(),
      },
    });

    return NextResponse.json(hotTake);
  } catch (error) {
    console.error('Error creating hot take:', error);
    return NextResponse.json(
      { error: 'Failed to create hot take' },
      { status: 500 }
    );
  }
}
