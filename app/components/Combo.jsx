import {useState} from 'react';
import {Grid, Tarjeta} from '~/components/Tarjeta';

const DOMINIO = '1caf84-4.myshopify.com';

const pesos = (n) => '$' + Number(n || 0).toLocaleString('es-CO');

export default function Combo({combo}) {
  const camisa = combo?.camisa;
  const gorras = combo?.gorras || [];
  const [abierto, setAbierto] = useState(false);
  const [vCamisa, setVCamisa] = useState(null);
  const [vGorra, setVGorra] = useState(null);

  // por defecto: primera talla disponible y la primera de las cuatro gorras
  const varianteCamisa =
    camisa?.variantes?.find((v) => v.id === vCamisa) ||
    camisa?.variantes?.find((v) => v.disponible) ||
    camisa?.variantes?.[0];
  const gorraElegida = gorras.find((g) => g.handle === vGorra) || gorras[0];
  const varianteGorra = gorraElegida?.variantes?.find((v) => v.disponible) || gorraElegida?.variantes?.[0];

  const suma = Number(camisa?.precioNum || 0) + Number(gorraElegida?.precioNum || 0);
  const final = Math.round(suma * 0.85);
  const listo = Boolean(varianteCamisa?.id && varianteGorra?.id);

  // el permalink de Shopify exige VARIANTE:CANTIDAD; sin el :1 responde 404
  const ids = [varianteCamisa?.id, varianteGorra?.id]
    .filter(Boolean)
    .map((id) => `${String(id).split('/').pop()}:1`)
    .join(',');
  const href = `https://${DOMINIO}/cart/${ids}?discount=COMBO15`;

  if (!camisa || !gorras.length) return null;

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
        <Tarjeta p={camisa} badge="Del combo" />
        <Tarjeta p={{...gorraElegida, titulo: gorraElegida.titulo}} badge="Del combo" />
      </Grid>

      <div className="hn-combo-pie">
        <div className="hn-combo-total">
          <span className="hn-combo-total-label">Precio conjunto</span>
          <span className="hn-combo-total-nums">
            <span className="hn-combo-tachado">antes {pesos(suma)}</span>
            <strong className="hn-combo-final">{pesos(final)}</strong>
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
        <div className="hn-sheet-fondo" role="dialog" aria-modal="true" aria-label="Elige talla y gorra">
          <div className="hn-sheet">
            <header className="hn-sheet-cabeza">
              <h3>Arma tu conjunto</h3>
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
              <div className="hn-sheet-bloque">
                <div className="hn-sheet-fila">
                  <span className="hn-sheet-foto">
                    {varianteCamisa?.img ? <img src={varianteCamisa.img} alt={camisa.titulo} loading="lazy" /> : null}
                  </span>
                  <div className="hn-sheet-texto">
                    <p className="hn-sheet-prenda">{camisa.titulo}</p>
                    <p className="hn-sheet-elegida">{varianteCamisa?.titulo || 'Elige talla'}</p>
                    <p className="hn-sheet-precio">{pesos(camisa.precioNum)}</p>
                  </div>
                </div>
                <div className="hn-sheet-chips">
                  {(camisa.variantes || []).map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      disabled={!v.disponible}
                      className={
                        'hn-chip' + (v.id === varianteCamisa?.id ? ' is-on' : '') + (v.disponible ? '' : ' is-off')
                      }
                      onClick={() => setVCamisa(v.id)}
                    >
                      {v.titulo}
                    </button>
                  ))}
                </div>
              </div>

              <div className="hn-sheet-bloque">
                <p className="hn-sheet-prenda">Elige tu gorra</p>
                <div className="hn-sheet-gorras">
                  {gorras.map((g) => {
                    const activa = g.handle === gorraElegida?.handle;
                    return (
                      <button
                        key={g.handle}
                        type="button"
                        className={'hn-gorra-op' + (activa ? ' is-on' : '')}
                        onClick={() => setVGorra(g.handle)}
                      >
                        <span className="hn-gorra-foto">
                          {g.imgs?.[0] ? <img src={g.imgs[0]} alt={g.titulo} loading="lazy" /> : null}
                        </span>
                        <span className="hn-gorra-nombre">{g.titulo}</span>
                        <span className="hn-gorra-precio">{pesos(g.precioNum)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <footer className="hn-sheet-pie">
              <span className="hn-sheet-total">
                {pesos(final)} <em>−15%</em>
              </span>
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
