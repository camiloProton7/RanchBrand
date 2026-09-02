import {Link} from 'react-router';

export default function Footer({logoSrc}) {
  const year = new Date().getFullYear();
  return (
    <footer className="tr-footer">
      <div className="tr-footer-inner">
        <div className="tr-footer-head">
          {logoSrc ? (
            <img className="tr-footer-logo" src={logoSrc} alt="The Ranch" />
          ) : (
            <h2 className="tr-footer-megatitle">THE RANCH</h2>
          )}
          <p className="tr-footer-tagline">No seguimos modas, las marcamos.</p>
        </div>

        <div className="tr-footer-grid">
          <div className="tr-footer-newsletter">
            <h4 className="tr-footer-title">Únete al ranch</h4>
            <p className="tr-footer-newsletter-desc">
              Novedades, drops y ofertas exclusivas.
            </p>
            <form
              className="tr-footer-form"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                className="tr-footer-input"
                type="email"
                placeholder="Tu email"
                aria-label="Email"
              />
              <button
                className="tr-footer-submit"
                type="submit"
                aria-label="Suscribirse"
              >
                →
              </button>
            </form>
          </div>

          <div className="tr-footer-col">
            <h4 className="tr-footer-title">Tienda</h4>
            <Link to="/collections/gorras-truckers">Gorras</Link>
            <Link to="/collections/chaquetas">Chaquetas</Link>
            <Link to="/collections/all">Accesorios</Link>
          </div>

          <div className="tr-footer-col">
            <h4 className="tr-footer-title">Ayuda</h4>
            <a href="https://ranch.com.co/policies/shipping-policy">Envíos</a>
            <a href="https://ranch.com.co/policies/refund-policy">Devoluciones</a>
            <a href="https://wa.me/573209157343">Contacto</a>
          </div>

          <div className="tr-footer-col">
            <h4 className="tr-footer-title">Legal</h4>
            <a href="https://ranch.com.co/policies/privacy-policy">Privacidad</a>
            <a href="https://ranch.com.co/policies/terms-of-service">Términos</a>
          </div>
        </div>

        <div className="tr-footer-bottom">
          <span className="tr-footer-copy">© {year} The Ranch — Colombia</span>
          <div className="tr-footer-social">
            <a
              href="https://www.instagram.com/"
              rel="noopener noreferrer"
              target="_blank"
            >
              Instagram
            </a>
            <a
              href="https://www.tiktok.com/"
              rel="noopener noreferrer"
              target="_blank"
            >
              TikTok
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
