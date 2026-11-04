import {useLoaderData} from 'react-router';
import {useEffect, useMemo, useRef, useState} from 'react';
import estilos from '~/styles/personalizado-mayor.css?url';

/**
 * Página de personalización para pedidos al por mayor.
 *
 * Vive en borrador: solo abre con el token de la URL y no está enlazada desde
 * ninguna parte del sitio. Cuando Camilo la valide se quita el candado.
 */
const TOKEN_BORRADOR = 'ranch-mayor-2026';
export const MINIMO = 8;

const PRODUCTOS = [
  'licorera-metalica',
  'chaqueta-ganadera-gamuza',
  'chaqueta-laredo-impermeable',
];

const CONSULTA = `#graphql
  query PersonalizadoMayor($handle: String!) {
    product(handle: $handle) {
      title
      handle
      featuredImage { url altText }
      priceRange { minVariantPrice { amount } }
      variants(first: 1) { nodes { id } }
    }
  }
`;

export const links = () => [{rel: 'stylesheet', href: estilos}];

export const meta = () => [
  {title: 'Personalización al por mayor — The Ranch'},
  {name: 'robots', content: 'noindex, nofollow'},
];

export async function loader({request, context}) {
  const url = new URL(request.url);
  if (url.searchParams.get('preview') !== TOKEN_BORRADOR) {
    throw new Response('No encontrado', {status: 404});
  }

  const productos = [];
  for (const handle of PRODUCTOS) {
    try {
      const data = await context.storefront.query(CONSULTA, {variables: {handle}});
      if (data?.product) productos.push(data.product);
    } catch {
      /* si uno falla, la página sigue con los otros */
    }
  }
  return {productos};
}

const TECNICAS = [
  {
    id: 'bordado',
    nombre: 'Bordado',
    lema: 'Hilo sobre la tela',
    detalle:
      'El logo se cose con hilo poliéster de alta densidad. Aguanta lavado, no se decolora y tiene relieve real: se ve y se siente.',
    ideal: 'Chaquetas de gamuza, dril, sacos y gorras.',
    min: 'Desde 8 unidades',
    colores: [
      {id: 'terracota', hex: '#b34a2a', nombre: 'Terracota'},
      {id: 'crema', hex: '#efe3cb', nombre: 'Crema'},
      {id: 'negro', hex: '#1b1815', nombre: 'Negro'},
      {id: 'blanco', hex: '#f7f4ee', nombre: 'Blanco'},
      {id: 'verde', hex: '#3f5138', nombre: 'Verde campo'},
    ],
  },
  {
    id: 'laser',
    nombre: 'Grabado láser',
    lema: 'Marca quemada en el material',
    detalle:
      'El láser retira la capa superficial y deja la marca ahumada del propio material. No se borra ni se despega: es permanente.',
    ideal: 'Cuero, metal, gamuza y piezas rígidas como la licorera.',
    min: 'Desde 8 unidades',
    colores: [{id: 'grafito', hex: '#3b2b1f', nombre: 'Ahumado'}],
  },
];

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const pesos = (n) =>
  `$${Number(n).toLocaleString('es-CO', {maximumFractionDigits: 0})}`;

/* ---------- tratamiento de la imagen del diseño ---------- */

async function cargarImagen(src) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = src;
  await img.decode();
  return img;
}

/** Quita los píxeles casi blancos para que un logo sobre fondo blanco funcione. */
function quitarBlanco(img) {
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(0, 0, c.width, c.height);
  const px = d.data;
  for (let i = 0; i < px.length; i += 4) {
    if (px[i] > 238 && px[i + 1] > 238 && px[i + 2] > 238) px[i + 3] = 0;
  }
  ctx.putImageData(d, 0, 0);
  return c.toDataURL('image/png');
}

/** Tiñe el diseño con el color del hilo o del ahumado, respetando la transparencia. */
async function tintar(src, hex) {
  const img = await cargarImagen(src);
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, c.width, c.height);
  return c.toDataURL('image/png');
}

