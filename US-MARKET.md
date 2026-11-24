# The Ranch US — estado y migración a tienda nueva

Última actualización: 2026-11-24

## Qué está hecho y dónde vive

**Código (se conserva, no se pierde):**
- Repo: `camiloProton7/RanchBrand`
- Rama: `feat/us-market` (subida a GitHub, 4 commits)
- Home replicada de Colombia con textos en inglés: 138 textos en 28 archivos
- Idioma decidido por build: `PUBLIC_MARKET=US`
- Archivos clave: `app/lib/market.js`, `app/lib/lang.js`, `app/lib/i18n.js`, `app/lib/nav.js`,
  `app/root.jsx` (lang dinámico + sin franja Black Friday), `app/routes/_index.jsx`, `app/components/SiteHeader.jsx`

**Despliegue actual (temporal, queda en la tienda vieja):**
- Tienda Shopify: `1caf84-4.myshopify.com`
- Storefront Hydrogen: `The Ranch US` — id `1000186454`
- Deployment producción en Oxygen, compilado con `PUBLIC_MARKET=US`
- Dominio `ranchbrand.online` apuntando ahí

**Por qué no está público:** el plan Grow/Advanced permite 1 entorno público y Colombia ya lo usa.
El entorno Production de `The Ranch US` quedó privado → todo visitante cae en login de Shopify.

## Decisión tomada

Abrir una **tienda Shopify nueva en plan Basic ($25/mes)** para EE. UU. Razones:

1. Cada tienda tiene su propio entorno público → el sitio puede publicarse
2. Solo una tienda con entidad/banco en EE. UU. puede habilitar **USD** y **Shopify Payments US**
3. Separa catálogo, precios, impuestos, pedidos y píxel
4. Colombia queda intacta en Grow $65

Descartado: subir a Advanced ($399) — sigue con 1 entorno público y no habilita USD.
Descartado: Plus (prueba 2 meses a $399, luego $2.300) — solo se paga con ~$279.000 USD/mes.

## Qué se necesita cuando exista la tienda nueva

1. **Dominio de la tienda**: `xxxx.myshopify.com`
2. **Storefront Hydrogen** creado en el canal Hydrogen de la tienda nueva (lo crea Camilo en el admin)
3. **Token público de Storefront API** de ese storefront (variable de entorno, nunca en el repo)
4. **Productos que cruzan**: lista de referencias y precios en USD
5. **Zona de envío EE. UU.** con tarifas reales (DHL desde Colombia o bodega Miami)
6. **Shopify Payments US** o Stripe (requiere LLC al día: reporte anual, operating agreement, dirección física)

## Pasos técnicos para desplegar en la tienda nueva

```bash
cd ~/projects/RanchBrand
git checkout feat/us-market
git pull
npx shopify hydrogen link --storefront "The Ranch US" --force   # elegir la tienda NUEVA
export PUBLIC_STORE_DOMAIN=xxxx.myshopify.com
PUBLIC_MARKET=US npx shopify hydrogen deploy --force --env production
```

Luego en el admin de la tienda nueva:
- Hydrogen → The Ranch US → Configuración → **Entornos** → Production → Visibilidad **Público**
- Configuración → Dominios → `ranchbrand.online` → destino **The Ranch US (Production)** como primario
- `www.ranchbrand.online` → mismo destino, redirigiendo al principal

## Verificación

```bash
curl -sI https://ranchbrand.online/ | grep -iE "^HTTP|powered-by"
# debe decir: HTTP/2 200 y powered-by: Shopify, Oxygen
curl -s https://ranchbrand.online/ | grep -c "We did not build"
# debe ser >= 1
```

## Bloqueos que NO resuelve la tienda nueva

- **Stripe / Shopify Payments US**: LLC en Wyoming delinquent desde agosto, nombre IRS
  (`RANCH BRAND LLC`) distinto al de Northwest (`The Ranch Brand LLC`), sin operating agreement,
  sin dirección física en EE. UU. Form 5472/1120 pendiente.
- **Envío a EE. UU.**: no hay tarifas definidas ni decisión de operación (DHL vs bodega Miami).
- **Catálogo en inglés**: títulos y descripciones viven en Shopify; hay que traducirlos en la tienda nueva.

## Precios definidos para EE. UU.

- Gorra: **$79 USD**
- Chaqueta: **$169–179 USD**
- Chaleco y saco: **$89 USD**
