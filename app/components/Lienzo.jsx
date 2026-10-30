import {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router';

const TITULO = [
  ['Lo', 'que', 'te', 'pones'],
  ['dice', 'de', 'dónde', 'vienes.'],
];

export default function Lienzo({
  img = '/lienzo.webp',
  eyebrow = 'The Ranch',
  titulo = TITULO,
  cta = 'Ver la colección',
  to = '/nuevo2/coleccion/chaquetas',
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      {threshold: 0.28}
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  let orden = 0;

  return (
    <section
      ref={ref}
      className={'hn-lienzo' + (visible ? ' is-visible' : '')}
      aria-label="The Ranch"
    >
      <img src={img} alt="" aria-hidden="true" loading="lazy" decoding="async" />
      <span className="hn-lienzo-velo" aria-hidden="true" />

      <div className="hn-lienzo-copy">
        <p className="hn-lienzo-eye">{eyebrow}</p>

        <h2 className="hn-lienzo-title">
          {titulo.map((linea, li) => (
            <span className="hn-lienzo-linea" key={li}>
              {linea.map((palabra, pi) => {
                const i = orden++;
                return (
                  <span className="hn-palabra" key={pi}>
                    <span style={{transitionDelay: `${0.14 + i * 0.075}s`}}>{palabra}</span>
                  </span>
                );
              })}
            </span>
          ))}
        </h2>

        <Link to={to} className="hn-lienzo-cta">
          {cta}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
