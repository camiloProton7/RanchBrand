import {useEffect} from 'react';
import {Link, useLocation} from 'react-router';

/**
 * Franja fija de Black Friday, solo en el home, arriba de todo y debajo del header.
 * Fuera del home no aparece: en la landing sobra (ya trae su hero) y en el resto
 * del sitio estorba la lectura.
 * Mientras está visible marca <html class="con-franja"> para que el header y el
 * contenido se corran esos píxeles y nada quede tapado.
 */
export default function FranjaBF() {
  const {pathname} = useLocation();
  const oculta = pathname !== '/';

  useEffect(() => {
    const raiz = document.documentElement;
    if (oculta) {
      raiz.classList.remove('con-franja');
      return;
    }
    raiz.classList.add('con-franja');
    return () => raiz.classList.remove('con-franja');
  }, [oculta]);

  if (oculta) return null;

  return (
    <Link to="/black-friday" className="bf-franja-global" aria-label="Ir a Black Friday">
      <b>Black Friday</b>
      <span>Hasta 53% en la selección</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
        <path d="M5 12h13M12 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
