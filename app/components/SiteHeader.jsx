import {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router';
import {getCartCount} from '~/lib/cart';
import CartDrawer from '~/components/CartDrawer';

const MENU_ITEMS = [
  {label: 'Home', href: '/'},
  {label: 'Gorras', href: '/collections/gorras-truckers'},
  {label: 'Chaquetas', href: '/collections/chaquetas'},
  {label: 'Camisetas', href: '/collections/camisetas'},
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
      if (window.innerWidth > 860) return;
      const y = window.scrollY;
      setHidden(y > lastY.current && y > 140);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className={`tr-site-header ${hidden ? 'is-hidden' : ''}`}>
        <Link className="tr-site-logo" to="/" aria-label="The Ranch">
          {logoSrc ? <img src={logoSrc} alt="" /> : <span>The Ranch</span>}
        </Link>

        <nav className="tr-site-nav" aria-label="Principal">
          {MENU_ITEMS.map((item) => (
            <Link key={item.label} to={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

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
            {MENU_ITEMS.map((item, i) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setOpen(false)}
                style={{animationDelay: `${0.06 + i * 0.05}s`}}
              >
                <span className="tr-site-menu-num">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {item.label}
              </Link>
            ))}
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
