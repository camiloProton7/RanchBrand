import {useEffect, useMemo, useRef, useState} from 'react';
import {useLoaderData} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
// Importamos el componente de video (asegúrate de que VideoFinal.jsx esté en components)
import VideoFinal from '../components/VideoFinal';

/* ===== META DATA ===== */
export const meta = () => ([
  {title: 'Laredo Bomber — Entrega en 24H | The Ranch'},
  {name: 'description', content: 'Chaqueta Laredo. Entrega confirmada en menos de 24 horas. Calidad Premium.'},
]);

/* ===== CONFIGURACIÓN DE ASSETS ===== */
// Rutas directas a la carpeta public
const VIDEO_PATH = '/video-scroll.mp4';
const IMAGE_PATH = '/poster-hero.jpg';

/* ===== DATOS FIJOS (Reseñas, FAQ) ===== */
const REVIEWS = [
  { id: 1, author: "Camilo R.", verified: true, text: "La calidad me sorprendió. La usé en moto bajo aguacero en Bogotá y llegué seco. Vale cada peso.", rating: 5 },
  { id: 2, author: "Andrés M.", verified: true, text: "El fit es perfecto. No queda bombacha como otras bomber. Se ve muy elegante para la oficina.", rating: 5 },
  { id: 3, author: "Juan David P.", verified: true, text: "El envío fue rapidísimo. La pedí a las 2pm y al otro día ya la tenía. Recomendados.", rating: 5 }
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
            # CAMBIO: Pedimos 50 imágenes para asegurar que lleguen las de todos los colores
            images(first: 50) { 
              nodes { 
                id 
                url 
                altText 
                width 
                height 
              } 
            }
            variants(first: 50) {
              nodes {
                id
                availableForSale
                selectedOptions { name value }
                price { amount currencyCode }
                # También pedimos la imagen específica de la variante si existe
                image {
                    id
                    url
                    altText
                }
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
const STORE_DOMAIN = 'the-ranch.myshopify.com'; 
const COLORS = ['Verde Oliva', 'Negro'];
const SIZES  = ['S', 'M', 'L', 'XL'];
const ACCENT = '#f2c200';
const WHATSAPP_NUMBER = '573000000000'; 

function toNumericId(gid) { return gid?.match(/\/(\d+)$/)?.[1] || gid; }
function cartUrl(gid, qty = 1) { 
    const domain = (typeof window !== 'undefined') ? window.location.hostname : STORE_DOMAIN;
    return `https://${domain}/cart/${toNumericId(gid)}:${qty}`; 
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
  const [viewers, setViewers] = useState(12);
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
        setViewers(v => Math.floor(Math.random() * (18 - 8 + 1) + 8));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  // LÓGICA INTELIGENTE DE GALERÍA
  // Intenta filtrar las imágenes que coincidan con el color seleccionado (usando Alt Text)
  const filteredGallery = useMemo(() => {
      if (!allImages.length) return [];
      
      const matchingImages = allImages.filter(img => {
          if (!img.altText) return true; // Si no tiene alt, la mostramos por si acaso
          const alt = img.altText.toLowerCase();
          const selectedColor = color.toLowerCase();
          return alt.includes(selectedColor);
      });

      // Si encontramos fotos del color específico, mostramos esas. Si no, mostramos todas.
      return matchingImages.length > 0 ? matchingImages : allImages;
  }, [allImages, color]);


  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-100px 0px 0px 0px" }
    );
    if (mainCtaRef.current) observer.observe(mainCtaRef.current);
    return () => observer.disconnect();
  }, []);

  // RASTREO DE PIXEL (ViewContent)
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

  return (
    <>
      <style>{`
        /* CORRECCIÓN: Font-family sin comillas para evitar error #418 */
        html, body { margin:0; padding:0; background:#050505; color:#fff; font-family: Helvetica Neue, sans-serif; -webkit-font-smoothing: antialiased; }
        * { box-sizing: border-box; }

        .hero-container { height: 250vh; width: 100%; position: relative; z-index: 1; }
        .hero-sticky-frame { position: sticky; top: 0; left: 0; width: 100%; height: 100dvh; overflow: hidden; }
        .video-layer { position: absolute; inset: 0; z-index: 0; background: #000; }
        
        .overlay {
            position: absolute; inset: 0; z-index: 2;
            display: flex; flex-direction: column; justify-content: flex-end; align-items: center;
            padding: 0 20px 22vh 20px; text-align: center;
            background: linear-gradient(to top, rgba(0,0,0,0.95) 10%, transparent 50%);
            pointer-events: none;
        }
        .stars { color: ${ACCENT}; font-size: 13px; margin-bottom: 8px; letter-spacing: 2px; font-weight: 700; text-transform:uppercase;}
        .overlay h1 { font-size: clamp(42px, 10vw, 64px); font-weight: 900; line-height: 0.95; text-transform: uppercase; letter-spacing: -2px; margin:0; }
        .overlay h1 .highlight { color: ${ACCENT}; }
        .overlay p.subtitle  { font-size: clamp(15px, 4vw, 18px); opacity: 0.9; margin-top: 10px; max-width: 320px; font-weight: 400; }

        .content-layer {
            position: relative; z-index: 10; 
            background: #0a0a0a; 
            box-shadow: 0 -50px 100px rgba(0,0,0,1);
            border-radius: 20px 20px 0 0;
            margin-top: -8vh; padding-bottom: 0px; 
        }

        .shipping-alert {
            background: #1a1a1a; border-left: 4px solid ${ACCENT};
            padding: 20px 20px; margin: 0;
            display: flex; align-items: center; gap: 14px;
        }
        .ship-icon { font-size: 28px; }
        .ship-text { display: flex; flex-direction: column; }
        .ship-main { font-size: 16px; font-weight: 900; color: ${ACCENT}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
        .ship-sub { font-size: 14px; color: #fff; font-weight: 600; }

        .panel { padding: 30px 20px 10px; max-width: 550px; margin: 0 auto; }
        .live-viewers { text-align: center; font-size: 12px; color: #aaa; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .pulsating-dot { width: 8px; height: 8px; background: #ff4444; border-radius: 50%; animation: pulse-red 1.5s infinite; }

        .price-block { text-align:center; margin-bottom: 24px; }
        .product-price { font-size: 42px; font-weight: 900; color: #fff; letter-spacing: -1px; }
        .compare-price { text-decoration: line-through; color: #555; font-size: 18px; margin-left: 10px; font-weight: 500; }

        .selector-row { margin-bottom: 20px; }
        .label-group { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .label-title { font-size: 13px; font-weight: 700; color: #ccc; text-transform: uppercase; }
        .select-box { width: 100%; padding: 16px; background: #151515; border: 1px solid #333; color: #fff; border-radius: 8px; font-size: 16px; appearance: none; font-weight: 600; }
        
        .size-calc-btn { 
            background: rgba(242, 194, 0, 0.15); border: 1px solid ${ACCENT}; color: ${ACCENT};
            padding: 6px 14px; border-radius: 50px; font-size: 11px; font-weight: 800;
            cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px;
            display: flex; align-items: center; gap: 6px; transition: all 0.2s ease;
        }
        .size-calc-btn:hover { background: ${ACCENT}; color: #000; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(242, 194, 0, 0.3); }

        .stock-meter { margin: 20px 0; }
        .meter-label { font-size: 11px; color: #888; margin-bottom: 5px; display: flex; justify-content: space-between; }
        .meter-bg { height: 6px; background: #222; border-radius: 3px; overflow: hidden; }
        .meter-fill { height: 100%; background: linear-gradient(90deg, #ff4444, #ff8844); width: 85%; border-radius: 3px; }

        .cta-main {
            width: 100%; padding: 20px; margin-top: 10px;
            background: ${ACCENT}; color: #000;
            font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;
            border-radius: 8px; border: none; cursor: pointer;
            box-shadow: 0 0 20px rgba(242, 194, 0, 0.3);
            animation: pulse-shadow 2s infinite;
        }

        .accordion-section { margin-top: 30px; border-top: 1px solid #222; }
        .accordion-item { border-bottom: 1px solid #222; }
        .accordion-header {
            width: 100%; text-align: left; padding: 18px 0; background: none; border: none;
            color: #ddd; font-size: 14px; font-weight: 700; cursor: pointer;
            display: flex; justify-content: space-between; align-items: center; text-transform: uppercase; letter-spacing: 1px;
        }
        .accordion-content { max-height: 0; overflow: hidden; transition: max-height 0.3s ease; color: #999; font-size: 14px; line-height: 1.6; }
        .accordion-content.open { max-height: 200px; padding-bottom: 20px; }
        .plus-icon { font-size: 20px; color: ${ACCENT}; }

        .features-section { padding: 40px 24px 20px; max-width: 550px; margin: 0 auto; margin-top: 20px; }
        .features-grid { display: grid; gap: 24px; margin-bottom: 40px; }
        .feature-item { display: flex; gap: 16px; }
        .f-icon { font-size: 24px; color: ${ACCENT}; }
        .f-content h4 { font-size: 14px; font-weight: 800; color: #fff; margin: 0 0 4px 0; text-transform: uppercase; }
        .f-content p { font-size: 13px; color: #999; margin: 0; line-height: 1.5; }

        .reviews-title { text-align: center; font-size: 18px; font-weight: 800; text-transform: uppercase; margin-bottom: 20px; letter-spacing: 1px; color:#fff; }
        .reviews-grid { display: grid; gap: 16px; margin-bottom: 40px; }
        .review-card { background: #151515; padding: 16px; border-radius: 8px; border: 1px solid #222; }
        .review-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .reviewer-name { font-weight: 700; font-size: 13px; color: #fff; }
        .verified { color: #4ade80; margin-left: 4px; font-size: 12px; }
        .review-stars { color: ${ACCENT}; font-size: 12px; letter-spacing: 2px; }
        .review-text { color: #bbb; font-size: 13px; line-height: 1.4; font-style: italic; }

        .gallery-container { padding: 0 10px 40px; max-width: 800px; margin: 0 auto; }
        .gallery-header { text-align: center; margin: 30px 0 15px; font-size: 12px; font-weight: 800; color: #555; text-transform: uppercase; letter-spacing: 2px; }
        .gallery-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
        .gallery-item { aspect-ratio: 4/5; border-radius: 6px; overflow: hidden; background: #111; }
        .gallery-item img { width: 100%; height: 100%; object-fit: cover; }

        .faq-section { background: #0f0f0f; padding: 40px 20px; border-top: 1px solid #222; }
        .faq-title { text-align:center; font-size:20px; font-weight:900; margin-bottom:30px; color:${ACCENT}; text-transform:uppercase;}
        .faq-item { border-bottom: 1px solid #333; max-width: 600px; margin: 0 auto; }
        .faq-q { width:100%; text-align:left; padding: 16px 0; background:none; border:none; color:#fff; font-weight:700; font-size:15px; cursor:pointer; display:flex; justify-content:space-between; }
        .faq-a { max-height:0; overflow:hidden; transition:max-height 0.3s ease; color:#ccc; font-size:14px; line-height:1.5; }
        .faq-a.open { max-height:150px; padding-bottom:16px; }

        .trust-footer { background: #000; padding: 40px 20px 120px; text-align: center; border-top: 1px solid #222; }
        .tf-logos { display:flex; justify-content:center; gap:15px; margin-bottom:20px; opacity:0.7; filter:grayscale(100%); }
        .tf-icon { font-size:24px; color:#fff; border:1px solid #444; padding:5px 10px; border-radius:4px; font-weight:bold; font-size:12px; }
        .tf-text { font-size:12px; color:#555; }
        
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:200; display:flex; align-items:center; justify-content:center; padding:20px; }
        .modal-content { background:#151515; padding:30px; border-radius:12px; border:1px solid #333; width:100%; max-width:350px; text-align:center; position:relative; }
        .close-modal { position:absolute; top:10px; right:15px; background:none; border:none; color:#fff; font-size:24px; cursor:pointer; }
        .modal-title { font-size:18px; font-weight:800; margin-bottom:20px; color:#fff; }
        .input-group { margin-bottom:15px; text-align:left; }
        .input-group label { display:block; font-size:12px; color:#aaa; margin-bottom:5px; }
        .modal-input { width:100%; padding:12px; background:#000; border:1px solid #333; color:#fff; border-radius:6px; font-size:16px; }
        .calc-btn { width:100%; padding:14px; background:${ACCENT}; color:#000; font-weight:800; border:none; border-radius:8px; cursor:pointer; margin-top:10px; }
        .result-box { margin-top:20px; padding:15px; background:#222; border-radius:8px; border:1px solid ${ACCENT}; }
        .result-text { font-size:14px; color:#fff; }
        .result-size { font-size:32px; font-weight:900; color:${ACCENT}; display:block; margin:5px 0; }

        .sticky-bar {
            position: fixed; bottom: 0; left: 0; right: 0;
            background: #111; border-top: 1px solid #333; z-index: 100;
            display: flex; align-items: center; justify-content: space-between; gap: 12px;
            padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
            transform: translateY(110%); transition: transform 0.2s ease-out;
        }
        .sticky-bar.visible { transform: translateY(0); }
        .sticky-info { display: flex; flex-direction: column; }
        .sticky-title { font-size: 11px; font-weight: 700; color: #aaa; text-transform: uppercase; }
        .sticky-price { color: #fff; font-weight: 800; font-size:16px; }
        .cta-sticky { flex: 1; padding: 14px; background: ${ACCENT}; color: #000; font-weight: 900; font-size: 14px; border: none; border-radius: 4px; text-transform: uppercase; }

        .whatsapp-float {
            position: fixed; bottom: 90px; right: 20px; z-index: 99;
            background: #25D366; width: 50px; height: 50px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5); transition: transform 0.2s;
        }
        .whatsapp-float:active { transform: scale(0.9); }

        @keyframes pulse-red { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes pulse-shadow { 0% { box-shadow: 0 0 15px rgba(242, 194, 0, 0.1); } 50% { box-shadow: 0 0 25px rgba(242, 194, 0, 0.5); } 100% { box-shadow: 0 0 15px rgba(242, 194, 0, 0.1); } }
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
                    <div className="stars">★★★★★ 48 Reseñas</div>
                    <h1>LAREDO <span className="highlight">BOMBER</span></h1>
                    <p className="subtitle">Diseñada para durar. Hecha para impresionar.</p>
                </div>
            </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="content-layer">
            
            <div className="shipping-alert">
                <span className="ship-icon">🚀</span>
                <div className="ship-text">
                    <span className="ship-main">PIDE AHORA MISMO</span>
                    <span className="ship-sub">Entrega confirmada menos de 24 horas.</span>
                </div>
            </div>

            <section className="panel">
                <div className="live-viewers">
                    <div className="pulsating-dot"></div>
                    {viewers} personas están viendo esto ahora
                </div>

                <div className="price-block">
                    <span className="product-price">
                        {selectedVariant?.price?.amount ? <Money data={selectedVariant.price}/> : '$185.000'}
                    </span>
                    <span className="compare-price">$245.000</span>
                </div>

                <div className="stock-meter">
                    <div className="meter-label">
                        <span>Disponibilidad</span>
                        <span style={{color:'#ff4444', fontWeight:'bold'}}>¡Casi Agotado!</span>
                    </div>
                    <div className="meter-bg"><div className="meter-fill"></div></div>
                </div>

                {/* SELECTORES DE COLOR/TALLA */}
                <div className="selector-row">
                    <div className="label-group">
                        <span className="label-title">Color: {color}</span>
                    </div>
                    <select className="select-box" value={color} onChange={(e)=>setColor(e.target.value)}>
                        {COLORS.map((c)=> <option key={c}>{c}</option>)}
                    </select>
                </div>

                <div className="selector-row">
                    <div className="label-group">
                        <span className="label-title">Talla</span>
                        <button className="size-calc-btn" onClick={() => setShowSizeModal(true)}>
                            📏 ¿Cuál es mi talla?
                        </button>
                    </div>
                    <select className="select-box" value={size} onChange={(e)=>setSize(e.target.value)}>
                        {SIZES.map((s)=> <option key={s}>{s}</option>)}
                    </select>
                </div>

                {/* BOTÓN DE COMPRA */}
                <button 
                    ref={mainCtaRef}
                    className="cta-main"
                    onClick={()=> selectedVariant && window.location.assign(cartUrl(selectedVariant.id, qty))}
                >
                    COMPRAR AHORA
                </button>

                {/* ACORDEONES INFO */}
                <div className="accordion-section">
                  {[
                    { title: "Materiales y Composición", content: "Exterior: Nylon Taslan 100% Impermeable de alto calibre. Forro: Poliéster perchado térmico inteligente. Cremalleras: YKK originales selladas contra el agua." },
                    { title: "Guía de Tallas (Fit)", content: "El fit es 'Regular'. Si usas talla M en camisetas, pide M en la chaqueta. Si te gusta usar busos muy gruesos debajo, te recomendamos pedir una talla más grande." },
                    { title: "Garantía The Ranch", content: "Compra sin miedo. Tienes 60 días de garantía por defectos de fábrica (costuras, cremalleras). Si no te queda, el primer cambio es GRATIS." }
                  ].map((item, i) => (
                    <div key={i} className="accordion-item">
                      <button className="accordion-header" onClick={() => setOpenAccordion(openAccordion === i ? null : i)}>
                        {item.title}
                        <span className="plus-icon">{openAccordion === i ? '−' : '+'}</span>
                      </button>
                      <div className={`accordion-content ${openAccordion === i ? 'open' : ''}`}>
                        {item.content}
                      </div>
                    </div>
                  ))}
                </div>
            </section>

            {/* BENEFICIOS + RESEÑAS */}
            <section className="features-section">
                <div className="features-grid">
                    <div className="feature-item">
                        <span className="f-icon">💧</span>
                        <div className="f-content">
                            <h4>100% Impermeable</h4>
                            <p>Protección total contra la lluvia y el viento.</p>
                        </div>
                    </div>
                    <div className="feature-item">
                        <span className="f-icon">🔒</span>
                        <div className="f-content">
                            <h4>Pago Contraentrega</h4>
                            <p>Pagas solo cuando recibes el producto en casa.</p>
                        </div>
                    </div>
                    <div className="feature-item">
                        <span className="f-icon">🛡️</span>
                        <div className="f-content">
                            <h4>Garantía Total</h4>
                            <p>30 días para cambios sin preguntas.</p>
                        </div>
                    </div>
                </div>

                <h3 className="reviews-title">Lo que dicen en el Rancho</h3>
                <div className="reviews-grid">
                    {REVIEWS.map((review) => (
                      <div key={review.id} className="review-card">
                        <div className="review-header">
                          <span className="reviewer-name">
                            {review.author}
                            {review.verified && <span className="verified">✓</span>}
                          </span>
                          <span className="review-stars">{'★'.repeat(review.rating)}</span>
                        </div>
                        <p className="review-text">"{review.text}"</p>
                      </div>
                    ))}
                </div>
            </section>

            {/* GALERÍA DINÁMICA */}
            {filteredGallery.length > 0 && (
                <section className="gallery-container">
                    <div className="gallery-header">Galería {color}</div>
                    <div className="gallery-grid">
                        {filteredGallery.slice(0,6).map((img, i) => (
                            <div key={img.id || i} className="gallery-item">
                                {img.url ? <Image data={img} widths={[500]} sizes="50vw" /> : null}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* FAQ SECTION */}
            <section className="faq-section">
                <h2 className="faq-title">Preguntas Frecuentes</h2>
                {FAQS.map((item, i) => (
                    <div key={i} className="faq-item">
                        <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                            {item.q}
                            <span style={{color: ACCENT}}>{openFaq === i ? '−' : '+'}</span>
                        </button>
                        <div className={`faq-a ${openFaq === i ? 'open' : ''}`}>
                            {item.a}
                        </div>
                    </div>
                ))}
            </section>

            {/* TRUST FOOTER */}
            <footer className="trust-footer">
                <div className="tf-logos">
                    <span className="tf-icon">VISA</span>
                    <span className="tf-icon">MC</span>
                    <span className="tf-icon">NEQUI</span>
                    <span className="tf-icon">PSE</span>
                </div>
                <div className="tf-text">
                    🔒 Compra 100% Segura. Tus datos están encriptados.<br/>
                    The Ranch © 2025. Todos los derechos reservados.
                </div>
            </footer>
        </div>
      </main>

      {/* MODAL CALCULADORA */}
      {showSizeModal && (
        <div className="modal-overlay" onClick={() => setShowSizeModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-modal" onClick={() => setShowSizeModal(false)}>×</button>
                <h3 className="modal-title">Calcula tu Talla Ideal</h3>
                <div className="input-group">
                    <label>Tu Estatura (cm)</label>
                    <input type="number" className="modal-input" placeholder="Ej: 175" value={userHeight} onChange={e => setUserHeight(e.target.value)} />
                </div>
                <div className="input-group">
                    <label>Tu Peso (kg)</label>
                    <input type="number" className="modal-input" placeholder="Ej: 75" value={userWeight} onChange={e => setUserWeight(e.target.value)} />
                </div>
                <button className="calc-btn" onClick={handleCalculate}>CALCULAR AHORA</button>
                {recommended && (
                    <div className="result-box">
                        <span className="result-text">Tu talla recomendada es:</span>
                        <span className="result-size">{recommended}</span>
                        <button style={{marginTop:10, background:'none', border:'none', color:'#fff', textDecoration:'underline', cursor:'pointer'}} onClick={() => setShowSizeModal(false)}>
                            Usar esta talla
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* STICKY BAR */}
      <div className={`sticky-bar ${showStickyBar ? 'visible' : ''}`}>
        <div className="sticky-info">
            <span className="sticky-title">Laredo Bomber</span>
            <span className="sticky-price">$185.000</span>
        </div>
        <button className="cta-sticky" onClick={()=> selectedVariant && window.location.assign(cartUrl(selectedVariant.id, qty))}>
          Comprar Ahora
        </button>
      </div>

      {/* WHATSAPP FLOAT */}
      <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20tengo%20una%20pregunta%20sobre%20la%20Laredo`} target="_blank" rel="noreferrer" className="whatsapp-float">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>
    </>
  );
}