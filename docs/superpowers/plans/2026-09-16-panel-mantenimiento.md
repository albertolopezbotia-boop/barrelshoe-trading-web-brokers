# Panel de mantenimiento (Decap CMS) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar de alta un panel web (`/admin`, Decap CMS) para editar fichas de
bróker, añadir brokers nuevos, editar textos sueltos de página y subir logos,
con revisión antes de publicar, sin tocar el pipeline de despliegue existente.

**Architecture:** Página estática `/admin` (Decap CMS servido desde CDN) que
habla con la API de GitHub desde el navegador, autenticada vía un Worker de
Cloudflare que hace de puente OAuth. `publish_mode: editorial_workflow`: cada
cambio crea una rama + PR contra `main`; el CI existente (`ci.yml`, que ya
dispara en `pull_request: branches:[main]`) valida esa rama; fusionar el PR
dispara el pipeline de deploy de siempre.

**Tech Stack:** Decap CMS (CDN, sin build propio), Cloudflare Workers (proxy
OAuth), Astro content collections (`type: 'data'`) para los textos de página.

**Spec:** `docs/superpowers/specs/2026-09-16-panel-mantenimiento-design.md`

## Global Constraints

- No se toca `main` en ningún paso de este plan salvo a través de un PR
  revisado normal (branch de trabajo del plan, igual que cualquier otra
  tarea). El propio panel, una vez desplegado, seguirá el flujo de PR contra
  `main` para el contenido — eso es infraestructura, no significa que esta
  implementación empuje directo a `main`.
- Cada tarea debe dejar `npm run check`, `npm test` y `npm run build` en
  verde antes de darse por completa.
- El texto visible de las páginas no debe cambiar al extraerlo a
  `src/content/*` — es un refactor de dónde vive el dato, no una reescritura.
- **Checkpoint humano obligatorio entre la Tarea 5 y la Tarea 6**: la Tarea 5
  entrega código (Worker + instrucciones); la Tarea 6 no puede empezar hasta
  que el propietario haya creado la GitHub OAuth App, desplegado el Worker, y
  entregado la URL pública del Worker y el Client ID. Sin eso no hay login
  real que probar. Esto es un punto de parada legítimo, no un fallo del plan.

---

### Task 1: Extraer el texto de la home a una colección de contenido

**Files:**
- Create: `src/content/homePage/index.yaml`
- Modify: `src/content/config.ts`
- Modify: `src/pages/index.astro`
- Test: verificación manual (build + comparación visual), no hay test unitario nuevo — es texto estático

**Interfaces:**
- Produces: colección Astro `homePage` con un único entry de id `"index"`, tipo `{ heroTitle: string; heroLead: string; cardMt4: string; cardMt5: string; cardCtrader: string; cardCopyTrading: string; cardOro: string; cardComparativa: string }`.

- [ ] **Paso 1: Crear el fichero de datos**

`src/content/homePage/index.yaml`:
```yaml
heroTitle: "Encuentra tu mejor broker"
heroLead: "Compara reseñas, rankings y costes de los principales brokers de forex y CFDs, en español."
cardMt4: "Principiantes"
cardMt5: "Crypto"
cardCtrader: "Cuenta de fondeo"
cardCopyTrading: "Copytrading"
cardOro: "Forex"
cardComparativa: "Xauusd"
```

- [ ] **Paso 2: Registrar la colección en `src/content/config.ts`**

Reemplaza el contenido completo del fichero por:
```ts
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
```

- [ ] **Paso 3: Leer la colección desde `src/pages/index.astro`**

En el frontmatter de `index.astro`, junto a los demás `import`, añade:
```ts
import { getEntry } from 'astro:content';
```

Sustituye:
```ts
const catCardLabel: Record<string, string> = {
  mt4: 'Principiantes',
  mt5: 'Crypto',
  ctrader: 'Cuenta de fondeo',
  'copy-trading': 'Copytrading',
  oro: 'Forex',
};
```
por:
```ts
const home = (await getEntry('homePage', 'index'))!.data;
const catCardLabel: Record<string, string> = {
  mt4: home.cardMt4,
  mt5: home.cardMt5,
  ctrader: home.cardCtrader,
  'copy-trading': home.cardCopyTrading,
  oro: home.cardOro,
};
```

