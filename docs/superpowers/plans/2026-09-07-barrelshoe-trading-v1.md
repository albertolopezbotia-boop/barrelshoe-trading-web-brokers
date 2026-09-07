# Barrelshoe Trading v1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static, SEO-oriented broker comparison site (comparison table, 10 broker reviews, 5 category ranking pages, methodology + legal pages) deployable to Plesk via Git.

**Architecture:** Astro in static (SSG) mode. Broker data lives in per-broker MDX files whose frontmatter is validated by a Zod schema in an Astro content collection — an invalid or incomplete broker fails the build. Pages are assembled from that collection plus two plain TypeScript data modules (`site`, `categories`). No client framework; the only client JS is a small vanilla script for sorting/filtering the comparison table. Pure TypeScript helpers (rating math, broker filtering/sorting, JSON-LD builders) are unit-tested with Vitest; everything else is verified by a successful `astro build` and a manual visual pass.

**Tech Stack:** Astro 5, `@astrojs/mdx`, `@astrojs/sitemap`, TypeScript, Zod (bundled with Astro), Vitest, plain CSS with custom properties. Node 22 LTS.

**Spec:** `docs/superpowers/specs/2026-09-07-barrelshoe-trading-design.md`

## Global Constraints

- **Language:** all UI copy and content in Spanish (es-ES). No i18n routing in v1.
- **Node:** 22 LTS. `.nvmrc` = `22`, `package.json` `engines.node` = `>=20`.
- **Brand:** "Barrelshoe Trading". Domain `barrelshoetrading.com`. Production URL `https://barrelshoetrading.com` (used for canonical, sitemap, OG absolute URLs).
- **No client framework.** No React/Vue/Svelte. Interactivity only via `<script>` tags in `.astro` files.
- **Affiliate links** always render with `rel="sponsored nofollow noopener"` and `target="_blank"`.
- **Styling:** plain CSS only. Design tokens as CSS custom properties in `src/styles/tokens.css`. No Tailwind, no CSS-in-JS, no UI library. Component styles go in `<style>` blocks inside the `.astro` component (scoped by default).
- **Out of scope v1:** blog/news, calculators, i18n, CMS, user accounts, newsletter, own analytics, dark mode. Do not add them.
- **The 10 brokers (slugs):** `infinox`, `hantec-markets`, `fp-trading`, `fp-markets`, `xm`, `vantage`, `pu-prime`, `exness`, `ultima-markets`, `vt-markets`.
- **The 5 categories (slugs):** `mt4`, `mt5`, `ctrader`, `copy-trading`, `oro`.
- **Commits:** conventional-commit prefixes (`feat:`, `test:`, `chore:`, `docs:`, `style:`). Every commit message ends with:
  ```
  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
  ```
- **Branch:** all work on `feat/v1-site`, branched from `main`.

---

## File Structure

```
web-brokers/
  astro.config.mjs           # Astro config: site URL, mdx + sitemap integrations
  package.json               # scripts, deps, engines
  tsconfig.json              # extends astro/tsconfigs/strict
  vitest.config.ts           # Vitest config (node env, src/lib glob)
  .nvmrc                     # "22"
  .gitignore                 # (exists)
  README.md                  # setup, scripts, deploy summary
  DEPLOY.md                  # Plesk + Plan B runbook
  .github/workflows/ci.yml   # astro check + astro build + vitest on push/PR
  .github/workflows/deploy.yml # Plan B: build + publish dist/ to `deploy` branch (manual trigger)

  public/
    robots.txt               # allow all, points to sitemap
    favicon.svg
    fonts/                   # self-hosted woff2 (added in Task 17)
    logos/                   # <slug>.svg broker logos
    og/
      default.png            # 1200x630 fallback OG image

  src/
    content/
      config.ts              # brokers collection + Zod schema
      brokers/
        _example.mdx         # reference template, ignored by Astro (underscore prefix)
        infinox.mdx          # + 9 more, Tasks 18-19
    data/
      site.ts                # SITE constant: brand, urls, disclosure, risk warning, methodology blurb, contact
      categories.ts          # CATEGORIES array: slug, title, intro, filter predicate, faq
    lib/
      rating.ts              # aggregateRating(breakdown) -> number
      rating.test.ts
      brokers.ts             # loadBrokers(), sortBrokers(), filterBrokersByCategory()
      brokers.test.ts
      jsonld.ts              # organizationLd(), reviewLd(), itemListLd(), faqPageLd(), breadcrumbListLd()
      jsonld.test.ts
      table.ts               # sortRows(), filterRows() — pure logic behind ComparisonTable client script
      table.test.ts
      format.ts              # money(), pips(), yesNo() display helpers
      format.test.ts
    layouts/
      Layout.astro           # <html> shell, <head> via Seo, header + footer, <slot/>
    components/
      Seo.astro
      Header.astro
      Footer.astro
      Breadcrumbs.astro
      Disclosure.astro
      RatingStars.astro
      ProsCons.astro
      AffiliateButton.astro
      FactSheet.astro
      RegulationTable.astro
      CompanyProfile.astro
      Faq.astro
      ComparisonTable.astro  # + inline <script> using lib/table.ts compiled logic
      BrokerCard.astro
      CategoryRanking.astro
    pages/
      index.astro
      metodologia.astro
      aviso-legal.astro
      privacidad.astro
      sobre-nosotros.astro
      404.astro
      brokers/[slug].astro
      mejores-brokers/[categoria].astro
    styles/
      tokens.css             # :root custom properties
      global.css             # reset + base element styles, imports tokens.css

  docs/superpowers/{specs,plans}/
```

**Responsibility boundaries:**
- `src/lib/*` — pure, framework-free, unit-tested. No Astro imports.
- `src/data/*` — static config as typed constants. `categories.ts` filter predicates take a `BrokerData` and return boolean.
- `src/content/config.ts` — the single source of truth for the broker shape. `BrokerData` type is inferred from the Zod schema and re-exported.
- `src/components/*` — presentational. Receive typed props, emit HTML + scoped CSS. Only `ComparisonTable` ships client JS.
- `src/pages/*` — data loading (`getCollection`, `getStaticPaths`) + composition only. No business logic; delegate to `src/lib`.

---

## Task 1: Scaffold Astro project and tooling

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `.nvmrc`, `src/pages/index.astro`, `src/env.d.ts`
- Test: `src/lib/format.test.ts` (smoke test to prove Vitest runs)
- Create: `src/lib/format.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - npm scripts: `dev`, `build`, `preview`, `check` (`astro check`), `test` (`vitest run`), `test:watch`.
  - `src/lib/format.ts` exports:
    - `money(value: { amount: number; currency: string }): string` — e.g. `{amount:100,currency:"USD"}` → `"100 USD"`.
    - `pips(value: number): string` — e.g. `0.6` → `"0,6 pips"` (comma decimal, es-ES).
    - `yesNo(value: boolean): string` — `true` → `"Sí"`, `false` → `"No"`.

- [ ] **Step 1: Create `.nvmrc`**

```
22
```

- [ ] **Step 2: Create `package.json`**

```json
{
  "name": "barrelshoe-trading-web-brokers",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "engines": { "node": ">=20" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 3: Install dependencies**

Run:
```bash
npm install astro@^5 @astrojs/mdx @astrojs/sitemap
npm install -D vitest @astrojs/check typescript
```
Expected: installs succeed, `package-lock.json` created.

- [ ] **Step 4: Create `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://barrelshoetrading.com',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap()],
});
```

- [ ] **Step 5: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 6: Create `src/env.d.ts`**

```ts
/// <reference path="../.astro/types.d.ts" />
```

- [ ] **Step 7: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/lib/**/*.test.ts'],
  },
});
```

- [ ] **Step 8: Create `src/pages/index.astro` (temporary placeholder)**

```astro
---
---
<html lang="es">
  <head><meta charset="utf-8" /><title>Barrelshoe Trading</title></head>
  <body><h1>Barrelshoe Trading</h1></body>
</html>
```

- [ ] **Step 9: Write the failing test `src/lib/format.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { money, pips, yesNo } from './format';

describe('format', () => {
  it('money formats amount and currency', () => {
    expect(money({ amount: 100, currency: 'USD' })).toBe('100 USD');
  });
  it('pips uses es-ES comma decimal and unit', () => {
    expect(pips(0.6)).toBe('0,6 pips');
  });
  it('yesNo maps booleans to Spanish', () => {
    expect(yesNo(true)).toBe('Sí');
    expect(yesNo(false)).toBe('No');
  });
});
```

- [ ] **Step 10: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `./format`.

- [ ] **Step 11: Create `src/lib/format.ts`**

```ts
export function money(value: { amount: number; currency: string }): string {
  return `${new Intl.NumberFormat('es-ES').format(value.amount)} ${value.currency}`;
}

export function pips(value: number): string {
  return `${new Intl.NumberFormat('es-ES').format(value)} pips`;
}

export function yesNo(value: boolean): string {
  return value ? 'Sí' : 'No';
}
```

- [ ] **Step 12: Run test to verify it passes**

Run: `npm test`
Expected: PASS (3 tests).

- [ ] **Step 13: Verify build and dev**

Run: `npm run build`
Expected: builds to `dist/`, no errors.
Run: `npm run check`
Expected: 0 errors.

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro project with mdx, sitemap, vitest"
```

---

## Task 2: CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: npm scripts `check`, `test`, `build` from Task 1.
- Produces: a CI check that runs on push to any branch and on PRs to `main`.

- [ ] **Step 1: Create `.github/workflows/ci.yml`**

```yaml
name: CI
on:
  push:
    branches: ['**']
  pull_request:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run check
      - run: npm test
      - run: npm run build
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "chore: add CI workflow (check, test, build)"
```

---

