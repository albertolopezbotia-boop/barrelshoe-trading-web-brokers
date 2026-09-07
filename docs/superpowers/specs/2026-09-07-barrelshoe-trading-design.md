# Barrelshoe Trading — Comparador de brokers (v1)

- **Fecha:** 2026-09-07
- **Estado:** Diseño aprobado, pendiente de plan de implementación
- **Marca / dominio:** Barrelshoe Trading · `barrelshoetrading.com`
- **Hosting:** Plesk (proveedor con panel Plesk, IP 185.230.55.45), correo en el mismo hosting

## 1. Objetivo

Sitio de comparación y reviews de brokers de trading (forex/CFDs), enfocado a
audiencia de España y LATAM, monetizado por afiliación y orientado a SEO. Modelo
de referencia: BrokerChooser / FXScouts.

La v1 cubre el núcleo: tabla comparativa, reviews individuales, páginas de
ranking por categoría, y páginas de metodología y legales. Sin blog, sin
calculadoras, sin multiidioma (todo ello es fase 2).

### Brokers de la v1 (10)

1. Infinox
2. Hantec Markets
3. FP Trading
4. FP Markets
5. XM
6. Vantage
7. PU Prime
8. Exness
9. Ultima Markets
10. VT Markets

## 2. Arquitectura y stack

- **Astro** en modo estático (SSG). Salida `dist/` = HTML + CSS, JS mínimo.
- **Astro Content Collections** para los brokers: colección `brokers` con esquema
  Zod validado. El build falla si un dato obligatorio falta o tiene tipo
  incorrecto — primera red de seguridad del proyecto.
- **Sin framework de cliente.** Interactividad (ordenar/filtrar la tabla
  comparativa) resuelta con `<script>` vanilla pequeño.
- **CSS propio** con design tokens (custom properties: color, espaciado,
  tipografía, radios, sombras). Estilos scoped por componente Astro. Tema claro
  en v1.
- **Fuentes autoalojadas** en `public/fonts/`. Imágenes vía `<Image>` de Astro.
- **TypeScript** para config, esquemas y helpers.
- Integraciones: `@astrojs/sitemap`, `@astrojs/mdx`, `astro check`.
- Node fijado vía `.nvmrc` + `engines` en `package.json` (Node 20 LTS).

## 3. Modelo de datos y contenido

Un fichero por broker: `src/content/brokers/<slug>.mdx`

- **Frontmatter** = datos estructurados (alimentan tablas, fichas y rankings).
- **Cuerpo MDX** = la review larga en prosa, por secciones.

### 3.1 Esquema del broker (frontmatter)

| Grupo | Campos |
|---|---|
| Identidad | `name`, `slug`, `logo`, `websiteUrl`, `founded` (año), `headquarters` |
| Afiliación | `affiliateUrl`, `featured` (bool), `rank` (entero, orden del ranking manual) |
| Valoración | `rating` (0–5, un decimal), `ratingBreakdown` { `fees`, `platforms`, `deposits`, `support`, `regulation` } (cada uno 0–5) |
| Regulación | `regulators`: lista de { `authority`, `country`, `licenseNumber`, `status` (`activa`\|`limitada`\|`retirada`) } |
| Costes | `minDeposit` { `amount`, `currency` }, `spreadEurUsdFrom` (pips, número), `commissionPerLot` { `amount`, `currency` } \| null, `swapFree` (bool) |
| Cuentas | `accountTypes`: lista de { `name`, `spreadFrom` (pips), `commission` (texto), `minDeposit` { amount, currency } } |
| Plataformas | `platforms`: multi de [`MT4`, `MT5`, `cTrader`, `WebTrader`, `propia`, `movil`] |
| Instrumentos | `instruments` { `forex`, `indices`, `commodities`, `gold`, `stocks`, `crypto`, `etfs` } (bool) |
| Operativa | `leverageMax` (texto, p. ej. "1:500"), `copyTrading` (bool), `easAllowed` (bool), `scalpingAllowed` (bool), `demoAccount` (bool), `islamicAccount` (bool) |
| Depósito / Retiro | `paymentMethods`: lista de strings, `withdrawalTimeTypical` (texto), `withdrawalFees` (texto) |
| Perfil de empresa | `ownership` (grupo/matriz, texto), `listedCompany` (bool), `globalOffices`: lista de strings (país o ciudad), `groupEntities`: lista de strings |
| Soporte | `support` { `languages`: [], `hours` (texto), `channels`: [] } |
| Editorial | `pros`: [], `cons`: [], `bottomLine` (2–3 frases), `lastUpdated` (fecha ISO) |
| FAQ | `faq`: lista de { `question`, `answer` } |

