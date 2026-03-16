import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/blog/posts - Get all posts with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit');
    const search = searchParams.get('search');

    const where: any = {};
    
    if (status !== 'all') {
      where.status = status;
    }
    
    if (category) {
      where.category = { slug: category };
    }
    
    if (featured === 'true') {
      where.isFeatured = true;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    const posts = await db.blogPost.findMany({
      where,
      include: {
        category: true,
        author: true,
      },
      orderBy: [
        { isFeatured: 'desc' },
        { publishedAt: 'desc' },
      ],
      ...(limit ? { take: parseInt(limit) } : {}),
    });

    // Transform for frontend
    const transformedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      featuredImage: post.featuredImage,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      keywords: post.keywords,
      categoryId: post.categoryId,
      category: post.category ? {
        id: post.category.id,
        name: post.category.name,
        slug: post.category.slug,
        color: post.category.color,
        icon: post.category.icon,
      } : null,
      authorId: post.authorId,
      author: post.author ? {
        id: post.author.id,
        name: post.author.name,
        slug: post.author.slug,
        avatar: post.author.avatar,
        role: post.author.role,
      } : null,
      linkedOfferIds: post.linkedOfferIds ? JSON.parse(post.linkedOfferIds) : [],
      readingTime: post.readingTime,
      status: post.status,
      isFeatured: post.isFeatured,
      viewsCount: post.viewsCount,
      likesCount: post.likesCount,
      publishedAt: post.publishedAt?.toISOString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    }));

    return NextResponse.json(transformedPosts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch blog posts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/blog/posts - Create new post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Calculate reading time (approx 200 words per minute)
    const wordCount = body.content?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    
    // Prepare data - handle empty strings and null values
    const data: any = {
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt || null,
      content: body.content || '',
      featuredImage: body.featuredImage || null,
      metaTitle: body.metaTitle || null,
      metaDescription: body.metaDescription || null,
      keywords: body.keywords || null,
      readingTime,
      status: body.status || 'draft',
      isFeatured: body.isFeatured || false,
    };
    
    // Handle categoryId - convert empty string to null
    if (body.categoryId && body.categoryId !== '') {
      data.categoryId = body.categoryId;
    }
    
    // Handle authorId - convert empty string to null
    if (body.authorId && body.authorId !== '') {
      data.authorId = body.authorId;
    }
    
    // Handle linkedOfferIds
    if (body.linkedOfferIds && Array.isArray(body.linkedOfferIds) && body.linkedOfferIds.length > 0) {
      data.linkedOfferIds = JSON.stringify(body.linkedOfferIds);
    }
    
    // Set publishedAt if status is published
    if (body.status === 'published') {
      data.publishedAt = new Date();
    }
    
    const post = await db.blogPost.create({
      data,
      include: {
        category: true,
        author: true,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json({ 
      error: 'Failed to create blog post',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
