import {useState} from 'react';
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

  return (
    <>
      <header className="tr-site-header">
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
          </nav>
        </div>
      ) : null}
    </>
  );
}
