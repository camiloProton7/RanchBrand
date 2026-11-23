/**
 * Configuración de mercado — The Ranch.
 *
 * Una sola base de código, dos tiendas:
 *   MARKET=CO  → ranch.com.co        (español, COP, envíos Colombia)
 *   MARKET=US  → ranchbrand.online   (inglés,  USD, envíos Estados Unidos)
 *
 * El mercado se lee de la variable de entorno del despliegue de Oxygen.
 * Sin variable, cae en CO: así producción de Colombia nunca cambia de comportamiento
 * aunque el despliegue de EE. UU. falle o falte configuración.
 */

const POR_DEFECTO = 'CO';

export const MERCADOS = {
  CO: {
    code: 'CO',
    language: 'ES',
    country: 'CO',
    currency: 'COP',
    locale: 'es-CO',
    domain: 'ranch.com.co',
    telefono: '+57 320 915 7343',
    whatsapp: '573209157343',
    razonSocial: null,
    envioGratisDesde: 250000,
  },
  US: {
    code: 'US',
    language: 'EN',
    country: 'US',
    currency: 'USD',
    locale: 'en-US',
    domain: 'ranchbrand.online',
    telefono: '+1 (000) 000-0000',
    whatsapp: null,
    razonSocial: 'The Ranch Brand LLC · 30 N Gould St Ste N, Sheridan, WY 82801',
    envioGratisDesde: null,
  },
};

/** Devuelve la configuración del mercado activo en este despliegue. */
export function getMarket(env) {
  const crudo = (env?.PUBLIC_MARKET || '').toUpperCase().trim();
  const clave = MERCADOS[crudo] ? crudo : POR_DEFECTO;
  return MERCADOS[clave];
}

export function esUS(env) {
  return getMarket(env).code === 'US';
}

/**
 * Mercado resuelto en tiempo de compilación.
 *
 * Cada despliegue se compila con su propia variable PUBLIC_MARKET, así el valor
 * viaja igual al servidor y al navegador (sin depender de leerla en runtime,
 * que en el cliente no existe).
 */
const _crudo = (import.meta.env.PUBLIC_MARKET || 'CO').toUpperCase().trim();
export const MARKET = MERCADOS[_crudo] ?? MERCADOS.CO;
export const IS_US = MARKET.code === 'US';
