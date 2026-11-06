import {useEffect, useRef, useState} from 'react';

const SELLOS = [
  {
    titulo: 'Envíos seguros',
    nota: 'Guía y rastreo',
    icono: (
      <>
        <path d="M3 7.5h10.5v9H3z" />
        <path d="M13.5 10.5h4l3 3v3h-7z" />
        <circle cx="6.6" cy="17.6" r="1.7" />
        <circle cx="16.9" cy="17.6" r="1.7" />
        <path d="M1 12.5h1.4M1 15h1.1" />
      </>
    ),
  },
  {
    titulo: 'Pagos seguros',
    nota: 'Compra protegida',
    icono: (
      <>
        <rect x="3" y="6" width="18" height="12.5" rx="2.2" />
        <path d="M3 10.2h18" />
        <path d="M6.6 14.4h3.2" />
        <path d="M16.8 14.2v2.6" />
      </>
    ),
  },
  {
    titulo: 'Garantía segura',
    nota: 'Cambios sin líos',
    icono: (
      <>
        <path d="M12 3.2 5 6v5.4c0 4.2 2.9 7.3 7 8.6 4.1-1.3 7-4.4 7-8.6V6z" />
        <path d="m9.2 11.9 2 2.1 3.7-3.9" />
      </>
    ),
  },
];

export default function Sellos() {
  const ref = useRef(null);
  const [dentro, setDentro] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setDentro(true);
          io.disconnect();
        }
      },
      {threshold: 0.35}
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className={'hn-sellos' + (dentro ? ' is-in' : '')}
      aria-label="Envíos, pagos y garantía"
    >
      <ul className="hn-sellos-row">
        {SELLOS.map((s, i) => (
          <li className="hn-sello" key={s.titulo} style={{'--i': i}}>
            <span className="hn-sello-aro">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {s.icono}
              </svg>
            </span>
            <span className="hn-sello-titulo">{s.titulo}</span>
            <span className="hn-sello-nota">{s.nota}</span>
          </li>
        ))}
      </ul>

      <p className="hn-sellos-pais">
        <span className="hn-sellos-raya" aria-hidden="true" />
        Industria colombiana
        <span className="hn-sellos-raya" aria-hidden="true" />
      </p>
    </section>
  );
}
