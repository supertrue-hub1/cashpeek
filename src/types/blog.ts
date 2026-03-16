import type { FAQItem } from '@/contexts/page-faq-context';

/**
 * Типы для блога и FAQ системы
 */

export type { FAQItem } from '@/contexts/page-faq-context';

/**
 * Варианты стилизации FAQ-блока
 */
export type FAQVariant = 'default' | 'bordered' | 'minimal';

/**
 * Тип секции статьи (для CMS/MDX)
 */
export interface ArticleSection {
  type: 'text' | 'heading' | 'faq' | 'image' | 'quote' | 'code' | 'list';
  content?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  items?: FAQItem[];
  src?: string;
  alt?: string;
  author?: string;
  language?: string;
  listItems?: string[];
}

/**
 * Метаданные статьи
 */
export interface ArticleMetadata {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  author: {
    name: string;
    avatar?: string;
  };
  featured?: boolean;
  tags?: string[];
  coverImage?: string;
}

/**
 * Полная статья с контентом
 */
export interface Article extends ArticleMetadata {
  sections: ArticleSection[];
}

/**
 * Пропсы для MDX-компонента FAQ
 */
export interface MDXFAQProps {
  items: Array<{
    q: string;  // Сокращение для question
    a: string;  // Сокращение для answer
  }>;
  title?: string;
  variant?: FAQVariant;
}

/**
 * Преобразует MDX-формат в стандартный FAQItem
 */
export function normalizeMDXFAQ(items: Array<{ q: string; a: string }>): FAQItem[] {
  return items.map((item) => ({
    question: item.q,
    answer: item.a,
  }));
}

// ============================================
// Blog System Types (Database-backed)
// ============================================

// Blog Category
export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  postCount?: number;
}

// Blog Author
export interface BlogAuthor {
  id: string;
  name: string;
  slug: string;
  avatar?: string;
  bio?: string;
  role?: string;
  socialLinks?: {
    twitter?: string;
    telegram?: string;
    linkedin?: string;
  };
}

// Blog Post
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  
  // Relations
  categoryId?: string;
  category?: BlogCategory;
  authorId?: string;
  author?: BlogAuthor;
  
  // Linked offers
  linkedOfferIds?: string[];
  
  // Reading
  readingTime: number;
  
  // Status
  status: 'draft' | 'published' | 'archived';
  isFeatured: boolean;
  
  // Analytics
  viewsCount: number;
  likesCount: number;
  
  // Timestamps
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Blog Tag
export interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

// Table of Contents Item
export interface TocItem {
  id: string;
  text: string;
  level: number;
}

// Blog Card Props
export interface BlogCardProps {
  post: BlogPost;
  variant?: 'default' | 'featured' | 'compact';
}

// CTA Box Props
export interface BlogCtaBoxProps {
  title?: string;
  description?: string;
  offerIds?: string[];
  variant?: 'inline' | 'sidebar' | 'bottom';
}

// Blog Filter State
export interface BlogFilterState {
  category?: string;
  search?: string;
  status?: string;
  author?: string;
}
