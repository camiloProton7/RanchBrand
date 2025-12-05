import {useEffect, useMemo, useRef, useState} from 'react';
import {useLoaderData} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import VideoFinal from '../components/VideoFinal';

/* ===== META DATA ===== */
export const meta = () => ([
  {title: 'Laredo Bomber — Entrega en 24H | The Ranch'},
  {name: 'description', content: 'Chaqueta Laredo. Entrega confirmada en menos de 24 horas. Calidad Premium.'},
]);

/* ===== CONFIGURACIÓN DE ASSETS ===== */
const VIDEO_PATH = '/video-scroll.mp4';
const IMAGE_PATH = '/poster-hero.jpg';

/* ===== DOMINIO DE CHECKOUT (VITAL) ===== */
// Usamos tu dominio técnico para asegurar que vaya al checkout de Shopify
const SHOPIFY_DOMAIN = '1caf84-4.myshopify.com'; 

/* ===== DATOS FIJOS ===== */
const REVIEWS = [
  { id: 1, author: "Camilo R.", verified: true, text: "La calidad me sorprendió. La usé en moto bajo aguacero en Bogotá y llegué seco. Vale cada peso.", rating: 5 },
  { id: 2, author: "Andrés M.", verified: true, text: "El fit es perfecto. No queda bombacha como otras bomber. Se ve muy elegante para la oficina.", rating: 5 },
  { id: 3, author: "Juan David P.", verified: true, text: "El envío fue rapidísimo. La pedí ayer y hoy ya la tengo. Recomendados.", rating: 5 }
];

const FAQS = [
  { q: "¿Cuánto tarda el envío?", a: "Si pides antes de las 4PM, despachamos HOY mismo. A ciudades principales llega en 24 horas hábiles." },
  { q: "¿Puedo pagar cuando reciba?", a: "¡Sí! Tenemos pago contraentrega en todo el país. Pagas en efectivo al recibir tu chaqueta." },
  { q: "¿Qué pasa si no me queda?", a: "No te preocupes. El primer cambio por talla es totalmente GRATIS. Nosotros asumimos los envíos." },
  { q: "¿Es 100% impermeable?", a: "Sí, la tela es Nylon Taslan impermeable y las cremalleras son selladas. Soporta aguaceros fuertes." }
];

const MOCK_PRODUCT = {
  id: 'gid://shopify/Product/mock',
  title: 'Laredo Bomber',
  handle: 'laredo',
  variants: {
    nodes: [
      {
        id: 'gid://shopify/ProductVariant/mock1',
        availableForSale: true,
        price: { amount: '185000', currencyCode: 'COP' },
        selectedOptions: [{name: 'Color', value: 'Verde Oliva'}, {name: 'Talla', value: 'M'}]
      }
    ]
  },
  images: { nodes: [] }
};

/* ===== LOADER (Backend) ===== */
export async function loader({context}) {
  const {storefront} = context;
  try {
    const data = await storefront.query(`#graphql
      query {
        products(first: 1, query: "title:Laredo") {
          nodes {
            id
            title
            handle
            images(first: 50) { nodes { id url altText width height } }
            variants(first: 50) {
              nodes {
                id
                availableForSale
                selectedOptions { name value }
                price { amount currencyCode }
                image { id url altText }
              }
            }
          }
        }
      }
    `);
    let product = data?.products?.nodes?.[0] || MOCK_PRODUCT;
    return {product};
  } catch (error) {
    return {product: MOCK_PRODUCT};
  }
}

/* ===== CONSTANTES Y HELPERS ===== */
const COLORS = ['Verde Oliva', 'Negro'];
const SIZES  = ['S', 'M', 'L', 'XL'];
const ACCENT = '#f2c200';
const WHATSAPP_NUMBER = '+15557364328'; 

function toNumericId(gid) { return gid?.match(/\/(\d+)$/)?.[1] || gid; }

// FUNCIÓN CORREGIDA: Genera URL absoluta a Shopify
function getCheckoutUrl(variantId, qty = 1) { 
    if (!variantId) return '#';
    const id = toNumericId(variantId);
    return `https://${SHOPIFY_DOMAIN}/cart/${id}:${qty}`; 
}

