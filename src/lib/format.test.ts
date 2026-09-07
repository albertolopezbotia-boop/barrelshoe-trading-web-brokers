import { describe, it, expect } from 'vitest';
import { money, pips, yesNo } from './format';

describe('format', () => {
  it('money formats amount and currency', () => {
    expect(money({ amount: 100, currency: 'USD' })).toBe('100 USD');
  });
  it('pips uses es-ES comma decimal and unit', () => {
    expect(pips(0.6)).toBe('0,6 pips');
  });
  it('yesNo maps booleans to Spanish', () => {
    expect(yesNo(true)).toBe('Sí');
    expect(yesNo(false)).toBe('No');
  });
});
