import {useState} from 'react';
import {Grid, Tarjeta} from '~/components/Tarjeta';

const DOMINIO = '1caf84-4.myshopify.com';

export default function Combo({combo}) {
  const [abierto, setAbierto] = useState(false);
  const [sel, setSel] = useState({});

  const items = combo?.items || [];
  const listo = items.length > 0 && items.every((it) => sel[it.handle]);

  // el permalink de Shopify exige VARIANTE:CANTIDAD; sin el :1 responde 404
  const elegidas = items
    .map((it) => String(sel[it.handle] || '').split('/').pop())
    .filter(Boolean);
  const href = `https://${DOMINIO}/cart/${elegidas.map((id) => `${id}:1`).join(',')}?discount=COMBO15`;

  if (!items.length) return null;

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
        {items.map((it) => (
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

        <button type="button" className="hn-combo-btn" onClick={() => setAbierto(true)}>
          Agregar conjunto · −15%
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>

      {abierto ? (
        <div className="hn-sheet-fondo" role="dialog" aria-modal="true" aria-label="Elige talla y color">
          <div className="hn-sheet">
            <header className="hn-sheet-cabeza">
              <h3>Elige talla y color</h3>
              <button
                type="button"
                className="hn-sheet-cerrar"
                aria-label="Cerrar"
                onClick={() => setAbierto(false)}
              >
                ×
              </button>
            </header>

            <div className="hn-sheet-cuerpo">
              {items.map((it) => (
                <div key={it.handle} className="hn-sheet-bloque">
                  <p className="hn-sheet-prenda">{it.titulo}</p>
                  <div className="hn-sheet-chips">
                    {(it.variantes || []).map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        disabled={!v.disponible}
                        className={
                          'hn-chip' + (sel[it.handle] === v.id ? ' is-on' : '') + (v.disponible ? '' : ' is-off')
                        }
                        onClick={() => setSel((s) => ({...s, [it.handle]: v.id}))}
                      >
                        {v.titulo}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <footer className="hn-sheet-pie">
              <span className="hn-sheet-total">{combo.finalTxt} · −15%</span>
              <a
                className={'hn-sheet-cta' + (listo ? '' : ' is-off')}
                href={listo ? href : undefined}
                aria-disabled={!listo}
                onClick={(e) => {
                  if (!listo) e.preventDefault();
                }}
              >
                Ir al pago
              </a>
            </footer>
          </div>
        </div>
      ) : null}
    </section>
  );
}
