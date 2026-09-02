import {useState} from 'react';
import {Link} from 'react-router';

/**
 * Extras de conversión para la PDP: sellos de confianza, ayuda de tallas,
 * acordeón específico por tipo de prenda y producto recomendado.
 */

export function isApparel(productType = '', title = '') {
  const t = `${productType} ${title}`.toLowerCase();
  return /chaqueta|jacket|saco|abrigo|camiseta|shirt|t-shirt|tshirt|buzo|hoodie|sudadera|polar|chamarra/.test(
    t,
  );
}

function detectType(productType = '', title = '') {
  const t = `${productType} ${title}`.toLowerCase();
  if (/chaqueta|jacket|chamarra|parka|impermeable|rompeviento|abrigo|saco/.test(t)) return 'jacket';
  if (/gorra|cap|hat|trucker|beanie|sombrero/.test(t)) return 'cap';
  if (/camiseta|shirt|t-shirt|tshirt|playera|buzo|hoodie|sudadera|polo/.test(t)) return 'shirt';
  return 'other';
}

const TRUST_ITEMS = [
  {icon: '🔒', title: 'Pago 100% seguro', desc: 'Bold, Addi y tarjetas'},
  {icon: '💳', title: 'Compra ahora, paga después', desc: 'Con Addi en cuotas'},
  {icon: '🚚', title: 'Envío gratis', desc: 'A toda Colombia'},
  {icon: '🔄', title: 'Cambios fáciles', desc: 'Sin complicaciones'},
];

const SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

function suggestSize(weightKg, heightCm) {
  const meters = heightCm / 100;
  const imc = weightKg / (meters * meters);

  let base;
  if (heightCm < 158) base = 0;
  else if (heightCm < 165) base = 1;
  else if (heightCm < 172) base = 2;
  else if (heightCm < 179) base = 3;
  else base = 4;

  let adjust = 0;
  if (imc < 21) adjust = -1;
  else if (imc < 25) adjust = 0;
  else if (imc < 29) adjust = 1;
  else adjust = 2;

  const idx = Math.max(0, Math.min(SIZES.length - 1, base + adjust));
  const size = SIZES[idx];
  const nearLimit = imc >= 23 && imc < 26;

  return {
    size,
    imc: imc.toFixed(1),
    slim: SIZES[Math.max(0, idx - 1)],
    normal: size,
    oversize: SIZES[Math.min(SIZES.length - 1, idx + 1)],
    nearLimit,
  };
}

