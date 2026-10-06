import {useEffect, useMemo, useRef, useState} from 'react';
import {Link, useLoaderData, useRouteLoaderData} from 'react-router';
import {addToCart, buyNow} from '~/lib/cart';
import {optimizeImage, imageSrcSet} from '~/lib/image';
import {Analytics} from '@shopify/hydrogen';
import {
  TrustBadges,
  SizeGuide,
  SizeTable,
  parseTablaMedidas,
  isApparel,
  ProductAccordion,
  RecommendedProduct,
  PaymentTrust,
} from '~/components/ProductExtras';
import {SocialProof} from '~/components/SocialProof';
import Personalizador from '~/components/Personalizador';
import productStyles from '~/styles/product.css?url';
import persoStyles from '~/styles/perso.css?url';

export const meta = ({data}) => {
  const product = data?.product;
  const title = product?.title ? `${product.title} — The Ranch` : 'Producto — The Ranch';
  const description = product?.description?.slice(0, 160) || 'The Ranch — Colombia';
  const url = product?.handle
    ? `https://ranch.com.co/products/${product.handle}`
    : 'https://ranch.com.co';
  const image = product?.featuredImage?.url || product?.images?.nodes?.[0]?.url;
  const items = [
    {title},
    {name: 'description', content: description},
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
    {property: 'og:type', content: 'product'},
    {property: 'og:url', content: url},
    {name: 'twitter:card', content: 'summary_large_image'},
    {tagName: 'link', rel: 'canonical', href: url},
  ];
  if (image) {
    items.push({property: 'og:image', content: image});
  }
  if (product) {
    const price = product.priceRange?.minVariantPrice?.amount;
    const currency = product.priceRange?.minVariantPrice?.currencyCode || 'COP';
    items.push({
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        description: product.description,
        image: product.images?.nodes?.map((i) => i.url) || [],
        sku: product.handle,
        brand: {'@type': 'Brand', name: 'The Ranch'},
        offers: {
          '@type': 'Offer',
          priceCurrency: currency,
          price: price,
          availability: 'https://schema.org/InStock',
          url: `https://ranch.com.co/products/${product.handle}`,
        },
      },
    });
  }
  return items;
};

export const links = () => [
  {rel: 'stylesheet', href: productStyles},
  {rel: 'stylesheet', href: persoStyles},
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Rye&family=Playfair+Display:wght@700&family=Great+Vibes&family=Oswald:wght@600&display=swap',
  },
];

// Full-page cache de Oxygen para páginas de producto (estáticas).
export const headers = () => ({
  'Oxygen-Cache-Control':
    'public, max-age=300, s-maxage=300, stale-while-revalidate=3600',
  Vary: 'Accept-Encoding, Accept-Language',
});

const PRODUCT_QUERY = `#graphql
  query Product($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      vendor
      description
      productType
      tags
      metafield(namespace: "custom", key: "tabla_medidas") { value }
      featuredImage {
        url
        altText
        width
        height
      }
      images(first: 50) {
        nodes {
          url
          altText
          width
          height
        }
      }
      priceRange { minVariantPrice { amount currencyCode } }
      compareAtPriceRange { minVariantPrice { amount } }
      variants(first: 250) {
        nodes {
          id
          availableForSale
          quantityAvailable
          selectedOptions { name value }
          price { amount currencyCode }
          image { url altText }
        }
      }
    }
  }
`;

const RELATED_QUERY = `#graphql
  query RelatedProducts($handle: String!) {
    collection(handle: $handle) {
      products(first: 12) {
        nodes {
          id
          title
          handle
          featuredImage {
            url
            altText
          }
          priceRange {
            minVariantPrice { amount currencyCode }
          }
          compareAtPriceRange {
            minVariantPrice { amount }
          }
          variants(first: 10) {
            nodes {
              id
              selectedOptions { name value }
              price { amount currencyCode }
            }
          }
        }
      }
    }
  }
`;

const COMBO_QUERY = `#graphql
  query ComboProducts($handle: String!) {
    collection(handle: $handle) {
      products(first: 50) {
        nodes {
          id
          title
          handle
          featuredImage {
            url
            altText
          }
          variants(first: 1) {
            nodes {
              id
            }
          }
        }
      }
    }
  }
`;

const CAMISA_COMBO_QUERY = `#graphql
  query CamisaCombo($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      featuredImage {
        url
        altText
      }
      images(first: 50) {
        nodes {
          url
          altText
          width
          height
        }
      }
      variants(first: 50) {
        nodes {
          id
          title
          availableForSale
          selectedOptions { name value }
          image {
            url
            altText
          }
        }
      }
    }
  }
`;

const TRUSTOO_SHOP_ID = '67813867760';

function mapReview(raw) {
  const resource = (raw.resources || []).find((x) =>
    (x.src || x.thumb_src || '').trim(),
  );
  const photo =
    (resource && (resource.src || resource.thumb_src)) ||
    raw.product_image_src ||
    raw.corresponding_product?.product_image ||
    null;
  return {
    name: (raw.author || '').trim(),
    product: raw.corresponding_product?.product_name || '',
    stars: raw.star || 5,
    text: (raw.content || '').trim(),
    photo,
    verified: !!raw.verified_badge,
  };
}

async function fetchTrustooReviews() {
  try {
    const url = `https://api.trustoo.io/api/v1/reviews/get_product_reviews?shop_id=${TRUSTOO_SHOP_ID}&limit=50&page=1&sort_by=comprehensive-descending&scene=3&is_show_all=1`;
    const res = await fetch(url, {headers: {accept: 'application/json'}});
    const json = await res.json();
    if (json.code !== 0) return [];
    return (json.data?.list || [])
      .map(mapReview)
      .filter((r) => r.text && r.text.trim().length > 8);
  } catch (error) {
    console.error('Trustoo fetch failed', error);
    return [];
  }
}

