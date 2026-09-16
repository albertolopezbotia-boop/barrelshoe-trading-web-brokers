# Panel de mantenimiento (Decap CMS) — Diseño

**Fecha:** 2026-09-16
**Estado:** aprobado en brainstorming, pendiente de plan de implementación

## Objetivo

Dar a Barrelshoe Trading un panel web para hacer, sin pasar por una sesión de
Claude Code ni tocar código a mano:

1. Editar el texto de una ficha de bróker existente.
2. Añadir un bróker nuevo.
3. Editar los textos sueltos de las páginas (home, metodología, categorías...).
4. Subir o cambiar el logo de un bróker.

Con revisión antes de publicar (varios colaboradores futuros, no solo el
propietario del sitio) y sin tener que operar un servidor propio — el sitio
sigue siendo 100% estático, servido por Plesk sin Node.

## Por qué Decap CMS

Decap CMS (antes Netlify CMS) es un editor de contenido de código abierto para
sitios estáticos con contenido en Git: una página `/admin` puramente estática
que habla directo con la API de GitHub desde el navegador — no necesita
servidor propio, encaja con Plesk. Resuelve de fábrica lo que pedimos:
formularios tipados por colección, subida de imágenes al repo, y un **flujo
editorial** (borrador → en revisión → listo para publicar) antes de tocar
`main`.

## Arquitectura

```
public/admin/
  index.html       ← shell HTML que carga Decap CMS desde cdnjs y lee config.yml
  config.yml        ← qué colecciones existen y qué campos tiene cada una

Cloudflare Worker (gratis, fuera de Plesk — no es Node en Plesk)
  /auth  /callback  ← intercambia el login de GitHub por un token de acceso;
                       Decap nunca ve ni guarda una contraseña

GitHub OAuth App (creada en la cuenta de GitHub del propietario del repo)
  Client ID / Client Secret ← usados solo por el Worker, nunca por el navegador

src/content/brokers/*.mdx        ← sin cambios de formato; editado desde el panel
src/content/pages/*.md  (NUEVO)  ← textos sueltos de home/metodología/categorías,
                                     extraídos de los .astro para que sean editables
src/data/site.ts, categories.ts  ← se quedan como están (cambian poco, se
                                     siguen tocando por chat)
```

`main` sigue siendo la única rama que despliega. El panel no toca el pipeline
existente (`.github/workflows/deploy.yml`, webhook a Plesk) — solo añade cómo
llegan los commits a `main`.

## Colecciones y campos

### `brokers` (colección de carpeta → `src/content/brokers/*.mdx`)

Un campo del formulario por cada campo de `src/lib/broker-schema.ts`, agrupado
en bloques dentro del propio formulario de Decap (no son colecciones
separadas, son secciones del mismo formulario):

- **General**: name, logo (imagen), websiteUrl, founded, headquarters,
  affiliateUrl, featured, rank.
- **Puntuación**: rating, ratingBreakdown (fees/platforms/deposits/support/
  regulation, 0–5).
- **Regulación**: regulators — lista de {authority, country, licenseNumber,
  status: selector activa/limitada/retirada}.
- **Costes**: minDeposit {amount, currency}, spreadEurUsdFrom,
  commissionPerLot {amount, currency} (opcional), swapFree.
- **Cuentas**: accountTypes — lista de {name, spreadFrom, commission,
  minDeposit}.
- **Plataformas**: platforms (multiselección MT4/MT5/cTrader/WebTrader/
  propia/movil), brokerType (multiselección), instruments (7 sí/no),
  leverageMax, copyTrading, easAllowed, scalpingAllowed, demoAccount,
  islamicAccount.
- **Pagos y retiros**: paymentMethods (lista), withdrawalTimeTypical,
  withdrawalFees, withdrawalMinimum {amount, currency} (opcional).
- **Empresa**: ownership, listedCompany, globalOffices (lista), groupEntities
  (lista), support {languages, hours, channels}.
- **Reseña**: pros (lista, mín. 2), cons (lista, mín. 2), bottomLine (texto,
  40–400 caracteres), lastUpdated (fecha), faq (lista de {question, answer}).
