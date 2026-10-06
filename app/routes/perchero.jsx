import html from "../perchero/camisetas.html?raw";

// El perchero es una página propia (canvas + fotos), servida tal cual desde
// ranch.com.co/perchero. Sus rutas de imagen son relativas: el <base href="/perchero/">
// del HTML las resuelve contra /perchero/frente|/perchero/lado (public/perchero/).
export function loader() {
  return new Response(html, {
    headers: {"Content-Type": "text/html; charset=utf-8"},
  });
}
