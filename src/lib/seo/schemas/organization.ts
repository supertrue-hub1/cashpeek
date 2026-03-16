/**
 * Organization Schema.org generator
 * https://schema.org/Organization
 */

export interface OrganizationSchemaData {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: {
    locality: string;
    region: string;
    country: string;
  };
  socialLinks?: {
    vk?: string;
    telegram?: string;
    youtube?: string;
  };
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cashpeek.ru';

/**
 * Создаёт Organization schema для сайта
 */
export function createOrganizationSchema(data?: Partial<OrganizationSchemaData>): object {
  const defaultData: OrganizationSchemaData = {
    name: 'CashPeek',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description: 'Сервис сравнения займов и микрокредитов. Помогаем найти выгодные предложения от проверенных МФО России.',
    email: 'info@cashpeek.ru',
    address: {
      locality: 'Москва',
      region: 'Москва',
      country: 'Russia',
    },
    ...data,
  };

  const sameAs: string[] = [];
  if (defaultData.socialLinks?.vk) sameAs.push(defaultData.socialLinks.vk);
  if (defaultData.socialLinks?.telegram) sameAs.push(defaultData.socialLinks.telegram);
  if (defaultData.socialLinks?.youtube) sameAs.push(defaultData.socialLinks.youtube);

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: defaultData.name,
    url: defaultData.url,
    logo: defaultData.logo,
    description: defaultData.description,
    email: defaultData.email,
    telephone: defaultData.phone,
    address: defaultData.address ? {
      '@type': 'PostalAddress',
      addressLocality: defaultData.address.locality,
      addressRegion: defaultData.address.region,
      addressCountry: defaultData.address.country,
    } : undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: defaultData.email,
      availableLanguage: 'Russian',
    },
  };
}

/**
 * Создаёт WebSite schema для главной страницы
 */
export function createWebSiteSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CashPeek',
    url: BASE_URL,
    description: 'Сравнение займов и микрокредитов онлайн',
    publisher: {
      '@type': 'Organization',
      name: 'CashPeek',
      logo: `${BASE_URL}/logo.png`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/zaimy?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
