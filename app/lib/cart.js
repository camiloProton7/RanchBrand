const CART_KEY = 'ranch-cart';
const SHOPIFY_DOMAIN = '1caf84-4.myshopify.com';

function toNumericId(gid) {
  return gid?.match(/\/(\d+)$/)?.[1] || gid;
}

export function formatPrice(amount, currency = 'COP') {
  if (!amount) return '';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function trackEvent(name, data = {}) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', name, data);
  }
}

export function getCart() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

export function addToCart(item) {
  if (!item?.variantId) return getCart();
  const cart = getCart();
  const existing = cart.find((i) => i.variantId === item.variantId);
  if (existing) {
    existing.qty += item.qty || 1;
  } else {
    cart.push({qty: 1, ...item});
  }
  window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('ranch-cart-updated'));
  trackEvent('AddToCart', {
    content_ids: [toNumericId(item.variantId)],
    content_name: item.title || '',
    content_type: 'product',
    value: Number(item.price) || 0,
    currency: 'COP',
  });
  return cart;
}

export function getCartCount() {
  return getCart().reduce((sum, i) => sum + (i.qty || 0), 0);
}

export function getCartUrl() {
  const cart = getCart();
  if (!cart.length) return `https://${SHOPIFY_DOMAIN}/cart`;
  const items = cart.map((i) => `${toNumericId(i.variantId)}:${i.qty}`).join(',');
  return `https://${SHOPIFY_DOMAIN}/cart/${items}`;
}

export function buyNow(variantId, qty = 1) {
  const id = toNumericId(variantId);
  if (!id) return;

  trackEvent('InitiateCheckout', {
    content_ids: [id],
    content_type: 'product',
    num_items: qty,
    currency: 'COP',
  });

  // Redirección inmediata (sin fetch) al checkout de Shopify.
  // /cart/{id}:{qty} agrega el producto y Shopify redirige directo al checkout
  // (verificado: 302 → /checkouts/). Evita la espera de la API en cada clic.
  window.location.href = `https://${SHOPIFY_DOMAIN}/cart/${id}:${qty}`;
}
