# Verificación de datos de brokers antes de publicar

## Por qué existe este documento

Las 10 fichas de `src/content/brokers/*.mdx` fueron pobladas por agentes de
investigación. Conviene entender el nivel de confianza de cada dato:

- Los **datos estructurales** (entidades, reguladores, plataformas, tipos de
  cuenta, mercados) se investigaron a partir de fuentes oficiales y reseñas
  sectoriales de referencia.
- Las **cifras precisas** (spread EUR/USD, comisión por lote, depósito mínimo,
  apalancamiento máximo, tiempos y comisiones de retirada) se introdujeron como
  **valores conservadores "desde"**. Las webs de varios brokers devuelven 403 a
  las descargas automáticas, así que estas cifras no se pudieron confirmar
  contra la fuente primaria.
- Algunos **números de licencia offshore** son referencias reales de registro
  (no inventadas) pero **no se pudieron verificar de forma independiente** en el
  registro del regulador.

Antes de que el sitio se haga público hay que **verificar TODO esto** contra:

1. Las **webs oficiales** de cada bróker (tipos de cuenta, spreads, comisiones,
   depósito mínimo, apalancamiento, métodos de pago, plazos de retirada).
2. Los **registros públicos de los reguladores** (FCA Register, ASIC Connect,
   CySEC, FSCA, FSC Mauricio, FSA Seychelles, etc.) para cada número de licencia.

Al completar la verificación de una ficha, **actualizar su campo `lastUpdated`**
(hoy todas están en `2026-09-07`).

Los logos son wordmarks generados (texto sobre fondo transparente), no los
activos de marca oficiales: sustituir antes de publicar si se desea.

---

## Tabla resumen

| # | Bróker | Slug | `rating` | Reguladores en la ficha | Confianza global |
|---|--------|------|----------|--------------------------|------------------|
| 1 | FP Markets | `fp-markets` | 4.0 | ASIC AFSL 286354, CySEC 371/18, FSCA FSP 50926, FSA Seychelles SD130, CMA Kenia No. 103 | **Alta** |
| 2 | Exness | `exness` | 3.9 | CySEC 178/12 (limitada), FCA 730729 (limitada), FSA Seychelles SD025, FSCA 51024, CBCS Curazao 0003LSI | **Alta** |
| 3 | Vantage Markets | `vantage` | 3.8 | ASIC AFSL 428901, FCA 590299, CIMA 1383491, FSCA FSP 51268, VFSC 700271 | **Media** |
| 4 | XM | `xm` | 3.7 | CySEC 120/10, ASIC AFSL 443670, DFSA F003484, FSC Belice 000261/397, FSCA FSP 49976 | **Alta** |
| 5 | INFINOX | `infinox` | 3.6 | FCA 501057, SCB Bahamas SIA F-188, FSC Mauricio GB20025832, FSCA FSP 50506 | **Media** |
| 6 | Ultima Markets | `ultima-markets` | 3.4 | CySEC 426/23, FCA 470325, FSC Mauricio GB 23201593 | **Media** |
| 7 | Hantec Markets | `hantec-markets` | 3.4 | FCA 502635 (limitada), FSC Mauricio C114013940, FSA Seychelles SD164, ASIC AFSL 326907 | **Media** |
| 8 | FP Trading | `fp-trading` | 3.3 | FSA San Vicente 126 LLC 2019, FSC Mauricio GB26205878, FSCA FSP 52858, FSRA Santa Lucía 2026-00106 | **Baja** |
| 9 | VT Markets | `vt-markets` | 3.1 | ASIC AFSL 516246 (solo mayoristas), FSCA FSP 50865, FSC Mauricio GB23202269 | **Baja** |
| 10 | PU Prime | `pu-prime` | 3.0 | FSCA FSP 52218, FSA Seychelles SD050, FSC Mauricio GB23202672 | **Baja** |

"Confianza global" mide lo bien atestiguada que está la **estructura** del
bróker (entidades, reguladores, oferta), no su calidad como bróker. Todas las
**cifras "desde"** de todas las fichas siguen pendientes de verificar,
independientemente de la columna.

---

## 1. FP Markets

**Verificado**

- Fundado en 2005 en Sídney; grupo First Prudential Markets. No cotiza.
- Regulación de primer nivel: ASIC (Australia) y CySEC (Chipre). Cliente español
  → entidad chipriota (CySEC, MiFID/ICF).
