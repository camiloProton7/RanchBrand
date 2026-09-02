const CART_KEY = 'ranch-cart';
const SHOPIFY_DOMAIN = '1caf84-4.myshopify.com';

function toNumericId(gid) {
  return gid?.match(/\/(\d+)$/)?.[1] || gid;
}

export function getCart() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

export function addToCart(variantId, qty = 1) {
  if (!variantId) return getCart();
  const cart = getCart();
  const existing = cart.find((i) => i.variantId === variantId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({variantId, qty});
  }
  window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('ranch-cart-updated'));
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
