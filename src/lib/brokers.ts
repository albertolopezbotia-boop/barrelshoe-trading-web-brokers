import type { BrokerData } from './broker-schema';
import type { Category } from '../data/categories';

export type BrokerEntry = { slug: string; data: BrokerData };

export function sortByRank(brokers: BrokerEntry[]): BrokerEntry[] {
  return [...brokers].sort((a, b) => a.data.rank - b.data.rank);
}

export function sortByRating(brokers: BrokerEntry[]): BrokerEntry[] {
  return [...brokers].sort(
    (a, b) => b.data.rating - a.data.rating || a.data.rank - b.data.rank,
  );
}

export function filterByCategory(brokers: BrokerEntry[], category: Category): BrokerEntry[] {
  return brokers.filter((b) => category.matches(b.data));
}

export function relatedBrokers(brokers: BrokerEntry[], slug: string, count = 3): BrokerEntry[] {
  return sortByRating(brokers.filter((b) => b.slug !== slug)).slice(0, count);
}