Sustituye el bloque que arma `heroCards` para que la tarjeta final use
`home.cardComparativa` en vez del literal `'Xauusd'`:
```ts
{ href: '#comparativa', label: home.cardComparativa },
```

En el markup, sustituye:
```astro
<h1>Encuentra tu mejor broker</h1>
```
por:
```astro
<h1>{home.heroTitle}</h1>
```
y:
```astro
<p class="hero__lead">Compara reseñas, rankings y costes de los principales brokers de forex y CFDs, en español.</p>
```
por:
```astro
<p class="hero__lead">{home.heroLead}</p>
```

- [ ] **Paso 4: Verificar**

Ejecuta:
```bash
npm run check
npm run build
```
Ambos deben terminar sin errores. Abre `dist/index.html` (o `npm run preview`)
y confirma que el titular, el subtítulo y las 6 tarjetas muestran el mismo
texto que antes del cambio.

- [ ] **Paso 5: Commit**
```bash
git add src/content/homePage src/content/config.ts src/pages/index.astro
git commit -m "refactor(home): extraer textos del hero a la colección homePage"
```

---

### Task 2: Extraer el texto de metodología a una colección de contenido

**Files:**
- Create: `src/content/methodologyPage/index.yaml`
- Modify: `src/content/config.ts`
- Modify: `src/pages/metodologia.astro`

**Interfaces:**
- Consumes: patrón `getEntry('<collection>', 'index')` establecido en la Tarea 1.
- Produces: colección Astro `methodologyPage` con un único entry `"index"`.

- [ ] **Paso 1: Crear el fichero de datos**

`src/content/methodologyPage/index.yaml` — copia literal de los bloques de
texto que hoy están escritos directamente en `metodologia.astro`:
```yaml
leadIntro: "En Barrelshoe Trading analizamos cada bróker con el mismo procedimiento para que las comparativas sean coherentes y verificables. En esta página explicamos cómo asignamos la puntuación, por qué incluimos unos brokers y no otros, de dónde salen los datos y cómo se financia el proyecto."
scoringIntro: "Puntuamos cada bróker de 0 a 5 en cinco áreas y calculamos una nota global ponderada. Los pesos reflejan lo que más afecta al resultado y a la seguridad de un trader minorista a largo plazo: los costes y la regulación pesan más que el resto."
scoringOutro: "La nota global es la media ponderada de las cinco áreas, redondeada a un decimal. Una nota alta en costes no compensa una regulación débil: si un bróker no tiene regulación verificable, no entra en la comparativa por muy competitivas que sean sus condiciones."
inclusionIntro: "No intentamos listar todos los brokers del mercado, sino los que un trader de habla hispana puede usar con garantías. Para entrar en la comparativa, un bróker debe cumplir estos criterios:"
sourcesIntro: "Los datos proceden de dos tipos de fuente que cualquiera puede consultar:"
sourcesOutro: "Las condiciones de los brokers cambian. Por eso cada review lleva una fecha de última actualización, que iremos renovando a medida que revisemos cada ficha. Si detectas un dato desfasado, escríbenos a"
monetizationIntro: "Barrelshoe Trading se financia con comisiones de afiliación: algunos enlaces a los brokers son enlaces de afiliado y podemos recibir una comisión si abres una cuenta a través de ellos, sin ningún coste adicional para ti. Puedes leer los detalles en el"
editorialIndependence: "Las comisiones de afiliación no cambian las puntuaciones ni el orden de las comparativas. La nota de cada bróker sale de la metodología descrita en esta página y sería la misma si no existiera ningún acuerdo de afiliación."
```

Nota: `sourcesOutro` y `monetizationIntro` terminan justo antes de un enlace
(`{SITE.email}` / "aviso legal") que se queda como código en el `.astro` — no
partas esas frases de otra forma, el punto de corte ya está puesto para que
el enlace siga funcionando igual.

- [ ] **Paso 2: Añadir la colección a `src/content/config.ts`**

