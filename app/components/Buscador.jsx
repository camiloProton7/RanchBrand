import {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {Link} from 'react-router';

const CATEGORIAS = [
  {titulo: 'Gorras', handle: 'gorras'},
  {titulo: 'Chaquetas y sacos', handle: 'chaquetas'},
  {titulo: 'Camisas y camisetas', handle: 'camisetas'},
  {titulo: 'Botas y accesorios', handle: 'botas-1'},
];

const CLAVE = 'ranch-busquedas';

function leerRecientes() {
  try {
    const v = JSON.parse(localStorage.getItem(CLAVE) || '[]');
    return Array.isArray(v) ? v.slice(0, 5) : [];
  } catch {
    return [];
  }
}

/** Lupa de la barra: abre un panel de búsqueda que responde mientras se escribe. */
export default function Buscador({tono = 'claro'}) {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState('');
  const [datos, setDatos] = useState({productos: [], colecciones: []});
  const [cargando, setCargando] = useState(false);
  const [recientes, setRecientes] = useState([]);
  const caja = useRef(null);

  useEffect(() => {
    if (abierto) {
      setRecientes(leerRecientes());
      setTimeout(() => caja.current?.focus(), 120);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [abierto]);

  // búsqueda con una pequeña espera para no consultar en cada tecla
  useEffect(() => {
    const q = texto.trim();
    if (q.length < 2) {
      setDatos({productos: [], colecciones: []});
      setCargando(false);
      return;
    }

    let vivo = true;
    setCargando(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/buscar?q=${encodeURIComponent(q)}`);
        const d = await r.json();
        if (vivo) setDatos(d);
      } catch {
        if (vivo) setDatos({productos: [], colecciones: []});
      } finally {
        if (vivo) setCargando(false);
      }
    }, 180);

    return () => {
      vivo = false;
      clearTimeout(t);
    };
  }, [texto]);

  function guardar(titulo) {
    try {
      const prev = leerRecientes().filter((x) => x.toLowerCase() !== titulo.toLowerCase());
      localStorage.setItem(CLAVE, JSON.stringify([titulo, ...prev].slice(0, 5)));
    } catch {
      /* sin almacenamiento: no pasa nada */
    }
  }

  function abrirProducto(p) {
    guardar(p.titulo);
    setAbierto(false);
    setTexto('');
  }

  const hayTexto = texto.trim().length >= 2;
  const vacio = hayTexto && !cargando && datos.productos.length === 0;

  return (
    <>
      <button
        type="button"
        className={'bs-lupa bs-lupa-' + tono}
        onClick={() => setAbierto(true)}
        aria-label="Buscar productos"
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="M15.5 15.5L21 21" />
        </svg>
      </button>

      {abierto && createPortal(
        <div className="bs-fondo" role="dialog" aria-modal="true" aria-label="Buscar">
          <div className="bs-panel">
            <div className="bs-barra">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="M15.5 15.5L21 21" />
              </svg>
              <input
                ref={caja}
                type="search"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Busca gorras, chaquetas, botas…"
                autoComplete="off"
                aria-label="Buscar productos"
              />
              <button type="button" className="bs-cerrar" onClick={() => setAbierto(false)} aria-label="Cerrar búsqueda">
                ×
              </button>
            </div>

            <div className="bs-cuerpo">
              {!hayTexto && (
                <>
                  {recientes.length > 0 && (
                    <div className="bs-bloque">
                      <p className="bs-rotulo">Recientes</p>
                      <div className="bs-chips">
                        {recientes.map((r) => (
                          <button key={r} type="button" className="bs-chip" onClick={() => setTexto(r)}>
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bs-bloque">
                    <p className="bs-rotulo">Explorar</p>
                    <div className="bs-cats">
                      {CATEGORIAS.map((c) => (
                        <Link
                          key={c.handle}
                          to={`/nuevo2/coleccion/${c.handle}`}
                          className="bs-cat"
                          onClick={() => setAbierto(false)}
                        >
                          <span>{c.titulo}</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                            <path d="M5 12h14M13 6l6 6-6 6" />
                          </svg>
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {hayTexto && cargando && (
                <p className="bs-estado">Buscando…</p>
              )}

              {vacio && (
                <div className="bs-vacio">
                  <p>No encontramos nada con «{texto.trim()}».</p>
                  <span>Prueba con otra palabra o entra a una colección.</span>
                </div>
              )}

              {hayTexto && !cargando && datos.productos.length > 0 && (
                <div className="bs-resultados">
                  {datos.productos.map((p) => (
                    <Link
                      key={p.id}
                      to={`/nuevo2/producto/${p.handle}`}
                      prefetch="intent"
                      className="bs-item"
                      onClick={() => abrirProducto(p)}
                    >
                      <span className="bs-item-img">
                        {p.img ? <img src={p.img} alt={p.titulo} loading="lazy" /> : <i />}
                      </span>
                      <span className="bs-item-txt">
                        <strong>{p.titulo}</strong>
                        <em>
                          {p.precio}
                          {p.antes && <s className="bs-antes">antes {p.antes}</s>}
                        </em>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
