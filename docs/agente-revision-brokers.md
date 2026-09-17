# Agente de revisión de datos de brokers

## Qué es

No hay ninguna automatización programada detrás de esto — es un **proceso
que sigo cuando el propietario me lo pide** en una sesión de Claude Code,
del tipo "revisa los datos de FP Markets" o "revisa los datos de todos los
brokers". No hace falta invocar nada especial: basta con pedirlo y seguir
este documento.

**Regla de oro: nunca publico un cambio de datos directamente.** Siempre
propongo — rama + Pull Request — para que el propietario revise y decida.

## Qué reviso por bróker

Para cada bróker a revisar, comparo el `.mdx` actual (`src/content/brokers/
<slug>.mdx`) contra su web oficial (`websiteUrl`) y, cuando aplica, el
registro público del regulador. Los campos que más cambian con el tiempo,
por orden de prioridad:

1. `minDeposit`, `spreadEurUsdFrom`, `commissionPerLot` — condiciones de
   trading.
2. `withdrawalTimeTypical`, `withdrawalFees`, `withdrawalMinimum` —
   condiciones de retirada.
3. `leverageMax`, `accountTypes` — apalancamiento y tipos de cuenta.
4. `regulators[].status` (activa/limitada/retirada) y `licenseNumber` —
   contra el registro público del regulador correspondiente (FCA Register,
   ASIC Connect, CySEC, FSCA, etc.), no solo la web del bróker.
5. `paymentMethods`, `support` (idiomas, horario, canales).

No reviso de forma rutinaria `pros`/`cons`/`bottomLine`/el cuerpo del
artículo (son contenido editorial, no datos verificables) salvo que un
cambio de datos los deje desactualizados — en ese caso lo señalo en el PR
para que el propietario decida si reescribe el texto.

## Proceso paso a paso

1. Leo el `.mdx` actual del bróker.
2. Investigo cada campo de la lista de arriba contra fuentes públicas
   (`WebFetch`/`WebSearch` sobre la web oficial y el registro del
   regulador). Anoto la fuente de cada dato que cambia.
3. Si **no hay ningún cambio real**, lo digo y no toco nada (ni siquiera
   `lastUpdated` — esa fecha refleja cuándo se revisaron los datos de
   verdad, no cuándo se ejecutó el proceso sin encontrar nada).
4. Si **hay cambios**, para cada bróker afectado:
   - Creo una rama `revision/<slug>-AAAA-MM-DD`.
   - Actualizo solo los campos que de verdad cambiaron.
   - Pongo `lastUpdated` a la fecha de hoy.
   - Hago commit y `git push` de esa rama (nunca a `main`).
   - Abro un Pull Request contra `main` con la lista de cambios y su
     fuente para cada uno.
5. Si algo publicado por la web oficial contradice claramente lo que dice
   `docs/broker-data-verification.md` sobre el nivel de confianza de ese
   dato, actualizo también esa nota en el mismo PR.
6. Al terminar, informo al propietario: brokers revisados, cuáles tienen
   PR con cambios (con el enlace), cuáles se confirmaron sin cambios.

## Lo que no hace este proceso

- No publica nada en `main` por su cuenta — el propietario decide qué PR
  fusionar y cuándo.
- No inventa datos que no pueda verificar; si una fuente no está
  disponible (web caída, registro sin ese bróker...), lo dice en vez de
  suponer.
- No es una tarea programada: si se quiere automatizar en el futuro (por
  ejemplo con un cron de GitHub Actions llamando a la API de Claude), es un
  cambio de infraestructura aparte, no algo que este documento ya cubra.
