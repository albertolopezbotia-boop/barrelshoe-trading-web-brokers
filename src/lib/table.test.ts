import { describe, it, expect } from 'vitest';
import { sortRows, filterRows, type Row } from './table';

const rows: Row[] = [
  { slug: 'a', name: 'A', logo: '', href: '', affiliateUrl: '', rating: 4.1, rank: 2, minDeposit: 100, spread: 0.8, platforms: ['MT4'], regulators: ['CySEC'] },
  { slug: 'b', name: 'B', logo: '', href: '', affiliateUrl: '', rating: 4.6, rank: 1, minDeposit: 0, spread: 1.0, platforms: ['MT5', 'cTrader'], regulators: ['ASIC', 'FCA'] },
  { slug: 'c', name: 'C', logo: '', href: '', affiliateUrl: '', rating: 3.9, rank: 3, minDeposit: 50, spread: 0.6, platforms: ['MT4', 'MT5'], regulators: ['CNMV'] },
];

describe('table logic', () => {
  it('sortRows by rating desc', () => {
    expect(sortRows(rows, 'rating', 'desc').map((r) => r.slug)).toEqual(['b', 'a', 'c']);
  });
  it('sortRows by minDeposit asc', () => {
    expect(sortRows(rows, 'minDeposit', 'asc').map((r) => r.slug)).toEqual(['b', 'c', 'a']);
  });
  it('sortRows does not mutate input', () => {
    sortRows(rows, 'spread', 'asc');
    expect(rows.map((r) => r.slug)).toEqual(['a', 'b', 'c']);
  });
  it('filterRows by platform is case-insensitive', () => {
    expect(filterRows(rows, { platform: 'mt5' }).map((r) => r.slug)).toEqual(['b', 'c']);
  });
  it('filterRows by regulator', () => {
    expect(filterRows(rows, { regulator: 'FCA' }).map((r) => r.slug)).toEqual(['b']);
  });
  it('filterRows with no filters returns all', () => {
    expect(filterRows(rows, {}).length).toBe(3);
  });
});
