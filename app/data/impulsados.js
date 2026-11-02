/**
 * Productos que se impulsan al añadir al carrito.
 *
 * Cambia estos handles cuando quieras empujar otra referencia. El buscador
 * toma el primer handle que exista y no sea el producto que el cliente acaba
 * de añadir; si no hay coincidencia, usa el de respaldo.
 */
export const IMPULSADOS = {
  // por colección: se usa el primero que exista
  gorras: ['gorra-1', 'gorra-bovina-the-ranch'],
  chaquetas: ['chaqueta-de-campo-utility', 'chaqueta-laredo-impermeable'],
  camisetas: ['camisa-outdoor-the-ranch', 'camisa-tipo-polo'],
  'botas-1': ['botas-gamuza-lariat', 'botas-chelsea'],

};

/**
 * Devuelve el handle a impulsar para el producto actual.
 *
 * Recorre sus colecciones en orden. Si ninguna tiene una pieza configurada
 * devuelve vacío a propósito: así se toma la primera de la misma colección
 * antes que meter una gorra en la ficha de unas botas.
 */
export function handleImpulsado(colecciones, handleActual) {
  const lista = Array.isArray(colecciones) ? colecciones : [colecciones];
  for (const c of lista) {
    const config = IMPULSADOS[c];
    if (!config) continue;
    const h = config.find((x) => x && x !== handleActual);
    if (h) return h;
  }
  return '';
}