Añade, junto a `homePage`:
```ts
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
```

- [ ] **Paso 3: Leer la colección desde `metodologia.astro`**

En el frontmatter, añade `import { getEntry } from 'astro:content';` (si
`metodologia.astro` no lo tiene ya) y, tras la definición de `areas`, añade:
```ts
const copy = (await getEntry('methodologyPage', 'index'))!.data;
```

Sustituye cada bloque de texto literal por su equivalente `{copy.<campo>}`:

- `<p class="lead">...En Barrelshoe Trading...financia el proyecto.</p>` → `<p class="lead">{copy.leadIntro}</p>`
- El párrafo bajo `<h2>Cómo puntuamos</h2>` → `<p>{copy.scoringIntro}</p>`
- El párrafo tras la tabla de pesos → `<p>{copy.scoringOutro}</p>`
- El párrafo bajo `<h2>Por qué estos brokers y no otros</h2>` → `<p>{copy.inclusionIntro}</p>` (la lista `<ul>` de criterios que va justo debajo NO se toca, se queda como está)
- El párrafo bajo `<h2>Fuentes de datos</h2>` → `<p>{copy.sourcesIntro}</p>` (la lista `<ul>` de fuentes que va justo debajo NO se toca)
- El párrafo que empieza "Las condiciones de los brokers cambian..." → cambia a:
  ```astro
  <p>
    {copy.sourcesOutro} <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
  </p>
  ```
- El párrafo bajo `<h2>Cómo ganamos dinero</h2>` → cambia a:
  ```astro
  <p>
    {copy.monetizationIntro} <a href="/aviso-legal/">aviso legal</a>.
  </p>
  ```
- El párrafo que empieza `<strong>Independencia editorial.</strong>` → cambia a:
  ```astro
  <p>
    <strong>Independencia editorial.</strong> {copy.editorialIndependence}
  </p>
  ```

- [ ] **Paso 4: Verificar**
```bash
npm run check
npm run build
```
Compara `dist/metodologia/index.html` contra el build anterior (o revisa
visualmente con `npm run preview`): el texto tiene que leerse exactamente
igual que antes.

- [ ] **Paso 5: Commit**
```bash
git add src/content/methodologyPage src/content/config.ts src/pages/metodologia.astro
git commit -m "refactor(metodologia): extraer textos a la colección methodologyPage"
```

---

### Task 3: Shell de Decap CMS y colección de páginas

**Files:**
- Create: `public/admin/index.html`
- Create: `public/admin/config.yml`

**Interfaces:**
- Consumes: colecciones `homePage` / `methodologyPage` de las Tareas 1-2 (mismos nombres de fichero y de campo).
- Produces: `config.yml` con el bloque `backend` (con un `base_url` placeholder que la Tarea 5 rellena) y la colección `pages`. La Tarea 4 añade la colección `brokers` al mismo fichero.

- [ ] **Paso 1: Crear el shell HTML**

`public/admin/index.html`:
```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Panel de mantenimiento — Barrelshoe Trading</title>
    <meta name="robots" content="noindex" />
  </head>
  <body>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/decap-cms/3.3.3/decap-cms.js"></script>
  </body>
</html>
```

- [ ] **Paso 2: Crear `config.yml` con el backend y la colección `pages`**

