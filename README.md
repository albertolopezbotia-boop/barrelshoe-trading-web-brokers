# Barrelshoe Trading — web-brokers

Static broker comparison and review site for the Spanish and Latin American markets,
built with [Astro 5](https://astro.build/) (SSG, no client-side framework). Content
lives in typed content collections; every broker review is schema-validated at build
time.

Production site: <https://barrelshoetrading.com>

## Requirements

- **Node 22 LTS** — the version is pinned in `.nvmrc`. Run `nvm use` in the repo root
  (`nvm install 22` first if you don't have it). `package.json` `engines.node` allows
  `>=20`, but CI and deployment use 22.
- **npm** (ships with Node).

## Setup

```bash
nvm use
npm install
```

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server at <http://localhost:4321> |
| `npm run build` | Build the static site to `dist/` |
| `npm run preview` | Serve the built `dist/` locally to check the production output |
| `npm test` | Run the Vitest suite (JS logic: rating, ranking, formatting, schema, JSON-LD) |
| `npm run check` | Run `astro check` (TypeScript + Astro diagnostics, 0 errors expected) |

## Content editing

- **To add a broker:** copy `src/content/brokers/_example.mdx` to
  `src/content/brokers/<slug>.mdx`, fill every field (the build validates the schema
  and fails on anything missing or invalid), and add `public/logos/<slug>.svg`.
- **To add a ranking category:** edit `src/data/categories.ts`.
- **Global site text** (name, tagline, nav, legal entity, disclaimers):
  `src/data/site.ts`.

## Project structure

```
astro.config.mjs        Astro config: site URL, trailingSlash, mdx + sitemap integrations
src/
  content/              Content collections
    brokers/            One .mdx per broker (+ _example.mdx template)
  data/                 site.ts (global text), categories.ts (ranking categories)
  lib/                  Pure logic + unit tests (rating, ranks, table, format, jsonld, schema)
  components/           Astro components (cards, tables, SEO, header/footer, etc.)
  layouts/              Layout.astro — shared HTML shell, SEO wiring
  pages/                Routes: home, brokers/<slug>, mejores-brokers/*, legal pages, 404
  styles/              Global CSS + design tokens
public/                 Static assets: logos/, fonts/, og/, favicon.svg, robots.txt
```

## Deployment

See [`DEPLOY.md`](./DEPLOY.md) for the full runbook (Plesk-builds-from-Git as Path A,
GitHub Actions build + static serve as Path B, plus DNS and TLS steps).

## Reference docs

- Design spec: [`docs/superpowers/specs/2026-09-07-barrelshoe-trading-design.md`](./docs/superpowers/specs/2026-09-07-barrelshoe-trading-design.md)
- Implementation plan: [`docs/superpowers/plans/2026-09-07-barrelshoe-trading-v1.md`](./docs/superpowers/plans/2026-09-07-barrelshoe-trading-v1.md)

## Data accuracy

Broker data (spreads, licence numbers, minimum deposits, company figures) was
researched from public sources but **must be verified against official sources**
(regulator registers, the broker's own legal documents) before being relied upon.
Each review carries a `lastUpdated` date reflecting when its data was last checked.
