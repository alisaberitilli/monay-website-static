import { Metadata } from 'next';

export const siteConfig = {
  name: 'Monay',
  description: 'First unified platform for enterprise stablecoin issuance & compliance. $250B TAM. GENIUS Act compliant. Dual-rail blockchain serving 932K institutions.',
  url: 'https://www.monay.com',
  ogImage: 'https://www.monay.com/og-image-placeholder.svg',
  links: {
    twitter: 'https://twitter.com/monay',
    linkedin: 'https://linkedin.com/company/monay',
    github: 'https://github.com/monay',
  },
  keywords: [
    'stablecoin platform',
    'GENIUS Act',
    'programmable money',
    'enterprise blockchain',
    'digital payments',
    'fintech infrastructure',
    'government payments',
    'public sector',
    'Base L2',
    'Solana',
    'CaaS',
    'WaaS',
    'treasury management',
    'compliance orchestration',
    '932K banks',
    '$250B TAM',
    '$500B SAM',
    'Pre-Series A',
    'fintech funding',
    'blockchain payments'
  ]
};

export function generateSEOMetadata({
  title,
  description,
  keywords = [],
  path = '',
  image,
}: {
  title: string;
  description: string;
  keywords?: string[];
  path?: string;
  image?: string;
}): Metadata {
  // ✅ SEO: Keep titles under 60 characters for optimal Google display
  const fullTitle = title.length > 50 ? title : `${title} | Monay`;
  const url = `${siteConfig.url}${path}`;
  const ogImage = image || siteConfig.ogImage;

  return {
    title: fullTitle,
    description,
    keywords: [...siteConfig.keywords, ...keywords],
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
      creator: '@monay',
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// Structured data generators for different page types
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Monay',
    description: 'Enterprise stablecoin platform with GENIUS Act compliance',
    url: siteConfig.url,
    logo: `${siteConfig.url}/Monay.svg`,
    founder: {
      '@type': 'Person',
      name: 'Ali Saberi',
      jobTitle: 'Founder CEO/CTO',
    },
    foundingDate: '2020',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
    },
    sameAs: [
      siteConfig.links.twitter,
      siteConfig.links.linkedin,
      siteConfig.links.github,
    ],
    seeks: {
      '@type': 'Investment',
      amount: '$6.5M',
      investmentType: 'Pre-Series A',
    },
  };
}

export function generateProductSchema(product: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    url: product.url,
    brand: {
      '@type': 'Brand',
      name: 'Monay',
    },
    offers: {
      '@type': 'Offer',
      price: 'Contact for pricing',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}