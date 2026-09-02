import {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router';

const MENU_ITEMS = [
  {label: 'Gorras', href: '/collections/gorras-truckers'},
  {label: 'Chaquetas', href: '/collections/chaquetas'},
  {label: 'Camisetas', href: '/collections/camisetas'},
  {label: 'Accesorios', href: '/collections/all'},
];

/**
 * Header global: masthead fijo (logo + nav + burger) y menú móvil compacto.
 * Presente en todas las rutas vía root.jsx.
 */
export default function SiteHeader({logoSrc}) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

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
          className="tr-site-wa"
          href="https://wa.me/573209157343"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Escríbenos por WhatsApp"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
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
              href="https://wa.me/573209157343"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              style={{animationDelay: `${0.06 + MENU_ITEMS.length * 0.05}s`}}
            >
              <span className="tr-site-menu-num">
                {String(MENU_ITEMS.length + 1).padStart(2, '0')}
              </span>
              WhatsApp
            </a>
          </nav>
        </div>
      ) : null}
    </>
  );
}