## Task 3: Design tokens, global CSS, base Layout

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`, `src/layouts/Layout.astro`
- Modify: `src/pages/index.astro` (use the layout)

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `Layout.astro` props: `{ title: string; description: string; canonicalPath: string; ogImage?: string; noindex?: boolean }`.
  - `Layout.astro` renders `<html lang="es">`, `<head>` (delegated to `Seo.astro` in Task 8 — for now inline the tags), a `<slot name="header" />`-free fixed `<Header />` placeholder + `<Footer />` placeholder, and `<main><slot /></main>`.
  - CSS custom properties available globally (see token list below).

- [ ] **Step 1: Create `src/styles/tokens.css`**

```css
:root {
  /* color */
  --color-bg: #ffffff;
  --color-surface: #f6f8fa;
  --color-border: #d8dee4;
  --color-text: #1b1f24;
  --color-text-muted: #57606a;
  --color-primary: #0b5cff;
  --color-primary-dark: #0842b8;
  --color-accent: #12805c;
  --color-warning-bg: #fff6e5;
  --color-warning-border: #e0a44a;
  --color-star: #f5a623;

  /* typography */
  --font-sans: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-size-xs: 0.78rem;
  --font-size-sm: 0.88rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.15rem;
  --font-size-xl: 1.5rem;
  --font-size-2xl: 2rem;
  --font-size-3xl: 2.6rem;
  --line-tight: 1.25;
  --line-base: 1.6;

  /* spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;

  /* layout */
  --container-max: 1080px;
  --container-narrow: 720px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 14px;
  --shadow-card: 0 1px 3px rgba(27, 31, 36, 0.08), 0 4px 12px rgba(27, 31, 36, 0.06);
}
```

- [ ] **Step 2: Create `src/styles/global.css`**

```css
@import "./tokens.css";

*, *::before, *::after { box-sizing: border-box; }
* { margin: 0; }
html { -webkit-text-size-adjust: 100%; }
body {
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  line-height: var(--line-base);
  color: var(--color-text);
  background: var(--color-bg);
}
h1, h2, h3, h4 { line-height: var(--line-tight); font-weight: 700; }
h1 { font-size: var(--font-size-3xl); }
h2 { font-size: var(--font-size-2xl); }
h3 { font-size: var(--font-size-xl); }
a { color: var(--color-primary); text-decoration: none; }
a:hover { text-decoration: underline; }
img { max-width: 100%; height: auto; display: block; }
table { border-collapse: collapse; width: 100%; }

