import type { NextConfig } from "next";

// Bundle Analyzer (опционально)
let withBundleAnalyzer: any;
try {
  const analyzer = require('@next/bundle-analyzer');
  withBundleAnalyzer = analyzer({
    enabled: process.env.ANALYZE === 'true',
  });
} catch {
  // Bundle analyzer не установлен
  withBundleAnalyzer = (config: NextConfig) => config;
}

const nextConfig: NextConfig = {
  output: "standalone",
  
  // TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // React
  reactStrictMode: false,
  
  // Оптимизация сборки
  experimental: {
    // Улучшенная оптимизация CSS
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'framer-motion',
      'recharts',
      '@tanstack/react-table',
    ],
    // Включить turbo для faster builds (опционально)
    // turbo: {
    //   resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    // },
  },
  
  // Webpack конфигурация для стабильности CSS
  webpack: (config, { isServer }) => {
    // Отключаем проблемные оптимизации для CSS
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Объединяем все CSS в один бандл
            styles: {
              name: 'styles',
              type: 'css/mini-extract',
              chunks: 'all',
              enforce: true,
            },
          },
        },
      };
    }
    
    // Игнорируем предупреждения о критических зависимостях
    config.ignoreWarnings = [
      { module: /node_modules\/z-ai-web-dev-sdk/ },
      { module: /node_modules\/@mdxeditor/ },
    ];
    
    return config;
  },
  
  // Изображения
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  
  // SEO Redirects
  async redirects() {
    return [
      // Старые URL → Новые URL
      {
        source: '/compare',
        destination: '/sravnit',
        permanent: true, // 301
      },
      {
        source: '/comparison',
        destination: '/sravnit',
        permanent: true,
      },
      {
        source: '/offers',
        destination: '/zaimy',
        permanent: true,
      },
      {
        source: '/loans',
        destination: '/zaimy',
        permanent: true,
      },
      {
        source: '/mikrozaimy',
        destination: '/zaimy',
        permanent: true,
      },
      {
        source: '/mikrokredity',
        destination: '/zaimy',
        permanent: true,
      },
      // Внимание: trailing slash редирект убран - вызывал бесконечный цикл
      // {
      //   source: '/:path*/',
      //   destination: '/:path*',
      //   permanent: true,
      // },
    ];
  },
  
  // Headers для SEO и безопасности
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/sitemap(.*)\\.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600',
          },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400',
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
