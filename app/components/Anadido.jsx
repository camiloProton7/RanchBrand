import {createPortal} from 'react-dom';
import {useEffect, useRef} from 'react';
import {Link} from 'react-router';

/**
 * Hoja inferior que confirma la compra y ofrece una pieza extra con descuento.
 *
 * El orden importa: arriba va SIEMPRE lo que el cliente acaba de añadir, con
 * su foto y su precio, para que no haya duda de qué se está comprando. El
 * extra va debajo, en un bloque aparte y rotulado como oferta.
 */
function numero(txt) {
  if (!txt) return 0;
  return Number(String(txt).replace(/[^\d]/g, '')) || 0;
}

function rebaja(precio, antes) {
  const a = numero(antes);
  const p = numero(precio);
  if (!a || !p || a <= p) return 0;
  return Math.round((1 - p / a) * 100);
}

export default function Anadido({
  abierto,
  cerrar,
  articulo,
  sugerido,
  onAnadir,
  onPagar,
  modo = 'carrito',
  anadiendo,
  yaAnadido,
}) {
  // el toque que abre la hoja no debe cerrarla al instante: en movil el mismo
  // gesto llega al fondo recien montado
  const abiertoEn = useRef(0);

  useEffect(() => {
    if (abierto) abiertoEn.current = Date.now();
  }, [abierto]);

  function tocarFondo() {
    if (Date.now() - abiertoEn.current < 350) return;
    cerrar();
  }

  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e) => {
      if (e.key === 'Escape') cerrar();
    };
    document.addEventListener('keydown', alTeclear);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', alTeclear);
      document.body.style.overflow = '';
    };
  }, [abierto, cerrar]);

  if (!abierto || typeof document === 'undefined') return null;

  const dto = sugerido ? rebaja(sugerido.precio, sugerido.antes) : 0;

  return createPortal(
    <div className="an-fondo" onClick={tocarFondo} role="presentation">
      <div
        className={'an-hoja' + (modo === 'pago' ? ' is-pago' : '')}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Producto añadido"
      >
        <span className="an-asa" aria-hidden="true" />

        <button type="button" className="an-cerrar" onClick={cerrar} aria-label="Cerrar">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        {/* lo que el cliente acaba de elegir */}
        <div className="an-agregado">
          <span className="an-tilde" aria-hidden="true">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12.5l5.5 5.5L20 7" />
            </svg>
          </span>

          <span className="an-agregado-img">
            {articulo?.img ? <img src={articulo.img} alt="" /> : <i />}
          </span>

          <span className="an-agregado-txt">
            <b>{modo === 'pago' ? 'Vas a pagar' : 'Añadido al carrito'}</b>
            <strong>{articulo?.titulo || 'Tu producto'}</strong>
            <em>
              {[articulo?.precio, articulo?.opciones, '1 unidad'].filter(Boolean).join(' · ')}
            </em>
          </span>
        </div>

        {/* el extra, con su descuento bien a la vista */}
        {sugerido && (
          <div className="an-extra">
            <p className="an-extra-tit">
              {dto > 0 ? (
                <>
                  Añádela con <b>{dto}% de descuento</b>
                </>
              ) : (
                'Combina con'
              )}
            </p>

            <div className="an-fila">
              <Link to={`/products/${sugerido.handle}`} className="an-foto" onClick={cerrar}>
                {sugerido.img ? <img src={sugerido.img} alt={sugerido.titulo} /> : <i />}
              </Link>

              <div className="an-datos">
                <Link to={`/products/${sugerido.handle}`} className="an-nombre" onClick={cerrar}>
                  {sugerido.titulo}
                </Link>
                <p className="an-precio">
                  <span className="an-num">{sugerido.precio}</span>
                  {dto > 0 && <span className="an-dto">−{dto}%</span>}
                  {sugerido.antes && <span className="an-antes">antes {sugerido.antes}</span>}
                </p>
              </div>
            </div>

            <button
              type="button"
              className={'an-add' + (yaAnadido ? ' is-ok' : '')}
              onClick={onAnadir}
              data-variante={sugerido.varianteId || 'vacio'}
              disabled={anadiendo || yaAnadido}
            >
              {yaAnadido
                ? 'Añadida'
                : anadiendo
                  ? 'Añadiendo…'
                  : dto > 0
                    ? `Añadir con ${dto}% dto`
                    : 'Añadir también'}
            </button>
          </div>
        )}

        {modo === 'pago' ? (
          <button type="button" className="an-pagar" onClick={onPagar}>
            Ir a pagar
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        ) : (
          <Link to="/carrito" className="an-ver" onClick={cerrar}>
            Ver carrito
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        )}
      </div>
    </div>,
    document.body,
  );
}
