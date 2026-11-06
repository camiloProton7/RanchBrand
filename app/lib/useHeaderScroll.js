import {useEffect, useState} from 'react';

/**
 * Esconde la barra al bajar y la devuelve al subir.
 *
 * En el celular el gesto no llega como un solo movimiento: al soltar el dedo
 * quedan eventos de inercia y el último puede ir en sentido contrario, lo que
 * dejaba la barra escondida justo cuando se estaba subiendo. Por eso se mira
 * el recorrido neto, se ignoran los temblores de menos de 4 px y se revalida
 * al levantar el dedo.
 *
 * Devuelve además `pegado`, que indica que ya se pasó el encabezado del hero:
 * ahí la barra deja de ser absoluta y pasa a fija para poder volver.
 */
export function useHeaderScroll({alto = 90, bajar = 44, subir = 10} = {}) {
  const [oculto, setOculto] = useState(false);
  const [pegado, setPegado] = useState(false);

  useEffect(() => {
    let ultimo = window.scrollY;
    let acumulado = 0;
    let pendiente = false;

    const medir = () => {
      pendiente = false;
      const y = Math.max(0, window.scrollY);
      const paso = y - ultimo;
      ultimo = y;

      setPegado(y > alto);

      // Arriba del todo no se esconde nunca.
      if (y < alto) {
        setOculto(false);
        acumulado = 0;
        return;
      }

      // Un temblor del dedo no cuenta como gesto.
      if (Math.abs(paso) < 4) return;

      if (paso > 0) {
        acumulado = Math.max(0, acumulado + paso);
        if (acumulado > bajar) setOculto(true);
      } else {
        acumulado = 0;
        setOculto(false);
      }
    };

    const alMover = () => {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(medir);
    };

    // Al levantar el dedo se vuelve a mirar: la inercia suele dejar el último
    // evento en el sentido contrario al gesto y la barra quedaba escondida.
    const alSoltar = () => {
      if (Math.max(0, window.scrollY) < ultimo) {
        acumulado = 0;
        setOculto(false);
      }
    };

    window.addEventListener('scroll', alMover, {passive: true});
    window.addEventListener('touchend', alSoltar, {passive: true});
    medir();

    return () => {
      window.removeEventListener('scroll', alMover);
      window.removeEventListener('touchend', alSoltar);
    };
  }, [alto, bajar, subir]);

  return {oculto, pegado};
}