`public/admin/config.yml`:
```yaml
backend:
  name: github
  repo: albertolopezbotia-boop/barrelshoe-trading-web-brokers
  branch: main
  base_url: "REEMPLAZAR_EN_TAREA_5"
  auth_endpoint: auth

publish_mode: editorial_workflow

media_folder: "public/logos"
public_folder: "/logos"

collections:
  - name: "pages"
    label: "Textos de página"
    files:
      - name: "home"
        label: "Home"
        file: "src/content/homePage/index.yaml"
        fields:
          - { label: "Titular del hero", name: "heroTitle", widget: "string" }
          - { label: "Subtítulo del hero", name: "heroLead", widget: "text" }
          - { label: "Tarjeta: MT4", name: "cardMt4", widget: "string" }
          - { label: "Tarjeta: MT5", name: "cardMt5", widget: "string" }
          - { label: "Tarjeta: cTrader", name: "cardCtrader", widget: "string" }
          - { label: "Tarjeta: Copy trading", name: "cardCopyTrading", widget: "string" }
          - { label: "Tarjeta: Oro", name: "cardOro", widget: "string" }
          - { label: "Tarjeta: Comparativa", name: "cardComparativa", widget: "string" }
      - name: "metodologia"
        label: "Metodología"
        file: "src/content/methodologyPage/index.yaml"
        fields:
          - { label: "Intro (lead)", name: "leadIntro", widget: "text" }
          - { label: "Cómo puntuamos — intro", name: "scoringIntro", widget: "text" }
          - { label: "Cómo puntuamos — cierre", name: "scoringOutro", widget: "text" }
          - { label: "Por qué estos brokers — intro", name: "inclusionIntro", widget: "text" }
          - { label: "Fuentes de datos — intro", name: "sourcesIntro", widget: "text" }
          - { label: "Fuentes de datos — cierre", name: "sourcesOutro", widget: "text" }
          - { label: "Cómo ganamos dinero — intro", name: "monetizationIntro", widget: "text" }
          - { label: "Independencia editorial", name: "editorialIndependence", widget: "text" }
```

- [ ] **Paso 3: Verificar que el YAML es válido**
```bash
node -e "require('js-yaml').load(require('fs').readFileSync('public/admin/config.yml','utf8')); console.log('YAML ok')"
```
Si `js-yaml` no está instalado como dependencia, instálalo solo para esta
comprobación puntual con `npx js-yaml public/admin/config.yml` en su lugar
(no hace falta añadirlo a `package.json`: `public/` no pasa por el build de
Astro, Decap parsea el YAML en el navegador).

- [ ] **Paso 4: Verificar que Astro sirve el admin como estático**
```bash
npm run build
```
Confirma que `dist/admin/index.html` y `dist/admin/config.yml` existen
(Astro copia todo `public/` tal cual).

- [ ] **Paso 5: Commit**
```bash
git add public/admin
git commit -m "feat(admin): shell de Decap CMS y colección de textos de página"
```

---

### Task 4: Colección `brokers` en Decap (mapeo completo del esquema)

**Files:**
- Modify: `public/admin/config.yml`

**Interfaces:**
- Consumes: `src/lib/broker-schema.ts` como fuente de verdad de campos y tipos — no dupliques nombres de campo distintos a los de ahí.

- [ ] **Paso 1: Añadir la colección `brokers` a `config.yml`**

