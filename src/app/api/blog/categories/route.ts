import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/blog/categories - Get all categories
export async function GET() {
  try {
    const categories = await db.blogCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { posts: { where: { status: 'published' } } },
        },
      },
    });

    const transformed = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      color: cat.color,
      icon: cat.icon,
      sortOrder: cat.sortOrder,
      postCount: cat._count.posts,
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST /api/blog/categories - Create category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const category = await db.blogCategory.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        color: body.color,
        icon: body.icon,
        sortOrder: body.sortOrder || 0,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
