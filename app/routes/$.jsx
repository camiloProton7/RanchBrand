import {data, Link} from 'react-router';
import styles from '~/styles/home-nuevo.css?url';
import Buscador from '~/components/Buscador';
import Carroza from '~/components/Carroza';
import MenuLateral from '~/components/MenuLateral';
import Pie from '~/components/Pie';

export const links = () => [{rel: 'stylesheet', href: styles}];

export const meta = () => [
  {title: 'Página no encontrada · The Ranch'},
  {name: 'robots', content: 'noindex'},
];

export function loader() {
  return data({}, {status: 404});
}

const SUGERENCIAS = [
  {nombre: 'Gorras', handle: 'gorras'},
  {nombre: 'Chaquetas', handle: 'chaquetas'},
  {nombre: 'Camisas', handle: 'camisetas'},
  {nombre: 'Botas', handle: 'botas-1'},
];

export default function NoEncontrada() {
  return (
    <div className="hn-root nf-root">
      <header className="nf-bar">
        <MenuLateral />
        <Link to="/" className="hn-logo" aria-label="The Ranch">
          <img src="/logo-tinta.png" alt="The Ranch" width="92" height="33" />
        </Link>
        <span className="hn-bag">
          <Buscador tono="oscuro" />
          <Carroza />
        </span>
      </header>

      <main className="nf-main">
        <p className="nf-eyebrow">404</p>
        <h1 className="nf-titulo">
          Esta página
          <br />
          se fue al monte.
        </h1>
        <p className="nf-texto">
          El enlace que abriste no existe, o la pieza ya no está con nosotros.
          Lo que sí sigue en pie está a un toque.
        </p>

        <Link to="/" className="nf-cta">
          Volver al inicio
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>

        <nav className="nf-cats" aria-label="Colecciones">
          {SUGERENCIAS.map((c) => (
            <Link key={c.handle} to={`/collections/${c.handle}`} className="nf-cat">
              {c.nombre}
            </Link>
          ))}
        </nav>
      </main>

      <Pie />
    </div>
  );
}
