import {redirect} from 'react-router';

/**
 * La direccion vieja de prueba ya no existe: se responde con un 301 para que
 * Google y los enlaces compartidos apunten a la direccion definitiva.
 */
export function loader({params}) {
  const destino = '/';
  return redirect(destino, 301);
}

export const meta = () => [{title: 'The Ranch'}];
