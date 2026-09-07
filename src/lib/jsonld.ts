import type { BrokerData } from './broker-schema';
import { SITE } from '../data/site';

const abs = (path: string) => new URL(path, SITE.url).href;

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
  };
}

export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
  };
}

export function reviewLd(input: { broker: Pick<BrokerData, 'name' | 'rating'>; slug: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: { '@type': 'FinancialService', name: input.broker.name },
    reviewRating: { '@type': 'Rating', ratingValue: input.broker.rating, bestRating: 5, worstRating: 0 },
    author: { '@type': 'Organization', name: SITE.name },
    url: abs(`/brokers/${input.slug}/`),
  };
}

export function itemListLd(input: { items: Array<{ name: string; url: string }> }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: input.items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      url: it.url,
    })),
  };
}

export function faqPageLd(faq: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function breadcrumbListLd(crumbs: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: abs(c.path),
    })),
  };
}
