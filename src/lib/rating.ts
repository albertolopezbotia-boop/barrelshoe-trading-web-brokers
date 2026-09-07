import type { BrokerData } from './broker-schema';

export const WEIGHTS = {
  fees: 0.3, platforms: 0.2, deposits: 0.15, support: 0.1, regulation: 0.25,
} as const;

export function aggregateRating(breakdown: BrokerData['ratingBreakdown']): number {
  const raw =
    breakdown.fees * WEIGHTS.fees +
    breakdown.platforms * WEIGHTS.platforms +
    breakdown.deposits * WEIGHTS.deposits +
    breakdown.support * WEIGHTS.support +
    breakdown.regulation * WEIGHTS.regulation;
  return Math.round(raw * 10) / 10;
}
