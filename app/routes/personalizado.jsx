import {useLoaderData} from 'react-router';
import {useMemo, useState} from 'react';
import estilos from '~/styles/personalizado-bordado.css?url';

/**
 * Pedido de bordado al por mayor.
 *
 * Borrador: solo abre con el token de la URL y no está enlazada en el sitio.
 * El cliente elige chaqueta, color y tallas, sube su diseño y ve el precio
 * en vivo (bordado $5.000 por prenda, 20% en la prenda desde 8 unidades).
 */

const TOKEN_BORRADOR = 'ranch-mayor-2026';
export const MINIMO = 8;
export const BORDADO_UNITARIO = 5000;
export const DESCUENTO_DESDE = 8;
export const DESCUENTO = 0.2;

export const links = () => [{rel: 'stylesheet', href: estilos}];

export const meta = () => [
  {title: 'Bordado al por mayor — The Ranch'},
  {name: 'robots', content: 'noindex, nofollow'},
];

const CONSULTA = `#graphql
  query ChaquetasBordado($handle: String!) {
    collection(handle: $handle) {
      products(first: 60, sortKey: PRICE, reverse: true) {
        nodes {
          title
          handle
          featuredImage {url altText}
          options {name values}
          variants(first: 120) {
            nodes {
              availableForSale
              price {amount}
              selectedOptions {name value}
            }
          }
        }
      }
    }
  }
`;

export async function loader({request, context}) {
  const url = new URL(request.url);
  if (url.searchParams.get('preview') !== TOKEN_BORRADOR) {
    throw new Response('No encontrado', {status: 404});
  }

  const data = await context.storefront.query(CONSULTA, {
    variables: {handle: 'chaquetas'},
    cache: context.storefront.CacheShort(),
  });

  const productos = (data?.collection?.products?.nodes || []).map((p) => {
    const opciones = p.options || [];
    const optColor = opciones.find((o) => /color/i.test(o.name));
    const optTalla = opciones.find((o) => /talla|size/i.test(o.name));
    const colores = optColor ? optColor.values : ['Único'];
    const tallas = optTalla ? optTalla.values : ['Única'];

    const disp = {};
    let precio = 0;
    for (const v of p.variants?.nodes || []) {
      const c = v.selectedOptions.find((s) => /color/i.test(s.name))?.value || 'Único';
      const t = v.selectedOptions.find((s) => /talla|size/i.test(s.name))?.value || 'Única';
      disp[`${c}|${t}`] = v.availableForSale;
      if (!precio) precio = Number(v.price?.amount || 0);
    }

    return {
      titulo: p.title,
      handle: p.handle,
      imagen: p.featuredImage?.url || '',
      precio: Math.round(precio),
      colores,
      tallas,
      disp,
    };
  });

  return {productos};
}

const cop = (n) => '$' + Math.round(n).toLocaleString('es-CO');

const COLORES_HILO = [
  {nombre: 'Negro', hex: '#1b1815'},
  {nombre: 'Blanco', hex: '#f7f4ee'},
  {nombre: 'Crema', hex: '#efe3cb'},
  {nombre: 'Terracota', hex: '#b34a2a'},
  {nombre: 'Oro viejo', hex: '#b08d4f'},
  {nombre: 'Verde oliva', hex: '#5c6242'},
  {nombre: 'Azul navy', hex: '#1f2c44'},
  {nombre: 'Vinotinto', hex: '#5a1f24'},
  {nombre: 'Gris', hex: '#8d8880'},
  {nombre: 'Plata', hex: '#c9c9c9'},
];