.container { max-width: var(--container-max); margin-inline: auto; padding-inline: var(--space-4); }
.container-narrow { max-width: var(--container-narrow); margin-inline: auto; padding-inline: var(--space-4); }
.visually-hidden {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
```

- [ ] **Step 3: Create `src/layouts/Layout.astro`**

```astro
---
import "../styles/global.css";

interface Props {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage?: string;
  noindex?: boolean;
}

const { title, description, canonicalPath, ogImage = "/og/default.png", noindex = false } = Astro.props;
const canonical = new URL(canonicalPath, Astro.site).href;
const ogImageAbs = new URL(ogImage, Astro.site).href;
---
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    {noindex && <meta name="robots" content="noindex, nofollow" />}
    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={ogImageAbs} />
    <meta property="og:locale" content="es_ES" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  </head>
  <body>
    <a class="visually-hidden" href="#contenido">Saltar al contenido</a>
    <header class="site-header container"><a href="/">Barrelshoe Trading</a></header>
    <main id="contenido"><slot /></main>
    <footer class="site-footer container"><p>© {new Date().getFullYear()} Barrelshoe Trading</p></footer>
    <style>
      .site-header, .site-footer { padding-block: var(--space-4); }
      .site-header { border-bottom: 1px solid var(--color-border); font-weight: 700; }
      .site-footer { border-top: 1px solid var(--color-border); color: var(--color-text-muted); margin-top: var(--space-16); font-size: var(--font-size-sm); }
    </style>
  </body>
</html>
```

- [ ] **Step 4: Rewrite `src/pages/index.astro` to use the layout**

```astro
---
import Layout from "../layouts/Layout.astro";
---
<Layout title="Barrelshoe Trading — Comparador de brokers" description="Comparativa y análisis de brokers para traders de España y Latinoamérica." canonicalPath="/">
  <div class="container">
    <h1>Barrelshoe Trading</h1>
    <p>Comparador de brokers. Sitio en construcción.</p>
  </div>
</Layout>
```

- [ ] **Step 5: Verify build**

Run: `npm run build && npm run check`
Expected: build succeeds, 0 check errors. Open `dist/index.html` and confirm `<link rel="canonical" href="https://barrelshoetrading.com/">` and the OG tags are present.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add design tokens, global styles, base layout"
```

---

## Task 4: Broker content collection schema

**Files:**
- Create: `src/content/config.ts`, `src/content/brokers/_example.mdx`
- Test: `src/lib/schema.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - Astro content collection `brokers`.
  - Exported `brokerSchema` (Zod object) and `export type BrokerData = z.infer<typeof brokerSchema>` from `src/content/config.ts`.
  - Field shape (exact — later tasks depend on these names):

```ts
{
  name: string;
  logo: string;              // "/logos/<slug>.svg"
  websiteUrl: string;        // url
  founded: number;           // year, int, 1970..currentYear
  headquarters: string;
  affiliateUrl: string;      // url
  featured: boolean;         // default false
  rank: number;              // int >= 1, unique across brokers (enforced in Task 5 loader test)
  rating: number;            // 0..5, multipleOf 0.1
  ratingBreakdown: {
    fees: number; platforms: number; deposits: number; support: number; regulation: number; // each 0..5
  };
  regulators: Array<{
    authority: string;       // e.g. "CNMV", "FCA", "ASIC", "CySEC"
    country: string;         // e.g. "España"
    licenseNumber: string;
    status: 'activa' | 'limitada' | 'retirada';
  }>;                        // min 1
  minDeposit: { amount: number; currency: string };
  spreadEurUsdFrom: number;  // pips, >= 0
  commissionPerLot: { amount: number; currency: string } | null;
  swapFree: boolean;
  accountTypes: Array<{
    name: string;
    spreadFrom: number;      // pips
    commission: string;      // free text, e.g. "Sin comisión" or "3,5 USD por lote"
    minDeposit: { amount: number; currency: string };
  }>;                        // min 1
  platforms: Array<'MT4' | 'MT5' | 'cTrader' | 'WebTrader' | 'propia' | 'movil'>; // min 1
  instruments: {
    forex: boolean; indices: boolean; commodities: boolean; gold: boolean;
    stocks: boolean; crypto: boolean; etfs: boolean;
  };
  leverageMax: string;       // e.g. "1:500"
  copyTrading: boolean;
  easAllowed: boolean;
  scalpingAllowed: boolean;
  demoAccount: boolean;
  islamicAccount: boolean;
  paymentMethods: string[];  // min 1
  withdrawalTimeTypical: string;
  withdrawalFees: string;
  ownership: string;
  listedCompany: boolean;
  globalOffices: string[];
  groupEntities: string[];
  support: { languages: string[]; hours: string; channels: string[] };
  pros: string[];            // min 2
  cons: string[];            // min 2
  bottomLine: string;        // 40..400 chars
  lastUpdated: string;       // date (coerced)
  faq: Array<{ question: string; answer: string }>; // min 1
}
```

- [ ] **Step 1: Create `src/content/config.ts`**

```ts
import { defineCollection, z } from 'astro:content';

const money = z.object({ amount: z.number().nonnegative(), currency: z.string().min(1) });
const score = z.number().min(0).max(5);

export const brokerSchema = z.object({
  name: z.string().min(1),
  logo: z.string().startsWith('/logos/'),
  websiteUrl: z.string().url(),
  founded: z.number().int().min(1970).max(new Date().getFullYear()),
  headquarters: z.string().min(1),
  affiliateUrl: z.string().url(),
  featured: z.boolean().default(false),
  rank: z.number().int().min(1),
  rating: z.number().min(0).max(5).multipleOf(0.1),
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

const brokers = defineCollection({ type: 'content', schema: brokerSchema });

export const collections = { brokers };
```

- [ ] **Step 2: Create `src/content/brokers/_example.mdx` (reference template, ignored by Astro)**

```mdx
---
name: "Bróker de Ejemplo"
logo: "/logos/_example.svg"
websiteUrl: "https://example.com"
founded: 2010
headquarters: "Londres, Reino Unido"
affiliateUrl: "https://example.com/partners"
featured: false
rank: 99
rating: 4.2
ratingBreakdown: { fees: 4.0, platforms: 4.5, deposits: 4.0, support: 4.0, regulation: 4.5 }
regulators:
  - { authority: "FCA", country: "Reino Unido", licenseNumber: "123456", status: "activa" }
minDeposit: { amount: 100, currency: "USD" }
spreadEurUsdFrom: 0.6
commissionPerLot: null
swapFree: true
accountTypes:
  - { name: "Standard", spreadFrom: 1.0, commission: "Sin comisión", minDeposit: { amount: 100, currency: "USD" } }
  - { name: "Raw", spreadFrom: 0.0, commission: "3,5 USD por lote", minDeposit: { amount: 500, currency: "USD" } }
platforms: ["MT4", "MT5", "movil"]
instruments: { forex: true, indices: true, commodities: true, gold: true, stocks: false, crypto: false, etfs: false }
leverageMax: "1:500"
copyTrading: true
easAllowed: true
scalpingAllowed: true
demoAccount: true
islamicAccount: true
paymentMethods: ["Transferencia bancaria", "Tarjeta", "Skrill", "Neteller"]
withdrawalTimeTypical: "1-2 días hábiles"
withdrawalFees: "Sin comisión (el banco puede aplicar cargos)"
ownership: "Example Group Ltd"
listedCompany: false
globalOffices: ["Reino Unido", "Chipre", "Australia"]
groupEntities: ["Example UK Ltd", "Example Global Ltd"]
support: { languages: ["Español", "Inglés"], hours: "24/5", channels: ["Chat en vivo", "Email", "Teléfono"] }
pros:
  - "Spreads bajos en la cuenta Raw"
  - "Regulación de primer nivel (FCA)"
cons:
  - "Sin acciones ni ETunciones"
  - "Depósito mínimo alto en la cuenta Raw"
bottomLine: "Un bróker sólido y bien regulado, con costes competitivos para quien opera forex e índices; menos indicado si buscas acciones."
lastUpdated: 2026-09-07
faq:
  - { question: "¿Está regulado?", answer: "Sí, por la FCA del Reino Unido." }
---

## Visión general

Texto de ejemplo.
```

- [ ] **Step 3: Write the failing test `src/lib/schema.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { brokerSchema } from '../content/config';

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
```

- [ ] **Step 4: Run test to verify it fails, then passes**

Run: `npm test`
Expected: initially FAIL if `astro:content` cannot resolve in Vitest. If so, add to `vitest.config.ts` under `test`:
```ts
    server: { deps: { inline: ['astro:content'] } },
```
and add `resolve.alias` mapping is not needed — instead import the schema without the collection. If `astro:content` still fails to resolve in the Vitest environment, split the schema: move the pure Zod object to `src/lib/broker-schema.ts` (no `astro:content` import), and have `src/content/config.ts` import `brokerSchema` from there. Update the test import to `../lib/broker-schema`. Re-run.
Expected after fix: PASS (5 tests).

- [ ] **Step 5: Run `astro sync` and build**

Run: `npx astro sync && npm run build`
Expected: build succeeds; `_example.mdx` is ignored (underscore prefix), so zero broker entries is fine at this point.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add broker content collection with validated schema"
```

---

## Task 5: Site and categories data modules

**Files:**
- Create: `src/data/site.ts`, `src/data/categories.ts`
- Test: `src/lib/categories.test.ts`

**Interfaces:**
- Consumes: `BrokerData` from `src/content/config.ts` (or `src/lib/broker-schema.ts` if it was split in Task 4 — use the same source).
- Produces:
  - `SITE` constant:

```ts
export const SITE = {
  name: 'Barrelshoe Trading',
  url: 'https://barrelshoetrading.com',
  tagline: 'Comparador de brokers para traders de España y Latinoamérica',
  description: 'Analizamos y comparamos brokers de forex y CFDs con una metodología transparente. Spreads, regulación, plataformas y retiros de un vistazo.',
  email: 'info@barrelshoetrading.com',
  affiliateDisclosure:
    'Barrelshoe Trading puede recibir una comisión de los brokers que aparecen en esta web cuando abres una cuenta a través de nuestros enlaces. Esto no supone ningún coste adicional para ti y no influye en nuestras valoraciones, que se basan en la metodología publicada.',
  riskWarning:
    'Los CFDs son instrumentos complejos y conllevan un alto riesgo de perder dinero rápidamente debido al apalancamiento. Entre el 74 % y el 89 % de las cuentas de inversores minoristas pierden dinero al operar con CFDs. Considera si entiendes cómo funcionan los CFDs y si puedes permitirte el alto riesgo de perder tu dinero.',
  methodologyBlurb:
    'Puntuamos cada bróker de 0 a 5 en cinco áreas —costes, plataformas, depósitos y retiros, atención al cliente y regulación— y calculamos una nota global ponderada. Solo incluimos brokers con regulación verificable.',
  social: { twitter: '', youtube: '' },
} as const;
```

  - `CATEGORIES` array where each item is:

```ts
interface Category {
  slug: 'mt4' | 'mt5' | 'ctrader' | 'copy-trading' | 'oro';
  title: string;           // H1, e.g. "Mejores brokers con MetaTrader 4 (MT4)"
  shortTitle: string;      // nav / card, e.g. "MT4"
  intro: string;           // 1-2 paragraphs, plain text
  metaDescription: string;
  matches: (b: BrokerData) => boolean;
  faq: Array<{ question: string; answer: string }>;
}
export const CATEGORIES: Category[];
export function getCategory(slug: string): Category | undefined;
```

- [ ] **Step 1: Create `src/data/site.ts`** with the `SITE` constant exactly as in Interfaces above.

- [ ] **Step 2: Create `src/data/categories.ts`**

```ts
import type { BrokerData } from '../content/config';

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
```

- [ ] **Step 3: Write the failing test `src/lib/categories.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { CATEGORIES, getCategory } from '../data/categories';
import type { BrokerData } from '../content/config';

const base = { platforms: [], copyTrading: false, instruments: { gold: false } } as unknown as BrokerData;

describe('categories', () => {
  it('has exactly the 5 v1 category slugs', () => {
    expect(CATEGORIES.map((c) => c.slug).sort()).toEqual(
      ['copy-trading', 'ctrader', 'mt4', 'mt5', 'oro'],
    );
  });
  it('mt4 category matches a broker offering MT4', () => {
    const b = { ...base, platforms: ['MT4'] } as unknown as BrokerData;
    expect(getCategory('mt4')!.matches(b)).toBe(true);
  });
  it('oro category matches only brokers with gold', () => {
    expect(getCategory('oro')!.matches({ ...base, instruments: { gold: true } } as unknown as BrokerData)).toBe(true);
    expect(getCategory('oro')!.matches(base)).toBe(false);
  });
  it('getCategory returns undefined for unknown slug', () => {
    expect(getCategory('forex')).toBeUndefined();
  });
});
```

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add site config and category data modules"
```

---

## Task 6: rating and brokers helper libs (TDD)

**Files:**
- Create: `src/lib/rating.ts`, `src/lib/rating.test.ts`, `src/lib/brokers.ts`, `src/lib/brokers.test.ts`

**Interfaces:**
- Consumes: `BrokerData` type; `CATEGORIES`/`Category` from `src/data/categories.ts`.
- Produces:
  - `src/lib/rating.ts`:
    - `WEIGHTS: Record<'fees'|'platforms'|'deposits'|'support'|'regulation', number>` — `{ fees: 0.3, platforms: 0.2, deposits: 0.15, support: 0.1, regulation: 0.25 }` (sums to 1).
    - `aggregateRating(breakdown: BrokerData['ratingBreakdown']): number` — weighted sum, rounded to 1 decimal.
  - `src/lib/brokers.ts`:
    - `type BrokerEntry = { slug: string; data: BrokerData }`
    - `sortByRank(brokers: BrokerEntry[]): BrokerEntry[]` — ascending `data.rank`, stable, returns a new array.
    - `sortByRating(brokers: BrokerEntry[]): BrokerEntry[]` — descending `data.rating`, tie-break ascending `rank`.
    - `filterByCategory(brokers: BrokerEntry[], category: Category): BrokerEntry[]` — keeps entries where `category.matches(data)` is true, preserving input order.
    - `relatedBrokers(brokers: BrokerEntry[], slug: string, count = 3): BrokerEntry[]` — the `count` highest-rated entries excluding `slug`.

- [ ] **Step 1: Write `src/lib/rating.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { aggregateRating, WEIGHTS } from './rating';

describe('aggregateRating', () => {
  it('weights sum to 1', () => {
    expect(Object.values(WEIGHTS).reduce((a, b) => a + b, 0)).toBeCloseTo(1);
  });
  it('all-5 breakdown yields 5.0', () => {
    expect(aggregateRating({ fees: 5, platforms: 5, deposits: 5, support: 5, regulation: 5 })).toBe(5);
  });
  it('computes a weighted average rounded to 1 decimal', () => {
    // 4*0.3 + 3*0.2 + 5*0.15 + 2*0.1 + 4.5*0.25 = 1.2+0.6+0.75+0.2+1.125 = 3.875 -> 3.9
    expect(aggregateRating({ fees: 4, platforms: 3, deposits: 5, support: 2, regulation: 4.5 })).toBe(3.9);
  });
});
```

- [ ] **Step 2: Run to verify fail**

Run: `npm test -- rating`
Expected: FAIL — cannot resolve `./rating`.

- [ ] **Step 3: Write `src/lib/rating.ts`**

```ts
import type { BrokerData } from '../content/config';

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
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- rating`
Expected: PASS (3 tests).

- [ ] **Step 5: Write `src/lib/brokers.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { sortByRank, sortByRating, filterByCategory, relatedBrokers, type BrokerEntry } from './brokers';
import type { Category } from '../data/categories';

const mk = (slug: string, rank: number, rating: number, extra: Partial<any> = {}): BrokerEntry =>
  ({ slug, data: { rank, rating, platforms: [], copyTrading: false, instruments: { gold: false }, ...extra } } as unknown as BrokerEntry);

describe('brokers helpers', () => {
  const list = [mk('c', 3, 4.1), mk('a', 1, 3.9), mk('b', 2, 4.5)];

  it('sortByRank orders ascending by rank without mutating input', () => {
    const out = sortByRank(list);
    expect(out.map((b) => b.slug)).toEqual(['a', 'b', 'c']);
    expect(list[0].slug).toBe('c');
  });
  it('sortByRating orders descending by rating, tie-break by rank', () => {
    const tie = [mk('x', 5, 4.0), mk('y', 2, 4.0), mk('z', 1, 4.8)];
    expect(sortByRating(tie).map((b) => b.slug)).toEqual(['z', 'y', 'x']);
  });
  it('filterByCategory keeps only matching brokers in input order', () => {
    const cat = { matches: (d: any) => d.platforms.includes('MT4') } as Category;
    const withPlat = [mk('c', 3, 4.1, { platforms: ['MT4'] }), mk('a', 1, 3.9, { platforms: [] }), mk('b', 2, 4.5, { platforms: ['MT4'] })];
    expect(filterByCategory(withPlat, cat).map((b) => b.slug)).toEqual(['c', 'b']);
  });
  it('relatedBrokers returns top-rated excluding the given slug', () => {
    expect(relatedBrokers(list, 'b', 2).map((b) => b.slug)).toEqual(['c', 'a']);
  });
});
```

- [ ] **Step 6: Run to verify fail, then write `src/lib/brokers.ts`**

```ts
import type { BrokerData } from '../content/config';
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
```

- [ ] **Step 7: Run all tests**

Run: `npm test`
Expected: PASS (all suites).

- [ ] **Step 8: Commit**

```bash
git add src/lib/rating.ts src/lib/rating.test.ts src/lib/brokers.ts src/lib/brokers.test.ts
git commit -m "feat: add rating aggregation and broker sort/filter helpers"
```

---

## Task 7: JSON-LD builders (TDD)

**Files:**
- Create: `src/lib/jsonld.ts`, `src/lib/jsonld.test.ts`

**Interfaces:**
- Consumes: `BrokerData`, `SITE`.
- Produces (each returns a plain JSON-serializable object):
  - `organizationLd(): object` — `@type: Organization`, name/url from `SITE`.
  - `websiteLd(): object` — `@type: WebSite`.
  - `reviewLd(input: { broker: BrokerData; slug: string }): object` — `@type: Review`, `itemReviewed: { @type: "FinancialService", name }`, `reviewRating: { @type: Rating, ratingValue: broker.rating, bestRating: 5 }`, `author: { @type: Organization, name: SITE.name }`, `url`.
  - `itemListLd(input: { items: Array<{ name: string; url: string }> }): object` — `@type: ItemList` with `itemListElement` as `ListItem` entries, `position` starting at 1.
  - `faqPageLd(faq: Array<{ question: string; answer: string }>): object` — `@type: FAQPage`.
  - `breadcrumbListLd(crumbs: Array<{ name: string; path: string }>): object` — `@type: BreadcrumbList`, absolute URLs from `SITE.url`.

- [ ] **Step 1: Write `src/lib/jsonld.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { organizationLd, reviewLd, itemListLd, faqPageLd, breadcrumbListLd } from './jsonld';

describe('jsonld', () => {
  it('organizationLd has correct type and url', () => {
    const ld = organizationLd() as any;
    expect(ld['@type']).toBe('Organization');
    expect(ld.url).toBe('https://barrelshoetrading.com');
  });
  it('reviewLd carries the rating and reviewed item', () => {
    const ld = reviewLd({ broker: { name: 'XM', rating: 4.3 } as any, slug: 'xm' }) as any;
    expect(ld['@type']).toBe('Review');
    expect(ld.reviewRating.ratingValue).toBe(4.3);
    expect(ld.itemReviewed.name).toBe('XM');
    expect(ld.url).toBe('https://barrelshoetrading.com/brokers/xm/');
  });
  it('itemListLd numbers positions from 1', () => {
    const ld = itemListLd({ items: [{ name: 'A', url: 'u1' }, { name: 'B', url: 'u2' }] }) as any;
    expect(ld.itemListElement[0].position).toBe(1);
    expect(ld.itemListElement[1].position).toBe(2);
  });
  it('faqPageLd maps questions to Question/Answer', () => {
    const ld = faqPageLd([{ question: 'q', answer: 'a' }]) as any;
    expect(ld['@type']).toBe('FAQPage');
    expect(ld.mainEntity[0].acceptedAnswer.text).toBe('a');
  });
  it('breadcrumbListLd builds absolute urls', () => {
    const ld = breadcrumbListLd([{ name: 'Inicio', path: '/' }, { name: 'Brokers', path: '/brokers/xm/' }]) as any;
    expect(ld.itemListElement[1].item).toBe('https://barrelshoetrading.com/brokers/xm/');
  });
});
```

- [ ] **Step 2: Run to verify fail.**

Run: `npm test -- jsonld`
Expected: FAIL — cannot resolve `./jsonld`.

- [ ] **Step 3: Write `src/lib/jsonld.ts`**

```ts
import type { BrokerData } from '../content/config';
import { SITE } from '../data/site';

const abs = (path: string) => new URL(path, SITE.url).href;

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
  };
}

export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
  };
}

