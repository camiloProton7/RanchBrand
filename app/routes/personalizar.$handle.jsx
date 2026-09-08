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
    if (!data?.product) {
      throw new Response('No encontrado', {status: 404});
    }
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
  const [pos, setPos] = useState({x: 50, y: 38});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const stageRef = useRef(null);
  const dragging = useRef(false);

  const onPointerDown = (e) => {
    dragging.current = true;
    e.target.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragging.current || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
    const y = clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100);
    setPos({x, y});
  };
  const onPointerUp = () => {
    dragging.current = false;
  };

  const onLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result);
    reader.readAsDataURL(file);
  };

  const renderCanvas = async () => {
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
      ctx.font = `${Math.round(90 * scale)}px ${font}`;
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
      if (data?.ok) {
        setDone(true);
      } else {
        alert('No se pudo guardar. Intenta de nuevo.');
      }
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error. Intenta de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cust">
      <header className="cust-head">
        <h1 className="cust-title">Personaliza tu {product?.title}</h1>
        <p className="cust-sub">
          Grabado láser en negro · + $15.000 COP · {formatCOP(price)}
        </p>
      </header>

      {/* Escenario de previsualización */}
      <div
        className="cust-stage"
        ref={stageRef}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {img ? <img className="cust-img" src={img} alt={product?.title} /> : null}
        <div
          className="cust-design"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: `translate(-50%, -50%) scale(${scale})`,
            fontFamily: font,
            color: '#000000',
          }}
          onPointerDown={onPointerDown}
        >
          {logo ? <img className="cust-logo" src={logo} alt="logo" /> : text || 'Tu texto'}
        </div>
        <div className="cust-hint">Arrastra para mover · usa el slider para escalar</div>
      </div>

      {/* Controles */}
      <div className="cust-controls">
        <div className="cust-row">
          <label className="cust-label">Texto</label>
          <input
            className="cust-input"
            type="text"
            placeholder="Escribe tu texto…"
            value={text}
            maxLength={20}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="cust-row">
          <label className="cust-label">Tipografía</label>
          <div className="cust-fonts">
            {FONTS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`cust-font ${font === f.family ? 'is-active' : ''}`}
                style={{fontFamily: f.family}}
                onClick={() => setFont(f.family)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="cust-row">
          <label className="cust-label">Tamaño</label>
          <input
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
          <label className="cust-label">Subir tu logo (opcional)</label>
          <input className="cust-file" type="file" accept="image/*" onChange={onLogo} />
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
        <p className="cust-note">
          Al finalizar guardamos tu diseño (render + archivos) y lo enviamos con tu pedido.
        </p>

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
