import {useState} from 'react';

/**
 * Extras de conversión para la PDP: sellos de confianza, ayuda de tallas,
 * acordeón premium y bundle "Se compran juntos".
 */

export function isApparel(productType = '', title = '') {
  const t = `${productType} ${title}`.toLowerCase();
  return /chaqueta|jacket|saco|abrigo|camiseta|shirt|t-shirt|tshirt|buzo|hoodie|sudadera|polar|chamarra/.test(
    t,
  );
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

/* ===== Acordeón premium (información de la prenda) ===== */

const ACCORDION_SECTIONS = [
  {key: 'desc', title: 'Descripción'},
  {
    key: 'warm',
    title: 'Nivel de abrigo y cómo se usa',
    body: 'Prenda de peso medio, ideal para climas frescos (12°–22°C). Úsala sola en días templados o en capas con una chaqueta ligera cuando baje la temperatura.',
  },
  {
    key: 'materials',
    title: 'Materiales y cuidado',
    body: 'Confeccionada con materiales de alta calidad y costuras reforzadas. Lava a máquina con agua fría, no uses blanqueador y seca a la sombra para conservar el color y la forma.',
  },
  {
    key: 'shipping',
    title: 'Envíos, cambios y garantía',
    body: 'Envío gratis a toda Colombia (2–5 días hábiles). Cambios fáciles dentro de los 30 días. Garantía de 6 meses por defectos de fabricación.',
  },
];

export function ProductAccordion({description}) {
  const [open, setOpen] = useState(0);

  return (
    <div className="trp-accordion">
      {ACCORDION_SECTIONS.map((s, i) => (
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
            <div className="trp-acc-content">
              {i === 0 && description ? description : s.body}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ===== Bundle "Se compran juntos" ===== */

export function BundleTogether({items, formatPrice, onAddPack}) {
  const [selected, setSelected] = useState(() => items.map(() => null));

  const pick = (itemIdx, variantId) =>
    setSelected((s) => s.map((id, j) => (j === itemIdx ? variantId : id)));

  const selectedVariants = items.map((it, i) =>
    it.variants.find((v) => v.id === selected[i]),
  );
  const allSelected = selectedVariants.every((v) => v != null);

  const total = selectedVariants.reduce(
    (s, v) => s + (v ? Number(v.price) || 0 : 0),
    0,
  );
  const discount = Math.round(total * 0.05);
  const final = total - discount;

  return (
    <section className="trp-bundle" aria-label="Se compran juntos">
      <span className="trp-bundle-reco">Recomendado para ti</span>
      <h2 className="trp-bundle-title">Se compran juntos</h2>
      <p className="trp-bundle-subtitle">5% de descuento en el paquete</p>

      <div className="trp-bundle-items">
        {items.map((it, i) => {
          const sel = selectedVariants[i];
          return (
            <div key={it.title} className="trp-bundle-item">
              {it.image ? (
                <img className="trp-bundle-img" src={it.image} alt="" loading="lazy" />
              ) : null}
              <div className="trp-bundle-info">
                <span className="trp-bundle-name">{it.title}</span>
                <select
                  className="trp-bundle-select"
                  value={selected[i] || ''}
                  onChange={(e) => pick(i, e.target.value)}
                  aria-label={`Talla de ${it.title}`}
                >
                  <option value="" disabled>
                    Elige talla
                  </option>
                  {it.variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label} · {formatPrice(v.price)}
                    </option>
                  ))}
                </select>
              </div>
              <span className="trp-bundle-item-price">
                {sel ? formatPrice(sel.price) : '—'}
              </span>
            </div>
          );
        })}
      </div>

      <div className="trp-bundle-summary">
        <span className="trp-bundle-total-label">Total</span>
        <s className="trp-bundle-total-orig">{formatPrice(total)}</s>
        <strong className="trp-bundle-total-final">{formatPrice(final)}</strong>
        <span className="trp-bundle-save">Ahorras {formatPrice(discount)}</span>
      </div>

      <button
        type="button"
        className="trp-bundle-cta"
        onClick={() => onAddPack(selectedVariants.filter(Boolean))}
        disabled={!allSelected}
      >
        {allSelected ? 'Añadir el pack al carrito' : 'Elige talla primero'}
      </button>
    </section>
  );
}