export function reviewLd(input: { broker: Pick<BrokerData, 'name' | 'rating'>; slug: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: { '@type': 'FinancialService', name: input.broker.name },
    reviewRating: { '@type': 'Rating', ratingValue: input.broker.rating, bestRating: 5, worstRating: 0 },
    author: { '@type': 'Organization', name: SITE.name },
    url: abs(`/brokers/${input.slug}/`),
  };
}

export function itemListLd(input: { items: Array<{ name: string; url: string }> }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: input.items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      url: it.url,
    })),
  };
}

export function faqPageLd(faq: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function breadcrumbListLd(crumbs: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: abs(c.path),
    })),
  };
}
```

- [ ] **Step 4: Run to verify pass.**

Run: `npm test -- jsonld`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/jsonld.ts src/lib/jsonld.test.ts
git commit -m "feat: add JSON-LD structured-data builders"
```

---

## Task 8: Seo component

**Files:**
- Create: `src/components/Seo.astro`
- Modify: `src/layouts/Layout.astro` (replace inline head tags with `<Seo />`, add optional `jsonLd` prop passthrough)

**Interfaces:**
- Consumes: nothing from lib (takes serializable props).
- Produces:
  - `Seo.astro` props: `{ title: string; description: string; canonical: string; ogImage: string; noindex?: boolean; jsonLd?: object[] }`.
  - Renders: `<title>`, description, canonical, robots (when noindex), OG + Twitter tags, and one `<script type="application/ld+json">` per `jsonLd` entry.
  - `Layout.astro` gains prop `jsonLd?: object[]`, forwarded to `Seo`.

- [ ] **Step 1: Create `src/components/Seo.astro`**

```astro
---
interface Props {
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  noindex?: boolean;
  jsonLd?: object[];
}
const { title, description, canonical, ogImage, noindex = false, jsonLd = [] } = Astro.props;
---
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical} />
{noindex && <meta name="robots" content="noindex, nofollow" />}
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Barrelshoe Trading" />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonical} />
<meta property="og:image" content={ogImage} />
<meta property="og:locale" content="es_ES" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={ogImage} />
{jsonLd.map((obj) => (
  <script type="application/ld+json" set:html={JSON.stringify(obj)} />
))}
```

- [ ] **Step 2: Update `src/layouts/Layout.astro`**

Replace the `<head>` inner tags (everything after `<meta name="viewport">` and before `</head>`) with:

```astro
    <Seo
      title={title}
      description={description}
      canonical={canonical}
      ogImage={ogImageAbs}
      noindex={noindex}
      jsonLd={jsonLd}
    />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
```

Add to the frontmatter: `import Seo from "../components/Seo.astro";` and extend `Props` with `jsonLd?: object[];`, destructured with default `[]`.

- [ ] **Step 3: Verify build**

Run: `npm run build && npm run check`
Expected: build succeeds. Grep `dist/index.html` for `application/ld+json` — none yet on the placeholder home (no jsonLd passed), that's fine. Confirm `<title>` and canonical still present.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: extract Seo component with JSON-LD support"
```

---

## Task 9: Header, Footer, Breadcrumbs, Disclosure

**Files:**
- Create: `src/components/Header.astro`, `src/components/Footer.astro`, `src/components/Breadcrumbs.astro`, `src/components/Disclosure.astro`
- Modify: `src/layouts/Layout.astro` (use `Header`/`Footer`)

**Interfaces:**
- Consumes: `SITE`, `CATEGORIES` (for nav).
- Produces:
  - `Header.astro`: no props. Renders brand link + nav (`Comparativa` → `/`, dropdown/inline links to each `/mejores-brokers/<slug>/` using `shortTitle`, `Metodología` → `/metodologia/`).
  - `Footer.astro`: no props. Renders brand, short affiliate disclosure line, links to `/aviso-legal/`, `/privacidad/`, `/sobre-nosotros/`, `/metodologia/`, and the `SITE.riskWarning` text in a `<small>`.
  - `Breadcrumbs.astro` props: `{ crumbs: Array<{ name: string; path: string }> }`. Renders `<nav aria-label="Ruta de navegación">` with an ordered list; last item is `aria-current="page"` and not linked.
  - `Disclosure.astro` props: `{ variant?: 'banner' | 'inline' }` (default `banner`). Renders `SITE.affiliateDisclosure`.

- [ ] **Step 1: Create the four components** per the interface contract above. Use scoped `<style>` blocks and design tokens. `Header` nav collapses to a horizontally scrollable row under 640px (no JS menu). Example `Disclosure.astro`:

```astro
---
import { SITE } from '../data/site';
interface Props { variant?: 'banner' | 'inline'; }
const { variant = 'banner' } = Astro.props;
---
<p class:list={['disclosure', variant]}>{SITE.affiliateDisclosure}</p>
<style>
  .disclosure { color: var(--color-text-muted); font-size: var(--font-size-sm); }
  .disclosure.banner {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-3) var(--space-4);
  }
</style>
```

- [ ] **Step 2: Update `Layout.astro`** to import and render `<Header />` and `<Footer />` in place of the placeholder markup.

- [ ] **Step 3: Verify build**

Run: `npm run build && npm run check`
Expected: succeeds. Open `dist/index.html`, confirm nav links to all 5 category slugs and footer contains the risk warning.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add header, footer, breadcrumbs, disclosure components"
```

---

## Task 10: Broker presentational components

**Files:**
- Create: `src/components/RatingStars.astro`, `src/components/ProsCons.astro`, `src/components/AffiliateButton.astro`, `src/components/FactSheet.astro`, `src/components/RegulationTable.astro`, `src/components/CompanyProfile.astro`, `src/components/Faq.astro`
- Test: `src/lib/format.test.ts` (extend with a `stars()` helper if used — see Step 1)

**Interfaces:**
- Consumes: `BrokerData`, `format.ts` helpers.
- Produces:
  - `RatingStars.astro` props: `{ value: number; showNumber?: boolean }`. Renders 5 star glyphs with the filled fraction represented via a clipped overlay (CSS width %), `role="img"` + `aria-label="{value} sobre 5"`.
  - `ProsCons.astro` props: `{ pros: string[]; cons: string[] }`. Two lists side by side (stack on mobile).
  - `AffiliateButton.astro` props: `{ href: string; broker: string; label?: string }`. Renders `<a class="aff-btn" href={href} target="_blank" rel="sponsored nofollow noopener">{label ?? \`Abrir cuenta en \${broker}\`}</a>`.
  - `FactSheet.astro` props: `{ broker: BrokerData }`. A definition list of key facts: depósito mínimo (`money`), spread EUR/USD desde (`pips`), plataformas (join `, `), reguladores (authorities join `, `), apalancamiento máx, cuenta demo (`yesNo`).
  - `RegulationTable.astro` props: `{ regulators: BrokerData['regulators'] }`. Table: Autoridad | País | Nº de licencia | Estado.
  - `CompanyProfile.astro` props: `{ broker: BrokerData }`. Renders `ownership`, `listedCompany` (`yesNo` → "Cotiza en bolsa"), `founded`, `headquarters`, `globalOffices` (join), `groupEntities` (list).
  - `Faq.astro` props: `{ items: Array<{ question: string; answer: string }>; heading?: string }`. Renders `<section>` with `<h2>{heading ?? 'Preguntas frecuentes'}</h2>` and `<details>` per item. (JSON-LD is emitted by the page via `faqPageLd`, not here.)