/** Junta la foto del producto con el diseño en su sitio: el render que ve el cliente. */
async function componer(fotoUrl, disenoUrl, estado) {
  const base = await cargarImagen(fotoUrl);
  // lienzo cuadrado, la foto entra completa igual que en la vista previa
  const lado = Math.max(base.width, base.height);
  const c = document.createElement('canvas');
  c.width = lado;
  c.height = lado;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, lado, lado);
  const k = Math.min(lado / base.width, lado / base.height);
  const bw = base.width * k;
  const bh = base.height * k;
  ctx.drawImage(base, (lado - bw) / 2, (lado - bh) / 2, bw, bh);

  if (!disenoUrl) return c.toDataURL('image/png');
  const d = await cargarImagen(disenoUrl);

  const cx = (estado.x / 100) * c.width;
  const cy = (estado.y / 100) * c.height;
  const escala = (estado.escala * c.width) / 320;
  const ancho = d.width * escala;
  const alto = d.height * escala;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((estado.rotacion * Math.PI) / 180);
  ctx.globalAlpha = estado.tecnica === 'laser' ? 0.9 : 0.96;
  if (estado.tecnica === 'bordado') {
    ctx.shadowColor = 'rgba(0,0,0,0.28)';
    ctx.shadowBlur = Math.max(1, c.width * 0.0016);
    ctx.shadowOffsetY = Math.max(1, c.width * 0.0016);
  }
  ctx.drawImage(d, -ancho / 2, -alto / 2, ancho, alto);
  ctx.restore();

  return c.toDataURL('image/png');
}

