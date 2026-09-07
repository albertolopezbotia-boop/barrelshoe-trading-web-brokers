import type { BrokerEntry } from './brokers';
import type { BrokerData } from './broker-schema';

export type SortKey = 'rank' | 'rating' | 'minDeposit' | 'spread';

export const INSTRUMENT_KEYS: Array<keyof BrokerData['instruments']> = [
  'forex',
  'indices',
  'commodities',
  'gold',
  'stocks',
  'crypto',
  'etfs',
];

export interface Row {
  slug: string;
  name: string;
  href: string;
  affiliateUrl: string;
  rating: number;
  rank: number;
  minDeposit: number;
  minDepositCurrency: string;
  spread: number;
  leverageMax: string;
  commission: string;
  swapFree: boolean;
  withdrawalTime: string;
  platforms: string[];
  brokerType: string[];
  regulators: string[];
  regulatorTags: string[];
  instruments: string[];
}

export interface Filters {
  name?: string;
  platform?: string;
  regulator?: string;
  instruments?: string[];
}

export function toRow(entry: BrokerEntry): Row {
  const d = entry.data;
  return {
    slug: entry.slug,
    name: d.name,
    href: `/brokers/${entry.slug}/`,
    affiliateUrl: d.affiliateUrl,
    rating: d.rating,
    rank: d.rank,
    minDeposit: d.minDeposit.amount,
    minDepositCurrency: d.minDeposit.currency,
    spread: d.spreadEurUsdFrom,
    leverageMax: d.leverageMax,
    commission: d.commissionPerLot
      ? `${d.commissionPerLot.amount} ${d.commissionPerLot.currency}`
      : 'Sin comisión',
    swapFree: d.swapFree,
    withdrawalTime: d.withdrawalTimeTypical,
    platforms: d.platforms,
    brokerType: d.brokerType,
    regulators: d.regulators.map((r) => r.authority),
    regulatorTags: d.regulators.map((r) => `${r.authority} (${r.country})`),
    instruments: INSTRUMENT_KEYS.filter((k) => d.instruments[k]),
  };
}

export function sortRows(rows: Row[], key: SortKey, dir: 'asc' | 'desc'): Row[] {
  const sign = dir === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => (a[key] - b[key]) * sign || a.rank - b.rank);
}

export function filterRows(rows: Row[], filters: Filters): Row[] {
  const name = filters.name?.trim().toLowerCase();
  const p = filters.platform?.toLowerCase();
  const r = filters.regulator?.toLowerCase();
  const instr = (filters.instruments ?? []).map((x) => x.toLowerCase());
  return rows.filter((row) => {
    const okName = !name || row.name.toLowerCase().includes(name);
    const okP = !p || row.platforms.some((x) => x.toLowerCase() === p);
    const okR = !r || row.regulators.some((x) => x.toLowerCase() === r);
    const okInstr =
      instr.length === 0 ||
      instr.every((want) => row.instruments.some((have) => have.toLowerCase() === want));
    return okName && okP && okR && okInstr;
  });
}
