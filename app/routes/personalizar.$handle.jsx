import {useLoaderData} from 'react-router';
import {useRef, useState} from 'react';
import customStyles from '~/styles/personalizar.css?url';

const PRODUCT_QUERY = `#graphql
  query PersonalizableProduct($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      featuredImage {
        url(transform: {maxWidth: 900, preferredContentType: WEBP})
        altText
      }
      priceRange {
        minVariantPrice { amount currencyCode }
      }
      variants(first: 1) {
        nodes { id }
      }
    }
  }
`;

const FONTS = [
  {id: 'rye', label: 'Western', family: '"Rye", serif'},
  {id: 'playfair', label: 'Serif', family: '"Playfair Display", serif'},
  {id: 'greatvibes', label: 'Script', family: '"Great Vibes", cursive'},
  {id: 'oswald', label: 'Bold', family: '"Oswald", sans-serif'},
];

export const links = () => [
  {rel: 'stylesheet', href: customStyles},
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Rye&family=Playfair+Display:wght@700&family=Great+Vibes&family=Oswald:wght@600&display=swap',
  },
];

export async function loader({params, context}) {
  const {storefront} = context;
  try {
    const data = await storefront.query(PRODUCT_QUERY, {
      variables: {handle: params.handle},
    });
    if (!data?.product) throw new Response('No encontrado', {status: 404});
    return {product: data.product};
  } catch (e) {
    throw new Response('No encontrado', {status: 404});
  }
}

