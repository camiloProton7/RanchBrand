/**
 * Caché en memoria para datos que cambian poco.
 *
 * El home pedía el ranking de ventas, luego los productos más vendidos y
 * después un relleno: tres viajes en cadena a Shopify antes de pintar. Con
 * esto el segundo y el tercero desaparecen casi siempre.
 *
 * Vive en el proceso; se vacía solo al reiniciar el servidor.
 */
const bolsa = new Map();

export async function recordar(clave, minutos, producir) {
  const ahora = Date.now();
  const guardado = bolsa.get(clave);

  if (guardado && guardado.vence > ahora) return guardado.valor;

  const valor = await producir();
  bolsa.set(clave, {valor, vence: ahora + minutos * 60 * 1000});
  return valor;
}

/** Solo para pruebas: borra todo lo guardado. */
export function olvidar() {
  bolsa.clear();
}
