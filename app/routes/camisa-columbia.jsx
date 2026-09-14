import {Link} from 'react-router';
import landingStyles from '~/styles/camisa-columbia.css?url';

export const meta = () => [
  {title: 'Camisa Outdoor Columbia The Ranch — Secado Rápido UPF 50'},
  {
    name: 'description',
    content:
      'Camisa tipo Columbia con protección UPF 50, secado rápido y bolsillos funcionales. Tallas S a XL. Envío gratis en Colombia.',
  },
  {property: 'og:title', content: 'Camisa Outdoor Columbia The Ranch'},
  {property: 'og:type', content: 'product'},
  {property: 'og:url', content: 'https://ranch.com.co/camisa-columbia'},
  {tagName: 'link', rel: 'canonical', href: 'https://ranch.com.co/camisa-columbia'},
];

export function links() {
  return [{rel: 'stylesheet', href: landingStyles}];
}

const FEATURES = [
  {icon: '☀️', title: 'Protección UPF 50', desc: 'Bloquea los rayos UV en largas jornadas al sol.'},
  {icon: '💧', title: 'Secado rápido', desc: 'Transpira y evacúa la humedad al instante.'},
  {icon: '🧵', title: 'Tejido técnico', desc: 'Resistente al uso diario y a la intemperie.'},
  {icon: '🎒', title: 'Bolsillos funcionales', desc: 'Con solapa y cierre para lo esencial.'},
  {icon: '🧭', title: 'Cuello tipo Columbia', desc: 'Protección extra para el cuello.'},
  {icon: '🏔️', title: 'Corte cómodo', desc: 'Libertad de movimiento en todo terreno.'},
];

const TALLAS = ['S', 'M', 'L', 'XL'];

export default function CamisaColumbia() {
  return (
    <main className="ccl">
      {/* ===== HERO ===== */}
      <section className="ccl-hero">
        <span className="ccl-badge">🔥 Nuevo lanzamiento</span>
        <h1 className="ccl-title">
          Camisa Outdoor
          <span className="ccl-title-accent">Columbia</span>
        </h1>
        <p className="ccl-subtitle">
          Del campo a la montaña. Protección UPF 50, secado rápido y carácter que no se
          negocia.
        </p>

        <div className="ccl-tallas">
          {TALLAS.map((t) => (
            <span key={t} className="ccl-talla">
              {t}
            </span>
          ))}
        </div>

        <div className="ccl-cta-row">
          <a className="ccl-cta" href="/products/camisa-columbia">
            Comprar ahora
          </a>
          <a className="ccl-cta-secondary" href="#detalles">
            Ver detalles ↓
          </a>
        </div>

        <div className="ccl-trust">
          <span>🚚 Envío gratis</span>
          <span>🔒 Pago seguro</span>
          <span>🔄 Cambios fáciles</span>
        </div>
      </section>

      {/* ===== CARACTERÍSTICAS ===== */}
      <section id="detalles" className="ccl-features">
        <h2 className="ccl-features-title">Hecha para quien hace las cosas bien</h2>
        <div className="ccl-features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="ccl-feature">
              <span className="ccl-feature-icon" aria-hidden="true">
                {f.icon}
              </span>
              <h3 className="ccl-feature-title">{f.title}</h3>
              <p className="ccl-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="ccl-final">
        <h2 className="ccl-final-title">
          No seguimos modas, <em>las marcamos</em>.
        </h2>
        <p className="ccl-final-sub">Tallas S a XL. Envío gratis a toda Colombia.</p>
        <a className="ccl-cta ccl-cta-big" href="/products/camisa-columbia">
          Llévala puesta 🤠
        </a>
        <Link className="ccl-back" to="/">
          ← Volver a la tienda
        </Link>
      </section>
    </main>
  );
}
