import {useNavigation} from 'react-router';
import {useEffect, useState} from 'react';

/**
 * Barra fina arriba que aparece en el mismo instante en que se toca
 * cualquier enlace o botón que cambia de ruta. No mide progreso real:
 * avisa que el toque se registró, que es lo que el dedo necesita ver.
 */
export default function Progreso() {
  const nav = useNavigation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (nav.state === 'idle') {
      setVisible(false);
      return;
    }
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, [nav.state]);

  if (!visible) return null;

  return <div className="progreso" aria-hidden="true" />;
}
