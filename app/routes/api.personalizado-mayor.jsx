/**
 * Solicitud de personalización al por mayor (bordado o grabado láser).
 * POST /api/personalizado-mayor
 *
 * No cobra nada: guarda la solicitud con el render del diseño para que el
 * equipo la cotice. Mínimo 8 unidades, por eso va aparte del personalizador
 * unitario de la ficha.
 */

const SUPABASE_URL = 'https://rattwfjkxgqvxmxlybcz.supabase.co';
const BUCKET = 'personalizaciones';
const MINIMO = 8;

function dataUrlParts(dataUrl) {
  const [meta, data] = String(dataUrl || '').split(',');
  if (!meta || !data) return null;
  const mime = (meta.match(/data:(.*?);/) || [])[1] || 'image/png';
  let bytes;
  try {
    const bin = atob(data);
    bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
  return {mime, bytes};
}

async function subir(key, path, dataUrl) {
  const parts = dataUrlParts(dataUrl);
  if (!parts) return null;
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': parts.mime,
      'x-upsert': 'true',
    },
    body: parts.bytes,
  });
  if (!res.ok) throw new Error(`upload ${path} falló: ${res.status}`);
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

export async function action({request, context}) {
  try {
    const f = await request.formData();
    const tecnica = String(f.get('tecnica') || '').trim();
    const producto = String(f.get('producto') || '').trim();
    const handle = String(f.get('handle') || '').trim();
    const cantidad = parseInt(String(f.get('cantidad') || '0'), 10);
    const nombre = String(f.get('nombre') || '').trim();
    const empresa = String(f.get('empresa') || '').trim();
    const telefono = String(f.get('telefono') || '').trim();
    const ciudad = String(f.get('ciudad') || '').trim();
    const notas = String(f.get('notas') || '').trim();
    const color = String(f.get('color') || '').trim();
    const render = String(f.get('render') || '');
    const diseno = String(f.get('diseno') || '');

    if (!tecnica || !producto || !nombre || !telefono) {
      return Response.json({ok: false, error: 'Faltan datos de contacto.'}, {status: 400});
    }
    if (!Number.isFinite(cantidad) || cantidad < MINIMO) {
      return Response.json(
        {ok: false, error: `El mínimo es de ${MINIMO} unidades.`},
        {status: 400},
      );
    }

    const SERVICE_KEY =
      context?.env?.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SERVICE_KEY) {
      return Response.json({ok: false, error: 'Configuración incompleta.'}, {status: 500});
    }

    const ts = Date.now();
    const slug = `mayor-${handle || 'prenda'}-${ts}`;

    let renderUrl = null;
    let disenoUrl = null;
    try {
      if (render) renderUrl = await subir(SERVICE_KEY, `${slug}-render.png`, render);
      if (diseno) disenoUrl = await subir(SERVICE_KEY, `${slug}-diseno.png`, diseno);
    } catch (e) {
      console.error('upload storage', e);
      return Response.json({ok: false, error: 'No se pudo subir el diseño.'}, {status: 500});
    }

    const payload = {
      ticket_number: `MAY-${ts.toString(36).toUpperCase()}`,
      from_number: telefono,
      customer_phone: telefono,
      product_name: `${producto} · ${cantidad} u · ${tecnica}`,
      issue_type: 'personalizacion',
      issue_description: `Pedido al por mayor: ${cantidad} unidades de ${producto} con ${tecnica}.`,
      status: 'open',
      priority: 'high',
      context_data: {
        mayorista: true,
        minimo: MINIMO,
        tecnica,
        producto,
        handle,
        cantidad,
        nombre,
        empresa,
        ciudad,
        notas,
        color,
        render_url: renderUrl,
        diseno_url: disenoUrl,
        origen: 'pagina-personalizado',
      },
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/tickets`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error('supabase tickets', res.status, await res.text());
      return Response.json({ok: false, error: 'No se pudo registrar la solicitud.'}, {status: 500});
    }

    return Response.json({ok: true, ticket: payload.ticket_number, renderUrl, disenoUrl});
  } catch (err) {
    console.error('api.personalizado-mayor', err);
    return Response.json({ok: false, error: 'Ocurrió un error.'}, {status: 500});
  }
}
