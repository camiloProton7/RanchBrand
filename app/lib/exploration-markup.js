/** Original artwork extracted from the owner-approved concept. UI remains native HTML. */
export const INITIAL_POSITION = {x: 50.5, y: 55};
export const WAYPOINTS = [
  {name: 'Gorras', key: 'gorras', x: 51, y: 10, goalY: 24, icon: 'hat'},
  {name: 'Chaquetas', key: 'chaquetas', x: 15, y: 26, goalY: 40, icon: 'jacket'},
  {name: 'Camisas', key: 'camisas', x: 85, y: 26, goalY: 40, icon: 'shirt'},
  {name: 'Botas', key: 'botas', x: 15, y: 55, goalY: 69, icon: 'boot'},
  {name: 'Niños', key: 'ninos', x: 85, y: 65, goalY: 79, icon: 'child'},
];
const shapes = {
  hat: '<path d="M8 16c1-3 1-9 4-9 2 0 2 4 5 4s3-4 5-4c3 0 3 7 4 10M7 16c4 3 14 4 20 0M5 15c-6 2-3 8 10 9 10 1 15-3 15-6 0-2-2-3-4-3M8 18c6 3 13 3 18 0"/>',
  jacket: '<path d="M12 5l4 3 4-3 6 4 4 18-6 1-3-13v15H11V15L8 28l-6-1L6 9zM12 5l4 7 4-7M16 12v18M11 19h4m3 0h3"/>',
  shirt: '<path d="M10 5c3 3 9 3 12 0l9 7-6 7-3-3v13H10V16l-3 3-6-7zM11 6c0 6 10 6 10 0"/>',
  boot: '<path d="M11 3h12l-2 15 3 5 6 3-1 4H4l-1-5 10-6-2-8zM12 8h10M13 19l7 3M5 26h24M17 9v5"/>',
  child: '<path d="M9 7c1-2 1-5 3-5l4 2 4-2c2 0 2 4 3 5M5 8c5 4 17 4 22 0M11 12a5 5 0 0010 0M11 17l-6 6 4 4 4-4-2 7h10l-2-7 4 4 4-4-6-6"/>',
};
export function icon(name) {
  return `<svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${shapes[name] || shapes.hat}</svg>`;
}
const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const localHref = (s) => typeof s === 'string' && s.startsWith('/') && !s.startsWith('//') ? s : '/search';
export function sceneMarkup(hrefs) {
  const nodes = WAYPOINTS.map((p) => `<a class="rex-waypoint" data-destination="${p.key}" data-x="${p.x}" data-y="${p.goalY}" href="${escape(localHref(hrefs[p.key]))}" style="left:${p.x}%;top:${p.y}%" aria-label="Explorar ${p.name}"><span class="rex-waypoint__circle">${icon(p.icon)}</span><span class="rex-waypoint__label">${p.name}</span></a>`).join('');
  const roads = WAYPOINTS.map((p) => `<path d="M50.5 55 Q${(50.5+p.x)/2-6} ${(55+p.goalY)/2-5} ${p.x} ${p.goalY}"/>`).join('');
  return `<section class="rex-stage" data-scene="reference-v3" aria-label="Mapa de colecciones The Ranch">
    <h1 class="rex-sr-only">Explora The Ranch</h1>
    <img class="rex-terrain" src="/exploration/terrain-reference.webp" alt="" width="284" height="513" fetchpriority="high" draggable="false"/>
    <svg class="rex-roads" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><g>${roads}</g><path class="rex-route" data-route d=""/></svg>
    <div class="rex-tracks" data-tracks aria-hidden="true"></div>
    ${WAYPOINTS.map(p => `<span class="rex-pin" style="left:${p.x}%;top:${p.goalY}%" aria-hidden="true"></span>`).join('')}
    ${nodes}
    <button type="button" class="rex-rider" data-rider aria-label="Mover el jinete. Arrastra o utiliza las flechas del teclado; Enter abre la colección más cercana." style="left:50.5%;top:55%" aria-describedby="rex-instruction">
      <span class="rex-rider__shadow" aria-hidden="true"></span>
      <span class="rex-rider__art"><img src="/exploration/rider-reference.webp" width="71" height="205" alt="Caballo y jinete de la ilustración original, vistos desde arriba" draggable="false" fetchpriority="high"/></span>
    </button>
    <p class="rex-origin">ORGULLOSAMENTE<br/>DE SUBACHOQUE</p>
    <svg class="rex-compass" viewBox="0 0 70 80" aria-hidden="true"><g stroke="currentColor" stroke-width=".7" fill="none"><circle cx="35" cy="40" r="20"/><circle cx="35" cy="40" r="16"/><path d="M35 8v64M3 40h64M19 24l32 32M51 24L19 56"/><path d="M35 12l5 28-5 28-5-28zM7 40l28-5 28 5-28 5z"/></g><path d="M35 12v28l5 0zM35 40v28l-5-28z" fill="currentColor"/><g fill="currentColor" font-family="Georgia,serif" font-size="8" text-anchor="middle"><text x="35" y="7">N</text><text x="35" y="79">S</text><text x="4" y="43">O</text><text x="66" y="43">E</text></g></svg>
    <p class="rex-instruction" id="rex-instruction" data-status role="status" aria-live="polite">Arrastra el caballo o toca una colección</p>
    <a class="rex-skip" data-skip hidden>Ver colección ahora →</a>
  </section>`;
}