Los campos son refinables durante la implementación; esta es la base para tabla
comparativa + fichas + review + rankings + datos estructurados.

### 3.2 Cuerpo de la review (MDX)

Secciones estándar por review: visión general · costes y comisiones ·
plataformas · instrumentos · tipos de cuenta · depósitos y retiros · atención al
cliente · veredicto.

### 3.3 Datos globales

`src/data/site.ts`: marca, dominio, texto de *disclosure* de afiliación, aviso
de riesgo, resumen de metodología, contacto y redes.

`src/data/categories.ts`: definición de las páginas de ranking (slug, título,
intro, criterio de filtrado/orden, FAQ).

## 4. Páginas y rutas (v1)

| Ruta | Contenido |
|---|---|
| `/` | Home: hero, tabla comparativa (10 brokers, ordenable/filtrable), top ranking, teaser de metodología, disclosure |
| `/brokers/<slug>/` | Review individual (×10) |
| `/mejores-brokers/<categoria>/` | Rankings (×5 inicial): `mt4`, `mt5`, `ctrader`, `copy-trading`, `oro` |
| `/metodologia/` | Cómo valoramos · por qué estos brokers y no otros · fuentes de datos |
| `/aviso-legal/` | Disclosure de afiliación · aviso de riesgo · términos |
| `/privacidad/` | Política de privacidad + cookies |
| `/sobre-nosotros/` | Quiénes somos · contacto |
| `/404` | Página de error |
| `/sitemap.xml`, `/robots.txt` | Generados |

### 4.1 Estructura de la página de review

1. Ficha header: logo, rating global + estrellas, datos clave (depósito mínimo,
   spread EUR/USD, plataformas, regulación), CTA de afiliado.
2. Pros / Contras.
3. Desglose de valoración (tabla de sub-ratings).
4. Cuerpo de la review (MDX, secciones de §3.2).
5. Perfil de empresa (grupo/matriz, cotizada, oficinas globales).
6. Tabla de regulación (autoridad, país, licencia, estado).
7. FAQ (con JSON-LD `FAQPage`).
8. Brokers relacionados.

### 4.2 Estructura de la página de ranking

Intro editorial · tabla comparativa filtrada a la categoría · ranking en
tarjetas (orden por `rank`) · FAQ · disclosure.

### 4.3 Regulación ES + LATAM

Aunque la v1 es monolingüe (español) y de una sola versión, los datos y el texto
de regulación cubren CNMV (España) y reguladores LATAM clave (CNBV México, CMF
Chile, CNV Argentina, etc.). El campo `regulators` ya lo soporta.

## 5. Componentes

`Layout` · `Seo` (meta + OpenGraph + JSON-LD) · `Header` · `Footer` ·
`ComparisonTable` (+ JS vanilla de orden/filtro) · `BrokerCard` · `RatingStars` ·
`ProsCons` · `FactSheet` · `RegulationTable` · `CompanyProfile` ·
`AffiliateButton` (`rel="sponsored nofollow"`, `target="_blank"`) · `Disclosure` ·
`Faq` · `Breadcrumbs` · `CategoryRanking`.

## 6. SEO

- HTML semántico, un `<h1>` por página, breadcrumbs visibles.
- Canonical en todas las páginas · `sitemap.xml` · `robots.txt`.
- JSON-LD: `Organization` global · `Review` + `aggregateRating` en reviews ·
  `ItemList` en rankings · `FAQPage` donde haya FAQ · `BreadcrumbList`.
- OpenGraph + Twitter cards · imagen OG por defecto + una por broker.
- Rendimiento: estático, JS mínimo, fuentes autoalojadas, imágenes optimizadas.
- Enlaces de afiliado con `rel="sponsored nofollow"` (no pasan link juice).
- Estructura preparada para `hreflang` (fase 2 i18n) sin bloquear la v1.

