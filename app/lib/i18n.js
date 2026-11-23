/**
 * Textos de interfaz por mercado.
 *
 * Solo lo que se ve en pantalla y no viene de Shopify (títulos de producto, descripciones
 * y colecciones se traducen en la tienda con la API de traducciones, no aquí).
 *
 * Regla de uso: `t('clave', market)` devuelve el texto del mercado activo. Si falta una
 * clave en inglés, devuelve el español — nunca una cadena vacía, para que un texto sin
 * traducir se vea y se pueda corregir, en vez de romper la página.
 */

const ES = {
  'nav.gorras': 'Gorras',
  'nav.camisas': 'Camisas',
  'nav.chaquetas': 'Chaquetas',
  'nav.botas': 'Botas',
  'nav.mujer': 'Mujer',
  'nav.accesorios': 'Accesorios',

  'product.addToCart': 'Añadir al carrito',
  'product.buyNow': 'Comprar ahora',
  'product.soldOut': 'Agotada',
  'product.selectSize': 'Elige tu talla',
  'product.sizeGuide': 'Guía de tallas',
  'product.shipping': 'Envío a todo Colombia',
  'product.returns': 'Cambios y devoluciones sin complicación',
  'product.payment': 'Paga con PSE, Nequi, tarjeta o contraentrega',
  'product.alsoBought': 'Los clientes también eligieron',
  'product.swipe': 'Desliza →',
  'product.added': 'Añadido al carrito',

  'cart.title': 'Tu carrito',
  'cart.empty': 'Tu carrito está vacío',
  'cart.subtotal': 'Subtotal',
  'cart.checkout': 'Ir a pagar',
  'cart.continue': 'Seguir comprando',
  'cart.remove': 'Quitar',

  'footer.tagline': 'No seguimos modas, las marcamos.',
  'footer.joinTitle': 'Únete al ranch',
  'footer.shop': 'Tienda',
  'footer.help': 'Ayuda',
  'footer.legal': 'Legal',
  'footer.shipping': 'Envíos',
  'footer.returns': 'Devoluciones',
  'footer.contact': 'Contacto',
  'footer.privacy': 'Privacidad',
  'footer.terms': 'Términos',
  'footer.rights': 'Todos los derechos reservados',
};

const EN = {
  'nav.gorras': 'Hats',
  'nav.camisas': 'Shirts',
  'nav.chaquetas': 'Jackets',
  'nav.botas': 'Boots',
  'nav.mujer': 'Women',
  'nav.accesorios': 'Accessories',

  'product.addToCart': 'Add to cart',
  'product.buyNow': 'Buy now',
  'product.soldOut': 'Sold out',
  'product.selectSize': 'Select your size',
  'product.sizeGuide': 'Size guide',
  'product.shipping': 'Ships across the United States',
  'product.returns': 'Easy returns and exchanges',
  'product.payment': 'Pay with card, Apple Pay or Google Pay',
  'product.alsoBought': 'Customers also chose',
  'product.swipe': 'Swipe →',
  'product.added': 'Added to cart',

  'cart.title': 'Your cart',
  'cart.empty': 'Your cart is empty',
  'cart.subtotal': 'Subtotal',
  'cart.checkout': 'Checkout',
  'cart.continue': 'Keep shopping',
  'cart.remove': 'Remove',

  'footer.tagline': "We don't follow trends. We set them.",
  'footer.joinTitle': 'Join the ranch',
  'footer.shop': 'Shop',
  'footer.help': 'Help',
  'footer.legal': 'Legal',
  'footer.shipping': 'Shipping',
  'footer.returns': 'Returns',
  'footer.contact': 'Contact',
  'footer.privacy': 'Privacy',
  'footer.terms': 'Terms',
  'footer.rights': 'All rights reserved',
};

const DICCIONARIOS = {ES, EN};

/**
 * Traduce una clave al idioma del mercado.
 * @param {string} clave
 * @param {{language?: string}} market
 */
export function t(clave, market) {
  const idioma = market?.language === 'EN' ? 'EN' : 'ES';
  return DICCIONARIOS[idioma][clave] ?? DICCIONARIOS.ES[clave] ?? clave;
}