export default function PersonalizadoMayor() {
  const {productos} = useLoaderData();

  const [tecnica, setTecnica] = useState(TECNICAS[0]);
  const [producto, setProducto] = useState(productos[0] || null);
  const [color, setColor] = useState(TECNICAS[0].colores[0].hex);

  const [original, setOriginal] = useState(null);
  const [limpio, setLimpio] = useState(true);
  const [tintado, setTintado] = useState(null);
  const [nombreArchivo, setNombreArchivo] = useState('');
  const [aviso, setAviso] = useState('');

  const [pos, setPos] = useState({x: 50, y: 50});
  const [escala, setEscala] = useState(1);
  const [rotacion, setRotacion] = useState(0);
  const [arrastrando, setArrastrando] = useState(false);

  const [cantidad, setCantidad] = useState(MINIMO);
  const [datos, setDatos] = useState({nombre: '', empresa: '', telefono: '', ciudad: '', notas: ''});
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(null);
  const [error, setError] = useState('');

  const escenario = useRef(null);
  const punteros = useRef({});
  const distanciaPinch = useRef(0);
  const escalaPinch = useRef(1);

  const foto = producto?.featuredImage?.url || '';

  /* el diseño se vuelve a teñir cuando cambia el color */
  useEffect(() => {
    let vivo = true;
    (async () => {
      if (!original) {
        setTintado(null);
        return;
      }
      try {
        const t = await tintar(original, color);
        if (vivo) setTintado(t);
      } catch {
        if (vivo) setTintado(original);
      }
    })();
    return () => {
      vivo = false;
    };
  }, [original, color]);

  /* al cambiar de técnica, el color vuelve al primero de esa técnica */
  useEffect(() => {
    setColor(tecnica.colores[0].hex);
  }, [tecnica]);

  const subir = async (e) => {
    const file = e.target.files?.[0];
    setAviso('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAviso('Sube una imagen: PNG, JPG o SVG.');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      let data = String(reader.result);
      if (limpio) {
        try {
          const img = await cargarImagen(data);
          data = quitarBlanco(img);
        } catch {
          /* si falla, se usa tal cual */
        }
      }
      setOriginal(data);
      setNombreArchivo(file.name);
      setPos({x: 50, y: 50});
      setEscala(1);
      setRotacion(0);
    };
    reader.readAsDataURL(file);
  };

  const mover = (clientX, clientY) => {
    const rect = escenario.current?.getBoundingClientRect();
    if (!rect?.width) return;
    setPos({
      x: clamp(((clientX - rect.left) / rect.width) * 100, 4, 96),
      y: clamp(((clientY - rect.top) / rect.height) * 100, 4, 96),
    });
  };

  const distancia = () => {
    const p = Object.values(punteros.current);
    if (p.length < 2) return 0;
    return Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
  };

  const abajo = (e) => {
    punteros.current[e.pointerId] = {x: e.clientX, y: e.clientY};
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const n = Object.keys(punteros.current).length;
    if (n === 1) {
      setArrastrando(true);
      mover(e.clientX, e.clientY);
    } else if (n === 2) {
      setArrastrando(false);
      distanciaPinch.current = distancia();
      escalaPinch.current = escala;
    }
  };

  const moverDedo = (e) => {
    if (!punteros.current[e.pointerId]) return;
    punteros.current[e.pointerId] = {x: e.clientX, y: e.clientY};
    const n = Object.keys(punteros.current).length;
    if (n === 1 && arrastrando) mover(e.clientX, e.clientY);
    else if (n === 2 && distanciaPinch.current > 0) {
      setEscala(clamp(escalaPinch.current * (distancia() / distanciaPinch.current), 0.25, 3));
    }
  };

  const arriba = (e) => {
    delete punteros.current[e.pointerId];
    if (Object.keys(punteros.current).length < 2) distanciaPinch.current = 0;
    if (Object.keys(punteros.current).length === 0) setArrastrando(false);
  };

  const puedeEnviar = useMemo(
    () =>
      Boolean(
        producto &&
          datos.nombre.trim() &&
          datos.telefono.trim().length >= 7 &&
          cantidad >= MINIMO &&
          !enviando,
      ),
    [producto, datos, cantidad, enviando],
  );

  const enviar = async () => {
    if (!puedeEnviar) return;
    setEnviando(true);
    setError('');
    try {
      const render = await componer(foto, tintado, {
        x: pos.x,
        y: pos.y,
        escala,
        rotacion,
        tecnica: tecnica.id,
      });

      const form = new FormData();
      form.append('tecnica', tecnica.nombre);
      form.append('producto', producto.title);
      form.append('handle', producto.handle);
      form.append('cantidad', String(cantidad));
      form.append('color', tecnica.colores.find((c) => c.hex === color)?.nombre || '');
      form.append('nombre', datos.nombre);
      form.append('empresa', datos.empresa);
      form.append('telefono', datos.telefono);
      form.append('ciudad', datos.ciudad);
      form.append('notas', datos.notas);
      form.append('render', render);
      if (tintado) form.append('diseno', tintado);

      const res = await fetch('/api/personalizado-mayor', {method: 'POST', body: form});
      const json = await res.json();
      if (json?.ok) {
        setListo(json.ticket);
      } else {
        setError(json?.error || 'No se pudo enviar. Intenta de nuevo.');
      }
    } catch {
      setError('No se pudo enviar. Revisa tu conexión e intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  if (listo) {
    return (
      <main className="pm">
        <div className="pm-gracias">
          <span className="pm-gracias-sello">Solicitud recibida</span>
          <h1>Ya la tenemos</h1>
          <p>
            Guardamos tu diseño y el render de {producto?.title} con {cantidad} unidades. Te
            escribimos a {datos.telefono} con la cotización.
          </p>
          <p className="pm-gracias-rad">Radicado {listo}</p>
          <a className="pm-gracias-volver" href="/">
            Volver a la tienda
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="pm">
      <div className="pm-top">
        <a href="/" className="pm-logo" aria-label="The Ranch">
          <img src="/logo-tinta.png" alt="The Ranch" width="74" />
        </a>
        <span className="pm-draft">Borrador · no publicado</span>
      </div>

      {/* ---------- portada ---------- */}
      <header className="pm-hero">
        <p className="pm-eyebrow">Para empresas, equipos y eventos</p>
        <h1>
          Tu marca puesta
          <br />
          en la prenda.
        </h1>
        <p className="pm-hero-sub">
          Bordado o grabado láser sobre nuestras chaquetas y licoreras. Sube tu diseño, ubícalo y
          mira cómo queda antes de pedir.
        </p>
        <span className="pm-hero-min">Mínimo 8 unidades · cotización a medida</span>
      </header>

      {/* ---------- 1. técnica ---------- */}
      <section className="pm-paso">
        <div className="pm-paso-head">
          <span className="pm-num">1</span>
          <h2>Elige la técnica</h2>
        </div>

        <div className="pm-tecnicas">
          {TECNICAS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={'pm-tecnica' + (tecnica.id === t.id ? ' is-on' : '')}
              onClick={() => setTecnica(t)}
            >
              <span className="pm-tecnica-top">
                <strong>{t.nombre}</strong>
                <em>{t.lema}</em>
              </span>
              <span className="pm-tecnica-det">{t.detalle}</span>
              <span className="pm-tecnica-ideal">{t.ideal}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ---------- 2. producto ---------- */}
      <section className="pm-paso">
        <div className="pm-paso-head">
          <span className="pm-num">2</span>
          <h2>Elige la pieza</h2>
        </div>

        <div className="pm-productos">
          {productos.map((p) => (
            <button
              key={p.handle}
              type="button"
              className={'pm-prod' + (producto?.handle === p.handle ? ' is-on' : '')}
              onClick={() => setProducto(p)}
            >
              <span className="pm-prod-foto">
                {p.featuredImage?.url ? (
                  <img src={p.featuredImage.url} alt={p.title} loading="lazy" />
                ) : null}
              </span>
              <span className="pm-prod-info">
                <strong>{p.title}</strong>
                <em>desde {pesos(p.priceRange.minVariantPrice.amount)}</em>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ---------- 3. estudio ---------- */}
      <section className="pm-paso">
        <div className="pm-paso-head">
          <span className="pm-num">3</span>
          <h2>Sube tu diseño y ubícalo</h2>
        </div>

        <div className="pm-estudio">
          <div
            className={'pm-lienzo' + (arrastrando ? ' is-drag' : '')}
            ref={escenario}
            onPointerDown={abajo}
            onPointerMove={moverDedo}
            onPointerUp={arriba}
            onPointerCancel={arriba}
          >
            {foto ? (
              <img className="pm-lienzo-foto" src={foto} alt={producto?.title} draggable={false} />
            ) : null}

            {tintado ? (
              <img
                className={'pm-diseno is-' + tecnica.id}
                src={tintado}
                alt="Tu diseño"
                draggable={false}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: `translate(-50%, -50%) rotate(${rotacion}deg) scale(${escala})`,
                }}
              />
            ) : (
              <span className="pm-lienzo-vacio">
                Sube tu logo y arrástralo
                <br />
                a donde lo quieras
              </span>
            )}

            <span className="pm-lienzo-tag">{tecnica.nombre} · vista previa</span>
          </div>
          <p className="pm-ref">
            La foto es de referencia. Antes de producir te enviamos el montaje final para aprobar.
          </p>

          <div className="pm-controles">
            <label className="pm-subir">
              <input type="file" accept="image/*" onChange={subir} />
              <span>{nombreArchivo ? 'Cambiar diseño' : 'Subir diseño'}</span>
            </label>

            {nombreArchivo ? (
              <p className="pm-archivo">
                {nombreArchivo}
                <button
                  type="button"
                  onClick={() => {
                    setOriginal(null);
                    setNombreArchivo('');
                  }}
                >
                  quitar
                </button>
              </p>
            ) : (
              <p className="pm-ayuda">PNG con fondo transparente es lo que mejor queda.</p>
            )}

            <label className="pm-check">
              <input
                type="checkbox"
                checked={limpio}
                onChange={(e) => setLimpio(e.target.checked)}
              />
              <span>Quitar el fondo blanco del logo</span>
            </label>

            {aviso ? <p className="pm-aviso">{aviso}</p> : null}

            <div className="pm-fila">
              <span className="pm-etq">
                {tecnica.id === 'bordado' ? 'Color del hilo' : 'Tono del grabado'}
              </span>
              <div className="pm-colores">
                {tecnica.colores.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={'pm-color' + (color === c.hex ? ' is-on' : '')}
                    style={{background: c.hex}}
                    onClick={() => setColor(c.hex)}
                    aria-label={c.nombre}
                    title={c.nombre}
                  />
                ))}
              </div>
            </div>

            <div className="pm-fila">
              <span className="pm-etq">Tamaño</span>
              <input
                className="pm-range"
                type="range"
                min="0.25"
                max="3"
                step="0.05"
                value={escala}
                onChange={(e) => setEscala(parseFloat(e.target.value))}
              />
            </div>

            <div className="pm-fila">
              <span className="pm-etq">Giro</span>
              <input
                className="pm-range"
                type="range"
                min="-45"
                max="45"
                step="1"
                value={rotacion}
                onChange={(e) => setRotacion(parseInt(e.target.value, 10))}
              />
            </div>

            <p className="pm-tip">Arrastra el diseño en la foto · pellizca para agrandarlo</p>
          </div>
        </div>
      </section>

      {/* ---------- 4. pedido ---------- */}
      <section className="pm-paso">
        <div className="pm-paso-head">
          <span className="pm-num">4</span>
          <h2>Cuántas y a quién</h2>
        </div>

        <div className="pm-pedido">
          <div className="pm-cantidad">
            <span className="pm-etq">Unidades</span>
            <div className="pm-cant-fila">
              <button type="button" onClick={() => setCantidad((c) => Math.max(MINIMO, c - 1))}>
                −
              </button>
              <input
                type="number"
                min={MINIMO}
                value={cantidad}
                onChange={(e) => setCantidad(parseInt(e.target.value || '0', 10))}
                inputMode="numeric"
              />
              <button type="button" onClick={() => setCantidad((c) => c + 1)}>
                +
              </button>
            </div>
            <p className="pm-ayuda">
              {cantidad < MINIMO
                ? `El mínimo es ${MINIMO}. Bájalo y no se puede cotizar.`
                : 'Entre más unidades, mejor queda el precio por unidad.'}
            </p>
          </div>

          <div className="pm-form">
            <label>
              <span className="pm-etq">Tu nombre</span>
              <input
                value={datos.nombre}
                onChange={(e) => setDatos({...datos, nombre: e.target.value})}
                placeholder="Nombre y apellido"
              />
            </label>
            <label>
              <span className="pm-etq">WhatsApp</span>
              <input
                value={datos.telefono}
                onChange={(e) => setDatos({...datos, telefono: e.target.value})}
                placeholder="300 000 0000"
                inputMode="tel"
              />
            </label>
            <label>
              <span className="pm-etq">Empresa o equipo</span>
              <input
                value={datos.empresa}
                onChange={(e) => setDatos({...datos, empresa: e.target.value})}
                placeholder="Opcional"
              />
            </label>
            <label>
              <span className="pm-etq">Ciudad</span>
              <input
                value={datos.ciudad}
                onChange={(e) => setDatos({...datos, ciudad: e.target.value})}
                placeholder="Chía, Bogotá…"
              />
            </label>
            <label className="pm-ancho">
              <span className="pm-etq">Algo que debamos saber</span>
              <textarea
                value={datos.notas}
                onChange={(e) => setDatos({...datos, notas: e.target.value})}
                rows={3}
                placeholder="Fecha del evento, tallas, si el logo va en la espalda…"
              />
            </label>
          </div>

          {error ? <p className="pm-error">{error}</p> : null}

          <button type="button" className="pm-cta" disabled={!puedeEnviar} onClick={enviar}>
            {enviando ? 'Enviando…' : 'Pedir cotización'}
          </button>
          <p className="pm-nota">
            No se cobra nada acá. Te escribimos con el precio por unidad y el tiempo de entrega.
          </p>
        </div>
      </section>
    </main>
  );
}
