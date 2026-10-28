import {useEffect, useMemo, useRef} from 'react';
import {Link, useNavigate} from 'react-router';
import {NAV_ITEMS} from '~/lib/nav';
import {sceneMarkup, WAYPOINTS} from '~/lib/exploration-markup';
import {mountExploration} from '~/lib/exploration-motion';
import styles from '~/styles/exploration-reference.css?url';

export const links = () => [{rel: 'stylesheet', href: styles}];
export const meta = () => [
  {title: 'Explora The Ranch | Vista previa'},
  {name: 'robots', content: 'noindex,nofollow'},
  {name: 'description', content: 'Exploración interactiva de las colecciones The Ranch.'},
];
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

// Keep verified collection handles. Children use search until a real collection is configured.
const findHref = (label) => NAV_ITEMS.find((item) => item.label === label)?.href || '/search';
const HREFS = {
  gorras: findHref('Gorras'), chaquetas: findHref('Chaquetas'),
  camisas: findHref('Camisas'), botas: findHref('Botas'), ninos: '/search?q=ni%C3%B1os',
};
export default function Explorar() {
  const root = useRef(null);
  const navigate = useNavigate();
  const markup = useMemo(() => sceneMarkup(HREFS), []);
  useEffect(() => mountExploration(root.current, navigate), [navigate]);
  return (
    <main className="rex-scene" data-version="reference-v3">
      <div ref={root} dangerouslySetInnerHTML={{__html: markup}} />
      <nav className="rex-direct" aria-label="Ir directamente a las colecciones">
        <p>El camino también es parte de la experiencia.</p>
        <div>{WAYPOINTS.map((p) => <Link key={p.key} to={HREFS[p.key]}>{p.name}</Link>)}</div>
        <small>VISTA PREVIA · REFERENCIA V3</small>
      </nav>
    </main>
  );
}
