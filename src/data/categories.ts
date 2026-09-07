import type { BrokerData } from '../lib/broker-schema';

export interface Category {
  slug: 'mt4' | 'mt5' | 'ctrader' | 'copy-trading' | 'oro';
  title: string;
  shortTitle: string;
  intro: string;
  metaDescription: string;
  matches: (b: BrokerData) => boolean;
  faq: Array<{ question: string; answer: string }>;
}

export const CATEGORIES: Category[] = [
  {
    slug: 'mt4',
    title: 'Mejores brokers con MetaTrader 4 (MT4) en 2026',
    shortTitle: 'MT4',
    intro:
      'MetaTrader 4 sigue siendo la plataforma de referencia para el trading de forex y CFDs, sobre todo por su compatibilidad con expert advisors (robots). Estos son los brokers de nuestra comparativa que ofrecen MT4, ordenados por nuestra puntuación global.',
    metaDescription:
      'Comparativa de los mejores brokers con MetaTrader 4 (MT4): spreads, comisiones, regulación y compatibilidad con robots.',
    matches: (b) => b.platforms.includes('MT4'),
    faq: [
      { question: '¿Qué ventajas tiene MT4 frente a MT5?', answer: 'MT4 tiene la mayor biblioteca de robots e indicadores y es más ligera; MT5 añade más marcos temporales, más tipos de órdenes y acceso a acciones.' },
      { question: '¿Puedo usar robots (EAs) en todos estos brokers?', answer: 'Sí, todos los brokers de esta lista permiten expert advisors en MT4. Revisa la ficha de cada uno para ver si hay restricciones de scalping.' },
    ],
  },
  {
    slug: 'mt5',
    title: 'Mejores brokers con MetaTrader 5 (MT5) en 2026',
    shortTitle: 'MT5',
    intro:
      'MetaTrader 5 amplía MT4 con más marcos temporales, profundidad de mercado y acceso a más clases de activos. Estos son los brokers de la comparativa que ofrecen MT5.',
    metaDescription:
      'Los mejores brokers con MetaTrader 5 (MT5): costes, activos disponibles, regulación y tipos de cuenta comparados.',
    matches: (b) => b.platforms.includes('MT5'),
    faq: [
      { question: '¿MT5 es mejor que MT4?', answer: 'Depende: MT5 es superior en marcos temporales, órdenes y activos, pero MT4 mantiene el mayor ecosistema de robots.' },
    ],
  },
  {
    slug: 'ctrader',
    title: 'Mejores brokers con cTrader en 2026',
    shortTitle: 'cTrader',
    intro:
      'cTrader es la alternativa preferida por los traders que buscan ejecución ECN transparente y una interfaz moderna. Estos son los brokers de la comparativa que la ofrecen.',
    metaDescription:
      'Comparativa de brokers con cTrader: ejecución ECN, spreads raw, comisiones y regulación.',
    matches: (b) => b.platforms.includes('cTrader'),
    faq: [
      { question: '¿Por qué elegir cTrader?', answer: 'Por su modelo ECN transparente, la profundidad de mercado completa y un entorno de creación de bots (cBots) en C#.' },
    ],
  },
  {
    slug: 'copy-trading',
    title: 'Mejores brokers para copy trading en 2026',
    shortTitle: 'Copy trading',
    intro:
      'El copy trading permite replicar automáticamente las operaciones de traders con historial verificado. Estos son los brokers de la comparativa con copy trading integrado o mediante plataforma asociada.',
    metaDescription:
      'Los mejores brokers para copy trading: plataformas de copia, comisiones, regulación y mínimos para empezar.',
    matches: (b) => b.copyTrading,
    faq: [
      { question: '¿El copy trading tiene coste extra?', answer: 'Normalmente el bróker no cobra por copiar, pero el trader que copias puede llevarse una comisión de rendimiento. Revisa cada ficha.' },
      { question: '¿Es seguro el copy trading?', answer: 'Reduce el trabajo de análisis pero no el riesgo de mercado: sigues expuesto a pérdidas y al apalancamiento.' },
    ],
  },
  {
    slug: 'oro',
    title: 'Mejores brokers para operar con oro (XAU/USD) en 2026',
    shortTitle: 'Oro',
    intro:
      'El oro es uno de los CFDs más operados por su liquidez y su papel como activo refugio. Comparamos los brokers de la lista que ofrecen oro, mirando spread de XAU/USD, apalancamiento y swaps.',
    metaDescription:
      'Comparativa de brokers para operar oro (XAU/USD): spreads, apalancamiento, swaps y cuentas sin swap.',
    matches: (b) => b.instruments.gold,
    faq: [
      { question: '¿Qué mirar para operar oro?', answer: 'El spread típico de XAU/USD, el apalancamiento máximo en metales y el swap nocturno (o si hay cuenta sin swap).' },
    ],
  },
];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