- [ ] **Step 1: Create all seven components** per the contracts. Keep each under ~60 lines. `AffiliateButton.astro` exact body:

```astro
---
interface Props { href: string; broker: string; label?: string; }
const { href, broker, label } = Astro.props;
---
<a class="aff-btn" href={href} target="_blank" rel="sponsored nofollow noopener">
  {label ?? `Abrir cuenta en ${broker}`}
</a>
<style>
  .aff-btn {
    display: inline-block;
    background: var(--color-primary);
    color: #fff;
    font-weight: 700;
    padding: var(--space-3) var(--space-6);
    border-radius: var(--radius-md);
    text-align: center;
  }
  .aff-btn:hover { background: var(--color-primary-dark); text-decoration: none; }
</style>
```

- [ ] **Step 2: Create `src/pages/_dev-components.astro`** (temporary visual harness, underscore-prefixed so it is not routed):

```astro
---
import Layout from '../layouts/Layout.astro';
import RatingStars from '../components/RatingStars.astro';
import AffiliateButton from '../components/AffiliateButton.astro';
import ProsCons from '../components/ProsCons.astro';
---
<Layout title="dev" description="dev" canonicalPath="/_dev-components/" noindex>
  <div class="container">
    <RatingStars value={3.7} showNumber />
    <AffiliateButton href="https://example.com" broker="XM" />
    <ProsCons pros={['Uno', 'Dos']} cons={['Tres', 'Cuatro']} />
  </div>
</Layout>
```

- [ ] **Step 3: Verify build and visual**

Run: `npm run build && npm run check`
Expected: succeeds.
Run: `npm run dev`, open `http://localhost:4321/_dev-components/`, confirm stars render a 74%-filled row, the affiliate button has `rel="sponsored nofollow noopener"` (check page source), pros/cons stack correctly at narrow width.

- [ ] **Step 4: Delete the harness**

```bash
rm src/pages/_dev-components.astro
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add broker presentational components"
```

---

## Task 11: ComparisonTable (sort/filter logic TDD + component)

**Files:**
- Create: `src/lib/table.ts`, `src/lib/table.test.ts`, `src/components/ComparisonTable.astro`

**Interfaces:**
- Consumes: `BrokerEntry`, `format.ts`.
- Produces:
  - `src/lib/table.ts`:
    - `type SortKey = 'rank' | 'rating' | 'minDeposit' | 'spread'`
    - `type Row = { slug: string; name: string; logo: string; href: string; affiliateUrl: string; rating: number; rank: number; minDeposit: number; spread: number; platforms: string[]; regulators: string[] }`
    - `toRow(entry: BrokerEntry): Row`
    - `sortRows(rows: Row[], key: SortKey, dir: 'asc' | 'desc'): Row[]` — pure, new array.
    - `filterRows(rows: Row[], filters: { platform?: string; regulator?: string }): Row[]` — case-insensitive membership.
  - `ComparisonTable.astro` props: `{ entries: BrokerEntry[]; caption?: string; showFilters?: boolean }`. Renders a `<table>` of rows (built via `toRow`), a filter control row (platform `<select>`, regulator `<select>`) when `showFilters`, and clickable `<th>` sort buttons. Ships one `<script>` that re-sorts/filters the DOM using the compiled logic from `table.ts` (import it in the script).

- [ ] **Step 1: Write `src/lib/table.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { sortRows, filterRows, type Row } from './table';

const rows: Row[] = [
  { slug: 'a', name: 'A', logo: '', href: '', affiliateUrl: '', rating: 4.1, rank: 2, minDeposit: 100, spread: 0.8, platforms: ['MT4'], regulators: ['CySEC'] },
  { slug: 'b', name: 'B', logo: '', href: '', affiliateUrl: '', rating: 4.6, rank: 1, minDeposit: 0, spread: 1.0, platforms: ['MT5', 'cTrader'], regulators: ['ASIC', 'FCA'] },
  { slug: 'c', name: 'C', logo: '', href: '', affiliateUrl: '', rating: 3.9, rank: 3, minDeposit: 50, spread: 0.6, platforms: ['MT4', 'MT5'], regulators: ['CNMV'] },
];

describe('table logic', () => {
  it('sortRows by rating desc', () => {
    expect(sortRows(rows, 'rating', 'desc').map((r) => r.slug)).toEqual(['b', 'a', 'c']);
  });
  it('sortRows by minDeposit asc', () => {
    expect(sortRows(rows, 'minDeposit', 'asc').map((r) => r.slug)).toEqual(['b', 'c', 'a']);
  });
  it('sortRows does not mutate input', () => {
    sortRows(rows, 'spread', 'asc');
    expect(rows.map((r) => r.slug)).toEqual(['a', 'b', 'c']);
  });
  it('filterRows by platform is case-insensitive', () => {
    expect(filterRows(rows, { platform: 'mt5' }).map((r) => r.slug)).toEqual(['b', 'c']);
  });
  it('filterRows by regulator', () => {
    expect(filterRows(rows, { regulator: 'FCA' }).map((r) => r.slug)).toEqual(['b']);
  });
  it('filterRows with no filters returns all', () => {
    expect(filterRows(rows, {}).length).toBe(3);
  });
});
```

- [ ] **Step 2: Run to verify fail.** Run: `npm test -- table` → FAIL.

- [ ] **Step 3: Write `src/lib/table.ts`**

```ts
import type { BrokerEntry } from './brokers';

export type SortKey = 'rank' | 'rating' | 'minDeposit' | 'spread';

export interface Row {
  slug: string; name: string; logo: string; href: string; affiliateUrl: string;
  rating: number; rank: number; minDeposit: number; spread: number;
  platforms: string[]; regulators: string[];
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

export function filterRows(rows: Row[], filters: { platform?: string; regulator?: string }): Row[] {
  const p = filters.platform?.toLowerCase();
  const r = filters.regulator?.toLowerCase();
  return rows.filter((row) => {
    const okP = !p || row.platforms.some((x) => x.toLowerCase() === p);
    const okR = !r || row.regulators.some((x) => x.toLowerCase() === r);
    return okP && okR;
  });
}
```

- [ ] **Step 4: Run to verify pass.** Run: `npm test -- table` → PASS (6 tests).

- [ ] **Step 5: Write `src/components/ComparisonTable.astro`**

Server-render all rows sorted by rank. Emit `data-*` attributes per `<tr>` (`data-rating`, `data-rank`, `data-min-deposit`, `data-spread`, `data-platforms`, `data-regulators`) so the client script can read/sort without re-fetching. The `<script>`:

```astro
<script>
  import { sortRows, filterRows, type Row, type SortKey } from '../lib/table';

  const table = document.querySelector<HTMLTableElement>('[data-comparison-table]');
  if (table) {
    const tbody = table.querySelector('tbody')!;
    const readRows = (): Row[] =>
      [...tbody.querySelectorAll<HTMLTableRowElement>('tr')].map((tr) => ({
        slug: tr.dataset.slug!, name: '', logo: '', href: '', affiliateUrl: '',
        rating: Number(tr.dataset.rating), rank: Number(tr.dataset.rank),
        minDeposit: Number(tr.dataset.minDeposit), spread: Number(tr.dataset.spread),
        platforms: tr.dataset.platforms!.split('|'), regulators: tr.dataset.regulators!.split('|'),
      }));
    const rowEls = new Map([...tbody.querySelectorAll<HTMLTableRowElement>('tr')].map((tr) => [tr.dataset.slug!, tr]));
    let state = { key: 'rank' as SortKey, dir: 'asc' as 'asc' | 'desc', platform: '', regulator: '' };

    const render = () => {
      let rows = filterRows(readRows(), { platform: state.platform || undefined, regulator: state.regulator || undefined });
      rows = sortRows(rows, state.key, state.dir);
      const visible = new Set(rows.map((r) => r.slug));
      [...rowEls.values()].forEach((tr) => (tr.hidden = !visible.has(tr.dataset.slug!)));
      rows.forEach((r) => tbody.appendChild(rowEls.get(r.slug)!));
    };

    table.querySelectorAll<HTMLButtonElement>('th button[data-sort]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.sort as SortKey;
        state.dir = state.key === key && state.dir === 'asc' ? 'desc' : 'asc';
        state.key = key;
        render();
      });
    });
    table.querySelector<HTMLSelectElement>('[data-filter="platform"]')?.addEventListener('change', (e) => {
      state.platform = (e.target as HTMLSelectElement).value; render();
    });
    table.querySelector<HTMLSelectElement>('[data-filter="regulator"]')?.addEventListener('change', (e) => {
      state.regulator = (e.target as HTMLSelectElement).value; render();
    });
  }
</script>
```

Mobile (`max-width: 720px`): hide the `spread` and `regulators` columns via CSS, or switch to a stacked card layout using `display:block` on `tr`/`td` with `td::before { content: attr(data-label); }`. Pick the stacked-card approach; give each `<td>` a `data-label`.

- [ ] **Step 6: Verify build + manual**

Run: `npm run build && npm run check` → succeeds.
Add the component to `src/pages/index.astro` temporarily with 3 hand-built entries (or wait for Task 13 — acceptable to defer visual check). Run `npm run dev`, click a sort header, change the platform filter, confirm rows reorder/hide. Confirm at 375px width the table is readable (stacked).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add comparison table with client-side sort and filter"
```

---

## Task 12: BrokerCard and CategoryRanking

**Files:**
- Create: `src/components/BrokerCard.astro`, `src/components/CategoryRanking.astro`

**Interfaces:**
- Consumes: `BrokerEntry`, `RatingStars`, `AffiliateButton`, `format.ts`.
- Produces:
  - `BrokerCard.astro` props: `{ entry: BrokerEntry; position?: number }`. Renders a card: position badge (if given), logo, name (link to review), `RatingStars` + numeric, 3 one-line highlights (min deposit, spread desde, plataformas), top 2 `pros`, `AffiliateButton`, "Leer análisis" link.
  - `CategoryRanking.astro` props: `{ entries: BrokerEntry[] }`. Renders an ordered list of `BrokerCard` with `position` = index + 1. `entries` are assumed pre-sorted by the page.

- [ ] **Step 1: Create both components.**

- [ ] **Step 2: Verify build.** Run: `npm run build && npm run check` → succeeds.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add broker card and category ranking components"
```

