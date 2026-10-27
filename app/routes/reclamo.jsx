import {useState} from 'react';

/**
 * Formulario público de quejas y reclamos.
 * Crea un ticket con radicado en la plataforma (Supabase, función `reclamo`).
 */
export const meta = () => [
  {title: 'Quejas y reclamos — The Ranch'},
  {name: 'description', content: 'Cuéntanos qué pasó y te damos un número de radicado para seguir tu caso.'},
  {name: 'robots', content: 'noindex, nofollow'},
];

// El envío va a la action de esta misma ruta (mismo origen) y la tienda lo reenvía
// a la función `reclamo` de Supabase. Así no depende de CORS ni de /api/*.
const ENDPOINT = '/api/reclamo';
const SUPABASE_RECLAMO = 'https://rattwfjkxgqvxmxlybcz.supabase.co/functions/v1/reclamo';

/** POST /reclamo → crea el ticket con radicado. */
export async function action({request}) {
  if (request.method !== 'POST') {
    return Response.json({error: 'Método no permitido'}, {status: 405});
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({error: 'No pudimos leer los datos.'}, {status: 400});
  }
  try {
    const r = await fetch(SUPABASE_RECLAMO, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body),
    });
    const data = await r.json().catch(() => ({}));
    return Response.json(data, {status: r.status});
  } catch (error) {
    console.error('reclamo action', error);
    return Response.json({error: 'No pudimos enviar tu caso. Intenta otra vez.'}, {status: 502});
  }
}

