/**
 * Estrellas con relleno proporcional al rating (4.6 = 4 estrellas y media).
 * Se pinta con dos capas para no depender de imágenes ni de fuentes de iconos.
 */
export default function Stars({value, className = ''}) {
  const num = Number(value) || 0;
  const pct = Math.max(0, Math.min(100, (num / 5) * 100));
  return (
    <span className={`tr-stars ${className}`} role="img" aria-label={`${num.toFixed(1)} de 5`}>
      <span className="tr-stars-base" aria-hidden="true">
        ★★★★★
      </span>
      <span className="tr-stars-fill" aria-hidden="true" style={{width: `${pct}%`}}>
        ★★★★★
      </span>
    </span>
  );
}
