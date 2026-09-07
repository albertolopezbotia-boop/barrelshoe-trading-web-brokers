import type { BrokerEntry } from './brokers';

export type SortKey = 'rank' | 'rating' | 'minDeposit' | 'spread';

export interface Row {
  slug: string;
  name: string;
  logo: string;
  href: string;
  affiliateUrl: string;
  rating: number;
  rank: number;
  minDeposit: number;
  spread: number;
  platforms: string[];
  regulators: string[];
}

export function toRow(entry: BrokerEntry): Row {
  const d = entry.data;
  return {
    slug: entry.slug,
    name: d.name,
    logo: d.logo,
    href: `/brokers/${entry.slug}/`,
    affiliateUrl: d.affiliateUrl,
    rating: d.rating,
    rank: d.rank,
    minDeposit: d.minDeposit.amount,
    spread: d.spreadEurUsdFrom,
    platforms: d.platforms,
    regulators: d.regulators.map((r) => r.authority),
  };
}

export function sortRows(rows: Row[], key: SortKey, dir: 'asc' | 'desc'): Row[] {
  const sign = dir === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => (a[key] - b[key]) * sign || a.rank - b.rank);
}

export function filterRows(
  rows: Row[],
  filters: { platform?: string; regulator?: string },
): Row[] {
  const p = filters.platform?.toLowerCase();
  const r = filters.regulator?.toLowerCase();
  return rows.filter((row) => {
    const okP = !p || row.platforms.some((x) => x.toLowerCase() === p);
    const okR = !r || row.regulators.some((x) => x.toLowerCase() === r);
    return okP && okR;
  });
}