const S = {
  wrap: {maxWidth: 620, margin: '0 auto', padding: '32px 20px 64px'},
  h1: {fontFamily: 'Georgia, serif', fontSize: 32, lineHeight: 1.15, margin: '0 0 12px', color: '#1f1b16'},
  lead: {color: '#5d554a', fontSize: 16, lineHeight: 1.55, margin: '0 0 8px'},
  horario: {color: '#b34a2a', fontSize: 13.5, fontWeight: 600, margin: '0 0 28px'},
  label: {display: 'block', fontSize: 13, fontWeight: 600, color: '#5d554a', marginBottom: 6, letterSpacing: 0.2},
  input: {
    width: '100%',
    padding: '14px',
    fontSize: 16,
    color: '#1f1b16',
    background: '#fffdf8',
    border: '1px solid #ded5c4',
    borderRadius: 10,
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  fila: {display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12},
  check: {display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: '#5d554a', lineHeight: 1.45},
  btn: {
    background: '#b34a2a',
    color: '#fff',
    border: 0,
    borderRadius: 12,
    padding: '16px 20px',
    fontSize: 17,
    fontWeight: 700,
    cursor: 'pointer',
  },
  error: {background: '#fde8e4', border: '1px solid #e9b3a7', color: '#8c2f1f', padding: '12px 14px', borderRadius: 10, fontSize: 14},
  ok: {background: '#fffdf8', border: '1px solid #ded5c4', borderRadius: 16, padding: '32px 22px', textAlign: 'center'},
  radicado: {
    background: '#f5f0e6',
    border: '1px dashed #b34a2a',
    borderRadius: 12,
    padding: '18px 12px',
    fontSize: 26,
    fontWeight: 700,
    color: '#b34a2a',
    letterSpacing: 1,
  },
};

export default function Reclamo() {
  const [f, setF] = useState({nombre: '', telefono: '', email: '', pedido: '', producto: '', tipo: 'queja', descripcion: '', autoriza: false});
  const [estado, setEstado] = useState('editando');
  const [radicado, setRadicado] = useState('');
  const [error, setError] = useState('');

  const set = (k) => (e) =>
    setF((p) => ({...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value}));

  async function enviar(e) {
    e.preventDefault();
    setError('');
    setEstado('enviando');
    try {
      const r = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(f),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error || 'Algo salió mal. Intenta otra vez.');
        setEstado('editando');
        return;
      }
      setRadicado(data.radicado);
      setEstado('listo');
      window.scrollTo({top: 0, behavior: 'smooth'});
    } catch {
      setError('No pudimos enviar el formulario. Revisa tu conexión e intenta otra vez.');
      setEstado('editando');
    }
  }

  if (estado === 'listo') {
    return (
      <div style={S.wrap}>
        <div style={S.ok}>
          <div style={{fontSize: 42, lineHeight: 1}}>✓</div>
          <h2 style={{fontSize: 23, margin: '14px 0 6px', color: '#1f1b16'}}>Recibimos tu caso</h2>
          <p style={{color: '#5d554a', fontSize: 15, margin: '0 0 18px'}}>Guarda este número. Con él puedes preguntarnos cómo va.</p>
          <div style={S.radicado}>{radicado}</div>
          <p style={{color: '#7a7166', fontSize: 13, marginTop: 18, lineHeight: 1.5}}>
            Te escribimos por WhatsApp al número que dejaste. Si quieres agregar algo, hazlo por ese chat citando tu radicado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={S.wrap}>
      <h1 style={S.h1}>Cuéntanos qué pasó</h1>
      <p style={S.lead}>
        Déjanos los datos de tu caso y te entregamos un <strong>número de radicado</strong>. Con ese número puedes
        preguntarnos cómo va por WhatsApp.
      </p>
      <p style={S.horario}>Respondemos de lunes a viernes de 7:00 am a 6:00 pm y sábados de 11:00 am a 7:00 pm.</p>

      <form onSubmit={enviar} style={{display: 'grid', gap: 16}}>
        <div>
          <label style={S.label} htmlFor="nombre">Nombre completo *</label>
          <input id="nombre" style={S.input} value={f.nombre} onChange={set('nombre')} required minLength={3} autoComplete="name" />
        </div>
        <div>
          <label style={S.label} htmlFor="telefono">WhatsApp (10 dígitos) *</label>
          <input id="telefono" style={S.input} value={f.telefono} onChange={set('telefono')} required inputMode="tel" placeholder="300 123 4567" autoComplete="tel" />
        </div>
        <div>
          <label style={S.label} htmlFor="email">Correo (opcional)</label>
          <input id="email" style={S.input} value={f.email} onChange={set('email')} type="email" autoComplete="email" />
        </div>
        <div style={S.fila}>
          <div>
            <label style={S.label} htmlFor="pedido">Número de pedido</label>
            <input id="pedido" style={S.input} value={f.pedido} onChange={set('pedido')} inputMode="numeric" placeholder="Opcional" />
          </div>
          <div>
            <label style={S.label} htmlFor="tipo">¿Qué necesitas? *</label>
            <select id="tipo" style={S.input} value={f.tipo} onChange={set('tipo')}>
              <option value="queja">Queja</option>
              <option value="reclamo">Reclamo</option>
              <option value="garantia">Garantía</option>
              <option value="cambio">Cambio de talla o producto</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </div>
        <div>
          <label style={S.label} htmlFor="producto">Producto (opcional)</label>
          <input id="producto" style={S.input} value={f.producto} onChange={set('producto')} placeholder="Ej: Camisa Outdoor talla M" />
        </div>
        <div>
          <label style={S.label} htmlFor="descripcion">Cuéntanos qué pasó *</label>
          <textarea
            id="descripcion"
            style={{...S.input, minHeight: 130, resize: 'vertical'}}
            value={f.descripcion}
            onChange={set('descripcion')}
            required
            minLength={15}
            placeholder="Qué compraste, qué pasó y qué esperas que hagamos."
          />
        </div>
        <label style={S.check}>
          <input type="checkbox" checked={f.autoriza} onChange={set('autoriza')} style={{marginTop: 3, width: 18, height: 18, accentColor: '#b34a2a'}} />
          <span>Autorizo a The Ranch a tratar mis datos para atender este caso.</span>
        </label>

        {error ? <div style={S.error}>{error}</div> : null}

        <button type="submit" disabled={estado === 'enviando'} style={{...S.btn, opacity: estado === 'enviando' ? 0.75 : 1}}>
          {estado === 'enviando' ? 'Enviando…' : 'Enviar mi caso'}
        </button>
      </form>
    </div>
  );
}