- Plataformas: MT4, MT5, cTrader e IRESS (DMA de acciones). Categoría cTrader:
  correcta.
- Instrumentos: forex, índices, materias primas, oro, acciones (~10.000 vía
  IRESS), ETFs (~45), cripto — bien atestiguado.
- Copy trading: Myfxbook AutoTrade + copiado nativo cTrader/MT + MAM/PAMM.

**Pendiente de verificar**

- [ ] Licencia **ASIC AFSL 286354** en ASIC Connect.
- [ ] Licencia **CySEC 371/18** en el registro CySEC.
- [ ] Licencia **FSCA FSP 50926** en el registro FSCA.
- [ ] Licencia **FSA Seychelles SD130**.
- [ ] Licencia **CMA Kenia "No. 103"** — es la referencia **menos fiable** de las
  cinco (procede solo de fxscouts). Confirmar el número exacto o retirar la
  entrada.
- [ ] Entidad offshore vigente: la ficha usa Seychelles (SD130); históricamente
  el grupo usó San Vicente (First Prudential Markets Ltd, IBC 25709) y también
  Santa Lucía. Confirmar cuál onboarda hoy a LATAM.
- [ ] ¿Se aceptan **residentes en España** actualmente vía CySEC? (una reseña lo
  negaba; otra de jun-2026 lo confirmaba). Comprobar pasaporte CySEC/CNMV vigente.
- [ ] `spreadEurUsdFrom: 1.0` (Standard) y `accountTypes[Raw].spreadFrom: 0.0`.
- [ ] `commissionPerLot: 6 USD` (Raw, ida y vuelta; ~3 USD por lado).
- [ ] `minDeposit: 100 USD` (Standard/Raw) y `accountTypes[IRESS].minDeposit:
  1000 USD` + su tarifa de datos/comisión.
- [ ] `leverageMax: "1:500"` (offshore; ASIC/CySEC 1:30).
- [ ] `withdrawalTimeTypical` / `withdrawalFees` (redacción hedge, sin tarifario
  publicado).
- [ ] `support.hours: "24/7"` y lista de idiomas (subconjunto conservador de un
  "~15 idiomas"); confirmar atención en español.
- [ ] `headquarters: "Sídney, Australia"` (dirección registrada no re-verificada).

---

## 2. Exness

**Verificado**

- Fundado en 2008 (Petr Valov e Igor Lychagov); sede operativa en Limassol,
  Chipre. Grupo Exness. No cotiza.
- **Exness cerró su negocio minorista en el EEE y Reino Unido en 2019.** Las
  entidades CySEC 178/12 y FCA 730729 mantienen licencia pero **solo atienden a
  clientes profesionales/institucionales** (`status: "limitada"` en la ficha).
- Cliente minorista mundial → Exness (SC) Ltd (Seychelles FSA SD025); LATAM y
  Caribe → Exness B.V. (Curazao, CBCS).
- Plataformas: MT4, MT5, Exness Terminal (web), Exness Trade (app). Sin cTrader.
  Categoría cTrader: correcta (excluido).
- Copy trading: Exness Social Trading dentro de la app.
- Retiros instantáneos: diferenciador real y bien documentado.
- Apalancamiento "ilimitado": solo entidad Seychelles, con condiciones (equity <
  ~1.000 USD, mínimo de operaciones), baja a 1:200 en alta volatilidad, excluye
  cripto/índices/energías/acciones. Divulgado en la ficha (FAQ #3, Instrumentos,
  Veredicto).

**Pendiente de verificar**

- [ ] Licencias **CySEC 178/12**, **FCA 730729**, **FSA Seychelles SD025**,
  **FSCA 51024**, **CBCS Curazao 0003LSI** — cada una en su registro.
