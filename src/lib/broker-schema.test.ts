import { describe, it, expect } from 'vitest';
import { brokerSchema } from './broker-schema';

const valid = {
  name: 'X', logo: '/logos/x.svg', websiteUrl: 'https://x.com', founded: 2010,
  headquarters: 'Londres', affiliateUrl: 'https://x.com/a', rank: 1, rating: 4.2,
  ratingBreakdown: { fees: 4, platforms: 4, deposits: 4, support: 4, regulation: 4 },
  regulators: [{ authority: 'FCA', country: 'RU', licenseNumber: '1', status: 'activa' }],
  minDeposit: { amount: 100, currency: 'USD' }, spreadEurUsdFrom: 0.6,
  commissionPerLot: null, swapFree: true,
  accountTypes: [{ name: 'Std', spreadFrom: 1, commission: 'Sin comisión', minDeposit: { amount: 100, currency: 'USD' } }],
  platforms: ['MT4'],
  instruments: { forex: true, indices: false, commodities: false, gold: false, stocks: false, crypto: false, etfs: false },
  leverageMax: '1:500', copyTrading: false, easAllowed: true, scalpingAllowed: true,
  demoAccount: true, islamicAccount: false, paymentMethods: ['Tarjeta'],
  withdrawalTimeTypical: '1 día', withdrawalFees: 'Sin comisión',
  ownership: 'X Group', listedCompany: false, globalOffices: [], groupEntities: [],
  support: { languages: ['Español'], hours: '24/5', channels: ['Email'] },
  pros: ['a', 'b'], cons: ['c', 'd'],
  bottomLine: 'x'.repeat(50), lastUpdated: '2026-09-07',
  faq: [{ question: 'q', answer: 'a' }],
};

describe('brokerSchema', () => {
  it('accepts a fully valid broker', () => {
    expect(brokerSchema.safeParse(valid).success).toBe(true);
  });
  it('accepts a rating with a single decimal (4.2)', () => {
    expect(brokerSchema.safeParse({ ...valid, rating: 4.2 }).success).toBe(true);
  });
  it('rejects rating above 5', () => {
    expect(brokerSchema.safeParse({ ...valid, rating: 5.5 }).success).toBe(false);
  });
  it('rejects fewer than 2 pros', () => {
    expect(brokerSchema.safeParse({ ...valid, pros: ['only one'] }).success).toBe(false);
  });
  it('rejects empty regulators', () => {
    expect(brokerSchema.safeParse({ ...valid, regulators: [] }).success).toBe(false);
  });
  it('rejects a logo path outside /logos/', () => {
    expect(brokerSchema.safeParse({ ...valid, logo: 'x.svg' }).success).toBe(false);
  });
});
