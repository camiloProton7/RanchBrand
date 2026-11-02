/**
 * Producto que se impulsa al añadir al carrito.
 *
 * Hoy es siempre la Camisa Tipo Polo, en todas las categorías. Para cambiarlo
 * basta con tocar estas listas: se usa el primer handle que exista y que no
 * sea el producto que el cliente acaba de añadir.
 */
export const IMPULSADOS = {
  gorras: ['camisa-tipo-polo'],
  chaquetas: ['camisa-tipo-polo'],
  camisetas: ['camisa-tipo-polo'],
  'botas-1': ['camisa-tipo-polo'],
};

/** Respaldo por si el producto no está en ninguna colección conocida. */
export const RESPALDO = ['camisa-tipo-polo'];

/**
 * Devuelve el handle a impulsar para el producto actual.
 *
 * Recorre sus colecciones en orden. Si el cliente está viendo justo el
 * producto impulsado, devuelve vacío para no ofrecerle lo mismo que ya mira;
 * en ese caso la hoja usa la primera pieza de la misma colección.
 */
export function handleImpulsado(colecciones, handleActual) {
  const lista = Array.isArray(colecciones) ? colecciones : [colecciones];
  for (const c of lista) {
    const config = IMPULSADOS[c];
    if (!config) continue;
    const h = config.find((x) => x && x !== handleActual);
    if (h) return h;
  }
  return RESPALDO.find((x) => x && x !== handleActual) || '';
}
