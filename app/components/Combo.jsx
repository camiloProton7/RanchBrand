import {Grid, Tarjeta} from '~/components/Tarjeta';

const DOMINIO = '1caf84-4.myshopify.com';

export default function Combo({combo}) {
  if (!combo?.items?.length) return null;

  const ids = combo.items.map((i) => i.variantId.split('/').pop()).join(',');

  return (
    <section className="hn-combo" aria-label="Combina tu próximo recorrido">
      <header className="hn-combo-head">
        <div className="hn-combo-top">
          <div>
            <p className="hn-gorras-eyebrow">El conjunto</p>
            <h2 className="hn-combo-title">Combina tu próximo recorrido</h2>
          </div>
          <span className="hn-combo-badge">Ahorra 15%</span>
        </div>
        <p className="hn-combo-sub">Arma el conjunto perfecto y ahorra.</p>
      </header>

      <Grid className="hn-par-combo">
        {combo.items.map((it) => (
          <Tarjeta key={it.handle} p={it} badge="Del combo" />
        ))}
      </Grid>

      <div className="hn-combo-pie">
        <div className="hn-combo-total">
          <span className="hn-combo-total-label">Precio conjunto</span>
          <span className="hn-combo-total-nums">
            <span className="hn-combo-tachado">antes {combo.sumaTxt}</span>
            <strong className="hn-combo-final">{combo.finalTxt}</strong>
          </span>
        </div>

        <a
          className="hn-combo-btn"
          href={`https://${DOMINIO}/cart/${ids}?discount=COMBO15`}
          rel="nofollow"
        >
          Agregar conjunto · −15%
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </a>
      </div>
    </section>
  );
}
