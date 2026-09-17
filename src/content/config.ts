import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { brokerSchema } from '../lib/broker-schema';

const brokers = defineCollection({ type: 'content', schema: brokerSchema });

const homePage = defineCollection({
  type: 'data',
  schema: z.object({
    heroTitle: z.string().min(1),
    heroLead: z.string().min(1),
    cardMt4: z.string().min(1),
    cardMt5: z.string().min(1),
    cardCtrader: z.string().min(1),
    cardCopyTrading: z.string().min(1),
    cardOro: z.string().min(1),
    cardComparativa: z.string().min(1),
  }),
});

export const collections = { brokers, homePage };
