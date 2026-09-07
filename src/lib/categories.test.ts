import { describe, it, expect } from 'vitest';
import { CATEGORIES, getCategory } from '../data/categories';
import type { BrokerData } from './broker-schema';

const base = { platforms: [], copyTrading: false, instruments: { gold: false } } as unknown as BrokerData;

describe('categories', () => {
  it('has exactly the 5 v1 category slugs', () => {
    expect(CATEGORIES.map((c) => c.slug).sort()).toEqual(
      ['copy-trading', 'ctrader', 'mt4', 'mt5', 'oro'],
    );
  });
  it('mt4 category matches a broker offering MT4', () => {
    const b = { ...base, platforms: ['MT4'] } as unknown as BrokerData;
    expect(getCategory('mt4')!.matches(b)).toBe(true);
  });
  it('oro category matches only brokers with gold', () => {
    expect(getCategory('oro')!.matches({ ...base, instruments: { gold: true } } as unknown as BrokerData)).toBe(true);
    expect(getCategory('oro')!.matches(base)).toBe(false);
  });
  it('getCategory returns undefined for unknown slug', () => {
    expect(getCategory('forex')).toBeUndefined();
  });
});