---

## Task 13: Home page

**Files:**
- Modify: `src/pages/index.astro` (full rewrite)

**Interfaces:**
- Consumes: `getCollection('brokers')`, `sortByRank`, `sortByRating`, `ComparisonTable`, `CategoryRanking` (top 3), `Disclosure`, `organizationLd`, `websiteLd`, `itemListLd`, `SITE`, `CATEGORIES`.
- Produces: the `/` route.

- [ ] **Step 1: Rewrite `src/pages/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import Layout from '../layouts/Layout.astro';
import ComparisonTable from '../components/ComparisonTable.astro';
import CategoryRanking from '../components/CategoryRanking.astro';
import Disclosure from '../components/Disclosure.astro';
import { SITE } from '../data/site';
import { CATEGORIES } from '../data/categories';
import { sortByRank, sortByRating, type BrokerEntry } from '../lib/brokers';
import { organizationLd, websiteLd, itemListLd } from '../lib/jsonld';

const raw = await getCollection('brokers');
const entries: BrokerEntry[] = raw.map((e) => ({ slug: e.slug, data: e.data }));
const byRank = sortByRank(entries);
const top3 = sortByRating(entries).slice(0, 3);

const ld = [
  organizationLd(),
  websiteLd(),
  itemListLd({
    items: top3.map((e) => ({ name: e.data.name, url: new URL(`/brokers/${e.slug}/`, SITE.url).href })),
  }),
];
---
<Layout
  title={`${SITE.name} — ${SITE.tagline}`}
  description={SITE.description}
  canonicalPath="/"
  jsonLd={ld}
>
  <section class="hero container">
    <h1>Comparador de brokers para España y Latinoamérica</h1>
    <p>{SITE.description}</p>
    <Disclosure />
  </section>

  <section class="container">
    <h2>Comparativa de brokers</h2>
    <ComparisonTable entries={byRank} showFilters caption="Comparativa de los 10 brokers analizados" />
  </section>

  <section class="container">
    <h2>Los 3 mejores brokers ahora mismo</h2>
    <CategoryRanking entries={top3} />
  </section>

  <section class="container">
    <h2>Rankings por categoría</h2>
    <ul class="cat-links">
      {CATEGORIES.map((c) => (
        <li><a href={`/mejores-brokers/${c.slug}/`}>{c.title}</a></li>
      ))}
    </ul>
  </section>

  <section class="container-narrow">
    <h2>Nuestra metodología</h2>
    <p>{SITE.methodologyBlurb}</p>
    <p><a href="/metodologia/">Ver la metodología completa →</a></p>
  </section>
</Layout>
```

- [ ] **Step 2: Verify build**

Run: `npm run build && npm run check`
Expected: succeeds even with 0 brokers (empty table). After Task 18 there will be 1, after Task 19 all 10.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: build home page (hero, comparison table, top 3, category links)"
```

---

## Task 14: Broker review page

**Files:**
- Create: `src/pages/brokers/[slug].astro`

**Interfaces:**
- Consumes: `getCollection('brokers')`, `<Content />` render of the MDX body, all broker presentational components, `Breadcrumbs`, `Disclosure`, `relatedBrokers`, `reviewLd`, `faqPageLd`, `breadcrumbListLd`, `aggregateRating` (to assert consistency — see Step 2).
- Produces: `/brokers/<slug>/` for every broker in the collection.

- [ ] **Step 1: Create `src/pages/brokers/[slug].astro`**

```astro
---
import { getCollection, type CollectionEntry } from 'astro:content';
import Layout from '../../layouts/Layout.astro';
import Breadcrumbs from '../../components/Breadcrumbs.astro';
import RatingStars from '../../components/RatingStars.astro';
import ProsCons from '../../components/ProsCons.astro';
import AffiliateButton from '../../components/AffiliateButton.astro';
import FactSheet from '../../components/FactSheet.astro';
import RegulationTable from '../../components/RegulationTable.astro';
import CompanyProfile from '../../components/CompanyProfile.astro';
import Faq from '../../components/Faq.astro';
import CategoryRanking from '../../components/CategoryRanking.astro';
import Disclosure from '../../components/Disclosure.astro';
import { SITE } from '../../data/site';
import { relatedBrokers, type BrokerEntry } from '../../lib/brokers';
import { reviewLd, faqPageLd, breadcrumbListLd, organizationLd } from '../../lib/jsonld';

export async function getStaticPaths() {
  const brokers = await getCollection('brokers');
  const entries: BrokerEntry[] = brokers.map((e) => ({ slug: e.slug, data: e.data }));
  return brokers.map((entry) => ({
    params: { slug: entry.slug },
    props: { entry, entries },
  }));
}

interface Props { entry: CollectionEntry<'brokers'>; entries: BrokerEntry[]; }
const { entry, entries } = Astro.props;
const d = entry.data;
const { Content } = await entry.render();
const related = relatedBrokers(entries, entry.slug, 3);

const crumbs = [
  { name: 'Inicio', path: '/' },
  { name: 'Brokers', path: '/#comparativa' },
  { name: d.name, path: `/brokers/${entry.slug}/` },
];
const ld = [
  organizationLd(),
  reviewLd({ broker: d, slug: entry.slug }),
  faqPageLd(d.faq),
  breadcrumbListLd(crumbs.map((c) => ({ name: c.name, path: c.path }))),
];
---
<Layout
  title={`${d.name}: análisis y opiniones 2026 | ${SITE.name}`}
  description={d.bottomLine}
  canonicalPath={`/brokers/${entry.slug}/`}
  ogImage={`/og/${entry.slug}.png`}
  jsonLd={ld}
>
  <div class="container">
    <Breadcrumbs crumbs={crumbs} />
    <header class="broker-head">
      <img src={d.logo} alt={`Logo de ${d.name}`} width="120" height="48" />
      <h1>{d.name}: análisis, spreads y opiniones</h1>
      <RatingStars value={d.rating} showNumber />
      <p>{d.bottomLine}</p>
      <AffiliateButton href={d.affiliateUrl} broker={d.name} />
      <Disclosure variant="inline" />
    </header>

    <FactSheet broker={d} />
    <ProsCons pros={d.pros} cons={d.cons} />

    <section class="review-body">
      <Content />
    </section>

    <CompanyProfile broker={d} />
    <RegulationTable regulators={d.regulators} />
    <Faq items={d.faq} />

    <section>
      <h2>Brokers relacionados</h2>
      <CategoryRanking entries={related} />
    </section>
  </div>
</Layout>
```

- [ ] **Step 2: Add a build-time consistency assertion.** In the frontmatter, after `const d = entry.data;` add:

```astro
import { aggregateRating } from '../../lib/rating';
if (import.meta.env.DEV && Math.abs(aggregateRating(d.ratingBreakdown) - d.rating) > 0.15) {
  throw new Error(`${entry.slug}: rating ${d.rating} no coincide con el desglose (${aggregateRating(d.ratingBreakdown)})`);
}
```

This surfaces data-entry mistakes during `npm run dev` without hard-failing production builds on rounding.

- [ ] **Step 3: Verify build**

Run: `npm run build && npm run check`
Expected: succeeds with 0 brokers (no paths generated). Full verification happens in Task 18.

- [ ] **Step 4: Commit**

```bash
git add src/pages/brokers/[slug].astro
git commit -m "feat: build broker review page template"
```

---

## Task 15: Category ranking pages

**Files:**
- Create: `src/pages/mejores-brokers/[categoria].astro`

**Interfaces:**
- Consumes: `getCollection('brokers')`, `CATEGORIES`, `getCategory`, `filterByCategory`, `sortByRating`, `ComparisonTable`, `CategoryRanking`, `Faq`, `Breadcrumbs`, `Disclosure`, `itemListLd`, `faqPageLd`, `breadcrumbListLd`.
- Produces: `/mejores-brokers/<categoria>/` for each of the 5 categories.

- [ ] **Step 1: Create `src/pages/mejores-brokers/[categoria].astro`**

```astro
---
import { getCollection } from 'astro:content';
import Layout from '../../layouts/Layout.astro';
import Breadcrumbs from '../../components/Breadcrumbs.astro';
import ComparisonTable from '../../components/ComparisonTable.astro';
import CategoryRanking from '../../components/CategoryRanking.astro';
import Faq from '../../components/Faq.astro';
import Disclosure from '../../components/Disclosure.astro';
import { SITE } from '../../data/site';
import { CATEGORIES } from '../../data/categories';
import { filterByCategory, sortByRating, type BrokerEntry } from '../../lib/brokers';
import { itemListLd, faqPageLd, breadcrumbListLd, organizationLd } from '../../lib/jsonld';

export async function getStaticPaths() {
  const brokers = await getCollection('brokers');
  const entries: BrokerEntry[] = brokers.map((e) => ({ slug: e.slug, data: e.data }));
  return CATEGORIES.map((category) => {
    const matched = sortByRating(filterByCategory(entries, category));
    return { params: { categoria: category.slug }, props: { category, matched } };
  });
}

const { category, matched } = Astro.props;
const crumbs = [
  { name: 'Inicio', path: '/' },
  { name: 'Mejores brokers', path: '/#rankings' },
  { name: category.shortTitle, path: `/mejores-brokers/${category.slug}/` },
];
const ld = [
  organizationLd(),
  itemListLd({ items: matched.map((e) => ({ name: e.data.name, url: new URL(`/brokers/${e.slug}/`, SITE.url).href })) }),
  faqPageLd(category.faq),
  breadcrumbListLd(crumbs),
];
---
<Layout title={`${category.title} | ${SITE.name}`} description={category.metaDescription} canonicalPath={`/mejores-brokers/${category.slug}/`} jsonLd={ld}>
  <div class="container">
    <Breadcrumbs crumbs={crumbs} />
    <h1>{category.title}</h1>
    <p>{category.intro}</p>
    <Disclosure />
    <h2>Comparativa</h2>
    <ComparisonTable entries={matched} caption={`Brokers de la categoría ${category.shortTitle}`} />
    <h2>Ranking</h2>
    <CategoryRanking entries={matched} />
    <Faq items={category.faq} />
  </div>