Añade esta entrada a la lista `collections:` (junto a `pages`, no en
sustitución):
```yaml
  - name: "brokers"
    label: "Brokers"
    folder: "src/content/brokers"
    create: true
    slug: "{{slug}}"
    extension: "mdx"
    format: "frontmatter"
    identifier_field: "name"
    summary: "{{name}} — puesto {{rank}}, nota {{rating}}"
    fields:
      - { label: "Nombre", name: "name", widget: "string" }
      - { label: "Logo", name: "logo", widget: "image" }
      - { label: "Web oficial", name: "websiteUrl", widget: "string", pattern: ["^https?://", "Debe empezar por http:// o https://"] }
      - { label: "Fundado (año)", name: "founded", widget: "number", value_type: "int", min: 1970, max: 2030 }
      - { label: "Sede", name: "headquarters", widget: "string" }
      - { label: "URL de afiliado", name: "affiliateUrl", widget: "string", pattern: ["^https?://", "Debe empezar por http:// o https://"] }
      - { label: "Destacado", name: "featured", widget: "boolean", default: false }
      - { label: "Puesto en el ranking", name: "rank", widget: "number", value_type: "int", min: 1 }
      - { label: "Nota global (0-5)", name: "rating", widget: "number", value_type: "float", min: 0, max: 5, step: 0.1 }
      - label: "Desglose de la nota"
        name: "ratingBreakdown"
        widget: "object"
        fields:
          - { label: "Costes", name: "fees", widget: "number", value_type: "float", min: 0, max: 5, step: 0.1 }
          - { label: "Plataformas", name: "platforms", widget: "number", value_type: "float", min: 0, max: 5, step: 0.1 }
          - { label: "Depósitos y retiros", name: "deposits", widget: "number", value_type: "float", min: 0, max: 5, step: 0.1 }
          - { label: "Atención al cliente", name: "support", widget: "number", value_type: "float", min: 0, max: 5, step: 0.1 }
          - { label: "Regulación", name: "regulation", widget: "number", value_type: "float", min: 0, max: 5, step: 0.1 }
      - label: "Reguladores"
        name: "regulators"
        widget: "list"
        allow_add: true
        summary: "{{authority}} ({{country}})"
        fields:
          - { label: "Autoridad", name: "authority", widget: "string" }
          - { label: "País", name: "country", widget: "string" }
          - { label: "Nº de licencia", name: "licenseNumber", widget: "string" }
          - { label: "Estado", name: "status", widget: "select", options: ["activa", "limitada", "retirada"] }
      - label: "Depósito mínimo"
        name: "minDeposit"
        widget: "object"
        fields:
          - { label: "Importe", name: "amount", widget: "number", value_type: "float", min: 0 }
          - { label: "Divisa", name: "currency", widget: "string", default: "USD" }
      - { label: "Spread EUR/USD desde", name: "spreadEurUsdFrom", widget: "number", value_type: "float", min: 0 }
      - label: "Comisión por lote"
        name: "commissionPerLot"
        widget: "object"
        required: false
        fields:
          - { label: "Importe", name: "amount", widget: "number", value_type: "float", min: 0 }
          - { label: "Divisa", name: "currency", widget: "string", default: "USD" }
      - { label: "Cuenta sin swap disponible", name: "swapFree", widget: "boolean", default: false }
      - label: "Tipos de cuenta"
        name: "accountTypes"
        widget: "list"
        allow_add: true
        summary: "{{name}}"
        fields:
          - { label: "Nombre", name: "name", widget: "string" }
          - { label: "Spread desde", name: "spreadFrom", widget: "number", value_type: "float", min: 0 }
          - { label: "Comisión (texto)", name: "commission", widget: "string" }
          - label: "Depósito mínimo de esta cuenta"
            name: "minDeposit"
            widget: "object"
            fields:
              - { label: "Importe", name: "amount", widget: "number", value_type: "float", min: 0 }
              - { label: "Divisa", name: "currency", widget: "string", default: "USD" }
      - { label: "Plataformas", name: "platforms", widget: "select", multiple: true, options: ["MT4", "MT5", "cTrader", "WebTrader", "propia", "movil"] }
      - { label: "Tipo de ejecución", name: "brokerType", widget: "select", multiple: true, options: ["Creador de mercado", "STP", "ECN", "NDD", "DMA"] }
      - label: "Instrumentos"
        name: "instruments"
        widget: "object"
        fields:
          - { label: "Forex", name: "forex", widget: "boolean", default: false }
          - { label: "Índices", name: "indices", widget: "boolean", default: false }
          - { label: "Materias primas", name: "commodities", widget: "boolean", default: false }
          - { label: "Oro", name: "gold", widget: "boolean", default: false }
          - { label: "Acciones", name: "stocks", widget: "boolean", default: false }
          - { label: "Cripto", name: "crypto", widget: "boolean", default: false }
          - { label: "ETFs", name: "etfs", widget: "boolean", default: false }
      - { label: "Apalancamiento máximo (texto)", name: "leverageMax", widget: "string" }
      - { label: "Copy trading", name: "copyTrading", widget: "boolean", default: false }
      - { label: "Expert Advisors permitidos", name: "easAllowed", widget: "boolean", default: false }
      - { label: "Scalping permitido", name: "scalpingAllowed", widget: "boolean", default: false }
      - { label: "Cuenta demo", name: "demoAccount", widget: "boolean", default: false }
      - { label: "Cuenta islámica", name: "islamicAccount", widget: "boolean", default: false }
      - { label: "Métodos de pago", name: "paymentMethods", widget: "list" }
      - { label: "Tiempo de retirada típico", name: "withdrawalTimeTypical", widget: "text" }
      - { label: "Comisiones de retirada", name: "withdrawalFees", widget: "text" }
      - label: "Retiro mínimo"
        name: "withdrawalMinimum"
        widget: "object"
        required: false
        fields:
          - { label: "Importe", name: "amount", widget: "number", value_type: "float", min: 0 }
          - { label: "Divisa", name: "currency", widget: "string", default: "USD" }
      - { label: "Propiedad / grupo", name: "ownership", widget: "text" }
      - { label: "Cotiza en bolsa", name: "listedCompany", widget: "boolean", default: false }
      - { label: "Oficinas globales", name: "globalOffices", widget: "list" }
      - { label: "Entidades del grupo", name: "groupEntities", widget: "list" }
      - label: "Soporte"
        name: "support"
        widget: "object"
        fields:
          - { label: "Idiomas", name: "languages", widget: "list" }
          - { label: "Horario", name: "hours", widget: "string" }
          - { label: "Canales", name: "channels", widget: "list" }
      - { label: "Pros", name: "pros", widget: "list" }
      - { label: "Contras", name: "cons", widget: "list" }
      - { label: "Resumen (bottomLine)", name: "bottomLine", widget: "text", pattern: ["^.{40,400}$", "Entre 40 y 400 caracteres"] }
      - { label: "Última actualización", name: "lastUpdated", widget: "datetime", format: "YYYY-MM-DD", date_format: "YYYY-MM-DD", time_format: false }
      - label: "Preguntas frecuentes"
        name: "faq"
        widget: "list"
        allow_add: true
        summary: "{{question}}"
        fields:
          - { label: "Pregunta", name: "question", widget: "string" }
          - { label: "Respuesta", name: "answer", widget: "text" }
      - { label: "Análisis (cuerpo del artículo)", name: "body", widget: "markdown" }
```

