import {useEffect, useState} from 'react';
import {getCart, getCartUrl, formatPrice} from '~/lib/cart';

export default function CartDrawer({open, onClose}) {
  const [items, setItems] = useState([]);
  const [phone, setPhone] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const update = () => setItems(getCart());
    update();
    window.addEventListener('ranch-cart-updated', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('ranch-cart-updated', update);
      window.removeEventListener('storage', update);
    };
  }, []);

  const count = items.reduce((s, i) => s + (i.qty || 0), 0);
  const subtotal = items.reduce((s, i) => s + Number(i.price || 0) * (i.qty || 0), 0);
  const compareTotal = items.reduce(
    (s, i) => s + Number(i.compareAtPrice || 0) * (i.qty || 0),
    0,
  );
  const discount = compareTotal > subtotal ? compareTotal - subtotal : 0;

  // Guarda el carrito + teléfono para el recordatorio de carrito abandonado.
  const saveCart = async (value) => {
    setPhone(value);
    const digits = value.replace(/\D/g, '');
    if (digits.length < 10 || items.length === 0 || saved) return;
    try {
      const form = new FormData();
      form.append('phone', digits);
      form.append('items', JSON.stringify(items));
      await fetch('/api/cart', {method: 'POST', body: form});
      setSaved(true);
    } catch {
      // no crítico: el checkout igual captura el teléfono
    }
  };

  if (!open) return null;

  return (
    <div className="tr-cart-overlay" onClick={onClose}>
      <aside className="tr-cart-drawer" onClick={(e) => e.stopPropagation()}>
        <header className="tr-cart-head">
          <h2 className="tr-cart-title">
            Tu bolsa{' '}
            <span className="tr-cart-title-count">
              ({count} {count === 1 ? 'artículo' : 'artículos'})
            </span>
          </h2>
          <button className="tr-cart-close" type="button" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </header>

        <div className="tr-cart-items">
          {items.length === 0 ? (
            <p className="tr-cart-empty">Tu bolsa está vacía.</p>
          ) : (
            items.map((item) => {
              const hasDiscount =
                item.compareAtPrice && Number(item.compareAtPrice) > Number(item.price || 0);
              return (
                <div key={item.variantId} className="tr-cart-item">
                  {item.image ? (
                    <img className="tr-cart-item-img" src={item.image} alt="" loading="lazy" />
                  ) : null}
                  <div className="tr-cart-item-info">
                    <span className="tr-cart-item-title">{item.title}</span>
                    <span className="tr-cart-item-meta">Cantidad: {item.qty}</span>
                  </div>
                  <div className="tr-cart-item-prices">
                    {hasDiscount ? (
                      <s className="tr-cart-item-compare">
                        {formatPrice(Number(item.compareAtPrice) * (item.qty || 0))}
                      </s>
                    ) : null}
                    <span className="tr-cart-item-price">
                      {formatPrice(Number(item.price || 0) * (item.qty || 0))}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 ? (
          <footer className="tr-cart-foot">
            <div className="tr-cart-row">
              <span>Subtotal</span>
              <span>{formatPrice(compareTotal || subtotal)}</span>
            </div>
            {discount > 0 ? (
              <div className="tr-cart-row tr-cart-discount">
                <span>Descuento</span>
                <span>−{formatPrice(discount)}</span>
              </div>
            ) : null}
            <div className="tr-cart-row">
              <span>Envío</span>
              <span className="tr-cart-free">Gratis</span>
            </div>
            <div className="tr-cart-total">
              <span>Total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="tr-cart-wa">
              <label className="tr-cart-wa-label" htmlFor="tr-cart-phone">
                {saved ? '✓ Te avisaremos por WhatsApp' : 'Déjanos tu WhatsApp (opcional)'}
              </label>
              <input
                id="tr-cart-phone"
                className="tr-cart-wa-input"
                type="tel"
                inputMode="tel"
                placeholder="300 123 4567"
                value={phone}
                onChange={(e) => saveCart(e.target.value)}
                autoComplete="tel"
              />
            </div>
            <a className="tr-cart-checkout" href={getCartUrl()}>
              Finalizar compra
            </a>
            <button className="tr-cart-continue" type="button" onClick={onClose}>
              Seguir comprando
            </button>
          </footer>
        ) : null}
      </aside>
    </div>
  );
}