## 7. Dirección visual

Referencias (se concreta en la fase de implementación / frontend):

- Layout de datos denso pero legible, estilo **myfxbook**.
- Diseño de fichas y comparativa, estilo **bestbrokers.com**.
- Presentación de broker con perfil de empresa visible, estilo **wikifx**.
- Metodología y "top broker", estilo **brokerchooser**.
- Tema claro en v1. Responsive mobile-first: la tabla comparativa colapsa a
  tarjetas en móvil.

## 8. Despliegue

### 8.1 Repositorio

- GitHub: `barrelshoe-trading` (privado), rama principal `main`.
- Local: carpeta `web-brokers/` con `git init` y remote `origin`.
- `.gitignore`: `node_modules/`, `dist/`, `.env*`, `.DS_Store`, `.astro/`.
- `README.md`: instalación, comandos (`npm run dev`, `npm run build`), flujo de
  deploy.

### 8.2 Deploy (Plesk + Git)

1. Plesk → "Repositorio remoto" apuntando al repo de GitHub, rama `main`, modo
   **Automático**.
2. "Habilite acciones de despliegue adicionales" → `npm ci && npm run build`.
3. Raíz del documento del dominio → carpeta `dist/` generada.

### 8.3 Plan B (si Plesk no tiene Node en el shell de despliegue)

- Build en **GitHub Actions** en cada push a `main`.
- El workflow publica `dist/` en una rama `deploy`.
- Plesk conecta la rama `deploy` en modo Automático y sirve los archivos
  estáticos tal cual (sin acción de build).
- Resultado final idéntico.

### 8.4 Punto abierto

Verificar si el Plesk tiene la extensión **Node.js** disponible en el shell de
despliegue. Determina si se usa 8.2 o 8.3. No bloquea el desarrollo.

## 9. Testing

Sitio de contenido estático → estrategia ligera.

- **Validación de esquema:** el build de Astro falla si un broker tiene datos
  inválidos o incompletos. Es el chequeo principal.
- **CI (GitHub Actions):** `astro check && astro build` en cada push y PR.
- **Vitest** solo para lógica JS: cálculo del rating agregado y orden/filtro de
  la tabla comparativa. TDD aplica a estos helpers.
- Link-check opcional del `dist/` tras el build.
- Sin TDD pesado para el contenido ni las plantillas Astro.

## 10. Estructura del repo

```
web-brokers/
  astro.config.mjs
  package.json
  tsconfig.json
  .nvmrc
  .gitignore
  README.md
  .github/workflows/ci.yml
  public/
    robots.txt
    favicon.svg
    fonts/
    logos/                 # logos de brokers
    og/                    # imágenes OpenGraph
  src/
    content/
      config.ts            # esquemas Zod
      brokers/             # <slug>.mdx ×10
    data/
      site.ts
      categories.ts
    components/
    layouts/
      Layout.astro
    pages/
      index.astro
      metodologia.astro
      aviso-legal.astro
      privacidad.astro
      sobre-nosotros.astro
      404.astro
      brokers/[slug].astro
      mejores-brokers/[categoria].astro
    lib/                   # helpers JS + tests
    styles/
      tokens.css
      global.css
  docs/
    superpowers/specs/
```

## 11. Fuera de alcance (v1)

YAGNI — explícitamente fuera:

- Blog, educación y noticias.
- Calculadoras (pip, margen, swap, tamaño de posición, etc.).
- i18n / multiidioma / variante LATAM separada.
- CMS o panel de administración.
- Cuentas de usuario y reseñas de usuarios.
- Newsletter.
- Analítica propia (se puede añadir un snippet de terceros aparte).
- Modo oscuro.

## 12. Fases posteriores (contexto, no compromiso)

- **Fase 2:** calculadoras de trading (todas, referencia comparefxbrokers);
  sección de educación y noticias (posible reutilización del proyecto
  `blog-multilang` existente); i18n ES/EN/PT-BR con `hreflang`.
- **Fase 3:** más brokers, más categorías de ranking, comparador 1-a-1
  interactivo.
