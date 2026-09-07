import { describe, it, expect } from 'vitest';
import { aggregateRating, WEIGHTS } from './rating';

describe('aggregateRating', () => {
  it('weights sum to 1', () => {
    expect(Object.values(WEIGHTS).reduce((a, b) => a + b, 0)).toBeCloseTo(1);
  });
  it('all-5 breakdown yields 5.0', () => {
    expect(aggregateRating({ fees: 5, platforms: 5, deposits: 5, support: 5, regulation: 5 })).toBe(5);
  });
  it('computes a weighted average rounded to 1 decimal', () => {
    // 4*0.3 + 3*0.2 + 5*0.15 + 2*0.1 + 4.5*0.25 = 1.2+0.6+0.75+0.2+1.125 = 3.875 -> 3.9
    expect(aggregateRating({ fees: 4, platforms: 3, deposits: 5, support: 2, regulation: 4.5 })).toBe(3.9);
  });
});