</Layout>
```

- [ ] **Step 2: Verify build**

Run: `npm run build && npm run check`
Expected: succeeds; generates 5 pages, each with an empty table/ranking until brokers exist.

- [ ] **Step 3: Commit**

```bash
git add src/pages/mejores-brokers/[categoria].astro
git commit -m "feat: build category ranking pages"
```

---

## Task 16: Static content pages

**Files:**
- Create: `src/pages/metodologia.astro`, `src/pages/aviso-legal.astro`, `src/pages/privacidad.astro`, `src/pages/sobre-nosotros.astro`, `src/pages/404.astro`

**Interfaces:**
- Consumes: `Layout`, `SITE`, `Breadcrumbs`, `WEIGHTS` (methodology page shows the weights table), `CATEGORIES`.
- Produces: the 4 content routes + the 404 page.

- [ ] **Step 1: Create `metodologia.astro`** — sections: cómo puntuamos (table of `WEIGHTS` as percentages), qué medimos en cada área, por qué estos 10 brokers y no otros (selection criteria: regulación verificable, disponibilidad para clientes de habla hispana, plataformas MT4/MT5/cTrader, historial), fuentes de datos (webs oficiales de los brokers y registros de los reguladores; fecha de última actualización por review), cómo ganamos dinero (link a aviso legal). All copy in Spanish, written now — no placeholders.

- [ ] **Step 2: Create `aviso-legal.astro`** — sections: titular del sitio, naturaleza informativa (no es asesoramiento financiero), divulgación de afiliación (full `SITE.affiliateDisclosure` + expanded paragraph), advertencia de riesgo (`SITE.riskWarning`), limitación de responsabilidad, propiedad intelectual, legislación aplicable y jurisdicción (España), contacto (`SITE.email`).

- [ ] **Step 3: Create `privacidad.astro`** — sections: responsable del tratamiento, datos que se recogen (formulario de contacto si existe; logs del servidor; cookies), base jurídica, cookies (distinguir técnicas vs. analíticas/afiliación; nota de que los enlaces de afiliado pueden usar cookies de terceros), derechos RGPD (acceso, rectificación, supresión, etc.) y cómo ejercerlos, conservación, cambios en la política. Written as a reasonable GDPR baseline; include a visible note: "Revisar con un asesor legal antes de producción."

- [ ] **Step 4: Create `sobre-nosotros.astro`** — quiénes somos (proyecto editorial independiente que compara brokers), qué NO hacemos (no somos un bróker, no gestionamos dinero, no damos señales), cómo trabajamos (link a metodología), contacto (`SITE.email`).

- [ ] **Step 5: Create `404.astro`** — `noindex`, `<h1>Página no encontrada</h1>`, links back to `/`, `/metodologia/`, and the comparison table.

- [ ] **Step 6: Verify build**

Run: `npm run build && npm run check`
Expected: succeeds; all 4 pages + `404.html` in `dist/`.

- [ ] **Step 7: Commit**

```bash
git add src/pages/metodologia.astro src/pages/aviso-legal.astro src/pages/privacidad.astro src/pages/sobre-nosotros.astro src/pages/404.astro
git commit -m "feat: add methodology, legal, privacy, about and 404 pages"
```

---

## Task 17: Public assets — robots, favicon, fonts, default OG

**Files:**
- Create: `public/robots.txt`, `public/favicon.svg`, `public/og/default.png`, `public/fonts/inter-{400,600,700}.woff2`, `src/styles/fonts.css`
- Modify: `src/styles/global.css` (import fonts.css), `astro.config.mjs` (sitemap already added — confirm)

**Interfaces:**
- Consumes: nothing.
- Produces: `/robots.txt`, `/favicon.svg`, self-hosted Inter via `@font-face`.

- [ ] **Step 1: Create `public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://barrelshoetrading.com/sitemap-index.xml
```

- [ ] **Step 2: Create `public/favicon.svg`** — a simple mark: a rounded square with `B` in `--color-primary`. Inline SVG, ~10 lines.

- [ ] **Step 3: Add Inter font files.** Download Inter woff2 subsets (weights 400, 600, 700) from the Inter release (https://github.com/rsms/inter/releases) or Google Fonts `woff2`. Place in `public/fonts/`. Create `src/styles/fonts.css`:

```css
@font-face { font-family: "Inter"; font-weight: 400; font-display: swap; src: url("/fonts/inter-400.woff2") format("woff2"); }
@font-face { font-family: "Inter"; font-weight: 600; font-display: swap; src: url("/fonts/inter-600.woff2") format("woff2"); }
@font-face { font-family: "Inter"; font-weight: 700; font-display: swap; src: url("/fonts/inter-700.woff2") format("woff2"); }
```

Add `@import "./fonts.css";` at the top of `global.css`.

- [ ] **Step 4: Create `public/og/default.png`** — 1200×630, brand name + tagline on `--color-bg` with a `--color-primary` bar. Generate with any tool; commit the PNG. (Per-broker OG images `public/og/<slug>.png` are optional; the layout falls back to `default.png` when missing — no build error since it is a static path reference.)

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: `dist/robots.txt`, `dist/sitemap-index.xml`, `dist/favicon.svg`, fonts copied. Open the site in `npm run dev` and confirm Inter loads (Network tab shows woff2 200).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: add robots.txt, favicon, self-hosted fonts, default OG image"
```

---

## Task 18: Exemplar broker content — Infinox

**Files:**
- Create: `src/content/brokers/infinox.mdx`, `public/logos/infinox.svg`

**Interfaces:**
- Consumes: `brokerSchema`.
- Produces: one fully valid broker entry; proves the whole rendering path (home table, review page, category filtering, JSON-LD).

- [ ] **Step 1: Research and record Infinox data.** From INFINOX's official site and regulator registers, collect every field in the schema (§3.1 of the spec). Required accuracy notes:
  - `regulators`: INFINOX entities — FCA (UK, IX Capital Group Ltd / IFX Ltd — verify current), SCB (Bahamas), FSCA (South Africa), FSC (Mauritius). Record authority, country, licence number, `status: 'activa'` unless a register says otherwise.
  - `spreadEurUsdFrom`: typical EUR/USD spread on the standard STP account (pips).
  - `platforms`: INFINOX offers MT4, MT5, and IX Social/copy — set `platforms: ['MT4','MT5','WebTrader','movil']` if cTrader is not offered (verify).
  - `copyTrading: true` (IX Social).
  - `instruments`: forex, indices, commodities, gold true; stocks/etfs/crypto per current offering.
  - `rating` and `ratingBreakdown`: assign each sub-score 0–5 using the methodology; then set `rating` to `aggregateRating(breakdown)` (compute by hand: fees·0.3 + platforms·0.2 + deposits·0.15 + support·0.1 + regulation·0.25, round to 1 decimal). The Task 14 dev assertion enforces this within 0.15.
  - `rank`: `1` for now (re-ordered in Task 19 once all 10 exist).
  - `affiliateUrl`: use the real affiliate link if available, otherwise the plain `https://www.infinox.com/` homepage — never invent a tracking URL.
  - `lastUpdated`: today's date.

- [ ] **Step 2: Write `src/content/brokers/infinox.mdx`** using `_example.mdx` as the structural template, with the researched frontmatter and a review body containing these `##` sections (2–4 short paragraphs each, in Spanish): Visión general · Costes y comisiones · Plataformas · Instrumentos disponibles · Tipos de cuenta · Depósitos y retiros · Atención al cliente · Veredicto.

- [ ] **Step 3: Add `public/logos/infinox.svg`.** Use the official logo if licensing allows, otherwise a text-based SVG wordmark "INFINOX" — must be an `.svg` at `public/logos/infinox.svg` matching the `logo` field.

- [ ] **Step 4: Verify the full path**

Run: `npm run dev`
- Visit `/` — Infinox appears in the comparison table and (if top 3) in the ranking.
- Visit `/brokers/infinox/` — header, fact sheet, pros/cons, review body, company profile, regulation table, FAQ, related (empty or few) all render. View source: three `application/ld+json` blocks (`Organization`, `Review`, `FAQPage`, `BreadcrumbList`).
- Visit `/mejores-brokers/mt4/` — Infinox appears (offers MT4).
- No console errors. No dev assertion throw.

Run: `npm run build && npm run check`
Expected: succeeds, `dist/brokers/infinox/index.html` exists.

- [ ] **Step 5: Commit**

```bash
git add src/content/brokers/infinox.mdx public/logos/infinox.svg
git commit -m "content: add INFINOX broker review (exemplar)"
```

---

## Task 19: Remaining 9 broker reviews

**Files:**
- Create (one commit per broker): `src/content/brokers/<slug>.mdx` + `public/logos/<slug>.svg` for: `hantec-markets`, `fp-trading`, `fp-markets`, `xm`, `vantage`, `pu-prime`, `exness`, `ultima-markets`, `vt-markets`

**Interfaces:**
- Consumes: `brokerSchema`, the Task 18 process.
- Produces: all 10 brokers present; the site is content-complete.

For **each** broker, repeat this cycle:

- [ ] **Step A: Research** every schema field from the broker's official site and the relevant regulator registers. Per-broker anchors (verify all before publishing):
  - **Hantec Markets** — FCA (UK), FSCA (South Africa), FSA (Seychelles), ASIC (via Hantec Financial). MT4/MT5. HQ London.
  - **FP Trading** — clarify entity vs. "FP Markets"; if it is a regional brand of First Prudential Markets, note that in `ownership`/`groupEntities`. Regulators and platforms per its own site.
  - **FP Markets** — ASIC (Australia), CySEC (Cyprus), FSCA, FSA (St Vincent — note offshore). MT4/MT5, cTrader, IRESS. Founded 2005.
  - **XM** — CySEC, ASIC, DFSA, FSC (Belize). MT4/MT5, XM app. Part of Trading Point group. No cTrader.
  - **Vantage** — ASIC, FCA (appointed rep — verify), FSCA, VFSC (Vanuatu). MT4/MT5, ProTrader, copy trading. 
  - **PU Prime** — FSCA, FSA (Seychelles), other offshore. MT4/MT5. Copy trading.
  - **Exness** — CySEC, FCA, FSCA, FSA (Seychelles), CBCS. MT4/MT5, Exness Terminal/app. Very high leverage in some entities — record the retail figure and note pro/offshore separately in the body, not the schema.
  - **Ultima Markets** — CySEC, FSC (Mauritius), other. MT4/MT5. Member of The Financial Commission.
  - **VT Markets** — ASIC (verify current), FSCA, FSC (Mauritius), SVG. MT4/MT5, WebTrader, copy trading.
  - For any field you cannot verify, use the most conservative accurate value and mention the uncertainty in the review body — never guess a licence number or a spread.
