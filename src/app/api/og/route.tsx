import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * OG Image Generator API
 * Генерирует динамические OG-изображения для соцсетей
 * 
 * Примеры:
 * /api/og?title=Займы на карту&type=default
 * /api/og?title=Займы в Москве&subtitle=Сравните 15+ предложений&type=city
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const title = searchParams.get('title') || 'CashPeek — Займы онлайн';
  const subtitle = searchParams.get('subtitle') || 'Сравните лучшие предложения МФО';
  const type = searchParams.get('type') || 'default';
  
  // Цвета в зависимости от типа страницы
  const colors = {
    default: { bg: '#0f172a', accent: '#3b82f6' },
    blog: { bg: '#1e1b4b', accent: '#8b5cf6' },
    offer: { bg: '#054e3a', accent: '#10b981' },
    city: { bg: '#1e3a5f', accent: '#06b6d4' },
  };
  
  const color = colors[type as keyof typeof colors] || colors.default;
  
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: color.bg,
          padding: '60px',
          position: 'relative',
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 20% 80%, ${color.accent}20 0%, transparent 50%)`,
          }}
        />
        
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: color.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px',
            }}
          >
            <span style={{ fontSize: '24px', color: 'white' }}>💳</span>
          </div>
          <span
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            cash<span style={{ color: color.accent }}>peek</span>
          </span>
        </div>
        
        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <h1
            style={{
              fontSize: '52px',
              fontWeight: 'bold',
              color: 'white',
              margin: 0,
              lineHeight: 1.2,
              maxWidth: '900px',
            }}
          >
            {title}
          </h1>
          
          {subtitle && (
            <p
              style={{
                fontSize: '24px',
                color: '#94a3b8',
                margin: '20px 0 0',
                maxWidth: '800px',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 'auto',
            paddingTop: '30px',
            borderTop: '1px solid #334155',
          }}
        >
          <span style={{ fontSize: '18px', color: '#94a3b8' }}>
            cashpeek.ru
          </span>
          <span style={{ fontSize: '18px', color: '#94a3b8' }}>
            Сравнение МФО
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
