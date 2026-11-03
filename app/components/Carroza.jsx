import {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router';
import {getCartCount} from '~/lib/cart';

/**
 * Carrito de compras: asa, cesta y dos ruedas, dibujado a trazo para que
 * combine con el resto de los iconos. Sin relleno, para que se lea a 26 px.
 */
const CARRITO = (
  <>
    <path d="M2 3.2h3.1l2.9 12.6h11.6" />
    <path d="M6.2 6.9h16.3l-1.8 6.6H7.8" />
    <circle cx="10.6" cy="20.3" r="1.9" />
    <circle cx="18.9" cy="20.3" r="1.9" />
  </>
);

export default function Carroza({className = ''}) {
  const [n, setN] = useState(0);
  const [trote, setTrote] = useState(false);
  const [ultimo, setUltimo] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    const leer = () => setN(getCartCount());
    leer();
    window.addEventListener('ranch-cart-updated', leer);

    const alEntrar = (e) => {
      setUltimo(e.detail || null);
      setTrote(false);
      requestAnimationFrame(() => setTrote(true));
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setTrote(false);
        setUltimo(null);
      }, 2400);
    };
    window.addEventListener('ranch-carroza', alEntrar);

    return () => {
      window.removeEventListener('ranch-cart-updated', leer);
      window.removeEventListener('ranch-carroza', alEntrar);
      clearTimeout(timer.current);
    };
  }, []);

  return (
    <Link
      to="/carrito"
      className={'carroza' + (trote ? ' is-trote' : '') + (className ? ' ' + className : '')}
      aria-label={n > 0 ? `Carrito, ${n} ${n === 1 ? 'pieza' : 'piezas'}` : 'Carrito'}
    >
      <svg
        viewBox="0 0 28 24"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {CARRITO}
      </svg>

      {n > 0 && <i className="carroza-n">{n}</i>}

      {ultimo && (
        <span className="carroza-aviso">
          {ultimo.image && <img src={ultimo.image} alt="" />}
          <span>
            <b>En el carrito</b>
            <em>{ultimo.title}</em>
          </span>
        </span>
      )}
    </Link>
  );
}