- [ ] **Paso 2: Verificar el YAML**
```bash
npx js-yaml public/admin/config.yml
```

- [ ] **Paso 3: Verificar en `astro check`**
```bash
npm run check
```
(No debería verse afectado — `config.yml` no pasa por Astro — pero confirma
que las Tareas 1-3 siguen en verde antes de continuar.)

- [ ] **Paso 4: Commit**
```bash
git add public/admin/config.yml
git commit -m "feat(admin): mapear la colección brokers al esquema completo"
```

---

### Task 5: Worker de autenticación OAuth (Cloudflare)

**Files:**
- Create: `tools/decap-oauth-worker/worker.js`
- Create: `tools/decap-oauth-worker/wrangler.toml`
- Create: `tools/decap-oauth-worker/README.md`

**Interfaces:**
- Produces: la URL pública del Worker desplegado (`https://<algo>.workers.dev`), que hay que pegar en `base_url` de `public/admin/config.yml` (Tarea 6, Paso 1).

Este Worker es el único componente que no se prueba solo con `npm run
build` — su corrección se comprueba haciendo login de verdad en la Tarea 6.

- [ ] **Paso 1: Escribir el Worker**

`tools/decap-oauth-worker/worker.js`:
```js
// Puente de OAuth para Decap CMS (backend "github").
// Implementa el intercambio de código por token que Decap espera:
// GET  /auth              -> redirige a GitHub para autorizar
// GET  /callback?code=... -> intercambia el code por un token y lo
//                            devuelve a la ventana del CMS vía postMessage

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/auth') {
      const params = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        redirect_uri: `${url.origin}/callback`,
        scope: 'repo,user',
        state: crypto.randomUUID(),
      });
      return Response.redirect(
        `https://github.com/login/oauth/authorize?${params}`,
        302,
      );
    }

    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      if (!code) return new Response('Falta el parámetro code', { status: 400 });

      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });
      const tokenJson = await tokenRes.json();

      if (tokenJson.error) {
        return new Response(`Error de GitHub: ${tokenJson.error_description ?? tokenJson.error}`, { status: 400 });
      }

      const payload = JSON.stringify({ token: tokenJson.access_token, provider: 'github' });
      const html = `<!DOCTYPE html><html><body><script>
(function() {
  function receiveMessage(e) {
    window.opener.postMessage(
      'authorization:github:success:${payload}',
      e.origin
    );
    window.removeEventListener('message', receiveMessage, false);
  }
  window.addEventListener('message', receiveMessage, false);
  window.opener.postMessage('authorizing:github', '*');
})();
</script></body></html>`;
      return new Response(html, { headers: { 'Content-Type': 'text/html' } });
    }

    return new Response('Puente de OAuth de Barrelshoe Trading. Rutas: /auth, /callback', { status: 200 });
  },
};
```

- [ ] **Paso 2: Configurar el proyecto de Wrangler**

`tools/decap-oauth-worker/wrangler.toml`:
```toml
name = "barrelshoe-decap-oauth"
main = "worker.js"
compatibility_date = "2026-01-01"
```

- [ ] **Paso 3: Escribir las instrucciones de despliegue para el propietario**

`tools/decap-oauth-worker/README.md`:
```markdown
# Puente de OAuth para el panel de mantenimiento

