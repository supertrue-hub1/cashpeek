import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/blog/posts/[slug] - Get single post by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const post = await db.blogPost.findUnique({
      where: { slug },
      include: {
        category: true,
        author: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Increment views
    await db.blogPost.update({
      where: { id: post.id },
      data: { viewsCount: { increment: 1 } },
    });

    // Transform for frontend
    const transformedPost = {
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
        bio: post.author.bio,
        role: post.author.role,
        socialLinks: post.author.socialLinks ? JSON.parse(post.author.socialLinks) : null,
      } : null,
      linkedOfferIds: post.linkedOfferIds ? JSON.parse(post.linkedOfferIds) : [],
      readingTime: post.readingTime,
      status: post.status,
      isFeatured: post.isFeatured,
      viewsCount: post.viewsCount + 1, // Include current view
      likesCount: post.likesCount,
      publishedAt: post.publishedAt?.toISOString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };

    return NextResponse.json(transformedPost);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 });
  }
}

// PUT /api/blog/posts/[slug] - Update post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    
    // Calculate reading time
    const wordCount = body.content?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    
    const updateData: any = {
      updatedAt: new Date(),
    };
    
    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt || null;
    if (body.content !== undefined) {
      updateData.content = body.content;
      updateData.readingTime = readingTime;
    }
    if (body.featuredImage !== undefined) updateData.featuredImage = body.featuredImage || null;
    if (body.metaTitle !== undefined) updateData.metaTitle = body.metaTitle || null;
    if (body.metaDescription !== undefined) updateData.metaDescription = body.metaDescription || null;
    if (body.keywords !== undefined) updateData.keywords = body.keywords || null;
    
    // Handle categoryId - empty string means null
    if (body.categoryId !== undefined) {
      updateData.categoryId = body.categoryId && body.categoryId !== '' ? body.categoryId : null;
    }
    
    // Handle authorId - empty string means null
    if (body.authorId !== undefined) {
      updateData.authorId = body.authorId && body.authorId !== '' ? body.authorId : null;
    }
    
    // Handle linkedOfferIds
    if (body.linkedOfferIds !== undefined) {
      updateData.linkedOfferIds = body.linkedOfferIds && body.linkedOfferIds.length > 0 
        ? JSON.stringify(body.linkedOfferIds) 
        : null;
    }
    
    if (body.status !== undefined) {
      updateData.status = body.status;
      if (body.status === 'published') {
        updateData.publishedAt = new Date();
      }
    }
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured;
    
    const post = await db.blogPost.update({
      where: { slug },
      data: updateData,
      include: {
        category: true,
        author: true,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json({ 
      error: 'Failed to update blog post',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE /api/blog/posts/[slug] - Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    await db.blogPost.delete({
      where: { slug },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 });
  }
}
