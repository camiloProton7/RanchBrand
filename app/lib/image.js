/**
 * Optimiza una URL de imagen del CDN de Shopify añadiendo parámetros
 * de redimensionado. Shopify CDN sirve una versión más liviana de la
 * imagen cuando se pasa `width`, sin tocar el archivo original.
 *
 * @param {string} url  URL original de la imagen (cdn.shopify.com)
 * @param {number} width  Ancho objetivo en píxeles
 * @returns {string} URL con el parámetro `width` añadido
 */
export function optimizeImage(url, width = 800) {
  if (!url || !url.includes('cdn.shopify.com')) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}width=${width}`;
}
