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

export async function buyNow(variantId, qty = 1) {
  const id = toNumericId(variantId);
  if (!id) return;
  const merchandiseId = `gid://shopify/ProductVariant/${id}`;
  const token = import.meta.env.PUBLIC_STOREFRONT_API_TOKEN;

  try {
    const res = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({
        query: `mutation CartCreate($input: CartInput!) { cartCreate(input: $input) { cart { checkoutUrl } } }`,
        variables: {
          input: {
            lines: [{merchandiseId, quantity: qty}],
          },
        },
      }),
    });
    const data = await res.json();
    const checkoutUrl = data?.data?.cartCreate?.cart?.checkoutUrl;
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    } else {
      window.location.href = `https://${SHOPIFY_DOMAIN}/cart/${id}:${qty}`;
    }
  } catch {
    window.location.href = `https://${SHOPIFY_DOMAIN}/cart/${id}:${qty}`;
  }
}
