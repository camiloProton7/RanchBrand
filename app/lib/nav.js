/**
 * Navegación del sitio — FUENTE ÚNICA.
 *
 * Antes había tres listas escritas a mano (header, menú editorial del hero y barra de
 * categorías del home) y la misma home decía cosas distintas en tres partes. Todo lo que
 * se ve en pantalla sale de aquí.
 *
 * Cada href apunta a una colección que EXISTE y que contiene lo que la etiqueta promete
 * (verificado contra la API de la tienda, no de memoria):
 *   gorras 26 · camisetas 15 · chaquetas 22 · bordados 8 · sueteres-halfzip 3
 *   botas-1 10 · chaquetas-mujer 14 · botas-mujer 9 · accesorios 1 (hay 5 accesorios activos)
 *
 * Criterio del orden: primero lo que más se vende y más piezas tiene (gorras), luego el
 * resto del catálogo, y al final las categorías de apoyo. "Home" no va en la lista: el
 * logo del header ya lleva a la portada.
 *
 * Los items con `children` abren desplegable; los de documento suelto (el perchero) se
 * marcan con `plano: true` para enlazarlos con <a rel="external"> y que el router no deje
 * la pantalla en blanco.
 */
export const NAV_ITEMS = [
  {label: 'Gorras', href: '/collections/gorras'},
  {label: 'Camisas', href: '/collections/camisetas'},
  {
    label: 'Chaquetas',
    href: '/collections/chaquetas',
    children: [
      {label: 'Chaquetas y chalecos', href: '/collections/chaquetas'},
      {label: 'Sacos bordados', href: '/collections/bordados'},
      {label: 'Suéteres y tejidos', href: '/collections/sueteres-halfzip'},
    ],
  },
  {label: 'Botas', href: '/collections/botas-1'},
  {
    label: 'Mujer',
    href: '/collections/chaquetas-mujer',
    children: [
      {label: 'Chaquetas de mujer', href: '/collections/chaquetas-mujer'},
      {label: 'Botas de mujer', href: '/collections/botas-mujer'},
    ],
  },
  {label: 'Accesorios', href: '/collections/accesorios'},
];