export const meta = ({data}) => {
  const p = data?.product;
  if (!p) return [{title: 'Personaliza tu prenda — The Ranch'}];
  return [
    {title: `Personaliza tu ${p.title} — The Ranch`},
    {name: 'description', content: `Personaliza tu ${p.title} con grabado láser: elige tipografía, escribe tu texto o sube tu logo.`},
    {tagName: 'link', rel: 'canonical', href: `https://ranch.com.co/personalizar/${p.handle}`},
  ];
};

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export default function Personalizar() {
  const {product} = useLoaderData();
  const img = product?.featuredImage?.url || '';
  const price = product?.priceRange?.minVariantPrice?.amount;

  const [text, setText] = useState('');
  const [font, setFont] = useState(FONTS[0].family);
  const [logo, setLogo] = useState(null);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({x: 50, y: 40});
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [logoError, setLogoError] = useState('');

  const stageRef = useRef(null);
  const pointers = useRef({});
  const pinchDist = useRef(0);
  const scaleAtPinch = useRef(1);

  const moveTo = (cx, cy) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const x = clamp(((cx - rect.left) / rect.width) * 100, 0, 100);
    const y = clamp(((cy - rect.top) / rect.height) * 100, 0, 100);
    setPos({x, y});
  };

  const twoPointerDist = () => {
    const pts = Object.values(pointers.current);
    if (pts.length < 2) return 0;
    return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
  };

  const onDown = (e) => {
    pointers.current[e.pointerId] = {x: e.clientX, y: e.clientY};
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const n = Object.keys(pointers.current).length;
    if (n === 1) {
      setDragging(true);
      moveTo(e.clientX, e.clientY);
    } else if (n === 2) {
      setDragging(false);
      pinchDist.current = twoPointerDist();
      scaleAtPinch.current = scale;
    }
  };

  const onMove = (e) => {
    if (!pointers.current[e.pointerId]) return;
    pointers.current[e.pointerId] = {x: e.clientX, y: e.clientY};
    const n = Object.keys(pointers.current).length;
    if (n === 1 && dragging) {
      moveTo(e.clientX, e.clientY);
    } else if (n === 2) {
      const d = twoPointerDist();
      if (pinchDist.current > 0) {
        setScale(clamp(scaleAtPinch.current * (d / pinchDist.current), 0.3, 2.5));
      }
    }
  };

  const onUp = (e) => {
    delete pointers.current[e.pointerId];
    if (Object.keys(pointers.current).length < 2) {
      pinchDist.current = 0;
    }
    if (Object.keys(pointers.current).length === 0) {
      setDragging(false);
    }
  };

  const onLogo = (e) => {
    const file = e.target.files?.[0];
    setLogoError('');
    if (!file) return;
    if (file.type !== 'image/png') {
      setLogoError('El logo debe ser PNG (fondo transparente).');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result);
    reader.readAsDataURL(file);
  };

  const renderCanvas = async () => {
    try {
      await document.fonts.load(`110px ${font}`);
      await document.fonts.ready;
    } catch {}
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = img;
    await image.decode();
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const px = (pos.x / 100) * canvas.width;
    const py = (pos.y / 100) * canvas.height;

    if (logo) {
      const li = new Image();
      li.src = logo;
      await li.decode();
      const w = li.width * scale;
      const h = li.height * scale;
      ctx.drawImage(li, px - w / 2, py - h / 2, w, h);
    } else if (text.trim()) {
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${Math.round(110 * scale)}px ${font}`;
      ctx.fillText(text, px, py);
    }
    return canvas.toDataURL('image/png');
  };

  const finalizar = async () => {
    if (busy) return;
    if (!text.trim() && !logo) return;
    setBusy(true);
    try {
      const render = await renderCanvas();
      const form = new FormData();
      form.append('product', product.title);
      form.append('handle', product.handle);
      form.append('variantId', product.variants?.nodes?.[0]?.id || '');
      form.append('text', text);
      form.append('font', font);
      form.append('scale', String(scale));
      form.append('pos', JSON.stringify(pos));
      form.append('render', render);
      if (logo) form.append('logo', logo);

      const res = await fetch('/api/personalizar', {method: 'POST', body: form});
      const data = await res.json();
      if (data?.ok) setDone(true);
      else alert('No se pudo guardar. Intenta de nuevo.');
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error. Intenta de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  const previewText = text.trim() || 'Tu texto';

  return (
    <div className="cust">
      <header className="cust-head">
        <span className="cust-badge">Grabado láser</span>
        <h1 className="cust-title">Personaliza tu {product?.title}</h1>
        <p className="cust-sub">
          Escribe, elige tu estilo, súbelo y míralo en vivo.
          <strong> +$15.000</strong> por personalización
        </p>
      </header>

      {/* Vista previa */}
      <div className="cust-stage" ref={stageRef}>
        {img ? <img className="cust-img" src={img} alt={product?.title} draggable={false} /> : null}
        <div
          className={`cust-design ${dragging ? 'is-dragging' : ''}`}
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: `translate(-50%, -50%) scale(${scale})`,
            fontFamily: font,
          }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          {logo ? <img className="cust-logo" src={logo} alt="logo" draggable={false} /> : previewText}
        </div>
        <div className="cust-stage-topbar">
          <span className="cust-stage-tag">Vista previa en vivo</span>
          <div className="cust-zoom">
            <button type="button" aria-label="Reducir" onClick={() => setScale((s) => clamp(s - 0.15, 0.3, 2.5))}>−</button>
            <button type="button" aria-label="Aumentar" onClick={() => setScale((s) => clamp(s + 0.15, 0.3, 2.5))}>+</button>
          </div>
        </div>
        <div className="cust-hint">Arrastra para mover · pellizca para escalar</div>
      </div>

      {/* Controles */}
      <div className="cust-controls">
        <div className="cust-row">
          <label className="cust-label" htmlFor="cust-text">1 · Tu texto</label>
          <input
            id="cust-text"
            className="cust-input"
            type="text"
            placeholder="Escribe algo…"
            value={text}
            maxLength={20}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="cust-row">
          <span className="cust-label">2 · Elige tu estilo</span>
          <div className="cust-fonts">
            {FONTS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`cust-font ${font === f.family ? 'is-active' : ''}`}
                onClick={() => setFont(f.family)}
              >
                <span className="cust-font-sample" style={{fontFamily: f.family}}>{previewText}</span>
                <span className="cust-font-name">{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="cust-row">
          <label className="cust-label" htmlFor="cust-scale">3 · Tamaño</label>
          <input
            id="cust-scale"
            className="cust-range"
            type="range"
            min="0.3"
            max="2.5"
            step="0.05"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
          />
        </div>

        <div className="cust-row">
          <span className="cust-label">4 · Tu logo (PNG, opcional)</span>
          <input className="cust-file" type="file" accept="image/png" onChange={onLogo} />
          {logoError ? <p className="cust-error">{logoError}</p> : null}
          {logo ? (
            <button className="cust-clear" type="button" onClick={() => setLogo(null)}>
              Quitar logo
            </button>
          ) : null}
        </div>

        <button
          className="cust-cta"
          type="button"
          disabled={busy || (!text.trim() && !logo)}
          onClick={finalizar}
        >
          {busy ? 'Generando…' : 'Finalizar personalización'}
        </button>
        <p className="cust-note">Guardamos tu diseño (render + archivos) y lo enviamos con tu pedido.</p>

        {done ? (
          <div className="cust-done">✅ ¡Diseño guardado! Te contactaremos para completar el pedido.</div>
        ) : null}
      </div>
    </div>
  );
}

function formatCOP(amount) {
  if (!amount) return '';
  const n = Number(amount);
  return `$${n.toLocaleString('es-CO')}`;
}
