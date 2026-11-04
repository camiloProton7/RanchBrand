import {useState} from 'react';
import {Link} from 'react-router';

const ENTRADAS = [
  ['Inicio', '/'],
  ['Gorras', '/collections/gorras'],
  [
    'Chaquetas y sacos',
    '/collections/chaquetas',
    [
      ['Hombre', '/collections/chaquetas?genero=hombre'],
      ['Mujer', '/collections/chaquetas?genero=mujer'],
    ],
  ],
  ['Camisas y camisetas', '/collections/camisetas'],
  ['Botas y accesorios', '/collections/botas-1'],
  ['El combo de gorras', '/combo-gorras'],
];

export default function MenuLateral({tono = 'crema'}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button
        type="button"
        className={'hn-menu' + (tono === 'tinta' ? ' is-tinta' : '')}
        aria-label="Abrir menú"
        onClick={() => setAbierto(true)}
      >
        <span />
        <span />
      </button>

      {abierto && (
        <div className="hn-menu-abierto" role="dialog" aria-modal="true" aria-label="Menú">
          <button
            type="button"
            className="hn-menu-velo"
            aria-label="Cerrar menú"
            onClick={() => setAbierto(false)}
          />

          <div className="hn-panel">
            <div className="hn-panel-top">
              <Link
                to="/"
                className="hn-panel-logo"
                onClick={() => setAbierto(false)}
                aria-label="The Ranch"
              >
                <img src="/logo-tinta.png" alt="The Ranch" width="86" height="31" />
              </Link>
              <button
                type="button"
                className="hn-panel-cerrar"
                onClick={() => setAbierto(false)}
                aria-label="Cerrar"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <nav className="hn-panel-nav">
              {ENTRADAS.map(([t, to, hijos], i) => (
                <div key={to} className="hn-panel-grupo" style={{'--n': i}}>
                  <Link to={to} onClick={() => setAbierto(false)}>
                    <span className="hn-panel-num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="hn-panel-txt">{t}</span>
                    <span className="hn-panel-flecha" aria-hidden="true">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M5 12h13M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>

                  {hijos ? (
                    <div className="hn-panel-sub">
                      {hijos.map(([st, sto]) => (
                        <Link key={sto} to={sto} onClick={() => setAbierto(false)}>
                          <span className="hn-panel-sub-txt">{st}</span>
                          <span className="hn-panel-sub-flecha" aria-hidden="true">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path d="M5 12h13M12 5l7 7-7 7" />
                            </svg>
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}

              <p className="hn-panel-rotulo">Ayuda</p>

              <Link to="/policies/refund-policy" onClick={() => setAbierto(false)} style={{'--n': 6}}>
                <span className="hn-panel-num">07</span>
                <span className="hn-panel-txt">Garantía</span>
                <span className="hn-panel-flecha" aria-hidden="true">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M5 12h13M12 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>

              <a
                href="https://envia.com/es-CO/rastreo"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setAbierto(false)}
                style={{'--n': 7}}
              >
                <span className="hn-panel-num">08</span>
                <span className="hn-panel-txt">Seguimiento de casos</span>
                <span className="hn-panel-flecha" aria-hidden="true">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M5 12h13M12 5l7 7-7 7" />
                  </svg>
                </span>
              </a>
            </nav>

            <p className="hn-panel-lema">No nacimos para que fuera fácil.</p>

            <div className="hn-panel-pie">
              <a href="https://wa.me/573209157343" target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
              <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer">
                TikTok
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
