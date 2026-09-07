import { z } from 'astro/zod';

const money = z.object({ amount: z.number().nonnegative(), currency: z.string().min(1) });
const score = z.number().min(0).max(5);

/** Accepts a number in [0, 5] with at most one decimal place (avoids the
 *  IEEE-754 false negatives of `z.number().multipleOf(0.1)`). */
const oneDecimalRating = z
  .number()
  .min(0)
  .max(5)
  .refine((v) => Math.abs(v * 10 - Math.round(v * 10)) < 1e-9, {
    message: 'rating admite como máximo 1 decimal',
  });

export const brokerSchema = z.object({
  name: z.string().min(1),
  logo: z.string().startsWith('/logos/'),
  websiteUrl: z.string().url(),
  founded: z.number().int().min(1970).max(new Date().getFullYear()),
  headquarters: z.string().min(1),
  affiliateUrl: z.string().url(),
  featured: z.boolean().default(false),
  rank: z.number().int().min(1),
  rating: oneDecimalRating,
  ratingBreakdown: z.object({
    fees: score, platforms: score, deposits: score, support: score, regulation: score,
  }),
  regulators: z.array(z.object({
    authority: z.string().min(1),
    country: z.string().min(1),
    licenseNumber: z.string().min(1),
    status: z.enum(['activa', 'limitada', 'retirada']),
  })).min(1),
  minDeposit: money,
  spreadEurUsdFrom: z.number().nonnegative(),
  commissionPerLot: money.nullable(),
  swapFree: z.boolean(),
  accountTypes: z.array(z.object({
    name: z.string().min(1),
    spreadFrom: z.number().nonnegative(),
    commission: z.string().min(1),
    minDeposit: money,
  })).min(1),
  platforms: z.array(z.enum(['MT4', 'MT5', 'cTrader', 'WebTrader', 'propia', 'movil'])).min(1),
  brokerType: z
    .array(z.enum(['Creador de mercado', 'STP', 'ECN', 'NDD', 'DMA']))
    .min(1),
  instruments: z.object({
    forex: z.boolean(), indices: z.boolean(), commodities: z.boolean(), gold: z.boolean(),
    stocks: z.boolean(), crypto: z.boolean(), etfs: z.boolean(),
  }),
  leverageMax: z.string().min(1),
  copyTrading: z.boolean(),
  easAllowed: z.boolean(),
  scalpingAllowed: z.boolean(),
  demoAccount: z.boolean(),
  islamicAccount: z.boolean(),
  paymentMethods: z.array(z.string().min(1)).min(1),
  withdrawalTimeTypical: z.string().min(1),
  withdrawalFees: z.string().min(1),
  ownership: z.string().min(1),
  listedCompany: z.boolean(),
  globalOffices: z.array(z.string().min(1)),
  groupEntities: z.array(z.string().min(1)),
  support: z.object({
    languages: z.array(z.string().min(1)).min(1),
    hours: z.string().min(1),
    channels: z.array(z.string().min(1)).min(1),
  }),
  pros: z.array(z.string().min(1)).min(2),
  cons: z.array(z.string().min(1)).min(2),
  bottomLine: z.string().min(40).max(400),
  lastUpdated: z.coerce.date(),
  faq: z.array(z.object({ question: z.string().min(1), answer: z.string().min(1) })).min(1),
});

export type BrokerData = z.infer<typeof brokerSchema>;