- [ ] **Step B: Assign** `ratingBreakdown` sub-scores per the methodology, compute `rating` by the weighted formula (round to 1 decimal).
- [ ] **Step C: Write** `src/content/brokers/<slug>.mdx` (frontmatter + the 8 `##` review sections in Spanish) and add `public/logos/<slug>.svg`.
- [ ] **Step D: Run** `npm run dev` and open `/brokers/<slug>/` — confirm every section renders and the dev rating assertion does not throw.
- [ ] **Step E: Commit** `content: add <Name> broker review`.

After all 9:

- [ ] **Step F: Set final `rank` values.** Order all 10 brokers by `rating` descending (tie-break: stronger regulation, then lower costs). Edit each `rank` field to `1..10`, unique. 

- [ ] **Step G: Add a uniqueness guard.** Create `src/lib/ranks.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('broker ranks', () => {
  it('are unique and cover 1..10', () => {
    const dir = join(process.cwd(), 'src/content/brokers');
    const ranks = readdirSync(dir)
      .filter((f) => f.endsWith('.mdx') && !f.startsWith('_'))
      .map((f) => readFileSync(join(dir, f), 'utf8').match(/^rank:\s*(\d+)/m)![1])
      .map(Number)
      .sort((a, b) => a - b);
    expect(ranks).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
});
```

- [ ] **Step H: Full verification**

Run: `npm test` → all suites pass, including `ranks.test.ts`.
Run: `npm run check` → 0 errors.
Run: `npm run build` → succeeds; `dist/` contains `index.html`, `brokers/<slug>/index.html` ×10, `mejores-brokers/<slug>/index.html` ×5, the 4 content pages, `404.html`, `sitemap-index.xml`.
Run: `npm run preview`, spot-check 3 broker pages + 2 category pages + home. Confirm comparison table sort/filter works with all 10 rows; confirm each category page lists the right brokers (e.g. `/mejores-brokers/oro/` only brokers with `instruments.gold: true`).

- [ ] **Step I: Commit**

```bash
git add -A
git commit -m "content: finalise broker ranking order and add rank uniqueness test"
```

---

## Task 20: Deployment runbook and Plan B workflow

**Files:**
- Create: `DEPLOY.md`, `.github/workflows/deploy.yml`
- Modify: `README.md`

**Interfaces:**
- Consumes: the working build from Task 19.
- Produces: documented deploy paths; a manually-triggerable GitHub Actions workflow that builds and publishes `dist/` to a `deploy` branch (Plan B).

- [ ] **Step 1: Write `README.md`** — project one-liner, requirements (Node 22), `npm install`, `npm run dev` (localhost:4321), `npm run build`, `npm test`, `npm run check`. Content editing: "add a broker → create `src/content/brokers/<slug>.mdx` (copy `_example.mdx`) + `public/logos/<slug>.svg`; the build validates it". Link to `DEPLOY.md` and the spec.

- [ ] **Step 2: Write `DEPLOY.md`**

Document both paths:

**Path A — Plesk builds from Git (preferred).**
1. Plesk → domain `barrelshoetrading.com` → Git → add repository → remote `https://github.com/albertolopezbotia-boop/barrelshoe-trading-web-brokers.git`, branch `main`, deployment mode **Automatic**.
2. Enable "additional deployment actions": `npm ci && npm run build`.
3. Set the domain's document root to the repo's `dist/` subdirectory (Plesk → Hosting Settings → Document root → `.../barrelshoe-trading-web-brokers/dist`).
4. Requires the Plesk **Node.js** extension (check: domain panel shows a "Node.js" button, or `node -v` works in Plesk → Tools & Settings → scheduled task shell). Node 20+.
5. First deploy: push to `main`, then Plesk → Git → "Pull now" if it does not fire automatically.

**Path B — build in GitHub Actions, Plesk serves static (fallback if no Node on Plesk).**
1. In the repo, the `deploy.yml` workflow (below) builds on every push to `main` and force-pushes `dist/` to branch `deploy`.
2. Plesk → Git → repository branch `deploy`, deployment mode Automatic, **no** build action.
3. Document root → the deployed directory root (the branch contains only the built site).

Include: how to point the Hostinger/registrar DNS `A` record to `185.230.55.45` and add the `www` `CNAME`; enabling Let's Encrypt in Plesk; the `301` from `www` to apex (or vice-versa) matching `astro.config.mjs` `site`.

- [ ] **Step 3: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy (Plan B)
on:
  workflow_dispatch:
  push:
    branches: [main]
jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - name: Publish dist to deploy branch
        run: |
          cd dist
          touch .nojekyll
          git init -q
          git config user.name "deploy-bot"
          git config user.email "deploy-bot@users.noreply.github.com"
          git add -A
          git commit -q -m "build: ${GITHUB_SHA}"
          git push -f "https://x-access-token:${{ secrets.GITHUB_TOKEN }}@github.com/${{ github.repository }}.git" HEAD:deploy
```

Note in `DEPLOY.md`: keep this workflow but it is harmless if Path A is used (it only publishes a branch Plesk ignores). If Path A is confirmed, the workflow can be deleted or its `push` trigger removed.

- [ ] **Step 4: Verify**

Run: `npm run build` locally one more time → succeeds.
Push the branch; confirm GitHub Actions `CI` passes. Do **not** merge to `main` yet — that is the human's call at execution handoff.

- [ ] **Step 5: Commit**

```bash
git add README.md DEPLOY.md .github/workflows/deploy.yml
git commit -m "docs: add README and deployment runbook with Plan B workflow"
```

---

## Self-Review

**1. Spec coverage:**

| Spec section | Task(s) |
|---|---|
| §2 stack: Astro SSG, content collections, no client framework, CSS tokens, self-hosted fonts, TS, sitemap/mdx/check, Node pinned | 1, 3, 4, 17 |
| §3.1 broker schema (all field groups incl. perfil de empresa) | 4 |
| §3.2 review body sections | 14, 18, 19 |
| §3.3 site.ts + categories.ts | 5 |
| §4 routes (home, review, 5 rankings, metodología, aviso-legal, privacidad, sobre-nosotros, 404, sitemap, robots) | 13, 14, 15, 16, 17 |
| §4.1 review page structure (8 blocks incl. company profile, regulation, FAQ, related) | 14 |
| §4.2 ranking page structure | 15 |
| §4.3 regulación ES+LATAM | 4 (schema), 18–19 (data) |
| §5 components (all 17) | 8, 9, 10, 11, 12 |
| §6 SEO (semantic, 1 H1, breadcrumbs, canonical, sitemap, robots, JSON-LD Organization/Review/ItemList/FAQPage/BreadcrumbList, OG+Twitter, nofollow sponsored, hreflang-ready) | 3, 7, 8, 9, 13, 14, 15, 17 |
| §7 visual direction | 3 (tokens) + applied across 9–16 (qualitative; refined during implementation) |
| §8.1 repo (gitignore, nvmrc, engines, README) | 1, 17, 20 |
| §8.2 Plesk + Git build | 20 |
| §8.3 Plan B GitHub Actions | 20 |
| §8.4 verify Node on Plesk | 20 (documented as the open decision point) |
| §9 testing (schema validation, CI check+build, Vitest for JS logic) | 2, 4, 6, 7, 11, 19 |
| §10 repo structure | 1 + established across all tasks |
| §11 out of scope | Global Constraints (enforced by omission) |
| §12 later phases | not implemented (correct) |

No gaps found. Note: §7 visual direction (myfxbook/bestbrokers/wikifx styling) is captured as tokens + component structure; pixel-level fidelity is an implementation-time concern and the executor should do a visual pass in Task 19 Step H. If the human wants a mockup-first approach, that is a separate design task before Task 9.

**2. Placeholder scan:** No "TBD"/"TODO"/"implement later" in task steps. The privacy page (Task 16 Step 3) intentionally ships with a visible "revisar con asesor legal" note — that is product copy, not a plan placeholder. Task 18/19 require real research rather than inventing data — the steps name the specific sources and fields. "Similar to Task N" appears once (Task 19 "repeat this cycle") but the full cycle A–E is spelled out inline, not referenced.

**3. Type consistency:**
- `BrokerData` — defined in Task 4, imported by 5, 6, 7, 10, 11. Consistent. (Fallback: if split to `src/lib/broker-schema.ts` in Task 4 Step 4, all importers use that path — noted in Task 5 Interfaces.)
- `BrokerEntry` (`{ slug, data }`) — defined Task 6 (`src/lib/brokers.ts`), imported by 10, 11, 12, 13, 14, 15. Consistent.
- `Row` / `SortKey` — defined Task 11 (`src/lib/table.ts`), used only there and in `ComparisonTable`. Consistent.
- `Category` — defined Task 5, imported by 6 (`filterByCategory`), 15. Consistent.
- `aggregateRating(breakdown)` — Task 6, used in Task 14 assertion and Task 18/19 data process. Same signature.
- JSON-LD builder names (`organizationLd`, `websiteLd`, `reviewLd`, `itemListLd`, `faqPageLd`, `breadcrumbListLd`) — defined Task 7, used 13, 14, 15. Consistent.
- `Layout` props (`title`, `description`, `canonicalPath`, `ogImage?`, `noindex?`, `jsonLd?`) — Task 3 + extended Task 8; all page tasks (13–16) use exactly these names.
- `Seo` props (`title`, `description`, `canonical`, `ogImage`, `noindex?`, `jsonLd?`) — note `canonical` (absolute, resolved in Layout) vs Layout's `canonicalPath` (relative). Intentional and consistent between Task 3 and Task 8.

No inconsistencies to fix.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-09-07-barrelshoe-trading-v1.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