export default function Personalizado() {
  const {productos} = useLoaderData();

  const [paso, setPaso] = useState(1);
  const [iProd, setIProd] = useState(-1);
  const [color, setColor] = useState('');
  const [tallas, setTallas] = useState({});
  const [colorHilo, setColorHilo] = useState({nombre: 'Negro', hex: '#1b1815'});
  const [notas, setNotas] = useState('');
  const [diseno, setDiseno] = useState(null);
  const [nombre, setNombre] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [telefono, setTelefono] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [correo, setCorreo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [listo, setListo] = useState(null);

  const producto = productos[iProd] || null;

  const unidades = useMemo(
    () => Object.values(tallas).reduce((a, b) => a + (Number(b) || 0), 0),
    [tallas],
  );

  const cuentas = useMemo(() => {
    if (!producto) return {bruto: 0, descuento: 0, bordado: 0, total: 0, aplica: false};
    const bruto = producto.precio * unidades;
    const aplica = unidades >= DESCUENTO_DESDE;
    const descuento = aplica ? Math.round(bruto * DESCUENTO) : 0;
    const bordado = BORDADO_UNITARIO * unidades;
    return {bruto, descuento, bordado, total: bruto - descuento + bordado, aplica};
  }, [producto, unidades]);

  function elegirProducto(i) {
    setIProd(i);
    setColor(productos[i].colores[0]);
    setTallas({});
    setPaso(2);
    setError('');
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  function cambiar(talla, delta) {
    setTallas((prev) => {
      const n = Math.max(0, Math.min(500, (Number(prev[talla]) || 0) + delta));
      const copia = {...prev};
      if (n === 0) delete copia[talla];
      else copia[talla] = n;
      return copia;
    });
  }

  function disponible(talla) {
    if (!producto) return true;
    return producto.disp[`${color}|${talla}`] !== false;
  }

  async function subirArchivo(ev) {
    const f = ev.target.files?.[0];
    setError('');
    if (!f) return;
    if (f.size > 12 * 1024 * 1024) {
      setError('El archivo pasa de 12 MB. Mándanos una versión más liviana.');
      return;
    }
    if (!/image\/(png|jpeg|webp|svg\+xml)|application\/pdf/.test(f.type)) {
      setError('Formato no válido. Puede ser PNG, JPG, SVG o PDF.');
      return;
    }
    const dataUrl = await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result));
      r.onerror = rej;
      r.readAsDataURL(f);
    });
    setDiseno({nombre: f.name, mime: f.type, dataUrl, peso: f.size});
  }

  async function enviar() {
    setError('');
    if (!producto) return setError('Falta elegir la chaqueta.');
    if (unidades < MINIMO) return setError(`El mínimo es de ${MINIMO} unidades.`);
    if (!diseno) return setError('Falta subir el diseño que quieres bordar.');
    if (!nombre.trim() || !telefono.trim()) return setError('Falta tu nombre y el teléfono.');

    setEnviando(true);
    try {
      const fd = new FormData();
      fd.set('tecnica', 'Bordado');
      fd.set('producto', producto.titulo);
      fd.set('handle', producto.handle);
      fd.set('cantidad', String(unidades));
      fd.set('nombre', nombre.trim());
      fd.set('empresa', empresa.trim());
      fd.set('telefono', telefono.trim());
      fd.set('ciudad', ciudad.trim());
      fd.set('correo', correo.trim());
      fd.set('color', color);
      fd.set('notas', notas.trim());
      fd.set('tallas', Object.entries(tallas).map(([t, q]) => `${t}: ${q}`).join(' · '));
      fd.set('color_hilo', `${colorHilo.nombre} (${colorHilo.hex})`);
      fd.set('precio_unitario', String(producto.precio));
      fd.set('subtotal_prenda', String(cuentas.bruto));
      fd.set('descuento', String(cuentas.descuento));
      fd.set('bordado_unitario', String(BORDADO_UNITARIO));
      fd.set('total', String(cuentas.total));
      fd.set('diseno_nombre', diseno.nombre);
      if (diseno.dataUrl) fd.set('diseno', diseno.dataUrl);

      const res = await fetch('/api/personalizado-mayor', {method: 'POST', body: fd});
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'No se pudo enviar.');
      setListo(data.ticket);
      window.scrollTo({top: 0, behavior: 'smooth'});
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  }

  if (listo) {
    return (
      <main className="pm">
        <div className="pm-hecho">
          <div className="pm-check" aria-hidden="true">✓</div>
          <h1>Recibimos tu pedido</h1>
          <p className="pm-radicado">Radicado <strong>{listo}</strong></p>
          <div className="pm-aviso">
            <p>
              Ahora revisamos tu diseño y <strong>te llamamos</strong> para confirmar las
              características: tamaño, ubicación, color del hilo y el tipo de letra.
            </p>
            <p>
              Antes de producir hacemos <strong>una prueba del bordado</strong> sobre la prenda y
              te la mostramos. Solo cuando la apruebes arrancamos el pedido.
            </p>
          </div>
          <a className="pm-btn" href="/">Volver a la tienda</a>
        </div>
      </main>
    );
  }

  return (
    <main className="pm">
      <header className="pm-head">
        <p className="pm-eyebrow">The Ranch · Bordado</p>
        <h1>Bordado al por mayor</h1>
        <p className="pm-sub">
          Elige las chaquetas, sube tu diseño y te llamamos para cuadrar el bordado.
        </p>
      </header>

      <ol className="pm-pasos">
        {['Chaqueta', 'Color y tallas', 'Diseño'].map((t, i) => (
          <li
            key={t}
            className={paso === i + 1 ? 'activo' : paso > i + 1 ? 'hecho' : ''}
            onClick={() => {
              if (i + 1 < paso || (i + 1 === 2 && producto)) {
                setPaso(i + 1);
                window.scrollTo({top: 0, behavior: 'smooth'});
              }
            }}
          >
            <span>{i + 1}</span>
            {t}
          </li>
        ))}
      </ol>

      {paso === 1 && (
        <section className="pm-sec">
          <h2>¿Qué chaqueta vas a bordar?</h2>
          <div className="pm-grid">
            {productos.map((p, i) => (
              <button
                key={p.handle}
                type="button"
                className={'pm-card' + (i === iProd ? ' sel' : '')}
                onClick={() => elegirProducto(i)}
              >
                {p.imagen ? <img src={p.imagen} alt={p.titulo} loading="lazy" /> : null}
                <span className="pm-card-nombre">{p.titulo}</span>
                <span className="pm-card-precio">desde {cop(p.precio)}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {paso === 2 && producto && (
        <section className="pm-sec">
          <button type="button" className="pm-volver" onClick={() => setPaso(1)}>
            ← Cambiar chaqueta
          </button>
          <h2>{producto.titulo}</h2>

          {producto.colores.length > 1 && (
            <>
              <h3>Color</h3>
              <div className="pm-chips">
                {producto.colores.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={'pm-chip' + (color === c ? ' sel' : '')}
                    onClick={() => {
                      setColor(c);
                      setTallas({});
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </>
          )}

          <h3>Tallas</h3>
          <div className="pm-tallas">
            {producto.tallas.map((t) => {
              const hab = disponible(t);
              return (
                <div key={t} className={'pm-talla' + (hab ? '' : ' agotada')}>
                  <span className="pm-talla-nombre">{t}</span>
                  <div className="pm-stepper">
                    <button type="button" onClick={() => cambiar(t, -1)} disabled={!hab || !tallas[t]}>
                      −
                    </button>
                    <span>{tallas[t] || 0}</span>
                    <button type="button" onClick={() => cambiar(t, 1)} disabled={!hab}>
                      +
                    </button>
                  </div>
                  {!hab && <span className="pm-agotada">agotada</span>}
                </div>
              );
            })}
          </div>

          <div className="pm-resumen-mini">
            <div><span>Unidades</span><strong>{unidades}</strong></div>
            <div><span>Prenda</span><strong>{cop(cuentas.bruto)}</strong></div>
            <div><span>Bordado</span><strong>{cop(cuentas.bordado)}</strong></div>
            <div><span>Total</span><strong>{cop(cuentas.total)}</strong></div>
          </div>

          <button
            type="button"
            className="pm-btn"
            disabled={unidades < MINIMO}
            onClick={() => {
              setPaso(3);
              window.scrollTo({top: 0, behavior: 'smooth'});
            }}
          >
            {unidades < MINIMO ? `Faltan ${MINIMO - unidades} unidades` : 'Pasar al diseño'}
          </button>
        </section>
      )}

      {paso === 3 && producto && (
        <section className="pm-sec">
          <button type="button" className="pm-volver" onClick={() => setPaso(2)}>
            ← Cambiar tallas
          </button>
          <h2>Tu bordado</h2>

          <h3>Color del hilo</h3>
          <div className="pm-hilos">
            {COLORES_HILO.map((c) => (
              <button
                key={c.hex}
                type="button"
                className={'pm-hilo' + (colorHilo.hex === c.hex ? ' sel' : '')}
                onClick={() => setColorHilo(c)}
                title={c.nombre}
              >
                <i style={{background: c.hex}} />
                <span>{c.nombre}</span>
              </button>
            ))}
          </div>
          <p className="pm-nota">
            Cualquier color es posible. Si el tuyo no está en la lista, lo anotas abajo y lo
            cuadramos en la llamada.
          </p>

          <h3>Diseño</h3>
          <label className="pm-archivo">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,application/pdf"
              onChange={subirArchivo}
            />
            <span>{diseno ? `✓ ${diseno.nombre}` : 'Subir diseño (PNG, JPG, SVG o PDF)'}</span>
          </label>
          <p className="pm-nota">
            Lo ideal es PNG con fondo transparente o vector. Si solo tienes la foto del logo,
            súbela igual y lo dibujamos.
          </p>

          {diseno && /^image\//.test(diseno.mime) && (
            <div className="pm-preview">
              <img src={diseno.dataUrl} alt="Tu diseño" />
            </div>
          )}

          <h3>Ubicación y detalles</h3>
          <textarea
            className="pm-input"
            rows={3}
            placeholder="Ej: en el pecho izquierdo, 8 cm de ancho, con el nombre de cada persona debajo"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />

          <h3>Tus datos</h3>
          <div className="pm-campos">
            <input className="pm-input" placeholder="Nombre y apellido *" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            <input className="pm-input" placeholder="Empresa o equipo" value={empresa} onChange={(e) => setEmpresa(e.target.value)} />
            <input className="pm-input" placeholder="Teléfono / WhatsApp *" inputMode="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
            <input className="pm-input" placeholder="Correo" inputMode="email" value={correo} onChange={(e) => setCorreo(e.target.value)} />
            <input className="pm-input" placeholder="Ciudad" value={ciudad} onChange={(e) => setCiudad(e.target.value)} />
          </div>

          <div className="pm-cuenta">
            <div><span>{producto.titulo} × {unidades} u</span><b>{cop(cuentas.bruto)}</b></div>
            <div><span>Bordado {cop(BORDADO_UNITARIO)} × {unidades}</span><b>{cop(cuentas.bordado)}</b></div>
            {cuentas.descuento > 0 && (
              <div className="pm-desc"><span>Descuento por volumen −20%</span><b>−{cop(cuentas.descuento)}</b></div>
            )}
            <div className="pm-total"><span>Total</span><b>{cop(cuentas.total)}</b></div>
          </div>

          {!cuentas.aplica && (
            <p className="pm-nota">
              Desde {DESCUENTO_DESDE} unidades la prenda baja 20%. Vas en {unidades}.
            </p>
          )}

          <div className="pm-aviso">
            <p>
              Al enviar el pedido revisamos tu diseño y <strong>te llamamos</strong> para confirmar
              tamaño, ubicación y color del hilo.
            </p>
            <p>
              Antes de producir hacemos <strong>una prueba del bordado</strong> y te mostramos cómo
              queda. Solo arrancamos cuando la apruebes.
            </p>
          </div>

          {error && <p className="pm-error">{error}</p>}

          <button type="button" className="pm-btn" onClick={enviar} disabled={enviando}>
            {enviando ? 'Enviando…' : 'Enviar pedido de bordado'}
          </button>
          <p className="pm-nota pm-centro">
            No se cobra nada ahora. Te llamamos para confirmar antes de facturar.
          </p>
        </section>
      )}
    </main>
  );
}
