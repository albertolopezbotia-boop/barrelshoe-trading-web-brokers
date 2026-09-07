import { describe, it, expect } from 'vitest';
import { sortByRank, sortByRating, filterByCategory, relatedBrokers, type BrokerEntry } from './brokers';
import type { Category } from '../data/categories';

const mk = (slug: string, rank: number, rating: number, extra: Partial<any> = {}): BrokerEntry =>
  ({ slug, data: { rank, rating, platforms: [], copyTrading: false, instruments: { gold: false }, ...extra } } as unknown as BrokerEntry);

describe('brokers helpers', () => {
  const list = [mk('c', 3, 4.1), mk('a', 1, 3.9), mk('b', 2, 4.5)];

  it('sortByRank orders ascending by rank without mutating input', () => {
    const out = sortByRank(list);
    expect(out.map((b) => b.slug)).toEqual(['a', 'b', 'c']);
    expect(list[0].slug).toBe('c');
  });
  it('sortByRating orders descending by rating, tie-break by rank', () => {
    const tie = [mk('x', 5, 4.0), mk('y', 2, 4.0), mk('z', 1, 4.8)];
    expect(sortByRating(tie).map((b) => b.slug)).toEqual(['z', 'y', 'x']);
  });
  it('filterByCategory keeps only matching brokers in input order', () => {
    const cat = { matches: (d: any) => d.platforms.includes('MT4') } as Category;
    const withPlat = [mk('c', 3, 4.1, { platforms: ['MT4'] }), mk('a', 1, 3.9, { platforms: [] }), mk('b', 2, 4.5, { platforms: ['MT4'] })];
    expect(filterByCategory(withPlat, cat).map((b) => b.slug)).toEqual(['c', 'b']);
  });
  it('relatedBrokers returns top-rated excluding the given slug', () => {
    expect(relatedBrokers(list, 'b', 2).map((b) => b.slug)).toEqual(['c', 'a']);
  });
});