const norm = (s) => (s || '').trim().toLowerCase();

function calculateRecommendedSize(height, weight) {
  if (!height || !weight) return null;
  const h = parseInt(height);
  const w = parseInt(weight);
  if (w < 65) return 'S';
  if (w >= 65 && w < 78) return 'M';
  if (w >= 78 && w < 88) return 'L';
  if (w >= 88) return 'XL';
  return 'XL';
}

/* ===== COMPONENTE PRINCIPAL ===== */
export default function LaredoLanding() {
  const {product} = useLoaderData();
  const variants = product?.variants?.nodes || MOCK_PRODUCT.variants.nodes;
  const allImages = product?.images?.nodes || [];

  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize]   = useState('M');
  const [qty, setQty]     = useState(1);
  const [viewers, setViewers] = useState(24);
  const [recentSales, setRecentSales] = useState(5);
  
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [userHeight, setUserHeight] = useState('');
  const [userWeight, setUserWeight] = useState('');
  const [recommended, setRecommended] = useState(null);
  const mainCtaRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
        setViewers(v => Math.max(15, v + Math.floor(Math.random() * 5 - 2)));
        if (Math.random() > 0.6) setRecentSales(s => s + 1);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Ocultar Header
  useEffect(() => {
    if (typeof document !== 'undefined') {
        const els = document.querySelectorAll('header, .header, .site-header, .PageLayout, footer, .footer-section');
        els.forEach(el => { if(el) el.style.display = 'none'; });
        document.body.style.padding = '0';
        return () => els.forEach(el => { if(el) el.style.display = ''; });
    }
  }, []);

  const selectedVariant = useMemo(() => {
    const found = variants.find((v) => {
      const map = Object.fromEntries(v.selectedOptions.map((o) => [norm(o.name), o.value]));
      return (norm(map['color']) === norm(color) || norm(map['colour']) === norm(color)) && 
             (norm(map['talla']) === norm(size) || norm(map['size']) === norm(size));
    });
    return found || variants[0];
  }, [variants, color, size]);

  const sortedGallery = useMemo(() => {
      if (!allImages.length) return [];
      const selectedColor = color.toLowerCase();
      return [...allImages].sort((a, b) => {
          const altA = (a.altText || '').toLowerCase();
          const altB = (b.altText || '').toLowerCase();
          const aMatches = altA.includes(selectedColor);
          const bMatches = altB.includes(selectedColor);
          if (aMatches && !bMatches) return -1;
          if (!aMatches && bMatches) return 1;
          return 0;
      });
  }, [allImages, color]);

  // Observador de scroll para barra sticky
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-100px 0px 0px 0px" }
    );
    if (mainCtaRef.current) observer.observe(mainCtaRef.current);
    return () => observer.disconnect();
  }, []);

  // Pixel ViewContent
  useEffect(() => {
    if (typeof window !== 'undefined' && window.fbq && selectedVariant) {
      window.fbq('track', 'ViewContent', {
        content_name: 'Laredo Bomber',
        content_ids: [product?.id],
        content_type: 'product',
        value: selectedVariant.price.amount,
        currency: selectedVariant.price.currencyCode
      });
    }
  }, [product, selectedVariant]);

  const handleCalculate = () => {
    const res = calculateRecommendedSize(userHeight, userWeight);
    setRecommended(res);
    if(res) setSize(res);
  };

  // Acción de Compra: Redirección externa
  const handleBuy = () => {
      if (selectedVariant) {
          const url = getCheckoutUrl(selectedVariant.id, qty);
          window.location.href = url;
      }
  };

  return (
    <>
      <style>{`
        /* ESTILOS (Mismos de antes) */
        html, body { margin:0; padding:0; background:#050505; color:#fff; font-family: Helvetica Neue, sans-serif; -webkit-font-smoothing: antialiased; }
        * { box-sizing: border-box; }
        .hero-container { height: 350vh; width: 100%; position: relative; z-index: 1; }
        .hero-sticky-frame { position: sticky; top: 0; left: 0; width: 100%; height: 100dvh; overflow: hidden; }
        .video-layer { position: absolute; inset: 0; z-index: 0; background: #000; }
        .overlay { position: absolute; inset: 0; z-index: 2; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; padding: 0 20px 22vh 20px; text-align: center; background: linear-gradient(to top, rgba(0,0,0,0.95) 10%, transparent 50%); pointer-events: none; }
        .stars { color: ${ACCENT}; font-size: 13px; margin-bottom: 8px; letter-spacing: 2px; font-weight: 700; text-transform:uppercase; text-shadow: 0 2px 10px rgba(0,0,0,0.5);}
        .overlay h1 { font-size: clamp(42px, 12vw, 72px); font-weight: 900; line-height: 0.9; text-transform: uppercase; letter-spacing: -2px; margin:0; text-shadow: 0 4px 30px rgba(0,0,0,0.8); }
        .overlay h1 .highlight { color: ${ACCENT}; }
        .overlay p.subtitle  { font-size: clamp(14px, 4vw, 16px); opacity: 0.9; margin-top: 12px; max-width: 320px; font-weight: 500; letter-spacing: 1px; text-transform:uppercase; }
        .content-layer { position: relative; z-index: 10; background: #0a0a0a; box-shadow: 0 -50px 100px rgba(0,0,0,1); border-radius: 24px 24px 0 0; margin-top: -8vh; padding-bottom: 0px; }
        .shipping-alert { background: linear-gradient(90deg, #1a1a1a 0%, #222 100%); border-left: 4px solid ${ACCENT}; padding: 16px 20px; margin: 0; display: flex; align-items: center; gap: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
        .ship-icon { font-size: 24px; animation: bounce 2s infinite; }
        .ship-text { display: flex; flex-direction: column; }
        .ship-main { font-size: 13px; font-weight: 900; color: ${ACCENT}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
        .ship-sub { font-size: 14px; color: #fff; font-weight: 700; }
        .panel { padding: 30px 20px 10px; max-width: 550px; margin: 0 auto; }
        .social-proof-bar { display: flex; justify-content: center; align-items: center; gap: 20px; margin-bottom: 30px; font-size: 14px; font-weight: 700; color: #fff; background: rgba(255, 255, 255, 0.08); padding: 12px 24px; border-radius: 50px; border: 1px solid rgba(255, 255, 255, 0.15); width: fit-content; margin-left: auto; margin-right: auto; backdrop-filter: blur(10px); box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
        .sp-item { display: flex; align-items: center; gap: 8px; }
        .pulsating-dot { width: 10px; height: 10px; background: #4ade80; border-radius: 50%; animation: pulse-green 1.5s infinite; box-shadow: 0 0 10px #4ade80; }
        .fire-icon { color: #ff4444; font-size: 18px; }
        .price-block { text-align:center; margin-bottom: 24px; }
        .product-price { font-size: 48px; font-weight: 900; color: #fff; letter-spacing: -1.5px; }
        .compare-price { text-decoration: line-through; color: #666; font-size: 20px; margin-left: 12px; font-weight: 500; position: relative; top: -10px;}
        .selector-row { margin-bottom: 24px; }
        .label-group { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .label-title { font-size: 12px; font-weight: 800; color: #ccc; text-transform: uppercase; letter-spacing: 1px;}
        .select-box { width: 100%; padding: 16px; background: #151515; border: 1px solid #333; color: #fff; border-radius: 12px; font-size: 16px; appearance: none; font-weight: 600; transition: border 0.2s; cursor: pointer; }
        .select-box:focus { border-color: ${ACCENT}; outline: none; }
        .size-calc-btn { background: transparent; border: 1px solid #333; color: #888; padding: 4px 10px; border-radius: 50px; font-size: 10px; font-weight: 700; cursor: pointer; text-transform: uppercase; display: flex; align-items: center; gap: 4px; transition: all 0.2s ease; }
        .size-calc-btn:hover { border-color: ${ACCENT}; color: ${ACCENT}; }
        .stock-meter { margin: 25px 0; background: #111; padding: 12px; border-radius: 10px; border: 1px solid #222;}
        .meter-label { font-size: 12px; color: #bbb; margin-bottom: 8px; display: flex; justify-content: space-between; font-weight: 500; }
        .meter-bg { height: 6px; background: #222; border-radius: 3px; overflow: hidden; }
        .meter-fill { height: 100%; background: linear-gradient(90deg, #ff4444, #ff8844); width: 85%; border-radius: 3px; animation: load-meter 2s ease-out; }
        .cta-main { width: 100%; padding: 22px; margin-top: 15px; background: ${ACCENT}; color: #000; font-size: 18px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; border-radius: 12px; border: none; cursor: pointer; box-shadow: 0 4px 30px rgba(242, 194, 0, 0.2); transition: transform 0.1s; }
        .cta-main:active { transform: scale(0.98); }
        .accordion-section { margin-top: 40px; border-top: 1px solid #222; }
        .accordion-item { border-bottom: 1px solid #222; }
        .accordion-header { width: 100%; text-align: left; padding: 20px 0; background: none; border: none; color: #eee; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; justify-content: space-between; align-items: center; text-transform: uppercase; letter-spacing: 1px; }
        .accordion-content { max-height: 0; overflow: hidden; transition: max-height 0.3s ease; color: #999; font-size: 14px; line-height: 1.6; }
        .accordion-content.open { max-height: 300px; padding-bottom: 24px; }
        .plus-icon { font-size: 18px; color: ${ACCENT}; }
        .features-section { padding: 50px 24px; background: #0e0e0e; margin-top: 30px; }
        .features-grid { display: grid; gap: 30px; margin-bottom: 50px; }
        .feature-item { display: flex; gap: 16px; align-items: flex-start;}
        .f-icon { font-size: 28px; color: ${ACCENT}; line-height: 1; }
        .f-content h4 { font-size: 15px; font-weight: 800; color: #fff; margin: 0 0 6px 0; text-transform: uppercase; }
        .f-content p { font-size: 13px; color: #888; margin: 0; line-height: 1.5; }
        .reviews-title { text-align: center; font-size: 20px; font-weight: 900; text-transform: uppercase; margin-bottom: 30px; letter-spacing: 1px; color:#fff; }
        .reviews-grid { display: grid; gap: 16px; margin-bottom: 20px; }
        .review-card { background: #151515; padding: 20px; border-radius: 12px; border: 1px solid #222; }
        .review-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .reviewer-name { font-weight: 700; font-size: 14px; color: #fff; }
        .verified { color: #4ade80; margin-left: 6px; font-size: 11px; background: rgba(74, 222, 128, 0.1); padding: 2px 6px; border-radius: 4px;}
        .review-stars { color: ${ACCENT}; font-size: 14px; letter-spacing: 2px; }
        .review-text { color: #ccc; font-size: 14px; line-height: 1.5; font-style: italic; }
        .gallery-container { padding: 0 0 60px; max-width: 1000px; margin: 0 auto; background: #050505;}
        .gallery-header { text-align: center; margin: 40px 0 20px; font-size: 12px; font-weight: 800; color: #555; text-transform: uppercase; letter-spacing: 2px; }
        .gallery-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px; }
        .gallery-item:nth-child(3n) { grid-column: span 2; aspect-ratio: 16/9; }
        .gallery-item { aspect-ratio: 4/5; overflow: hidden; background: #111; position: relative;}
        .gallery-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;}
        .gallery-item:hover img { transform: scale(1.03); }
        .faq-section { background: #0f0f0f; padding: 60px 20px; border-top: 1px solid #222; }
        .faq-title { text-align:center; font-size:24px; font-weight:900; margin-bottom:40px; color:${ACCENT}; text-transform:uppercase; letter-spacing:-1px;}
        .faq-item { border-bottom: 1px solid #333; max-width: 600px; margin: 0 auto; }
        .faq-q { width:100%; text-align:left; padding: 20px 0; background:none; border:none; color:#fff; font-weight:700; font-size:16px; cursor:pointer; display:flex; justify-content:space-between; align-items:center;}
        .faq-a { max-height:0; overflow:hidden; transition:max-height 0.3s ease; color:#bbb; font-size:15px; line-height:1.6; }
        .faq-a.open { max-height:150px; padding-bottom:24px; }
        .trust-footer { background: #000; padding: 60px 20px 140px; text-align: center; border-top: 1px solid #222; }
        .tf-logos { display:flex; justify-content:center; gap:20px; margin-bottom:25px; opacity:0.6; filter:grayscale(100%); }
        .tf-icon { font-size:24px; color:#fff; border:1px solid #444; padding:6px 12px; border-radius:6px; font-weight:bold; font-size:12px; }
        .tf-text { font-size:12px; color:#555; line-height:1.5; }
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.9); z-index:200; display:flex; align-items:center; justify-content:center; padding:20px; backdrop-filter: blur(5px);}
        .modal-content { background:#151515; padding:40px 30px; border-radius:16px; border:1px solid #333; width:100%; max-width:380px; text-align:center; position:relative; box-shadow: 0 20px 50px rgba(0,0,0,0.5);}
        .close-modal { position:absolute; top:15px; right:20px; background:none; border:none; color:#666; font-size:28px; cursor:pointer; transition:color 0.2s;}
        .close-modal:hover { color: #fff; }
        .modal-title { font-size:20px; font-weight:900; margin-bottom:25px; color:#fff; text-transform: uppercase;}
        .input-group { margin-bottom:20px; text-align:left; }
        .input-group label { display:block; font-size:12px; color:#888; margin-bottom:8px; font-weight: 700; text-transform: uppercase;}
        .modal-input { width:100%; padding:16px; background:#0a0a0a; border:1px solid #333; color:#fff; border-radius:8px; font-size:18px; text-align: center; font-weight: bold;}
        .modal-input:focus { border-color: ${ACCENT}; outline: none; }
        .calc-btn { width:100%; padding:16px; background:${ACCENT}; color:#000; font-weight:900; border:none; border-radius:8px; cursor:pointer; margin-top:15px; font-size: 14px; letter-spacing: 1px;}
        .result-box { margin-top:25px; padding:20px; background:#222; border-radius:8px; border:1px solid ${ACCENT}; animation: fade-in 0.5s ease;}
        .result-text { font-size:13px; color:#aaa; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;}
        .result-size { font-size:48px; font-weight:900; color:${ACCENT}; display:block; margin:10px 0; line-height: 1;}
        .sticky-bar { position: fixed; bottom: 0; left: 0; right: 0; background: rgba(15,15,15,0.95); border-top: 1px solid #333; z-index: 100; display: flex; align-items: center; justify-content: space-between; gap: 15px; padding: 16px 20px calc(16px + env(safe-area-inset-bottom)); transform: translateY(110%); transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); backdrop-filter: blur(10px); }
        .sticky-bar.visible { transform: translateY(0); }
        .sticky-info { display: flex; flex-direction: column; }
        .sticky-title { font-size: 10px; font-weight: 800; color: #666; text-transform: uppercase; letter-spacing: 1px; }
        .sticky-price { color: #fff; font-weight: 900; font-size:18px; }
        .cta-sticky { flex: 1; padding: 14px; background: ${ACCENT}; color: #000; font-weight: 900; font-size: 14px; border: none; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(242, 194, 0, 0.15); }
        .whatsapp-float { position: fixed; bottom: 100px; right: 20px; z-index: 99; background: #25D366; width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .whatsapp-float:active { transform: scale(0.9); }
        @keyframes pulse-green { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes pulse-shadow { 0% { box-shadow: 0 0 15px rgba(242, 194, 0, 0.1); } 50% { box-shadow: 0 0 25px rgba(242, 194, 0, 0.5); } 100% { box-shadow: 0 0 15px rgba(242, 194, 0, 0.1); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        @keyframes load-meter { 0% { width: 0%; } 100% { width: 85%; } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <main>
        {/* HERO SCROLL VIDEO */}
        <div className="hero-container">
            <div className="hero-sticky-frame">
                <div className="video-layer">
                    <VideoFinal 
                        mp4Src={VIDEO_PATH} 
                        poster={IMAGE_PATH} 
                        bgFallback="#000" 
                    />
                </div>
                <div className="overlay">
                    <div className="stars">★★★★★ +400 CLIENTES FELICES</div>
                    <h1>LAREDO <span className="highlight">BOMBER</span></h1>
                    <p className="subtitle">Diseñada para durar. Hecha para impresionar.</p>
                </div>
            </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="content-layer">
            
            <div className="shipping-alert">
                <span className="ship-icon">⚡</span>
                <div className="ship-text">
                    <span className="ship-main">ENTREGA FLASH</span>
                    <span className="ship-sub">Recibe tu pedido en menos de 34 horas.</span>
                </div>
            </div>

            <section className="panel">
                {/* PRUEBA SOCIAL EN VIVO */}
                <div className="social-proof-bar">
                    <div className="sp-item"><div className="pulsating-dot"></div> {viewers} viendo</div>
                    <div className="sp-item">•</div>
                    <div className="sp-item"><span className="fire-icon">🔥</span> {recentSales} ventas hace 1h</div>
                </div>

                <div className="price-block">
                    <span className="product-price">
                        {selectedVariant?.price?.amount ? <Money data={selectedVariant.price}/> : '$185.000'}
                    </span>
                    <span className="compare-price">$245.000</span>
                </div>

                <div className="stock-meter">
                    <div className="meter-label">
                        <span>Alta Demanda</span>
                        <span style={{color:'#ff4444', fontWeight:'bold'}}>¡Quedan pocas unidades!</span>
                    </div>
                    <div className="meter-bg"><div className="meter-fill"></div></div>
                </div>

                {/* SELECTORES */}
                <div className="selector-row">
                    <div className="label-group"><span className="label-title">Color: {color}</span></div>
                    <select className="select-box" value={color} onChange={(e)=>setColor(e.target.value)}>
                        {COLORS.map((c)=> <option key={c}>{c}</option>)}
                    </select>
                </div>

                <div className="selector-row">
                    <div className="label-group">
                        <span className="label-title">Talla</span>
                        <button className="size-calc-btn" onClick={() => setShowSizeModal(true)}>📏 ¿Cuál es mi talla?</button>
                    </div>
                    <select className="select-box" value={size} onChange={(e)=>setSize(e.target.value)}>
                        {SIZES.map((s)=> <option key={s}>{s}</option>)}
                    </select>
                </div>

                {/* BOTÓN DE COMPRA - FIX REDIRECCIÓN */}
                <button 
                    ref={mainCtaRef}
                    className="cta-main"
                    onClick={handleBuy} // <--- Llama a la función corregida
                >
                    COMPRAR AHORA - ENVIAR YA
                </button>

                {/* ACORDEONES */}
                <div className="accordion-section">
                  {[{ title: "Materiales y Composición", content: "Exterior: Nylon Taslan 100% Impermeable de alto calibre. Forro: Poliéster perchado térmico inteligente. Cremalleras: YKK originales selladas contra el agua." },
                    { title: "Guía de Tallas (Fit)", content: "El fit es 'Regular'. Si usas talla M en camisetas, pide M en la chaqueta. Si te gusta usar busos muy gruesos debajo, te recomendamos pedir una talla más grande." },
                    { title: "Garantía The Ranch", content: "Compra sin miedo. Tienes 60 días de garantía por defectos de fábrica (costuras, cremalleras). Si no te queda, el primer cambio es GRATIS." }
                  ].map((item, i) => (
                    <div key={i} className="accordion-item">
                      <button className="accordion-header" onClick={() => setOpenAccordion(openAccordion === i ? null : i)}>
                        {item.title}
                        <span className="plus-icon">{openAccordion === i ? '−' : '+'}</span>
                      </button>
                      <div className={`accordion-content ${openAccordion === i ? 'open' : ''}`}>{item.content}</div>
                    </div>
                  ))}
                </div>
            </section>

            {/* BENEFICIOS, GALERIA Y RESTO IGUAL ... */}
            <section className="features-section"><div className="features-grid"><div className="feature-item"><span className="f-icon">💧</span><div className="f-content"><h4>100% Impermeable</h4><p>Protección total contra la lluvia y el viento.</p></div></div><div className="feature-item"><span className="f-icon">🔒</span><div className="f-content"><h4>Pago Contraentrega</h4><p>Pagas solo cuando recibes el producto en casa.</p></div></div><div className="feature-item"><span className="f-icon">🛡️</span><div className="f-content"><h4>Garantía Total</h4><p>30 días para cambios sin preguntas.</p></div></div></div><h3 className="reviews-title">Lo que dicen en el Rancho</h3><div className="reviews-grid">{REVIEWS.map((review)=>(<div key={review.id} className="review-card"><div className="review-header"><span className="reviewer-name">{review.author}{review.verified&&<span className="verified">✓ COMPRA VERIFICADA</span>}</span><span className="review-stars">{'★'.repeat(review.rating)}</span></div><p className="review-text">"{review.text}"</p></div>))}</div></section>
            {sortedGallery.length>0&&( <section className="gallery-container"><div className="gallery-header">Galería Oficial • {color}</div><div className="gallery-grid">{sortedGallery.slice(0,8).map((img,i)=>(<div key={img.id||i} className="gallery-item">{img.url?<Image data={img} widths={[600]} sizes="(min-width: 768px) 50vw, 100vw" loading="lazy"/>:null}</div>))}</div></section> )}
            <section className="faq-section"><h2 className="faq-title">Preguntas Frecuentes</h2>{FAQS.map((item,i)=>(<div key={i} className="faq-item"><button className="faq-q" onClick={()=>setOpenFaq(openFaq===i?null:i)}>{item.q}<span style={{color:ACCENT}}>{openFaq===i?'−':'+'}</span></button><div className={`faq-a ${openFaq===i?'open':''}`}>{item.a}</div></div>))}</section>
            <footer className="trust-footer"><div className="tf-logos"><span className="tf-icon">VISA</span><span className="tf-icon">MC</span><span className="tf-icon">NEQUI</span><span className="tf-icon">PSE</span></div><div className="tf-text">🔒 Compra 100% Segura. Tus datos están encriptados con SSL de 256-bits.<br/>The Ranch © 2025. Todos los derechos reservados.</div></footer>
        </div>
      </main>

      {showSizeModal && ( <div className="modal-overlay" onClick={()=>setShowSizeModal(false)}><div className="modal-content" onClick={e=>e.stopPropagation()}><button className="close-modal" onClick={()=>setShowSizeModal(false)}>×</button><h3 className="modal-title">Calcula tu Talla Ideal</h3><div className="input-group"><label>Tu Estatura (cm)</label><input type="number" className="modal-input" placeholder="Ej: 175" value={userHeight} onChange={e=>setUserHeight(e.target.value)}/></div><div className="input-group"><label>Tu Peso (kg)</label><input type="number" className="modal-input" placeholder="Ej: 75" value={userWeight} onChange={e=>setUserWeight(e.target.value)}/></div><button className="calc-btn" onClick={handleCalculate}>CALCULAR TALLA</button>{recommended&&(<div className="result-box"><span className="result-text">Tu talla recomendada es:</span><span className="result-size">{recommended}</span><button style={{marginTop:10,background:'none',border:'none',color:'#fff',textDecoration:'underline',cursor:'pointer'}} onClick={()=>setShowSizeModal(false)}>Usar esta talla</button></div>)}</div></div> )}
      <div className={`sticky-bar ${showStickyBar?'visible':''}`}><div className="sticky-info"><span className="sticky-title">Oferta Flash</span><span className="sticky-price">$185.000</span></div><button className="cta-sticky" onClick={handleBuy}>Comprar Ahora</button></div>
      <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20quiero%20pedir%20la%20Laredo%20con%20entrega%20en%2034h`} target="_blank" rel="noreferrer" className="whatsapp-float"><svg width="28" height="28" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>
    </>
  );
}