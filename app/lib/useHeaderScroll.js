import {useEffect, useState} from 'react';

/**
 * Esconde la barra al bajar y la devuelve al subir.
 *
 * En el celular el gesto no llega como un solo movimiento: al soltar el dedo
 * quedan eventos de inercia y el último puede ir en sentido contrario, lo que
 * dejaba la barra escondida justo cuando se estaba subiendo. Por eso se mira
 * el recorrido neto y se revalida al levantar el dedo.
 *
 * Devuelve además `pegado`, que indica que ya se pasó el encabezado del hero:
 * ahí la barra deja de ser absoluta y pasa a fija para poder volver.
 */
export function useHeaderScroll({alto = 90, bajar = 34, subir = 18} = {}) {
  const [oculto, setOculto] = useState(false);
  const [pegado, setPegado] = useState(false);

  useEffect(() => {
    let ultimo = window.scrollY;
    let acumulado = 0;

    const alMover = () => {
      const y = window.scrollY;
      const paso = y - ultimo;
      ultimo = y;

      setPegado(y > alto);

      if (y < alto) {
        setOculto(false);
        acumulado = 0;
        return;
      }

      // al bajar se acumula; al subir basta un gesto corto para devolverla
      if (paso > 0) {
        acumulado = Math.max(0, acumulado + paso);
        if (acumulado > bajar) setOculto(true);
      } else if (paso < 0) {
        acumulado = 0;
        setOculto(false);
      }
    };

    window.addEventListener('scroll', alMover, {passive: true});
    alMover();

    return () => window.removeEventListener('scroll', alMover);
  }, [alto, bajar, subir]);

  return {oculto, pegado};
}
