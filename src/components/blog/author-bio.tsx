'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Twitter, Linkedin, Send } from 'lucide-react';
import type { BlogAuthor } from '@/types/blog';
import { cn } from '@/lib/utils';

interface AuthorBioProps {
  author: BlogAuthor;
  className?: string;
}

const socialIcons = {
  twitter: Twitter,
  linkedin: Linkedin,
  telegram: Send,
};

export function AuthorBio({ author, className }: AuthorBioProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative h-16 w-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
            {author.avatar ? (
              <Image
                src={author.avatar}
                alt={author.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-primary/10 text-primary font-bold text-xl">
                {author.name.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="font-bold text-lg">{author.name}</div>
            {author.role && (
              <div className="text-sm text-primary font-medium">{author.role}</div>
            )}
            {author.bio && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                {author.bio}
              </p>
            )}
            
            {/* Social Links */}
            {author.socialLinks && (
              <div className="flex items-center gap-3 mt-3">
                {Object.entries(author.socialLinks).map(([platform, url]) => {
                  if (!url) return null;
                  const Icon = socialIcons[platform as keyof typeof socialIcons];
                  if (!Icon) return null;
                  
                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
