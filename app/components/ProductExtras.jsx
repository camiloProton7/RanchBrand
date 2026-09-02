import {useState} from 'react';

/**
 * Extras de conversión para la PDP: sellos de confianza + ayuda de tallas.
 * Solo aplica a chaquetas y camisetas (ropa con tallas).
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

  // Talla base por estatura (promedio colombiano: ~1.70m hombres, ~1.57m mujeres)
  let base;
  if (heightCm < 158) base = 0; // S
  else if (heightCm < 165) base = 1; // M
  else if (heightCm < 172) base = 2; // L
  else if (heightCm < 179) base = 3; // XL
  else base = 4; // XXL

  // Ajuste por complexión (IMC)
  let adjust = 0;
  if (imc < 21) adjust = -1; // delgado
  else if (imc < 25) adjust = 0; // normal
  else if (imc < 29) adjust = 1; // sobrepeso
  else adjust = 2; // obesidad

  const idx = Math.max(0, Math.min(SIZES.length - 1, base + adjust));
  const size = SIZES[idx];

  // "Cerca del límite" → sugiere subir talla (prendas reducidas)
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
