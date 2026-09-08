import {useEffect, useRef, useState} from 'react';

const FONTS = [
  {id: 'rye', label: 'Western', family: '"Rye", serif'},
  {id: 'playfair', label: 'Serif', family: '"Playfair Display", serif'},
  {id: 'greatvibes', label: 'Script', family: '"Great Vibes", cursive'},
  {id: 'oswald', label: 'Bold', family: '"Oswald", sans-serif'},
];

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

/**
 * Editor de personalización (grabado láser) incrustado en el PDP.
 * Expone el estado vía onChange({enabled, text, font, logo, scale, pos, render}).
 */
export default function Personalizador({product, onChange}) {
  const img = product?.featuredImage?.url || '';

  const [enabled, setEnabled] = useState(false);
  const [text, setText] = useState('');
  const [font, setFont] = useState(FONTS[0].family);
  const [logo, setLogo] = useState(null);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({x: 50, y: 40});
  const [dragging, setDragging] = useState(false);

  const stageRef = useRef(null);
  const pointers = useRef({});
  const pinchDist = useRef(0);
  const scaleAtPinch = useRef(1);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await Promise.all(FONTS.map((f) => document.fonts.load(`52px ${f.family}`)));
      } catch {}
      if (mounted) setFontsReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);
  const [fontsReady, setFontsReady] = useState(false);

  const renderCanvas = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = img;
    await image.decode();
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const px = (pos.x / 100) * canvas.width;
    const py = (pos.y / 100) * canvas.height;
    const hasText = !!text.trim();
    const hasLogo = !!logo;
    const lineH = Math.round(110 * scale);

    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (hasText && hasLogo) {
      ctx.font = `${lineH}px ${font}`;
      ctx.fillText(text.trim(), px, py - lineH * 0.6);
      const li = new Image();
      li.src = logo;
      await li.decode();
      const w = li.width * scale;
      const h = li.height * scale;
      ctx.drawImage(li, px - w / 2, py + lineH * 0.55, w, h);
    } else if (hasLogo) {
      const li = new Image();
      li.src = logo;
      await li.decode();
      const w = li.width * scale;
      const h = li.height * scale;
      ctx.drawImage(li, px - w / 2, py - h / 2, w, h);
    } else if (hasText) {
      ctx.font = `${lineH}px ${font}`;
      ctx.fillText(text.trim(), px, py);
    }
    return canvas.toDataURL('image/png');
  };

  // Notificar al padre cuando cambia el estado de personalización
  useEffect(() => {
    const activa = enabled && (text.trim() || logo);
    onChange?.({
      enabled: activa,
      text,
      font,
      logo,
      scale,
      pos,
      render: renderCanvas,
    });
  }, [enabled, text, font, logo, scale, pos]);

  const moveTo = (cx, cy) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const x = clamp(((cx - rect.left) / rect.width) * 100, 0, 100);
    const y = clamp(((cy - rect.top) / rect.height) * 100, 0, 100);
    setPos({x, y});
  };

  const twoPointerDist = () => {
    const pts = Object.values(pointers.current);
    if (pts.length < 2) return 0;
    return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
  };

  const onDown = (e) => {
    pointers.current[e.pointerId] = {x: e.clientX, y: e.clientY};
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const n = Object.keys(pointers.current).length;
    if (n === 1) {
      setDragging(true);
      moveTo(e.clientX, e.clientY);
    } else if (n === 2) {
      setDragging(false);
      pinchDist.current = twoPointerDist();
      scaleAtPinch.current = scale;
    }
  };

  const onMove = (e) => {
    if (!pointers.current[e.pointerId]) return;
    pointers.current[e.pointerId] = {x: e.clientX, y: e.clientY};
    const n = Object.keys(pointers.current).length;
    if (n === 1 && dragging) {
      moveTo(e.clientX, e.clientY);
    } else if (n === 2) {
      const d = twoPointerDist();
      if (pinchDist.current > 0) {
        setScale(clamp(scaleAtPinch.current * (d / pinchDist.current), 0.3, 2.5));
      }
    }
  };

  const onUp = (e) => {
    delete pointers.current[e.pointerId];
    if (Object.keys(pointers.current).length < 2) pinchDist.current = 0;
    if (Object.keys(pointers.current).length === 0) setDragging(false);
  };

  const onLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result);
    reader.readAsDataURL(file);
  };

  const previewText = text.trim() || 'Tu texto';

  return (
    <div className="perso">
      <button
        type="button"
        className={`perso-toggle ${enabled ? 'is-on' : ''}`}
        onClick={() => setEnabled((v) => !v)}
      >
        ✏️ Personalizar con grabado láser · +$15.000
      </button>

      {enabled ? (
        <div className="perso-editor">
          <div className="perso-stage" ref={stageRef}>
            {img ? <img className="perso-img" src={img} alt={product?.title} draggable={false} /> : null}
            <div
              className={`perso-design ${dragging ? 'is-dragging' : ''}`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: `translate(-50%, -50%) scale(${scale})`,
                fontFamily: font,
              }}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
            >
              {text.trim() ? <span className="perso-text">{text}</span> : null}
              {logo ? <img className="perso-logo" src={logo} alt="logo" draggable={false} /> : null}
              {!text.trim() && !logo ? <span className="perso-text">Tu texto</span> : null}
            </div>
            <div className="perso-hint">Arrastra para mover · pellizca para escalar</div>
          </div>

          <input
            className="perso-input"
            type="text"
            placeholder="Escribe tu texto…"
            value={text}
            maxLength={20}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="perso-fonts">
            {FONTS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`perso-font ${font === f.family ? 'is-active' : ''}`}
                onClick={() => setFont(f.family)}
              >
                <span className="perso-font-sample" style={{fontFamily: f.family}}>{previewText}</span>
                <span className="perso-font-name">{f.label}</span>
              </button>
            ))}
          </div>

          <input
            className="perso-range"
            type="range"
            min="0.3"
            max="2.5"
            step="0.05"
            value={scale}
            aria-label="Tamaño"
            onChange={(e) => setScale(parseFloat(e.target.value))}
          />

          <label className="perso-file">
            <span>Subir tu logo (opcional)</span>
            <input type="file" accept="image/*" onChange={onLogo} />
          </label>
          <p className="perso-file-hint">PNG con fondo transparente recomendado</p>
        </div>
      ) : null}
    </div>
  );
}
