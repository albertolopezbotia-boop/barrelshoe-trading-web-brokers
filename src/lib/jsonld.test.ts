import { describe, it, expect } from 'vitest';
import { organizationLd, reviewLd, itemListLd, faqPageLd, breadcrumbListLd } from './jsonld';

describe('jsonld', () => {
  it('organizationLd has correct type and url', () => {
    const ld = organizationLd() as any;
    expect(ld['@type']).toBe('Organization');
    expect(ld.url).toBe('https://barrelshoetrading.com');
  });
  it('reviewLd carries the rating and reviewed item', () => {
    const ld = reviewLd({ broker: { name: 'XM', rating: 4.3 } as any, slug: 'xm' }) as any;
    expect(ld['@type']).toBe('Review');
    expect(ld.reviewRating.ratingValue).toBe(4.3);
    expect(ld.itemReviewed.name).toBe('XM');
    expect(ld.url).toBe('https://barrelshoetrading.com/brokers/xm/');
  });
  it('itemListLd numbers positions from 1', () => {
    const ld = itemListLd({ items: [{ name: 'A', url: 'u1' }, { name: 'B', url: 'u2' }] }) as any;
    expect(ld.itemListElement[0].position).toBe(1);
    expect(ld.itemListElement[1].position).toBe(2);
  });
  it('faqPageLd maps questions to Question/Answer', () => {
    const ld = faqPageLd([{ question: 'q', answer: 'a' }]) as any;
    expect(ld['@type']).toBe('FAQPage');
    expect(ld.mainEntity[0].acceptedAnswer.text).toBe('a');
  });
  it('breadcrumbListLd builds absolute urls', () => {
    const ld = breadcrumbListLd([{ name: 'Inicio', path: '/' }, { name: 'Brokers', path: '/brokers/xm/' }]) as any;
    expect(ld.itemListElement[1].item).toBe('https://barrelshoetrading.com/brokers/xm/');
  });
});