- [ ] Confirmar que un **residente en España no puede** abrir cuenta minorista
  (la ficha lo afirma en cons[0], FAQ #1).
- [ ] Mantener CySEC/FCA como `status: "limitada"` vs `"activa"` (autorizadas
  pero cerradas a minoristas — decisión editorial).
- [ ] `leverageMax` es una cadena compuesta: `"1:30 en la entidad UE (solo
  profesionales); hasta ilimitado en la entidad de Seychelles"`. Confirmar
  redacción deseada en el FactSheet.
- [ ] `spreadEurUsdFrom: 0.0` (Raw Spread/Zero); Standard ~0,6 pips.
- [ ] `commissionPerLot: 7 USD` (Raw Spread, hasta 3,5 USD por lado). La cuenta
  Zero puede ser más barata (por instrumento, desde ~0,05 USD/lado). Confirmar
  cifra para la tabla comparativa.
- [ ] `minDeposit: 10 USD` (Standard) y ~200 USD en Raw/Zero/Pro.
- [ ] `instruments.etfs: false` — confirmar que Exness no ofrece CFDs sobre ETFs.
- [ ] `swapFree` / `islamicAccount`: disponibilidad y posible tarifa varían por
  jurisdicción.
- [ ] Nombres legales en `groupEntities` (p. ej. "Exness (VG) Ltd" BVI, "Exness
  ZA (Pty) Ltd").
- [ ] `support.hours: "24/7"` y lista de idiomas.

---

## 3. Vantage Markets

**Verificado**

- Fundado en 2009; sede en Sídney. Marca de Vantage Global Prime / Vantage Group.
  No cotiza.
- **Sin entidad UE/MiFID.** Cliente español y LATAM → Vantage International Group
  Limited (Islas Caimán, CIMA) o Vantage Global Limited (Vanuatu, VFSC).
- Plataformas: MT4, MT5, ProTrader (propia, con TradingView). Sin cTrader.
  Categoría cTrader: correcta (excluido).
- Copy trading integrado en la app (con SL/TP para el copiador).
- Instrumentos: forex, índices, materias primas, oro, acciones, ETFs, bonos,
  cripto.

**Pendiente de verificar**

- [ ] Licencias **ASIC AFSL 428901**, **FCA FRN 590299**, **CIMA 1383491**,
  **FSCA FSP 51268**, **VFSC 700271** — cada una en su registro.
- [ ] **Alcance de la autorización FCA (FRN 590299).** La ficha la marca
  `status: "activa"` y el cuerpo dice "orientada principalmente a negocio
  institucional/mayorista (B2B)". Confirmar el permiso concreto (autorización
  plena vs representante designado / matched-principal con permisos restringidos)
  y si acepta minoristas UK.
- [ ] `spreadEurUsdFrom: 0.0` (Raw ECN).
- [ ] `commissionPerLot: 6 USD` (Raw ECN; el centro de ayuda de Vantage indica
  "USD$6 per standard lot round turn" — bien atestiguado, confirmar).
- [ ] `accountTypes[Pro ECN].minDeposit: 20000 USD` + su comisión (modelado
  vagamente; confirmar umbral y tarifa o eliminar la tercera fila de cuenta).
- [ ] `minDeposit: 50 USD` (Standard STP / Raw ECN).
- [ ] `leverageMax: "1:500"` (VFSC offshore; ASIC/FCA 1:30).
- [ ] `withdrawalTimeTypical` / `withdrawalFees` (redacción hedge).
- [ ] `support.hours: "24/5"` y lista de idiomas; confirmar atención en español.
- [ ] `headquarters: "Sídney, Australia"` (dirección registrada no re-verificada).
- [ ] Nombres legales en `groupEntities` (esp. "Vantage Markets (Pty) Ltd" para
  FSCA FSP 51268).

---

## 4. XM

**Verificado**

- Fundado en 2009; sede en Limassol, Chipre. Grupo Trading Point (Trading Point
  Holdings Ltd). No cotiza.
- Cliente UE/EEE → Trading Point of Financial Instruments Ltd (CySEC 120/10,
  MiFID/ICF). México / Chile / Argentina y la mayor parte de LATAM → XM Global
  Limited (Belice FSC).
- Plataformas: MT4, MT5, XM App (propia, TradingView) + XM Copy Trading. Sin
  cTrader, sin API. Categoría cTrader: correcta (excluido).
- Instrumentos: forex, índices, materias primas, oro, 1.200+ acciones CFD, ETFs
  CFD (añadidos hace poco, sin comisión), cripto CFD (solo entidad XM Global, no
  UE).
- Comisión de inactividad: 10 USD/mes tras 90 días — divulgada en la ficha
  (cons, FAQ #5, Costes, `withdrawalFees`).

**Pendiente de verificar**

- [ ] Licencias **CySEC 120/10**, **ASIC AFSL 443670**, **DFSA F003484**,
  **FSC Belice 000261/397**, **FSCA FSP 49976** — cada una en su registro.
- [ ] **Entidad ASIC (AFSL 443670)**: varias fuentes de 2026 confirman que sigue
  activa y onboarda minoristas australianos; hacer una comprobación final en el
  registro.
- [ ] `spreadEurUsdFrom: 0.7` (Zero) y spreads "desde" de Standard (2,0) / Ultra
  Low (1,1) — valores de escaparate.
- [ ] `commissionPerLot: 7 USD` (Zero, ~3,5 USD/lado) — confirmar por instrumento.
- [ ] `minDeposit: 5 USD` (Standard/Ultra Low/Zero); Shares ~10.000 USD.
- [ ] `leverageMax: "1:1000"` (XM Global / Belice; UE y Australia 1:30).
- [ ] Importe/disparador de la **comisión de inactividad** (10 USD / 90 días).
- [ ] `instruments.crypto: true` — disponibilidad depende de la entidad (no UE).
- [ ] `support.hours: "24/7"` y "30+ idiomas" (lista es subconjunto conservador).
- [ ] `paymentMethods` incluye "Métodos de pago locales (Latinoamérica)" — la
  lista real varía por país; sin PayPal/Apple Pay.
- [ ] `headquarters: "Limasol, Chipre"` — nota: la ficha escribe "Limasol" (no
  "Limassol") en `headquarters` y en el cuerpo; unificar grafía con Exness.

---

## 5. INFINOX

**Verificado**

- Fundado en 2009 (CEO Robert Berkeley); sede en Londres. Opera bajo IX Capital
  Group Limited. No cotiza.
- Solo residentes en Reino Unido → INFINOX Capital Ltd (FCA). Resto (España /
  LATAM / Asia / África) → SCB Bahamas o FSC Mauricio.
- Plataformas: MT4, MT5 + app IX Social (copy trading). Sin cTrader. Categoría
  cTrader: correcta (excluido).
- Instrumentos: forex, índices, materias primas/energías, oro, ~750 acciones
  CFD, cripto CFD. Sin ETFs, sin contado.
- Tipos de cuenta: STP (sin comisión) + ECN (raw + comisión).

**Pendiente de verificar**

- [ ] Licencia **FCA 501057** (company no. 06854853) en FCA Register.
- [ ] Licencia **SCB Bahamas "SIA F-188"** (aparece como "SIA F-188" y "SIA-F188"
  en distintas fuentes).
- [ ] Licencia **FSC Mauricio GB20025832**.
- [ ] Licencia **FSCA Sudáfrica FSP 50506**.
- [ ] `spreadEurUsdFrom: 0.8` (STP) y `accountTypes[ECN].spreadFrom: 0.0` —
  terceros citan 0,8-0,9.
- [ ] `accountTypes[ECN].commission: "Desde 6 USD por lote (ida y vuelta)"` —
  fuentes citan 6 USD, 7,5 USD o 3,5 USD (una vía). `commissionPerLot: null`
  (modela la cuenta STP estándar).
- [ ] `minDeposit: 50 USD` (ambas cuentas) — INFINOX FAQ dice 50 USD; terceros
  dan un rango de 1 a 100 USD.
- [ ] `leverageMax: "1:500"` — retail offshore; algunos citan hasta 1:1000. FCA
  1:30.
- [ ] `withdrawalTimeTypical` / `withdrawalFees` — INFINOX no publica tarifario;
  redacción hedge.
- [ ] `support.languages` (subconjunto conservador de "~15 idiomas"); `hours:
  "24/5"`. Reseñas señalan respuestas lentas.
- [ ] `founded: 2009` y `headquarters` (Birchin Court, 20 Birchin Lane, Londres,
  según datos derivados del FCA Register).

---

## 6. Ultima Markets

**Verificado**

- Entidad constituida en 2016; marca impulsada desde ~2022. Sede en Ebene
  Cybercity, Mauricio. No cotiza.
- Cliente español → entidad chipriota CySEC 426/23 (MiFID/ICF). México / Chile /
  Argentina y resto → Ultima Markets Ltd (Mauricio FSC).
- **Entidad FCA verificada**: FRN **470325 = "ULTIMA MARKETS UK LIMITED"**
  (ex-Tiger Brokers (UK) Ltd; company 06249714, incorporada 16-may-2007). Ultima
  compró Tiger Brokers UK en nov-2024; aprobación de cambio de control de la FCA
  en jul-2025. Onboarding minorista UK en despliegue desde 2026.
- **Miembro de The Financial Commission** — fondo de compensación hasta 20.000
  EUR por reclamación.
- Plataformas: MT4, MT5 + UM App + UM Social (copy trading). Sin cTrader.
- Instrumentos: forex (60+), metales/oro, energías, índices, acciones CFD, ETFs
  CFD, Pre-IPO, cripto CFD ("250+ instrumentos").

**Pendiente de verificar**

- [ ] **Alcance de la autorización FCA 470325** — confirmar en el FCA Register
  qué permisos concretos tiene (empresa de inversión plena vs restringida) antes
  de apoyarse en ello en marketing.
- [ ] Licencia **CySEC 426/23** en el registro CySEC + nombre legal de la
  entidad chipriota (en `groupEntities` está genérico).
- [ ] Licencia **FSC Mauricio "GB 23201593"** (con o sin espacio).
- [ ] `accountTypes[ECN].minDeposit: 500 USD` — **fuentes en conflicto**:
  daytrading dice 500 USD, una búsqueda agregada decía 50 USD.
- [ ] `commissionPerLot: 6 USD` (ECN, ~3 USD/lado). daytrading cita "ECN 5 USD" /
  "Pro ECN 3 USD" (por lado vs ida y vuelta poco claro).
- [ ] `founded: 2016` (entidad) vs ~2022 (marca) — confirmar el año a mostrar.
- [ ] `headquarters: "Ebene, Mauricio"` — inferido de la dirección registrada.
- [ ] `spreadEurUsdFrom: 0.0` (ECN); Standard ~1,0 pip.
- [ ] `leverageMax: "1:30 en la entidad de la UE; hasta 1:2000 en la entidad de
  Mauricio"`.
- [ ] `instruments.crypto: true` — no estaba en la lista explícita de daytrading.
- [ ] `support.hours: "24/5"` y lista de idiomas; Telegram como canal.
- [ ] `withdrawalTimeTypical` (1-2 h tarjetas/cripto; 2-5 días transferencia).
- [ ] Fondo de The Financial Commission: confirmar membresía y términos vigentes
  (20.000 EUR por caso).
- [ ] `ratingBreakdown.regulation: 3.5` es un juicio (CySEC + FCA + Financial
  Commission por encima de pares offshore); revisar.

---

## 7. Hantec Markets

**Verificado**

- Grupo matriz: **Hantec Group**, fundado en 1990, Hong Kong (fundador Tang Yu
  Lap). La marca minorista "Hantec Markets" se data hacia 2009. No cotiza.
- **La entidad FCA (Hantec Markets Limited, FRN 502635) no admite clientes
  minoristas nuevos** — institucional. Ficha: `status: "limitada"`. España /
  LATAM → Hantec Markets Ltd (Mauricio FSC C114013940) o Hantec (Seychelles)
  Services Limited (FSA SD164).
- **No hay licencia FSCA (Sudáfrica) propia de Hantec** — SA se sirve vía la
  entidad de Mauricio (correctamente NO añadida a `regulators`).
- Plataformas: MT4, MT5 + Hantec Trader + Hantec Social (copy trading). Sin
  cTrader. Categoría cTrader: correcta (excluido).

**Pendiente de verificar**

- [ ] Licencia **FCA 502635** (verificada vía enlace al FCA Register durante la
  investigación; reconfirmar y el estado de onboarding minorista).
- [ ] Licencia **FSC Mauricio C114013940**.
- [ ] Licencia **FSA Seychelles SD164** (hantec.com/licenses).
- [ ] Licencia **ASIC AFSL 326907** (emitida 2008-08-27, Sídney — confirmada en
  búsqueda de licenciatarios ASIC; reconfirmar).
- [ ] `founded: 2009` (marca) vs 1990 (grupo) — confirmar el año a mostrar.
- [ ] `spreadEurUsdFrom: 0.2` y `accountTypes[Standard].spreadFrom: 0.2` — cifra
  de escaparate; el EUR/USD típico real es mayor.
- [ ] `accountTypes`: modelado como Standard (~100 USD) + Cent (10 USD, spread
  1,2). Terceros mencionan "Pro"/"Global"/"Professional (1.000 USD)" — la
  gama actual está sin verificar.
- [ ] `minDeposit: 10 USD` (Cent) — algunos citan 100/200 USD.
- [ ] `commissionPerLot: null` — confirmar que no hay cuenta ECN/raw con comisión.
- [ ] `scalpingAllowed: false` — **fuentes en conflicto** (fxscouts "permitido";
  daytrading "no permitido"). Puesto conservador; confirmar en T&C.
- [ ] `leverageMax: "1:500"` (offshore; FCA/ASIC 1:30). VFSC citaba 1:1000.
- [ ] `listedCompany: false` — un extracto afirmaba cotización en HKEX (probable
  confusión con otra empresa del grupo); confirmar.
- [ ] `headquarters: "Londres, Reino Unido"` (5-6 Newbury Street, EC1A 7HU).
- [ ] `support.languages` y disponibilidad de español; `hours: "24/5"`.
- [ ] `withdrawalTimeTypical` / `withdrawalFees` — sin tarifario publicado.
- [ ] Entidad Vanuatu VFSC ("Hantec Markets (V) Company Limited") existe pero NO
  está en `regulators` (decisión: dejar las 4 mejor atestiguadas).

---

## 8. FP Trading

**Verificado**

- **FP Trading es la antigua entidad offshore del grupo FP Markets**: FP Markets
  LLC (San Vicente y las Granadinas) se renombró **FP Trading LLC, efectivo el 28
  de marzo de 2026**, y opera desde entonces como marca independiente. Conserva
  solo las licencias offshore del grupo (SVG FSA, Mauricio FSC, Sudáfrica FSCA,
  Santa Lucía FSRA); **las licencias ASIC y CySEC se quedan en la sociedad FP
  Markets**, separada.
- El registro SVG "126 LLC 2019" corresponde a la antigua FP Markets LLC.
- Ninguna licencia de primer nivel → `ratingBreakdown.regulation: 2.5`.
- Plataformas: MT4, MT5, cTrader. Sin entidad UE → sin topes ESMA.

**Pendiente de verificar**

- [ ] Licencia **FSA San Vicente "126 LLC 2019"** (número de registro de la
  antigua FP Markets LLC).
- [ ] Licencia **FSC Mauricio GB26205878**.
- [ ] Licencia **FSCA Sudáfrica FSP 52858**.
- [ ] Licencia **FSRA Santa Lucía 2026-00106**.
- [ ] `founded: 2019` — **fuentes en conflicto**: reseñas dicen 2021; una 2019
  (reg SVG "126 LLC 2019"); otra 2025. La ficha usa 2019 (juicio tras confirmar
  el rebrand). Confirmar el año a mostrar.
- [ ] `headquarters: "Kingstown, San Vicente y las Granadinas"` — **incierto**:
  otras fuentes citan Dubái o Mauricio. Confirmar.
- [ ] Confirmar que **no hay** relación corporativa vigente entre FP Trading y la
  sociedad FP Markets más allá del origen común (la ficha lo describe como
  "marca independiente desde marzo de 2026").
- [ ] `instruments.stocks: true` y `instruments.etfs: true` — **fuentes en
  conflicto** (investing.com/myfxbook: "sin acciones ni ETFs"; bestbrokers /
  Finance Magnates: "1.000+ acciones CFD" y "40+ ETF CFD"). Si es incorrecto,
  poner ambos a `false`.
- [ ] `spreadEurUsdFrom: 1.0` (Standard) / `accountTypes[Raw].spreadFrom: 0.1`.
- [ ] `commissionPerLot: 6 USD` (Raw, ~3 USD/lado). Confirmar cifra exacta.
- [ ] `minDeposit: 100 USD` (consistente entre fuentes).
- [ ] `leverageMax: "1:500"` (forex, offshore).
- [ ] `withdrawalTimeTypical` ("~1 día hábil") / `withdrawalFees`.
- [ ] `support.languages` ("11 idiomas" reclamados; inclusión de español
  asumida); `hours: "24/5"`.
- [ ] Seguro de Lloyd's "hasta 1.000.000 USD" y fondo de The Financial Commission
  "20.000 EUR" — son reclamos de marketing repetidos por reseñas; verificar antes
  de darles peso (`pros[2]`).

---

## 9. VT Markets

**Verificado**

- Fundado en 2015; habitualmente asociado a Sídney. Marca del grupo VT Markets.
  No cotiza.
- **Entidad ASIC AFSL 516246 (VT Global Pty Ltd) = solo clientes mayoristas e
  institucionales**, no minoristas. VT Markets Pty Ltd (AFS rep. 001260828) es
  representante autorizado. Fuente: pie legal de vtmarkets.com.au + aviso
  publicado de ASIC.
- **La FCA británica mantiene a VT Markets en su lista de advertencias desde el
  21/06/2023** (última actualización 02/09/2025) por ofrecer/promocionar
  servicios sin autorización en el Reino Unido. Es la **firma real operando su
  dominio oficial** (no un clon). Ya divulgado en la ficha (Visión general, un
  `cons`, Veredicto).
- Sin entidad UE. España / LATAM → VT Markets Ltd (Mauricio FSC) o registro SVG.
- Plataformas: MT4, MT5 + app propia con TradingView. Sin cTrader. Categoría
  cTrader: correcta (excluido).
- Copy trading: "Vtrade" / social trading **prestado por un tercero** (divulgado
  en la ficha).

**Pendiente de verificar**

- [ ] Licencia **ASIC AFSL 516246** en ASIC Connect (una fuente citaba
  erróneamente "428901", que es de Vantage). Confirmar número, titular (VT Global
  Pty Ltd) y alcance mayorista.
- [ ] Licencia **FSCA Sudáfrica FSP 50865**.
- [ ] Licencia **FSC Mauricio GB23202269**.
- [ ] `leverageMax` es cadena compuesta: `"1:500 en la entidad offshore; la
  entidad australiana (ASIC) solo opera con clientes mayoristas..."`. globegain
  cita 1:1000 global; se usó 1:500. Confirmar.
- [ ] `commissionPerLot: 6 USD` (Raw ECN, ~3 USD/lado; tabla globegain "$6/lot" —
  bien atestiguado, confirmar).
- [ ] `accountTypes`: Cent (50 USD), Standard STP (100 USD), Raw ECN (modelado a
  100 USD; algunas fuentes 50, otras 500). `minDeposit` top-level = 50 (Cent).
- [ ] `spreadEurUsdFrom: 0.0` (Raw ECN); Standard ~1,2 pips.
- [ ] `founded: 2015` (consistente entre fuentes).
- [ ] `headquarters: "Sídney, Australia"` (dirección Kent Street; la sociedad
  matriz / dónde reside la entidad operadora no está claramente divulgada —
  `ownership` dice "asociada a Sídney").
- [ ] `instruments.crypto` / `etfs` / bonos — de la lista de globegain.
- [ ] `copyTrading: true` — "Vtrade" es un servicio social de un tercero; el
  copy trading nativo es modesto. Defendible pero se puede suavizar.
- [ ] `support.hours: "24/5"` (asumido de la norma sectorial; no firmemente
  indicado) y lista de idiomas (globegain lista español explícitamente).
- [ ] `withdrawalTimeTypical` / `withdrawalFees` — descripción sectorial estándar.

---

## 10. PU Prime

**Verificado**

- Fundado en 2015 como **"Pacific Union"**, renombrado a **PU Prime hacia 2020**.
  Sede habitualmente citada en Mauricio. No cotiza.
- **Todas las entidades disponibles son offshore.** Sin entidad UE/MiFID, sin
  autorización CNMV, sin entidad tier-1 operativa para minoristas → LATAM vía
  Seychelles (FSA) o Mauricio (FSC); también entidad SVG (PU Prime LLC, en prosa
  y `groupEntities`, no en `regulators`). Esto fija `regulation: 2.0`.
- Plataformas: MT4, MT5 + PU WebTrader + PU Prime app + PU Social (copy trading).
  Sin cTrader. Categoría cTrader: correcta (excluido).
- Apalancamiento 1:1000, reducido automáticamente a 1:500 por encima de 20.000
  USD de equity — divulgado (cuerpo, FAQ #4).

**Pendiente de verificar**

- [ ] Licencia **FSCA Sudáfrica FSP 52218**.
- [ ] Licencia **FSA Seychelles SD050**.
- [ ] Licencia **FSC Mauricio GB23202672**.
- [ ] `founded: 2015` (Pacific Union) vs ~2020 (marca PU Prime) — confirmar el
  año a mostrar.
- [ ] `headquarters: "Port Louis, Mauricio"` — las reseñas dicen "Mauricio";
  Port Louis es una **inferencia**. Pacific Union tuvo presencia en Sídney.
  Confirmar.
- [ ] `spreadEurUsdFrom: 0.0` (Prime); Cent/Standard spread 1,9 (compareforex) —
  otras fuentes dan "desde 1,3".
- [ ] `commissionPerLot: 2 USD` (cuenta **ECN**, ~1 USD/lado, requiere 10.000
  USD). La cuenta **Prime** es 7 USD ida y vuelta (~3,5 USD/lado, requiere 1.000
  USD). Confirmar qué cifra debe mostrar la tabla comparativa.
- [ ] `accountTypes` depósitos mínimos: Cent 20 USD / Standard 50 USD / Prime
  1.000 USD / ECN 10.000 USD — de compareforexbrokers; algunas fuentes dan
  mínimos de Prime más bajos.
- [ ] `leverageMax: "1:1000"` (offshore, cifra publicada por PU Prime).
- [ ] `withdrawalTimeTypical` (1-3 días monederos/tarjeta; hasta 7 días
  transferencia) / `withdrawalFees`.
- [ ] `support.hours: "24/7"` y "18 idiomas" (lista es subconjunto conservador).
- [ ] Entidades históricas/adicionales **no incluidas** en `regulators`: ASIC
  AFSL 410681 (Pacific Union Pty Ltd — estado minorista incierto) y CMA UAE
  20200000388 (feb-2026, sirve a Oriente Medio). Decidir si se añaden.
- [ ] Nombres legales en `groupEntities`.

---

## Notas transversales

- **Exness**: entidades CySEC (178/12) y FCA (730729) cerradas a minoristas
  nuevos de la UE/UK desde 2019; solo profesionales/institucionales. Ficha:
  `status: "limitada"`.
- **Hantec Markets**: entidad FCA (502635) sin onboarding minorista nuevo. Ficha:
  `status: "limitada"`.
- **VT Markets**: en la **lista de advertencias de la FCA desde jun-2023**
  (firma real, no clon). Ya divulgado en la ficha. Entidad ASIC = solo
  mayoristas/institucionales.
- **FP Trading**: entidad offshore del grupo FP Markets **renombrada de FP
  Markets LLC (SVG) el 28-mar-2026**. No hereda ASIC ni CySEC.
- **Ultima Markets**: entidad FCA (470325) adquirida a Tiger Brokers UK
  (aprobación FCA jul-2025); onboarding minorista UK en despliegue desde 2026.
  Verificar el alcance de los permisos antes de usarlo en marketing.
- **XM / Exness / Vantage / VT / Ultima**: varios `leverageMax` y `regulators`
  usan cadenas compuestas o `status` matizado; revisar la redacción en el
  FactSheet de cada ficha.
- **Grafía "Limassol"**: `exness.mdx` usa "Limassol"; `xm.mdx` usa "Limasol".
  Unificar.

---

## Cierre

- `src/pages/metodologia.astro` ya explica que las fuentes son las webs oficiales
  de los brokers y los registros públicos de los reguladores, y que "las
  condiciones de los brokers cambian" con fecha de última actualización por
  review.
- `src/pages/aviso-legal.astro` ya incluye el aviso de que el contenido es
  divulgativo, no es asesoramiento financiero, y de que antes de operar hay que
  "verificar las condiciones" en la fuente oficial.
- Cada ficha `.mdx` ya lleva en "Costes y comisiones" la frase "confirma las
  cifras actuales en la web oficial de <Bróker> antes de operar".
- **Acción pendiente**: al completar la verificación de cada bróker contra su web
  oficial y los registros de los reguladores, **actualizar el campo
  `lastUpdated`** de esa ficha (todas están hoy en `2026-09-07`).
