import {useEffect, useRef, useState} from 'react';
import {Link, Form, useLocation} from 'react-router';
import {getCartCount} from '~/lib/cart';
import CartDrawer from '~/components/CartDrawer';

// Menú del sitio. OJO: "Prendas superiores", "Camisas" y "Combos" apuntan por
// ahora a la colección más parecida que YA existe, para que ningún enlace del
// menú quede muerto. Cuando existan las colecciones propias (handles:
// prendas-superiores, camisas, combos) se cambian esos tres hrefs y listo.
// Rutas que se sirven como documento suelto (no son rutas React): el perchero de
// camisetas. Se enlazan con <a rel="external"> para forzar carga completa: si el
// item (o un hijo del desplegable) va con <Link>, el router intercepta el clic,
// cambia la URL y deja la pantalla en blanco.
const esDocumentoAparte = (item) => Boolean(item && (item.plano || item.href === '/perchero/'));

const MENU_ITEMS = [
  {label: 'Home', href: '/'},
  {label: 'Gorras', href: '/collections/gorras-truckers'},
  {
    label: 'Prendas superiores',
    href: '/collections/chaquetas',
    children: [
      {label: 'Chaquetas', href: '/collections/chaquetas'},
      // La colección arranca con su propio perchero (sección del rack arriba del listado).
      {label: 'Sacos Bordados', href: '/collections/bordados'},
      {label: 'Camisas', href: '/collections/camisetas'},
      {label: 'Camisetas', href: '/perchero/', plano: true},
    ],
  },
  {label: 'Combos', href: '/collections/combo-ranch-premium'},
  {label: 'Mujer', href: '/collections/chaquetas-mujer'},
];

/**
 * Header global: masthead fijo (logo + nav + burger) y menú móvil compacto.
 * Presente en todas las rutas vía root.jsx.
 */
export default function SiteHeader({logoSrc}) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [count, setCount] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const lastY = useRef(0);
  const {pathname} = useLocation();

  useEffect(() => {
    const update = () => setCount(getCartCount());
    update();
    window.addEventListener('ranch-cart-updated', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('ranch-cart-updated', update);
      window.removeEventListener('storage', update);
    };
  }, []);

  // Oculta el header al bajar el scroll (mobile) y lo muestra al subir.
  useEffect(() => {
    const onScroll = () => {
      if (window.innerWidth > 1024) return;
      const y = window.scrollY;
      setHidden(y > lastY.current && y > 140);
      lastY.current = y;
    };
    // En escritorio (o al agrandar la ventana) el header siempre debe estar a la
    // vista. Como onScroll no corre por encima de 1024px, si quedaba oculto en
    // mobile nadie lo volvía a mostrar y el menú "no salía" en escritorio.
    const onResize = () => {
      if (window.innerWidth > 1024) {
        setHidden(false);
        lastY.current = window.scrollY;
      }
    };
    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Al cambiar de página: el header vuelve a su sitio y el menú móvil se cierra.
  // Antes el estado "oculto" seguía vivo entre páginas, así que navegando en mobile
  // el menú se perdía (el header seguía escondido arriba) y el menú desplegado se
  // quedaba abierto encima del contenido de la página nueva.
  useEffect(() => {
    setHidden(false);
    setOpen(false);
    lastY.current = typeof window === 'undefined' ? 0 : window.scrollY;
  }, [pathname]);

  return (
    <>
      <header className={`tr-site-header ${hidden ? 'is-hidden' : ''}`}>
        <Link className="tr-site-logo" to="/" aria-label="The Ranch">
          {logoSrc ? <img src={logoSrc} alt="" /> : <span>The Ranch</span>}
        </Link>

        <nav className="tr-site-nav" aria-label="Principal">
          {MENU_ITEMS.map((item) => {
            // Los items `plano` (el perchero) se sirven como documento aparte:
            // con <Link> la navegación de cliente deja la página en blanco.
            const Etiqueta = esDocumentoAparte(item) ? "a" : Link;
            const props = esDocumentoAparte(item) ? {href: item.href, rel: "external"} : {to: item.href};
            return (
            <div key={item.label} className="tr-site-nav-item">
              <Etiqueta {...props}>
                {item.label}
                {item.children ? <span className="tr-site-nav-caret" aria-hidden="true" /> : null}
              </Etiqueta>
              {item.children ? (
                <div className="tr-site-dropdown">
                  {item.children.map((child) => {
                    const Hijo = esDocumentoAparte(child) ? "a" : Link;
                    const propsHijo = esDocumentoAparte(child) ? {href: child.href, rel: "external"} : {to: child.href};
                    return (
                      <Hijo key={child.label} {...propsHijo}>
                        {child.label}
                      </Hijo>
                    );
                  })}
                </div>
              ) : null}
            </div>
            );
          })}
        </nav>

        <Form action="/search" method="get" className="tr-site-search" role="search">
          <button type="submit" className="tr-site-search-btn" aria-label="Buscar">
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </button>
          <input
            type="search"
            name="q"
            placeholder="Buscar productos"
            aria-label="Buscar productos"
          />
        </Form>

        <a
          className="tr-site-cart"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setCartOpen(true);
          }}
          aria-label="Ver carrito"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 7h12l1 14H5L6 7z" />
            <path d="M9 7a3 3 0 0 1 6 0" />
          </svg>
          {count > 0 ? <span className="tr-site-cart-count">{count}</span> : null}
        </a>

        <button
          className={`tr-site-burger ${open ? 'is-open' : ''}`}
          type="button"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </header>

      {open ? (
        <div className="tr-site-menu" role="dialog" aria-label="Menú">
          <div className="tr-site-menu-head">
            <Link
              className="tr-site-logo"
              to="/"
              onClick={() => setOpen(false)}
              aria-label="The Ranch"
            >
              {logoSrc ? <img src={logoSrc} alt="" /> : <span>The Ranch</span>}
            </Link>
            <button
              className="tr-site-close"
              type="button"
              aria-label="Cerrar menú"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>

          <nav className="tr-site-menu-nav">
            {MENU_ITEMS.map((item, i) => {
              const Etiqueta = esDocumentoAparte(item) ? "a" : Link;
              const propsMovil = esDocumentoAparte(item) ? {href: item.href, rel: "external"} : {to: item.href};
              return (
              <div key={item.label} className="tr-site-menu-group">
                <Etiqueta
                  onClick={() => setOpen(false)}
                  style={{animationDelay: `${0.06 + i * 0.05}s`}}
                  {...propsMovil}
                >
                  <span className="tr-site-menu-num">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {item.label}
                </Etiqueta>
                {item.children ? (
                  <div className="tr-site-menu-sub">
                    {item.children.map((child) => {
                      const Hijo = esDocumentoAparte(child) ? "a" : Link;
                      const propsHijo = esDocumentoAparte(child) ? {href: child.href, rel: "external"} : {to: child.href};
                      return (
                        <Hijo
                          key={child.label}
                          onClick={() => setOpen(false)}
                          {...propsHijo}
                        >
                          <span className="tr-site-menu-num tr-site-menu-num-sub" />
                          {child.label}
                        </Hijo>
                      );
                    })}
                  </div>
                ) : null}
              </div>
              );
            })}
            <a
              className="tr-site-menu-wa"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setOpen(false);
                setCartOpen(true);
              }}
              style={{animationDelay: `${0.06 + MENU_ITEMS.length * 0.05}s`}}
            >
              <span className="tr-site-menu-num">
                {String(MENU_ITEMS.length + 1).padStart(2, '0')}
              </span>
              Carrito
            </a>
          </nav>
        </div>
      ) : null}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
