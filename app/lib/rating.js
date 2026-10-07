/**
 * Rating de vitrina: valor ESTABLE por producto (mismo producto -> mismo número, no cambia
 * entre visitas ni entre servidor y cliente). Se deriva del handle y queda entre 4.3 y 5.0,
 * como pidió Camilo ("de 4 hacia 5"), y el número de reseñas también varía.
 */
export function ratingFor(seed) {
  const s = String(seed || 'the-ranch');
  let h = 7;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) % 100003;
  const num = (43 + (h % 8)) / 10; // 4.3 .. 5.0
  return {num: num.toFixed(1), reviews: 68 + (h % 612)};
}