export async function loader({params, context}) {
  const {handle} = params;
  const {storefront} = context;
  try {
    const isCombo = handle === 'combo-5x-500';
    const isComboCamisa = handle === 'combo-camisa-gorra';
    const isCamisa = handle === 'camisa-outdoor-the-ranch';
    const [productData, relatedData, licoreraData, allReviews] = await Promise.all([
      storefront.query(PRODUCT_QUERY, {
        variables: {handle},
        cache: storefront.CacheShort(),
      }),
      storefront.query(RELATED_QUERY, {
        variables: {handle: 'hot-ranch'},
        cache: storefront.CacheLong(),
      }),
      storefront.query(PRODUCT_QUERY, {
        variables: {handle: 'licorera-metalica'},
        cache: storefront.CacheLong(),
      }),
      fetchTrustooReviews(),
    ]);

    const product = productData.product || null;
    const licorera = licoreraData.product || null;
    const title = (product?.title || '').toLowerCase();
    const matching = allReviews.filter((r) => {
      if (!title) return true;
      const p = (r.product || '').toLowerCase();
      return p && (p.includes(title) || title.includes(p));
    });
    const rest = allReviews.filter((r) => !matching.includes(r));
    const reviews = [...matching, ...rest].slice(0, 8);

    const relatedPool = (relatedData.collection?.products?.nodes || []).filter(
      (p) => p.handle !== handle,
    );
    const related = relatedPool.slice(0, 4);
    const similar = relatedPool.slice(0, 6);

    let comboGorras = [];
    if (isCombo || isComboCamisa) {
      const comboData = await storefront.query(COMBO_QUERY, {
        variables: {handle: 'gorras-combo'},
        cache: storefront.CacheLong(),
      });
      comboGorras = (comboData.collection?.products?.nodes || []).filter(
        (p) => p.handle !== handle,
      );
    }

    let camisaCombo = null;
    if (isComboCamisa) {
      const camisaData = await storefront.query(CAMISA_COMBO_QUERY, {
        variables: {handle: 'camisa-outdoor-the-ranch'},
        cache: storefront.CacheLong(),
      });
      camisaCombo = camisaData.product || null;
    }

    // Combos que se ofrecen en la ficha de la camisa. Se piden por handle explícito
    // (no se depende de que la consulta devuelva el handle) y el orden define el de la ficha.
    const combosCamisa = [];
    if (isCamisa) {
      const definiciones = [
        {handle: 'combo-camisa-gorra', etiqueta: 'con la gorra'},
        {handle: 'combo-camisa-outdoor-chaqueta-laredo', etiqueta: 'con la chaqueta'},
      ];
      const respuestas = await Promise.all(
        definiciones.map((def) =>
          storefront.query(PRODUCT_QUERY, {
            variables: {handle: def.handle},
            cache: storefront.CacheLong(),
          }),
        ),
      );
      respuestas.forEach((data, i) => {
        if (data?.product) {
          combosCamisa.push({
            ...data.product,
            handleCombo: definiciones[i].handle,
            etiqueta: definiciones[i].etiqueta,
          });
        }
      });
    }

    return {
      product,
      licorera,
      reviews,
      related,
      similar,
      comboGorras,
      isCombo,
      isComboCamisa,
      camisaCombo,
      isCamisa,
      combosCamisa,
    };
  } catch (error) {
    console.error(`Producto ${handle} falló`, error);
    return {
      product: null,
      licorera: null,
      reviews: [],
      related: [],
      similar: [],
      comboGorras: [],
      isCombo: false,
      isComboCamisa: false,
      camisaCombo: null,
      isCamisa: false,
      combosCamisa: [],
    };
  }
}

const SHOPIFY_DOMAIN = '1caf84-4.myshopify.com';

// Producto "Personalización grabado láser" ($15.000) para el cobro extra
const PERSONALIZACION_VARIANT_ID = '50406577111280';
// Handles de productos que permiten personalización (grabado láser)
const PERSONALIZABLES = ['chaqueta-ganadera-gamuza'];

function toNumericId(gid) {
  return gid?.match(/\/(\d+)$/)?.[1] || gid;
}

function getCheckoutUrl(variantId, qty = 1) {
  if (!variantId) return '#';
  const id = toNumericId(variantId);
  return `https://${SHOPIFY_DOMAIN}/cart/${id}:${qty}?checkout=true`;
}

function getCartUrl(variantId, qty = 1) {
  if (!variantId) return '#';
  const id = toNumericId(variantId);
  return `https://${SHOPIFY_DOMAIN}/cart/${id}:${qty}`;
}

function getBundleCartUrl(variantIds, discountCode) {
  if (!variantIds || !variantIds.length) return '#';
  const items = variantIds.map((id) => `${toNumericId(id)}:1`).join(',');
  const cartPath = `/cart/${items}`;
  if (discountCode) {
    return `https://${SHOPIFY_DOMAIN}/discount/${discountCode}?redirect=${cartPath}`;
  }
  return `https://${SHOPIFY_DOMAIN}${cartPath}`;
}

// URL del carrito para el combo: agrega la variante del combo (precio fijo) y
// guarda las gorras elegidas como NOTA del pedido (visible en el checkout y en
// el Admin de Shopify). Sin "checkout=true" (Shopify lo rechaza con 400).
function getComboCartUrl(comboVariantId, selectedHandles, gorras) {
  const id = toNumericId(comboVariantId);
  const titles = selectedHandles.map((h) => {
    const g = gorras.find((x) => x.handle === h);
    return g?.title || h;
  });
  const note = encodeURIComponent(`Gorras elegidas (5): ${titles.join(', ')}`);
  return `https://${SHOPIFY_DOMAIN}/cart/${id}:1?note=${note}`;
}

// URL del carrito para el combo Camisa + Gorra: agrega la variante del combo
// (precio fijo $290.000) y guarda la selección como NOTA del pedido.
function getComboCamisaCartUrl(comboVariantId, camisaColor, camisaTalla, gorraHandle, gorras) {
  const id = toNumericId(comboVariantId);
  const g = gorras.find((x) => x.handle === gorraHandle);
  const gorraTitle = g?.title || gorraHandle;
  const note = encodeURIComponent(
    `Combo Camisa + Gorra — Camisa: ${camisaColor} / ${camisaTalla} | Gorra: ${gorraTitle}`,
  );
  return `https://${SHOPIFY_DOMAIN}/cart/${id}:1?note=${note}`;
}

