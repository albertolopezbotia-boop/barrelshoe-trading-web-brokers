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

const methodologyPage = defineCollection({
  type: 'data',
  schema: z.object({
    leadIntro: z.string().min(1),
    scoringIntro: z.string().min(1),
    scoringOutro: z.string().min(1),
    inclusionIntro: z.string().min(1),
    sourcesIntro: z.string().min(1),
    sourcesOutro: z.string().min(1),
    monetizationIntro: z.string().min(1),
    editorialIndependence: z.string().min(1),
  }),
});

export const collections = { brokers, homePage, methodologyPage };