- **Cuerpo del artículo**: el Markdown bajo el frontmatter (secciones "Visión
  general", "Costes y comisiones"...) se edita con el campo de cuerpo nativo
  de Decap para colecciones de carpeta — no hay que tocarlo aparte.

"Añadir un bróker" = botón "Nueva entrada" de esta colección, mismo
formulario en blanco.

### `pages` (colección de ficheros → `src/content/pages/*.md`, NUEVA)

Una entrada fija por página con los bloques de texto que hoy están
incrustados en el `.astro` correspondiente:

- **Home**: titular del hero, subtítulo, textos de las 6 tarjetas.
- **Metodología**: intro, texto de cada área de puntuación, criterios de
  inclusión, fuentes de datos, cómo ganamos dinero.
- **Categorías**: intro y meta-descripción de cada una de las 5 categorías
  (hoy en `src/data/categories.ts`; se migran aquí si se quieren editables
  desde el panel, o se dejan en `categories.ts` si se prefiere seguir
  tocándolas por chat — a decidir en la tarea de extracción).

Esto implica un trabajo previo de extracción: sacar esos textos de
`index.astro` / `metodologia.astro` a ficheros de contenido, y que las
páginas los lean de ahí en vez de tenerlos escritos directamente. Se hace una
vez; no se vuelve a tocar.

## Acceso y flujo de revisión

- **Login**: botón "Login with GitHub" en `/admin`, vía el Worker de OAuth.
- **Quién entra**: cualquier colaborador del repo de GitHub. Añadir a alguien
  en el futuro = invitarlo como colaborador desde GitHub; no hay gestión de
  usuarios aparte que mantener.
- **`publish_mode: editorial_workflow`**: cada guardado crea una rama
  (`cms/<slug>`) y un commit, nunca toca `main` directamente. El panel
  muestra un tablero Borrador → En revisión → Listo para publicar.
- **Publicar** = mover la entrada a "Listo" (o pulsar "Publicar"), lo que
  fusiona esa rama a `main` — a partir de ahí entra el pipeline de siempre
  (build → rama `deploy` → webhook → Plesk).

## Validación — que no se cuele un dato a medias

- Cada campo del formulario lleva las restricciones del esquema real
  (obligatorio, numérico, longitud mínima/máxima, patrón) usando la
  validación nativa de campos de Decap.
- `src/lib/broker-schema.ts` sigue siendo la autoridad final. Se añade
  `cms/**` a los disparadores de `.github/workflows/ci.yml`, así que
  `npm run check` + tests + build corren también sobre las ramas que crea
  Decap — si algo se cuela en el formulario, el build falla antes de que la
  entrada pueda marcarse "Lista para publicar", igual que hoy con un commit
  manual.

## Riesgos / detalles a resolver durante la implementación

- **Campos "dinero opcional" (`commissionPerLot`, `withdrawalMinimum`)**: el
  esquema los define como `money.nullable()` (un objeto `{amount, currency}`
  o `null`). Decap no tiene un widget nativo de "objeto anidado opcional";
  hay que probar en la práctica qué escribe Decap cuando el campo se deja
  vacío (¿omite la clave? ¿escribe un objeto vacío?) y ajustar el esquema
  (p. ej. `.nullable().optional()`) o la configuración del campo para que
  ambos casos sigan siendo válidos. Es la pieza con más incertidumbre del
  plan — se resuelve con una prueba dirigida antes de dar por cerrada esa
  parte del formulario.
- **Extracción de textos de página**: hay que decidir, página a página, qué
  bloques de texto pasan a `src/content/pages/*.md` y cuáles se quedan en el
  `.astro` (p. ej. estructura/HTML) o en `data/categories.ts`.

## Qué requiere una acción del propietario (no lo puedo hacer yo)

- Crear la GitHub OAuth App (Settings → Developer settings → OAuth Apps) y
  guardar el Client ID / Client Secret.
- Tener (o crear) una cuenta gratuita de Cloudflare para desplegar el Worker
  de autenticación.

Ambos pasos son gratuitos y se hacen una sola vez; te doy las instrucciones
exactas cuando lleguemos a esa tarea del plan.

## Cómo se prueba sin arriesgar el sitio en producción

Todo el trabajo se hace en una rama propia; `main` y el sitio en producción
no se tocan hasta que el ciclo completo — guardar en el panel → rama →
revisión → publicar → deploy — se pruebe de principio a fin con una entrada
de prueba (editar un texto propio, o crear un bróker de mentira que luego se
borra).

## Fuera de alcance (v1)

- Gestión de roles/permisos granular (quién puede tocar qué colección) — se
  apoya en los permisos de colaborador de GitHub, no hay capa propia.
- Edición de `src/data/site.ts` / `categories.ts` desde el panel (se decide
  en la tarea de extracción si se migran o se quedan fuera).
- Vista previa en vivo del cambio antes de publicar (Decap la ofrece de
  fábrica para Markdown simple; para MDX con el layout real de la ficha de
  bróker requeriría una plantilla de previsualización a medida — se puede
  añadir más adelante, no es necesaria para que el panel funcione).