function formatPrice(amount, currency = 'COP') {
  if (!amount) return '';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

// Beneficios clave del producto (bullets visibles bajo el título)
function getBenefits(productType, title, ficha) {
  const b = [];
  if (ficha) {
    // Prenda con ficha propia: solo datos ciertos (nada de impermeable/UV si no aplica).
    if (ficha.preventa) b.push(`🔔 Preventa — llega el ${ficha.preventa}`);
    b.push('🚚 Envío gratis a toda Colombia');
    return b;
  }
  const t = `${productType || ''} ${title || ''}`.toLowerCase();
  if (t.includes('chaqueta') || t.includes('saco') || t.includes('chaleco') || t.includes('abrigo') || t.includes('ruana')) {
    b.push('☔ Impermeable', '🔥 Termo-regulación', '☀️ Protección UV');
  } else if (t.includes('gorra')) {
    b.push('✨ Bordado premium', '☀️ Protección UV', '🧢 Ajuste cómodo');
  } else if (t.includes('camisa') || t.includes('camiseta') || t.includes('polo')) {
    b.push('✨ Tela premium', '🌬️ Transpirable', '🧵 Costuras reforzadas');
  } else if (t.includes('bota')) {
    b.push('👢 Cuero premium', '🛡️ Suela antideslizante', '💪 Alta duración');
  } else {
    b.push('✨ Calidad premium', '✅ Garantía de devolución', '🛡️ Compra protegida');
  }
  b.push('🚚 Envío a toda Colombia');
  return b.slice(0, 4);
}

const norm = (s) => (s || '').trim().toLowerCase();
// "Marrón" y "marron" son el mismo color: se comparan sin tildes.
const sinTildes = (s) => norm(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
// Las URLs de Shopify cambian por versión y por tamaño (?v=..., ?width=...): dos
// referencias a la MISMA foto se reconocen comparando solo la ruta.
const rutaImagen = (u) => (u || '').split('?')[0];

// Mapeo de nombres de color a hex para los círculos del selector de la ficha.
// Hecho con los nombres que existen DE VERDAD en el catálogo (revisados en Shopify):
// Negro, Blanco, Cafe, Verde Militar, Desert, Miel, Beige, Berenjena, Azul Navy,
// Ocre, Vinotinto, Camuflaje, Arena, Verde Oliva, Azul, Verde.
// Antes: "Blanco" devolvía #e8e2d4 (un beige) y todo color no previsto caía en
// #c9bfa8 (beige), así que el círculo mentía sobre el color de la prenda.
const COLOR_HEX = {
  // neutros
  negro: '#1a1a18',
  black: '#1a1a18',
  blanco: '#ffffff',
  white: '#ffffff',
  gris: '#8a8a8a',
  gray: '#8a8a8a',
  // tierras y beiges
  crema: '#f2e9d6',
  beige: '#e0d5bc',
  arena: '#d6c7a5',
  sand: '#d6c7a5',
  desert: '#cfc0a0',
  camel: '#b58a5a',
  miel: '#c8912e',
  honey: '#c8912e',
  ocre: '#bf8a2c',
  ochre: '#bf8a2c',
  cafe: '#6b4a2b',
  marron: '#6b4a2b',
  brown: '#6b4a2b',
  cuero: '#8a5a2b',
  leather: '#8a5a2b',
  // verdes
  verde: '#3f6b3a',
  'verde oliva': '#5a6b3c',
  olive: '#5a6b3c',
  'verde militar': '#4f5d3a',
  camuflaje: '#4a5240',
  camo: '#4a5240',
  // azules y vinos
  azul: '#2f4a6b',
  blue: '#2f4a6b',
  'azul navy': '#1f2f4a',
  'azul marino': '#1f2f4a',
  navy: '#1f2f4a',
  berenjena: '#4a2b3d',
  vinotinto: '#6e1f2a',
  vino: '#6e1f2a',
  morado: '#6b4a8a',
  purple: '#6b4a8a',
  // cálidos
  rojo: '#b3261e',
  red: '#b3261e',
  naranja: '#d97a2b',
  orange: '#d97a2b',
  amarillo: '#d9c23a',
  yellow: '#d9c23a',
  rosa: '#d98a99',
  pink: '#d98a99',
};

const CLAVES_COLOR = Object.keys(COLOR_HEX).sort((a, b) => b.length - a.length);

function colorToHex(name) {
  const key = sinTildes(name);
  if (COLOR_HEX[key]) return COLOR_HEX[key];
  // El valor puede traer extras ("Camuflaje verde", "Azul navy oscuro"): se busca
  // la clave más específica dentro del nombre, de la más larga a la más corta.
  for (const k of CLAVES_COLOR) {
    if (key.includes(k)) return COLOR_HEX[k];
  }
  return '#c4c4c4';   // gris neutro: si no se reconoce, no se inventa un beige
}

// Abrevia tallas: "Pequeño (S)" -> "S", "Doble extragrande (XXL)" -> "2XL"
function formatSize(value) {
  const m = (value || '').match(/\(([^)]+)\)/);
  if (!m) return value;
  let abbr = m[1].trim().toUpperCase();
  abbr = abbr.replace(/^X{2,}/, (x) => `${x.length}XL`);
  return abbr;
}

const ATTRS = ['Edición limitada', 'Ajuste regulable'];

export default function ProductPage() {
  const {product, licorera, reviews, related, similar, comboGorras, isCombo, isComboCamisa, camisaCombo, isCamisa, combosCamisa} =
    useLoaderData();
  const tablaTallas = parseTablaMedidas(product?.metafield?.value);
  // Upsell de la licorera: no se muestra si el producto lleva la etiqueta "sin-licorera"
  // (se controla por producto desde Shopify) ni en el combo Laredo.
  const sinLicorera =
    (product?.tags || []).some((t) => String(t).toLowerCase().trim() === 'sin-licorera') ||
    product?.handle === 'combo-camisa-outdoor-chaqueta-laredo';  const rootData = useRouteLoaderData('root');
  const logoSrc = rootData?.header?.shop?.brand?.logo?.image?.url;

  const [activeImage, setActiveImage] = useState(0);
  const [color, setColor] = useState(null);
  const [fav, setFav] = useState(false);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [options, setOptions] = useState({});
  const [selectedGorras, setSelectedGorras] = useState([]);
  const [camisaColor, setCamisaColor] = useState(null);
  const [camisaTalla, setCamisaTalla] = useState(null);
  const [gorraCombo, setGorraCombo] = useState(null);
  const [personalizacion, setPersonalizacion] = useState(null);
  const trackRef = useRef(null);
  // Mientras la ficha mueve la galería sola (al elegir color), el onScroll del track
  // no debe mandar: sus eventos llegan a mitad de la animación y pisaban la foto
  // elegida (se elegía Verde Militar y quedaba la Foto 2, la de Beige).
  const scrollPropio = useRef(false);

  const variants = product?.variants?.nodes || [];

  const allImages = useMemo(() => {
    // En el combo Camisa + Gorra, la camisa es el producto principal (galería).
    const source = isComboCamisa && camisaCombo ? camisaCombo : product;
    const imgs = (source?.images?.nodes || []).map((i) => ({
      url: optimizeImage(i.url, 800),
      raw: i.url,
      alt: i.altText || source?.title || '',
      w: i.width,
      h: i.height,
    }));
    if (!imgs.length && source?.featuredImage?.url) {
      imgs.push({
        url: optimizeImage(source.featuredImage.url, 800),
        raw: source.featuredImage.url,
        alt: source?.featuredImage?.altText || '',
        w: source.featuredImage.width,
        h: source.featuredImage.height,
      });
    }
    return imgs;
  }, [product, camisaCombo, isComboCamisa]);

  // Marco del visor: si la primera foto es vertical (ej. 2:3), el visor toma su proporción
  // en vez del 4:5 fijo, que recortaba arriba y abajo. Las fotos 1:1 y 4:5 (las de la casa)
  // siguen exactamente como estaban.
  const ratioFotoVertical = useMemo(() => {
    const p = allImages?.[0];
    if (!p?.w || !p?.h) return null;
    // OJO: CSS aspect-ratio es ancho/alto -> para una foto 2:3 va 0.667, no 1.5.
    const r = p.w / p.h;
    return r <= 0.72 ? Math.max(r, 0.555) : null;
  }, [allImages]);

  // Colores disponibles (de variantes con opción "Color")
  const colors = useMemo(() => {
    const set = [];
    variants.forEach((v) => {
      const opt = (v.selectedOptions || []).find((o) => norm(o.name) === 'color');
      if (opt?.value && !set.includes(opt.value)) set.push(opt.value);
    });
    return set;
  }, [variants]);

  // Opciones de talla/otras (excluye Color y Title)
  const optionNames = useMemo(() => {
    const names = [];
    variants.forEach((v) => {
      (v.selectedOptions || []).forEach((o) => {
        const n = norm(o.name);
        if (n !== 'title' && n !== 'color' && !names.includes(o.name)) {
          names.push(o.name);
        }
      });
    });
    return names;
  }, [variants]);

  // Combo camisa + chaqueta Laredo: Shopify solo admite 3 opciones por producto, así
  // que en los datos la chaqueta va junta ("Negro / M") pero en la ficha se muestra
  // como dos filas separadas: color chaqueta y talla chaqueta.
  const OPT_CHAQUETA = 'Chaqueta (color y talla)';
  const esComboLaredo = product?.handle === 'combo-camisa-outdoor-chaqueta-laredo';

  const partesChaqueta = useMemo(() => {
    const colores = [];
    const tallas = [];
    variants.forEach((v) => {
      const val = (v.selectedOptions || []).find((o) => o.name === OPT_CHAQUETA)?.value;
      if (!val) return;
      const [c, t] = val.split(' / ');
      if (c && !colores.includes(c)) colores.push(c);
      if (t && !tallas.includes(t)) tallas.push(t);
    });
    return {colores, tallas};
  }, [variants]);

  const valorChaqueta = options[norm(OPT_CHAQUETA)] || '';
  const chaquetaColor = (valorChaqueta.split(' / ')[0] || partesChaqueta.colores[0] || '').trim();
  const chaquetaTalla = (valorChaqueta.split(' / ')[1] || partesChaqueta.tallas[0] || '').trim();

  const selectedVariant = useMemo(() => {
    return (
      variants.find((v) =>
        (v.selectedOptions || []).every((o) => {
          const n = norm(o.name);
          const val = n === 'color' ? color : options[n];
          return !val || norm(o.value) === norm(val);
        }),
      ) || variants[0]
    );
  }, [variants, options, color]);

  // Tope de unidades: el stock real de la talla/color elegidos. Antes se podía pedir 10 de una
  // prenda que solo tiene 2 (carrito imposible); ahora el stepper no pasa del disponible.
  const maxQty = useMemo(() => {
    // 1) lo que devuelva Shopify (en esta tienda suele venir nulo)
    const disp = selectedVariant?.quantityAvailable;
    if (typeof disp === 'number' && disp > 0) return Math.min(10, disp);
    // 2) las unidades por talla que lleva la propia ficha (metafield de la tabla de medidas)
    const valores = (selectedVariant?.selectedOptions || []).map((o) => norm(o.value));
    const fila = (tablaTallas?.filas || []).find((f) => valores.includes(norm(f.talla)));
    const u = fila?.unidades;
    if (typeof u === 'number' && u > 0) return Math.min(10, u);
    return 10;
  }, [selectedVariant, tablaTallas]);

  useEffect(() => {
    setQty((q) => Math.min(q, maxQty));
  }, [maxQty]);

  // Inicializa color y talla con los primeros valores disponibles.
  useEffect(() => {
    if (colors.length && !color) setColor(colors[0]);
  }, [colors, color]);

  useEffect(() => {
    if (!variants.length) return;
    optionNames.forEach((name) => {
      const key = norm(name);
      if (!options[key]) {
        const first = variants[0]?.selectedOptions?.find((o) => o.name === name)?.value;
        if (first) setOptions((prev) => ({...prev, [key]: first}));
      }
    });
  }, [optionNames, variants, options]);

  // Cambia la foto principal cuando cambia el color (o la talla): se usa la imagen
  // que cada variante tiene enlazada en Shopify.
  //
  // Antes comparaba la URL CRUDA de la variante contra las de la galería, que están
  // optimizadas (?width=800): nunca coincidía, así que la foto no cambiaba. Y el
  // plan B usaba la posición del color (colors.findIndex) como índice de foto, o sea
  // saltaba a una imagen cualquiera del producto.
  //
  // Se compara por RUTA (sin ?v= ni ?width=), que es estable. Si la variante elegida
  // no tiene foto propia se busca otra variante del mismo color; y si ese color no
  // tiene ninguna foto enlazada, se deja la foto actual en vez de saltar a otra.
  //
  // Corre también al abrir la ficha: si el selector ya trae marcado el primer color
  // (la ficha lo pone sola), la foto que se muestra es la de ESE color. Antes abría
  // con la primera de la galería y quedaba descuadrado: el selector marcaba Desert y
  // la foto era de otro color, y al tocar Desert (ya marcado) no pasaba nada.
  useEffect(() => {
    if (!color) return;

    const buscar = (url) => {
      const r = rutaImagen(url);
      return r ? allImages.findIndex((i) => rutaImagen(i.raw) === r) : -1;
    };

    let idx = buscar(selectedVariant?.image?.url);
    if (idx < 0) {
      const hermanas = variants.filter((v) =>
        (v.selectedOptions || []).some(
          (o) => norm(o.name) === 'color' && norm(o.value) === norm(color),
        ),
      );
      for (const v of hermanas) {
        idx = buscar(v.image?.url);
        if (idx >= 0) break;
      }
    }

    if (idx >= 0 && idx < allImages.length) {
      setActiveImage(idx);
      const track = trackRef.current;
      const slide = track?.children?.[idx];
      if (slide) {
        scrollPropio.current = true;
        clearTimeout(scrollPropio.t);
        scrollPropio.t = setTimeout(() => {
          scrollPropio.current = false;
        }, 800);
        slide.scrollIntoView({behavior: 'smooth', inline: 'center', block: 'nearest'});
      }
    }
  }, [selectedVariant, allImages, color, variants]);

  // Pixel de Meta: ViewContent cuando el producto carga.
  useEffect(() => {
    if (product?.id && typeof window !== 'undefined' && window.fbq) {
      window.fbq(
        'track',
        'ViewContent',
        {
          content_ids: [product.id],
          content_name: product.title,
          content_type: 'product',
          value: Number(product.priceRange?.minVariantPrice?.amount) || 0,
          currency: 'COP',
        },
        {
          eventID:
            'tr_vc_' + product.id + '_' + Math.random().toString(36).slice(2, 10),
        },
      );
    }
  }, [product]);

  if (!product) {
    return (
      <div className="trp-empty">
        <h1>Producto no encontrado</h1>
        <a href="/">← Volver al inicio</a>
      </div>
    );
  }

  const price = selectedVariant?.price?.amount || product.priceRange?.minVariantPrice?.amount;
  const compare = product.compareAtPriceRange?.minVariantPrice?.amount;
  const hasDiscount = compare && Number(compare) > Number(price);
  const isOut = selectedVariant?.availableForSale === false;
  const totalPrice = (Number(price) || 0) * qty;
  const totalCompare = (Number(compare) || 0) * qty;
  const discountPct = hasDiscount ? Math.round((1 - Number(price) / Number(compare)) * 100) : 0;

  const handleScroll = (e) => {
    // Si el movimiento lo hizo la ficha al elegir color, no se toca la foto: los
    // eventos del desplazamiento suave llegan a mitad de la animación y dejaban la
    // foto del color anterior (elegías Verde Militar y quedaba la de Beige).
    if (scrollPropio.current) return;
    const el = e.currentTarget;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx >= 0 && idx < allImages.length) setActiveImage(idx);
  };

  const scrollToImage = (i) => {
    if (trackRef.current) {
      trackRef.current.scrollTo({
        left: i * trackRef.current.clientWidth,
        behavior: 'smooth',
      });
      setActiveImage(i);
    }
  };

  const comboReady = isCombo && selectedGorras.length === 5;

  const toggleGorra = (handle) => {
    setSelectedGorras((prev) => {
      if (prev.includes(handle)) return prev.filter((h) => h !== handle);
      if (prev.length >= 5) return prev;
      return [...prev, handle];
    });
  };

  const camisaVariants = camisaCombo?.variants?.nodes || [];
  const camisaColores = Array.from(
    new Set(
      camisaVariants
        .map((v) => v.selectedOptions?.find((o) => o.name === 'Color')?.value)
        .filter(Boolean),
    ),
  );
  const camisaTallas = Array.from(
    new Set(
      camisaVariants
        .map((v) => v.selectedOptions?.find((o) => o.name === 'Talla')?.value)
        .filter(Boolean),
    ),
  );
  const comboCamisaReady = isComboCamisa && camisaColor && camisaTalla && gorraCombo;

  // Al elegir color de camisa, cambia la foto de la galería a la de ese color.
  const handleCamisaColor = (c) => {
    setCamisaColor(c);
    const variant = camisaVariants.find(
      (v) => v.selectedOptions?.find((o) => o.name === 'Color')?.value === c,
    );
    const imgUrl = variant?.image?.url;
    if (imgUrl) {
      const idx = allImages.findIndex((i) => i.url === imgUrl);
      if (idx >= 0) scrollToImage(idx);
    }
  };

  const handlePersonalizado = async () => {
    if (!selectedVariant?.id || !personalizacion?.enabled) return false;
    try {
      const render = await personalizacion.render();
      const form = new FormData();
      form.append('product', product.title);
      form.append('handle', product.handle);
      form.append('variantId', selectedVariant.id);
      form.append('text', personalizacion.text);
      form.append('font', personalizacion.font);
      form.append('scale', String(personalizacion.scale));
      form.append('pos', JSON.stringify(personalizacion.pos));
      form.append('render', render);
      if (personalizacion.logo) form.append('logo', personalizacion.logo);

      const res = await fetch('/api/personalizar', {method: 'POST', body: form});
      const data = await res.json();
      if (data?.ok) {
        const chaquetaId = toNumericId(selectedVariant.id);
        window.location.href = `https://${SHOPIFY_DOMAIN}/cart/${chaquetaId}:1,${PERSONALIZACION_VARIANT_ID}:1`;
        return true;
      }
      alert('No se pudo guardar la personalización. Intenta de nuevo.');
      return false;
    } catch (e) {
      console.error(e);
      alert('Ocurrió un error. Intenta de nuevo.');
      return false;
    }
  };

  const handleBuyNow = async () => {
    if (isComboCamisa) {
      if (!comboCamisaReady) return;
      window.location.href = getComboCamisaCartUrl(
        selectedVariant.id,
        camisaColor,
        camisaTalla,
        gorraCombo,
        comboGorras,
      );
      return;
    }
    if (isCombo) {
      if (!comboReady) return;
      window.location.href = getComboCartUrl(selectedVariant.id, selectedGorras, comboGorras);
      return;
    }
    if (!selectedVariant?.id) return;
    if (personalizacion?.enabled) {
      await handlePersonalizado();
      return;
    }
    buyNow(selectedVariant.id, qty, selectedVariant.price?.amount);
  };

  const handleAddToCart = async () => {
    if (isComboCamisa) {
      if (!comboCamisaReady) return;
      window.location.href = getComboCamisaCartUrl(
        selectedVariant.id,
        camisaColor,
        camisaTalla,
        gorraCombo,
        comboGorras,
      );
      return;
    }
    if (isCombo) {
      if (!comboReady) return;
      window.location.href = getComboCartUrl(selectedVariant.id, selectedGorras, comboGorras);
      return;
    }
    if (!selectedVariant?.id) return;
    if (personalizacion?.enabled) {
      await handlePersonalizado();
      return;
    }
    const variantOptions = (selectedVariant.selectedOptions || [])
      .filter((o) => o.name !== 'Title')
      .map((o) => o.value)
      .join(' / ');
    addToCart({
      variantId: selectedVariant.id,
      qty,
      title: product.title,
      image: selectedVariant.image?.url || product.featuredImage?.url,
      price: selectedVariant.price?.amount,
      compareAtPrice: compare,
      handle: product.handle,
      options: variantOptions || undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="trp">
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product?.id,
              title: product?.title,
              price: product?.priceRange?.minVariantPrice?.amount,
              vendor: product?.vendor,
              variantId: selectedVariant?.id,
              variantTitle: (selectedVariant?.selectedOptions || [])
                .map((o) => o.value)
                .join(' / '),
              quantity: 1,
            },
          ],
        }}
      />
      <div className="trp-media">
        <div className="trp-gallery">
        {/* ===== Visor visual ===== */}
        <div className="trp-viewer" style={ratioFotoVertical ? {aspectRatio: String(ratioFotoVertical)} : undefined}>
        <div
          ref={trackRef}
          className="trp-viewer-track"
          onScroll={handleScroll}
          aria-label="Galería de fotos"
        >
          {allImages.map((img, i) => (
            <div key={i} className="trp-viewer-slide">
              <img
                src={img.url}
                srcSet={imageSrcSet(img.raw, [480, 720, 900, 1200])}
                sizes="(min-width: 1024px) 640px, 100vw"
                alt={img.alt}
                draggable={false}
              />
            </div>
          ))}
        </div>

        <Link className="trp-back" to="/" aria-label="Volver">
          ←
        </Link>

        <div className="trp-gallery-indicator" aria-hidden="true">
          {String(activeImage + 1).padStart(2, '0')}
          <span> / </span>
          {String(allImages.length).padStart(2, '0')}
        </div>

        {colors.length > 1 && (
          <div className="trp-color-selector" role="radiogroup" aria-label="Color">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                className={norm(color) === norm(c) ? 'is-active' : ''}
                style={{background: colorToHex(c)}}
                onClick={() => setColor(c)}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        )}

        <div className="trp-attrs" aria-hidden="true">
          {ATTRS.map((a) => (
            <span key={a}>{a}</span>
          ))}
        </div>

        <div className="trp-lasso" aria-hidden="true" />
      </div>

      {/* ===== Miniaturas ===== */}
      {allImages.length > 1 && (
        <div className="trp-thumbs">
          {allImages.map((img, i) => (
            <button
              key={i}
              type="button"
              className={i === activeImage ? 'is-active' : ''}
              onClick={() => scrollToImage(i)}
              aria-label={`Foto ${i + 1}`}
            >
              <img
                src={optimizeImage(img.raw, 96)}
                srcSet={imageSrcSet(img.raw, [64, 96, 160])}
                sizes="80px"
                alt=""
              />
            </button>
          ))}
        </div>
      )}
      </div>

        <div className="trp-trust-escritorio">
          <TrustBadges />
        </div>

        {isApparel(product.productType, product.title) ? (
          <div className="trp-size-escritorio">
            <SizeGuide />
          </div>
        ) : null}

        {tablaTallas ? (
          <div className="trp-size-escritorio">
            <SizeTable datos={tablaTallas} />
          </div>
        ) : null}
      </div>

      <div className="trp-side">
        {/* ===== Tarjeta flotante de rating ===== */}
      <div className="trp-rating-pill">
        <span className="trp-rating-pill-star">★</span>
        <span className="trp-rating-pill-num">4.8</span>
        <span className="trp-rating-pill-sep">·</span>
        <span className="trp-rating-pill-label">672 reseñas</span>
        <span className="trp-rating-pill-arrow">→</span>
      </div>

      {isCombo && comboGorras.length > 0 ? (
        <section className="trp-combo-picker" aria-label="Elige tus 5 gorras">
          <h2 className="trp-combo-title">Elige tus 5 gorras</h2>
          <p className={`trp-combo-count ${comboReady ? 'is-ready' : ''}`}>
            {selectedGorras.length}/5 seleccionadas
          </p>
          <div className="trp-combo-grid">
            {comboGorras.map((g) => {
              const isSel = selectedGorras.includes(g.handle);
              return (
                <button
                  key={g.handle}
                  type="button"
                  className={`trp-combo-card ${isSel ? 'is-selected' : ''}`}
                  onClick={() => toggleGorra(g.handle)}
                  disabled={!isSel && selectedGorras.length >= 5}
                  aria-pressed={isSel}
                >
                  {g.featuredImage?.url ? (
                    <img
                      src={optimizeImage(g.featuredImage.url, 200)}
                      srcSet={imageSrcSet(g.featuredImage.url, [160, 200, 300])}
                      sizes="140px"
                      alt={g.title}
                      loading="lazy"
                    />
                  ) : null}
                  <span className="trp-combo-name">{g.title}</span>
                  <span className="trp-combo-check" aria-hidden="true">
                    {isSel ? '✓' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {isComboCamisa && comboGorras.length > 0 ? (
        <section className="trp-combo-picker" aria-label="Arma tu combo de camisa y gorra">
          <h1 className="trp-combo-title">{product.title}</h1>
          <p className="trp-combo-sub">Elige tu camisa (color y talla) y tu gorra favorita</p>

          <div className="trp-option">
            <span className="trp-option-label">Color de la camisa</span>
            <div className="trp-option-values trp-option-colors">
              {camisaColores.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={norm(camisaColor) === norm(c) ? 'is-active' : ''}
                  style={{background: colorToHex(c)}}
                  onClick={() => handleCamisaColor(c)}
                  aria-label={`Color ${c}`}
                  title={c}
                />
              ))}
            </div>
          </div>

          <div className="trp-option">
            <span className="trp-option-label">Talla de la camisa</span>
            <div className="trp-option-values">
              {camisaTallas.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={norm(camisaTalla) === norm(t) ? 'is-active' : ''}
                  onClick={() => setCamisaTalla(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <p className="trp-combo-count">Elige tu gorra</p>
          <div className="trp-combo-grid">
            {comboGorras.map((g) => {
              const isSel = gorraCombo === g.handle;
              return (
                <button
                  key={g.handle}
                  type="button"
                  className={`trp-combo-card ${isSel ? 'is-selected' : ''}`}
                  onClick={() => setGorraCombo(g.handle)}
                  aria-pressed={isSel}
                >
                  {g.featuredImage?.url ? (
                    <img
                      src={optimizeImage(g.featuredImage.url, 200)}
                      srcSet={imageSrcSet(g.featuredImage.url, [160, 200, 300])}
                      sizes="140px"
                      alt={g.title}
                      loading="lazy"
                    />
                  ) : null}
                  <span className="trp-combo-name">{g.title}</span>
                  <span className="trp-combo-check" aria-hidden="true">
                    {isSel ? '✓' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* ===== Info ===== */}
      <div className="trp-info">
        {!isComboCamisa ? (
          <>
            <p className="trp-variant">Colección Western — The Ranch</p>
            <h1 className="trp-title">{product.title}</h1>

            {/* Precio + descuento arriba */}
            <div className="trp-price-top">
              <span className="trp-price-top-now">{formatPrice(price)}</span>
              {hasDiscount ? <s className="trp-price-top-compare">{formatPrice(compare)}</s> : null}
              {discountPct > 0 ? <span className="trp-price-top-off">-{discountPct}%</span> : null}
            </div>

            {/* Prueba social */}
            <button
              type="button"
              className="trp-stars"
              onClick={() => document.getElementById('trp-reviews')?.scrollIntoView({behavior: 'smooth'})}
            >
              <span aria-hidden="true">★★★★★</span> <span className="trp-stars-num">4.8</span>
              <span className="trp-stars-link">Ver reseñas</span>
            </button>

            {/* Beneficios clave */}
            <ul className="trp-benefits">
              {getBenefits(product.productType, product.title, tablaTallas).map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </>
        ) : null}

        {/* Pago seguro / envío / cambios: en móvil van DESPUÉS del título y el precio,
            para que el cliente primero sepa qué prenda está viendo. En escritorio
            siguen bajo la galería, como estaban. */}
        <div className="trp-trust-movil">
          <TrustBadges />
        </div>

        <span className="trp-tag">{isOut ? 'Agotado' : 'Edición limitada'}</span>

        {/* ===== Selectores de talla/color (debajo del título) ===== */}
        {colors.length > 1 && (
          <div className="trp-option">
            <span className="trp-option-label">Color</span>
            <div className="trp-option-values trp-option-colors">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={norm(color) === norm(c) ? 'is-active' : ''}
                  style={{background: colorToHex(c)}}
                  onClick={() => setColor(c)}
                  aria-label={`Color ${c}`}
                  title={c}
                />
              ))}
            </div>
          </div>
        )}

        {esComboLaredo ? (
          <>
            <div className="trp-option">
              <span className="trp-option-label">Color chaqueta</span>
              <div className="trp-option-values trp-option-colors">
                {partesChaqueta.colores.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={norm(chaquetaColor) === norm(c) ? 'is-active' : ''}
                    style={{background: colorToHex(c)}}
                    onClick={() =>
                      setOptions((prev) => ({
                        ...prev,
                        [norm(OPT_CHAQUETA)]: `${c} / ${chaquetaTalla}`,
                      }))
                    }
                    aria-label={`Color chaqueta ${c}`}
                    title={c}
                  />
                ))}
              </div>
            </div>
            <div className="trp-option">
              <span className="trp-option-label">Talla chaqueta</span>
              <div className="trp-option-values">
                {partesChaqueta.tallas.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={norm(chaquetaTalla) === norm(t) ? 'is-active' : ''}
                    onClick={() =>
                      setOptions((prev) => ({
                        ...prev,
                        [norm(OPT_CHAQUETA)]: `${chaquetaColor} / ${t}`,
                      }))
                    }
                  >
                    {formatSize(t)}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : null}

        {optionNames
          .filter((name) => name !== OPT_CHAQUETA)
          .map((name) => {
            const values = Array.from(
              new Set(
                variants
                  .map((v) => v.selectedOptions?.find((o) => o.name === name)?.value)
                  .filter(Boolean),
              ),
            );
            const esFilaDeColor = norm(name) === 'color camisa';
            return (
              <div key={name} className="trp-option">
                <span className="trp-option-label">{name}</span>
                <div className={`trp-option-values${esFilaDeColor ? ' trp-option-colors' : ''}`}>
                  {values.map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={norm(options[norm(name)]) === norm(value) ? 'is-active' : ''}
                      style={esFilaDeColor ? {background: colorToHex(value)} : undefined}
                      onClick={() => setOptions((prev) => ({...prev, [norm(name)]: value}))}
                      aria-label={esFilaDeColor ? `Color camisa ${value}` : undefined}
                      title={esFilaDeColor ? value : undefined}
                    >
                      {esFilaDeColor ? null : formatSize(value)}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

        {/* ===== Upsell: los combos de la camisa (gorra y chaqueta); licorera para el resto ===== */}
        {/* (el combo camisa + chaqueta Laredo no lleva licorera, por pedido de Camilo) */}
        {isCamisa && combosCamisa.length ? (
          <section className="trp-reco" aria-label="Llévalo en combo">
            {combosCamisa.map((combo) => (
              <Link
                className="trp-reco-card"
                key={combo.handleCombo}
                to={`/products/${combo.handleCombo}`}
              >
                {combo.featuredImage?.url ? (
                  <img
                    className="trp-reco-img"
                    src={optimizeImage(combo.featuredImage.url, 400)}
                    srcSet={imageSrcSet(combo.featuredImage.url, [300, 400, 600])}
                    sizes="(min-width: 900px) 380px, 45vw"
                    alt=""
                    loading="lazy"
                  />
                ) : product.featuredImage?.url ? (
                  <img
                    className="trp-reco-img"
                    src={optimizeImage(product.featuredImage.url, 400)}
                    srcSet={imageSrcSet(product.featuredImage.url, [300, 400, 600])}
                    sizes="(min-width: 900px) 380px, 45vw"
                    alt=""
                    loading="lazy"
                  />
                ) : null}
                <div className="trp-reco-info">
                  <span className="trp-reco-tag">🔥 Combo {combo.etiqueta}</span>
                  <h3 className="trp-reco-title">{combo.title}</h3>
                  <div className="trp-reco-price">
                    {combo.compareAtPriceRange?.minVariantPrice?.amount ? (
                      <s className="trp-reco-price-orig">
                        {formatPrice(combo.compareAtPriceRange.minVariantPrice.amount)}
                      </s>
                    ) : null}
                    <strong className="trp-reco-price-final">
                      {formatPrice(combo.priceRange?.minVariantPrice?.amount)}
                    </strong>
                    <span className="trp-reco-badge">Combo</span>
                  </div>
                </div>
                <span className="trp-reco-cta">Ver combo</span>
              </Link>
            ))}
          </section>
        ) : licorera && !sinLicorera ? (
          <RecommendedProduct
            product={{
              handle: licorera.handle,
              title: licorera.title,
              price: licorera.priceRange?.minVariantPrice?.amount,
              image: licorera.featuredImage?.url,
              variantId: licorera.variants?.nodes?.[0]?.id,
            }}
            formatPrice={formatPrice}
            onAdd={() => {
              const currentVid = selectedVariant?.id;
              const licoreraVid = licorera.variants?.nodes?.[0]?.id;
              if (currentVid && licoreraVid) {
                window.location.href = getBundleCartUrl([currentVid, licoreraVid], 'COMBO10');
              } else if (licoreraVid) {
                window.location.href = getBundleCartUrl([licoreraVid], 'COMBO10');
              }
            }}
          />
        ) : null}

        <ProductAccordion
          productType={product.productType}
          title={product.title}
          description={product.description}
          ficha={tablaTallas}
        />

        <div className={`trp-stock ${isOut ? 'is-out' : ''}`}>
          {isOut ? 'Agotado' : '⚡ Últimas unidades disponibles'}
        </div>

        <SocialProof
          title={product.title}
          image={selectedVariant?.image?.url || product.featuredImage?.url}
        />
      </div>

      <div className="trp-info-bottom">
        <div className="trp-shipping-badge">
          <span aria-hidden="true">🔒</span> Pago 100% seguro y cifrado
          <span className="trp-shipping-sep" aria-hidden="true">·</span>
          <span aria-hidden="true">🛡️</span> Garantía de devolución 7 días
        </div>

        <div className="trp-guarantee-badge">
          <span aria-hidden="true">✅</span> Compra protegida de principio a fin
          <span className="trp-guarantee-cards">VISA · MASTERCARD · PSE</span>
        </div>
      </div>

      {PERSONALIZABLES.includes(product.handle) ? (
        <Personalizador product={product} onChange={setPersonalizacion} />
      ) : null}

      {/* ===== Barra de compra (grid 2x2) ===== */}
      {/* En movil el calculador va despues de elegir, para que no tape los selectores */}
      {isApparel(product.productType, product.title) ? (
        <div className="trp-size-movil">
          <SizeGuide />
        </div>
      ) : null}

      {tablaTallas ? (
        <div className="trp-size-movil">
          <SizeTable datos={tablaTallas} />
        </div>
      ) : null}

      <div className="trp-buybar">
          <div className="trp-buybar-price">
            <span className="trp-buybar-price-now">{formatPrice(totalPrice)}</span>
            {hasDiscount ? (
              <s className="trp-buybar-price-compare">{formatPrice(totalCompare)}</s>
            ) : null}
          </div>
          <button
            className={`trp-add-cart ${added ? 'is-added' : ''}`}
            type="button"
            onClick={handleAddToCart}
            disabled={isComboCamisa ? !comboCamisaReady : isOut || (isCombo && !comboReady)}
          >
            {isComboCamisa
              ? comboCamisaReady
                ? added
                  ? '✓ Añadido'
                  : 'Agregar al carrito'
                : 'Elige camisa y gorra'
              : isCombo && !comboReady
                ? 'Elige 5 gorras'
                : added
                  ? '✓ Añadido'
                  : 'Agregar al carrito'}
          </button>
          <div className="trp-qty" aria-label="Cantidad">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Menos"
            >
              −
            </button>
            <span>{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              disabled={qty >= maxQty}
              aria-label="Más"
            >
              +
            </button>
          </div>
          {/* "Comprar ahora" va DEBAJO de "Agregar al carrito": el camino normal es
              agregar al carrito, y el salto directo a pagar queda como acción secundaria
              (el grid 2x2 sigue el orden del DOM, así que el orden aquí es el visual). */}
          <button
            className="trp-add"
            type="button"
            onClick={handleBuyNow}
            disabled={isComboCamisa ? !comboCamisaReady : isOut || (isCombo && !comboReady)}
          >
            {isComboCamisa
              ? comboCamisaReady
                ? 'Comprar ahora'
                : 'Elige camisa y gorra'
              : isCombo && !comboReady
                ? 'Elige 5 gorras'
                : 'Comprar ahora'}
          </button>
        </div>
      </div>

      {/* ===== Medios de pago (confianza) ===== */}
      <PaymentTrust />

      {/* ===== Políticas (garantía, envíos, pagos, atención) ===== */}
      <PolicyCards />

      {/* ===== Reseñas (carrusel) ===== */}
      {reviews.length > 0 && (
        <section className="trp-reviews" id="trp-reviews">
          <h2 className="trp-reviews-title">Lo que dicen en el campo</h2>
          <div className="trp-reviews-track">
            <div className="trp-reviews-row">
              {[...reviews, ...reviews].map((r, i) => (
                <article key={i} className="trp-review-card">
                  <div className="trp-review-head">
                    {r.photo ? (
                      <img className="trp-review-photo" src={r.photo} alt="" loading="lazy" />
                    ) : (
                      <span className="trp-review-avatar">{r.name?.charAt(0) || 'R'}</span>
                    )}
                    <div className="trp-review-who">
                      <span className="trp-review-name">{r.name}</span>
                      <span className="trp-review-stars" aria-label={`${r.stars} de 5 estrellas`}>
                        {'★'.repeat(r.stars)}
                        {'☆'.repeat(5 - r.stars)}
                      </span>
                    </div>
                  </div>
                  <p className="trp-review-text">“{r.text}”</p>
                  {r.verified ? (
                    <span className="trp-review-verified">✓ Compra verificada</span>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== Productos similares ===== */}
      {similar.length > 0 && (
        <section className="trp-similar">
          <h2 className="trp-similar-title">También te puede gustar</h2>
          <div className="trp-similar-grid">
            {similar.map((p) => (
              <Link key={p.id} className="trp-similar-card" to={`/products/${p.handle}`}>
                <div className="trp-similar-media">
                  {p.featuredImage?.url ? (
                    <img
                      src={optimizeImage(p.featuredImage.url, 300)}
                      srcSet={imageSrcSet(p.featuredImage.url, [200, 300, 400])}
                      sizes="(min-width: 1000px) 200px, 33vw"
                      alt={p.featuredImage.altText || p.title}
                      loading="lazy"
                    />
                  ) : null}
                  <span className="trp-similar-rating">
                    <i>★</i> 4.8
                  </span>
                </div>
                <h3 className="trp-similar-name">{p.title}</h3>
                <div className="trp-similar-foot">
                  <span className="trp-similar-price">
                    {formatPrice(p.priceRange?.minVariantPrice?.amount)}
                  </span>
                  {p.compareAtPriceRange?.minVariantPrice?.amount &&
                  Number(p.compareAtPriceRange.minVariantPrice.amount) >
                    Number(p.priceRange?.minVariantPrice?.amount) ? (
                    <s className="trp-similar-compare">
                      {formatPrice(p.compareAtPriceRange.minVariantPrice.amount)}
                    </s>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function PolicyCards() {
  const items = [
    {
      title: 'Garantía de calidad',
      desc: 'Cada pieza pasa control de calidad. Si algo no te convence, te respondemos.',
      icon: '🛡️',
    },
    {
      title: 'Envíos garantizados',
      desc: 'Despachamos a toda Colombia con seguimiento hasta tu puerta.',
      icon: '🚚',
    },
    {
      title: 'Pagos seguros',
      desc: 'Bold, Addi y pasarelas cifradas. Tu dinero siempre protegido.',
      icon: '🔒',
    },
    {
      title: 'Atención al cliente',
      desc: 'Te acompañamos antes, durante y después de tu compra.',
      icon: '💬',
    },
  ];
  return (
    <section className="trp-policies">
      {items.map((item) => (
        <article key={item.title} className="trp-policy-card">
          <span className="trp-policy-icon" aria-hidden="true">
            {item.icon}
          </span>
          <h3 className="trp-policy-title">{item.title}</h3>
          <p className="trp-policy-desc">{item.desc}</p>
        </article>
      ))}
    </section>
  );
}