export function TrustBadges() {
  return (
    <div className="trp-trust" aria-label="Beneficios de compra">
      {TRUST_ITEMS.map((item) => (
        <div key={item.title} className="trp-trust-item">
          <span className="trp-trust-icon" aria-hidden="true">
            {item.icon}
          </span>
          <div className="trp-trust-text">
            <span className="trp-trust-title">{item.title}</span>
            <span className="trp-trust-desc">{item.desc}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SizeGuide() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const calculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!w || !h || w < 35 || w > 200 || h < 130 || h > 220) {
      setError('Ingresa un peso (kg) y estatura (cm) válidos.');
      setResult(null);
      return;
    }
    setError('');
    setResult(suggestSize(w, h));
  };

  return (
    <div className="trp-size-guide">
      <div className="trp-size-head">
        <span className="trp-size-icon" aria-hidden="true">
          📏
        </span>
        <div>
          <h4 className="trp-size-title">¿Cuál es tu talla?</h4>
          <p className="trp-size-subtitle">
            Calcúlala con tu peso y estatura (talla colombiana).
          </p>
        </div>
      </div>

      <div className="trp-size-fields">
        <label className="trp-size-field">
          <span>Peso (kg)</span>
          <input
            type="number"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Ej. 72"
            min="35"
            max="200"
          />
        </label>
        <label className="trp-size-field">
          <span>Estatura (cm)</span>
          <input
            type="number"
            inputMode="numeric"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="Ej. 172"
            min="130"
            max="220"
          />
        </label>
      </div>

      <button type="button" className="trp-size-cta" onClick={calculate}>
        Calcular mi talla
      </button>

      {error ? <p className="trp-size-error">{error}</p> : null}

      {result ? (
        <div className="trp-size-result">
          <div className="trp-size-main">
            <span className="trp-size-label">Tu talla recomendada</span>
            <span className="trp-size-value">{result.normal}</span>
          </div>

          <div className="trp-size-fit">
            <div className="trp-size-fit-item">
              <span className="trp-size-fit-name">Estrecha</span>
              <span className="trp-size-fit-size">{result.slim}</span>
              <span className="trp-size-fit-desc">Más ceñida</span>
            </div>
            <div className="trp-size-fit-item is-active">
              <span className="trp-size-fit-name">Normal</span>
              <span className="trp-size-fit-size">{result.normal}</span>
              <span className="trp-size-fit-desc">Ajuste estándar</span>
            </div>
            <div className="trp-size-fit-item">
              <span className="trp-size-fit-name">Oversize</span>
              <span className="trp-size-fit-size">{result.oversize}</span>
              <span className="trp-size-fit-desc">Más holgada</span>
            </div>
          </div>

          <p className="trp-size-note">
            {result.nearLimit
              ? '⚠️ Estás cerca del límite de tu talla. Algunas prendas vienen reducidas: si eres fornido o prefieres holgado, elige una talla más.'
              : '💡 Algunas prendas vienen reducidas: si dudas entre dos tallas, elige la más grande.'}
          </p>
        </div>
      ) : null}
    </div>
  );
}

/* ===== Acordeón específico por tipo de prenda ===== */

function getAccordionSections(productType, title, description) {
  const type = detectType(productType, title);
  const sections = [];

  if (description) {
    sections.push({key: 'desc', title: 'Descripción', body: description});
  }

  if (type === 'jacket') {
    sections.push(
      {
        key: 'rain',
        title: 'Impermeable — protección contra la lluvia',
        body: 'Membrana impermeable que repele la lluvia y el viento. Costuras selladas para mantenerte seco incluso en aguaceros intensos.',
      },
      {
        key: 'thermal',
        title: 'Termo regulación',
        body: 'Aislamiento térmico que regula tu temperatura corporal: abriga con el frío y libera el calor cuando estás en movimiento.',
      },
    );
  } else if (type === 'shirt') {
    sections.push({
      key: 'breath',
      title: 'Transpirabilidad',
      body: 'Tejido transpirable que evacúa la humedad y te mantiene fresco y cómodo durante todo el día.',
    });
  } else if (type === 'cap') {
    sections.push({
      key: 'fit',
      title: 'Ajuste cómodo',
      body: 'Correa trasera ajustable para un calce perfecto y estable, sin apretar ni moverse durante el día.',
    });
  }

  // Protección UV: clave para gorras y chaquetas
  if (type === 'cap' || type === 'jacket') {
    sections.push({
      key: 'uv',
      title: 'Protección UV',
      body:
        type === 'cap'
          ? 'Visera y tejido con bloqueo de rayos UV para proteger tu rostro y cuello en largas jornadas al sol.'
          : 'Tejido con bloqueo de rayos UV para cuidar tu piel durante la exposición prolongada al sol.',
    });
  }

  const materials =
    type === 'jacket'
      ? 'Tejido técnico de alta resistencia y secado rápido. Lava a máquina con agua fría, sin suavizante, y seca a la sombra.'
      : type === 'cap'
        ? 'Algodón resistente y duradero. Lava a mano con agua fría y seca a la sombra para conservar la forma y el color.'
        : 'Confeccionada con materiales de alta calidad y costuras reforzadas. Lava a máquina con agua fría, no uses blanqueador y seca a la sombra.';

  sections.push(
    {key: 'materials', title: 'Materiales y cuidado', body: materials},
    {
      key: 'shipping',
      title: 'Envíos, cambios y garantía',
      body: 'Envío gratis a toda Colombia (2–5 días hábiles). Cambios fáciles dentro de los 30 días. Garantía de 6 meses por defectos de fabricación.',
    },
  );

  return sections;
}

export function ProductAccordion({productType, title, description}) {
  const [open, setOpen] = useState(0);
  const sections = getAccordionSections(productType, title, description);

  return (
    <div className="trp-accordion">
      {sections.map((s, i) => (
        <div key={s.key} className={`trp-acc-item${open === i ? ' is-open' : ''}`}>
          <button
            type="button"
            className="trp-acc-head"
            onClick={() => setOpen(open === i ? -1 : i)}
            aria-expanded={open === i}
          >
            <span className="trp-acc-title">{s.title}</span>
            <span className="trp-acc-icon" aria-hidden="true">
              {open === i ? '−' : '+'}
            </span>
          </button>
          <div className="trp-acc-body" aria-hidden={open !== i}>
            <div className="trp-acc-content">{s.body}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ===== Producto recomendado (un solo producto) ===== */

export function RecommendedProduct({product, formatPrice, onAdd}) {
  if (!product) return null;
  const price = Number(product.price) || 0;
  const discount = Math.round(price * 0.1);
  const final = price - discount;

  return (
    <section className="trp-reco" aria-label="Llévalo con descuento">
      <a
        href={product.cartUrl || '#'}
        className="trp-reco-card"
        onClick={(e) => {
          if (onAdd) {
            e.preventDefault();
            onAdd();
          }
        }}
      >
        {product.image ? (
          <img className="trp-reco-img" src={product.image} alt="" loading="lazy" />
        ) : null}
        <div className="trp-reco-info">
          <span className="trp-reco-tag">Llévalo con descuento</span>
          <h3 className="trp-reco-title">{product.title}</h3>
          <div className="trp-reco-price">
            <s className="trp-reco-price-orig">{formatPrice(price)}</s>
            <strong className="trp-reco-price-final">{formatPrice(final)}</strong>
          </div>
        </div>
        <span className="trp-reco-badge">-10%</span>
        <span className="trp-reco-cta">Agregar al carrito</span>
      </a>
    </section>
  );
}
