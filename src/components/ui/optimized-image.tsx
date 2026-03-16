/**
 * Optimized Image Component
 * 
 * Оптимизированный компонент для изображений:
 * - Lazy loading
 * - Placeholder blur
 * - Адаптивные размеры
 * - Error handling
 */

'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fallback?: string;
}

// Placeholder для логотипов (серый квадрат)
const PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFNUU3RUIiLz48dGV4dCB4PSI1MCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOUM5QzlDIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7QnNC+0LPRgNCwPC90ZXh0Pjwvc3ZnPg==';

// Fallback изображение
const FALLBACK = '/images/no-logo.png';

export function OptimizedImage({
  src,
  alt,
  width = 100,
  height = 100,
  className,
  priority = false,
  fallback = FALLBACK,
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  const imageSrc = error || !src ? fallback : src;
  
  return (
    <div 
      className={cn('relative overflow-hidden bg-muted', className)}
      style={{ width, height }}
    >
      {/* Placeholder */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-muted" />
      )}
      
      {/* Image */}
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        placeholder="blur"
        blurDataURL={PLACEHOLDER}
        className={cn(
          'object-contain transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0'
        )}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true);
          setLoaded(true);
        }}
      />
    </div>
  );
}

// ============================================
// Logo Component для МФО
// ============================================

interface MfoLogoProps {
  src: string | null | undefined;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  priority?: boolean;
}

const LOGO_SIZES = {
  sm: { width: 48, height: 32 },
  md: { width: 80, height: 48 },
  lg: { width: 120, height: 72 },
};

export function MfoLogo({
  src,
  name,
  size = 'md',
  className,
  priority = false,
}: MfoLogoProps) {
  const { width, height } = LOGO_SIZES[size];
  
  return (
    <OptimizedImage
      src={src}
      alt={`${name} — логотип`}
      width={width}
      height={height}
      className={cn('rounded', className)}
      priority={priority}
    />
  );
}

// ============================================
// Hero Background Image
// ============================================

interface HeroBackgroundProps {
  src: string;
  alt?: string;
  className?: string;
  overlay?: boolean;
  overlayOpacity?: number;
}

export function HeroBackground({
  src,
  alt = '',
  className,
  overlay = true,
  overlayOpacity = 0.5,
}: HeroBackgroundProps) {
  return (
    <div className={cn('absolute inset-0 -z-10', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        priority
        quality={85}
        sizes="100vw"
      />
      
      {overlay && (
        <div 
          className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background"
          style={{ opacity: overlayOpacity }}
        />
      )}
    </div>
  );
}

export default OptimizedImage;
