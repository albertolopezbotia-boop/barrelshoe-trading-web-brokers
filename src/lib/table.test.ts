import { describe, it, expect } from 'vitest';
import { sortRows, filterRows, type Row } from './table';

const mk = (over: Partial<Row>): Row => ({
  slug: 'x',
  name: 'X',
  href: '',
  affiliateUrl: '',
  rating: 4,
  rank: 1,
  minDeposit: 100,
  minDepositCurrency: 'USD',
  spread: 1,
  leverageMax: '1:500',
  commission: 'Sin comisión',
  swapFree: true,
  withdrawalTime: '1-2 días',
  platforms: ['MT4'],
  brokerType: ['STP'],
  regulators: ['CySEC'],
  regulatorTags: ['CySEC (Chipre)'],
  instruments: ['forex'],
  ...over,
});

const rows: Row[] = [
  mk({ slug: 'a', name: 'Alfa Brokers', rating: 4.1, rank: 2, minDeposit: 100, spread: 0.8, platforms: ['MT4'], regulators: ['CySEC'], instruments: ['forex', 'gold'] }),
  mk({ slug: 'b', name: 'Beta Markets', rating: 4.6, rank: 1, minDeposit: 0, spread: 1.0, platforms: ['MT5', 'cTrader'], regulators: ['ASIC', 'FCA'], instruments: ['forex', 'crypto', 'stocks'] }),
  mk({ slug: 'c', name: 'Gamma FX', rating: 3.9, rank: 3, minDeposit: 50, spread: 0.6, platforms: ['MT4', 'MT5'], regulators: ['CNMV'], instruments: ['forex', 'gold', 'crypto'] }),
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
  it('filterRows by name is a case-insensitive substring', () => {
    expect(filterRows(rows, { name: 'markets' }).map((r) => r.slug)).toEqual(['b']);
    expect(filterRows(rows, { name: 'a' }).map((r) => r.slug)).toEqual(['a', 'b', 'c']);
  });
  it('filterRows by instruments requires every selected instrument (AND)', () => {
    expect(filterRows(rows, { instruments: ['gold', 'crypto'] }).map((r) => r.slug)).toEqual(['c']);
    expect(filterRows(rows, { instruments: ['forex'] }).map((r) => r.slug)).toEqual(['a', 'b', 'c']);
  });
  it('filterRows combines all filters', () => {
    expect(filterRows(rows, { instruments: ['crypto'], platform: 'mt4' }).map((r) => r.slug)).toEqual(['c']);
  });
  it('filterRows with no filters returns all', () => {
    expect(filterRows(rows, {}).length).toBe(3);
  });
});
