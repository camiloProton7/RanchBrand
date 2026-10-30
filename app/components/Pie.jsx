import {Link} from 'react-router';

const TIENDA = [
  {t: 'Gorras', to: '/nuevo2/coleccion/gorras'},
  {t: 'Chaquetas y sacos', to: '/nuevo2/coleccion/chaquetas'},
  {t: 'Camisas y camisetas', to: '/nuevo2/coleccion/camisetas'},
  {t: 'Botas y accesorios', to: '/nuevo2/coleccion/botas-1'},
];

const AYUDA = [
  {t: 'Contáctenos', href: 'https://wa.me/573209157343'},
  {t: 'Garantía y devoluciones', to: '/policies/refund-policy'},
  {t: 'Envíos', to: '/policies/shipping-policy'},
];

const LEGAL = [
  {t: 'Privacidad', to: '/policies/privacy-policy'},
  {t: 'Términos', to: '/policies/terms-of-service'},
];

export default function Pie() {
  return (
    <footer className="hn-pie">
      <div className="hn-pie-in">
        <p className="hn-pie-marca">The Ranch</p>
        <p className="hn-pie-lema">No nacimos para que fuera fácil.</p>

        <div className="hn-pie-cols">
          <div className="hn-pie-col">
            <p className="hn-pie-titulo">Tienda</p>
            {TIENDA.map((l) => (
              <Link key={l.t} to={l.to} className="hn-pie-link">
                {l.t}
              </Link>
            ))}
          </div>

          <div className="hn-pie-col">
            <p className="hn-pie-titulo">Ayuda</p>
            {AYUDA.map((l) =>
              l.href ? (
                <a key={l.t} href={l.href} className="hn-pie-link" target="_blank" rel="noopener noreferrer">
                  {l.t}
                </a>
              ) : (
                <Link key={l.t} to={l.to} className="hn-pie-link">
                  {l.t}
                </Link>
              )
            )}
          </div>

          <div className="hn-pie-col">
            <p className="hn-pie-titulo">Legal</p>
            {LEGAL.map((l) => (
              <Link key={l.t} to={l.to} className="hn-pie-link">
                {l.t}
              </Link>
            ))}
          </div>
        </div>

        <div className="hn-pie-redes">
          <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            Instagram
          </a>
          <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
            TikTok
          </a>
        </div>

        <div className="hn-pie-base">
          <span>© {new Date().getFullYear()} The Ranch</span>
          <span className="hn-pie-pais">Industria colombiana</span>
        </div>

        <a
          className="hn-pie-credito"
          href="https://wa.me/573502712645?text=Hola%20Proton%20Lab%2C%20quiero%20hablar%20sobre%20mi%20tienda."
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="hn-pie-chispa" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20Z" />
              <path d="M8.6 7.8c.2-.4.4-.4.7-.4h.5c.2 0 .4 0 .6.5l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.1.2-.2.3 0 .6.3.5.7 1 1.2 1.4.6.5 1.1.7 1.4.8.2.1.4 0 .5-.1l.6-.7c.2-.2.3-.2.5-.1l1.6.8c.2.1.4.2.4.3.1.2.1.9-.3 1.4-.4.5-1 1-1.8 1-.5 0-1.2 0-3-1s-2.9-3-3-3.2c-.1-.2-.7-1-.7-1.9 0-.9.5-1.4.7-1.6Z" />
            </svg>
          </span>
          Desarrollado por <strong>Proton Lab</strong>
          <span className="hn-pie-flecha" aria-hidden="true">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M5 12h13M12 5l7 7-7 7" />
            </svg>
          </span>
        </a>
      </div>
    </footer>
  );
}