Este Worker deja que `/admin` inicie sesión con GitHub sin exponer ningún
secreto en el navegador. Se despliega **una sola vez**.

## 1. Crear la GitHub OAuth App

1. GitHub → foto de perfil → Settings → Developer settings → OAuth Apps → New OAuth App.
2. Application name: `Barrelshoe Trading — admin`.
3. Homepage URL: `https://barrelshoetrading.com`.
4. Authorization callback URL: `https://<lo-que-elijas>.workers.dev/callback`
   (puedes ponerlo provisional y corregirlo después de desplegar el Worker,
   cuando sepas la URL real).
5. Guarda el **Client ID** y genera y guarda el **Client Secret** — el
   secreto solo se muestra una vez.

## 2. Desplegar el Worker

Necesitas una cuenta de Cloudflare (gratis, sin tarjeta) y Node en tu
máquina.

```bash
cd tools/decap-oauth-worker
npx wrangler login
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
npx wrangler deploy
```

`wrangler deploy` imprime la URL pública, algo como
`https://barrelshoe-decap-oauth.<tu-usuario>.workers.dev`.

## 3. Cerrar el círculo

1. Vuelve a la OAuth App de GitHub (paso 1) y pon la callback URL definitiva:
   `<esa URL>/callback`.
2. Pásame esa URL — la pego en `base_url` de `public/admin/config.yml`
   (Tarea 6 de este plan).
```

- [ ] **Paso 4: Commit**
```bash
git add tools/decap-oauth-worker
git commit -m "feat(admin): Worker de autenticación OAuth para Decap CMS"
```

- [ ] **Paso 5: Entregar al propietario**

Este es el checkpoint humano del plan (ver Global Constraints). Al llegar
aquí, párate y pide al propietario que siga
`tools/decap-oauth-worker/README.md` y te devuelva la URL del Worker
desplegado antes de continuar con la Tarea 6.

---

### Task 6: Cerrar el círculo y verificación de extremo a extremo

**Files:**
- Modify: `public/admin/config.yml`
- Modify: `src/lib/broker-schema.ts` (solo si la comprobación del Paso 3 lo exige)
- Create: `docs/mantenimiento.md`

**Interfaces:**
- Consumes: la URL del Worker entregada por el propietario tras la Tarea 5.

- [ ] **Paso 1: Rellenar `base_url`**

En `public/admin/config.yml`, sustituye `"REEMPLAZAR_EN_TAREA_5"` por la URL
real del Worker (sin `/callback`, solo el origen, p. ej.
`https://barrelshoe-decap-oauth.tuusuario.workers.dev`).

- [ ] **Paso 2: Desplegar esta rama de trabajo en un entorno accesible**

Antes de fusionar nada a `main`, hace falta ver `/admin` sirviendo desde una
URL real (Decap CMS no funciona abierto como fichero local por las
políticas de CORS del navegador). La forma más simple: fusiona esta rama
tal cual sigue el flujo normal del proyecto (Task 1 de
`finishing-a-development-branch`), y prueba contra la URL de Plesk una vez
desplegado — el panel en sí no afecta a ninguna página existente, así que
desplegarlo no es arriesgado.

