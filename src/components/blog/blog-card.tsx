'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Eye, ArrowRight } from 'lucide-react';
import type { BlogPost } from '@/types/blog';
import { formatReadingTime, formatPostDate, truncateText } from '@/lib/blog/utils';
import { cn } from '@/lib/utils';

interface BlogCardProps {
  post: BlogPost;
  variant?: 'default' | 'featured' | 'compact';
  className?: string;
}

export function BlogCard({ post, variant = 'default', className }: BlogCardProps) {
  const categoryColor = post.category?.color || '#10b981';
  
  if (variant === 'featured') {
    return (
      <Card className={cn(
        'group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300',
        className
      )}>
        <Link href={`/blog/${post.slug}`} className="block">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image */}
            <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
              {post.featuredImage ? (
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div 
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${categoryColor}20, ${categoryColor}40)` }}
                >
                  <span className="text-4xl font-bold text-white/80">
                    {post.title.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              {post.category && (
                <div className="absolute top-4 left-4">
                  <Badge 
                    style={{ backgroundColor: categoryColor }}
                    className="text-white border-0"
                  >
                    {post.category.name}
                  </Badge>
                </div>
              )}
            </div>
            
            {/* Content */}
            <CardContent className="p-8 flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {truncateText(post.excerpt, 200)}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {post.author && (
                  <span>{post.author.name}</span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatReadingTime(post.readingTime)}
                </span>
                {post.publishedAt && (
                  <span>{formatPostDate(post.publishedAt)}</span>
                )}
              </div>
              <div className="mt-4 flex items-center text-primary font-medium group-hover:gap-2 transition-all">
                Читать статью
                <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </CardContent>
          </div>
        </Link>
      </Card>
    );
  }
  
  if (variant === 'compact') {
    return (
      <Link 
        href={`/blog/${post.slug}`}
        className={cn(
          'group flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors',
          className
        )}
      >
        <div className="flex-1 min-w-0">
          <h4 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h4>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatReadingTime(post.readingTime)}</span>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
      </Link>
    );
  }
  
  // Default variant
  return (
    <Card className={cn(
      'group overflow-hidden hover:shadow-lg transition-all duration-300',
      className
    )}>
      <Link href={`/blog/${post.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          {post.featuredImage ? (
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${categoryColor}20, ${categoryColor}40)` }}
            >
              <span className="text-3xl font-bold text-white/80">
                {post.title.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          {post.category && (
            <div className="absolute top-3 left-3">
              <Badge 
                style={{ backgroundColor: categoryColor }}
                className="text-white border-0 text-xs"
              >
                {post.category.name}
              </Badge>
            </div>
          )}
          {post.isFeatured && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-yellow-500 text-yellow-900 border-0 text-xs">
                Избранное
              </Badge>
            </div>
          )}
        </div>
        
        {/* Content */}
        <CardContent className="p-5">
          <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {truncateText(post.excerpt, 120)}
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              {post.author && (
                <span className="font-medium">{post.author.name}</span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatReadingTime(post.readingTime)}
              </span>
            </div>
            {post.viewsCount > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {post.viewsCount}
              </span>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
