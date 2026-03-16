import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/blog/authors - Get all authors
export async function GET() {
  try {
    const authors = await db.blogAuthor.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { posts: { where: { status: 'published' } } },
        },
      },
    });

    const transformed = authors.map((author) => ({
      id: author.id,
      name: author.name,
      slug: author.slug,
      avatar: author.avatar,
      bio: author.bio,
      role: author.role,
      socialLinks: author.socialLinks ? JSON.parse(author.socialLinks) : null,
      postCount: author._count.posts,
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error fetching authors:', error);
    return NextResponse.json({ error: 'Failed to fetch authors' }, { status: 500 });
  }
}

// POST /api/blog/authors - Create author
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const author = await db.blogAuthor.create({
      data: {
        name: body.name,
        slug: body.slug,
        avatar: body.avatar,
        bio: body.bio,
        role: body.role,
        socialLinks: body.socialLinks ? JSON.stringify(body.socialLinks) : null,
      },
    });

    return NextResponse.json(author);
  } catch (error) {
    console.error('Error creating author:', error);
    return NextResponse.json({ error: 'Failed to create author' }, { status: 500 });
  }
}
