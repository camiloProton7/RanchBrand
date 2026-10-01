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

/**
 * Genera un `srcset` con varios anchos para que el navegador elija el más
 * adecuado según el tamaño real en pantalla y la densidad del dispositivo.
 * Sin esto, un móvil descarga una imagen de 480px para un recuadro de ~180px.
 *
 * @param {string} url  URL original de la imagen (cdn.shopify.com)
 * @param {number[]} widths  Anchos candidatos en píxeles
 * @returns {string|undefined} valor para el atributo srcSet
 */
export function imageSrcSet(url, widths = [180, 240, 360, 480, 720, 960]) {
  if (!url || !url.includes('cdn.shopify.com')) return undefined;
  return widths.map((w) => `${optimizeImage(url, w)} ${w}w`).join(', ');
}