- [ ] **Paso 3: Probar el ciclo completo con una entrada de prueba**

En `https://barrelshoetrading.com/admin/`:
1. Inicia sesión con GitHub. Confirma que no hay errores de consola y que
   ves las colecciones "Textos de página" y "Brokers".
2. Abre la ficha de cualquier bróker que tenga `commissionPerLot` o
   `withdrawalMinimum` y **vacía ese campo** (quita importe y divisa),
   guarda. Observa qué escribe Decap en el `.mdx` de la rama que crea (mira
   el diff del commit en GitHub): ¿omite la clave? ¿escribe un objeto vacío
   `{}`? ¿escribe `null`?
   - Si omite la clave o escribe `{}`: ajusta
     `src/lib/broker-schema.ts` para que esos dos campos acepten también esa
     forma (por ejemplo `money.nullable().optional()`, o un
     `.transform()` que convierta `{}` en `null` antes de validar) y añade
     el caso a `src/lib/broker-schema.test.ts`.
   - Si escribe `null` de forma nativa: no hace falta tocar el esquema, el
     `.nullable()` que ya existe lo cubre. Anota igualmente el
     comportamiento observado en `docs/mantenimiento.md` (Paso 5).
3. Edita un texto de "Textos de página" (por ejemplo el titular del hero) y
   guarda.
4. Confirma en GitHub que cada guardado abrió un Pull Request contra `main`
   y que el workflow de CI (`ci.yml`) se ha disparado solo sobre ese PR.
5. Deja que CI termine en verde, fusiona (o publica desde el propio panel)
   uno de los dos PRs de prueba, y confirma que el pipeline de siempre
   (`deploy.yml` → rama `deploy` → webhook → Plesk) se dispara y el cambio
   llega al sitio en vivo.
6. Revierte o borra cualquier dato de prueba que no deba quedarse publicado.

- [ ] **Paso 4: Si el Paso 3.2 exigió tocar el esquema, verificar**
```bash
npm run check
npm test
npm run build
```

- [ ] **Paso 5: Documentar el uso**

`docs/mantenimiento.md`:
```markdown
# Mantenimiento del sitio

## Cambios de texto o de ficha de bróker (panel)

Entra en `https://barrelshoetrading.com/admin/` con tu cuenta de GitHub.

- **Textos de página**: home y metodología, un formulario por página.
- **Brokers**: edita una ficha existente o pulsa "Nueva entrada" para dar de
  alta un bróker. Cada campo tiene el mismo límite que exige el sitio
  (obligatorio, número, longitud); si algo falta, Decap no deja guardar.
- Cada guardado abre una revisión (Borrador → En revisión → Listo). Nada se
  publica hasta que muevas la entrada a "Listo" o pulses "Publicar" — en ese
  momento se despliega solo, igual que un `git push` normal.
- Quién puede entrar: cualquier colaborador del repo de GitHub
  (`albertolopezbotia-boop/barrelshoe-trading-web-brokers`). Para añadir a
  alguien, invítalo como colaborador desde GitHub.

## Cambios que siguen sin pasar por el panel

- `src/data/site.ts`, `src/data/categories.ts`, colores, tipografía,
  estructura de las páginas: se piden por chat, como hasta ahora.
- El logo de un bróker se sube desde el propio formulario de su ficha
  (campo "Logo").

## Notas técnicas

- Comportamiento observado al vaciar un campo de dinero opcional
  (`commissionPerLot` / `withdrawalMinimum`) en Decap: <RELLENAR TRAS LA
  PRUEBA DEL PASO 3>.
```
Sustituye la última línea por lo que se observó de verdad en el Paso 3.2.

- [ ] **Paso 6: Commit**
```bash
git add public/admin/config.yml docs/mantenimiento.md
# si el Paso 4 tocó el esquema:
git add src/lib/broker-schema.ts src/lib/broker-schema.test.ts
git commit -m "feat(admin): conectar el Worker de OAuth y documentar el panel"
```
