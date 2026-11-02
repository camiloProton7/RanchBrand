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

  // si la colección no está en la lista
  respaldo: ['gorra-1'],
};

/** Devuelve el handle a impulsar para la colección del producto actual. */
export function handleImpulsado(coleccion, handleActual) {
  const lista = IMPULSADOS[coleccion] || IMPULSADOS.respaldo;
  return lista.find((h) => h && h !== handleActual) || '';
}
