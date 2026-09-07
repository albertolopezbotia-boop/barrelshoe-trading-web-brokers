import { defineCollection } from 'astro:content';
import { brokerSchema } from '../lib/broker-schema';

const brokers = defineCollection({ type: 'content', schema: brokerSchema });

export const collections = { brokers };
