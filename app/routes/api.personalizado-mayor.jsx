/**
 * Solicitud de bordado al por mayor.
 * POST /api/personalizado-mayor
 *
 * No cobra nada: guarda el pedido con el diseño para que el equipo lo revise,
 * llame al cliente y haga la prueba de bordado antes de producir.
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

function extension(mime) {
  if (/pdf/.test(mime)) return 'pdf';
  if (/svg/.test(mime)) return 'svg';
  if (/jpeg|jpg/.test(mime)) return 'jpg';
  if (/webp/.test(mime)) return 'webp';
  return 'png';
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

const num = (v) => {
  const n = Number(String(v || '0'));
  return Number.isFinite(n) ? Math.round(n) : 0;
};

export async function action({request, context}) {
  try {
    const f = await request.formData();
    const tecnica = String(f.get('tecnica') || 'Bordado').trim();
    const producto = String(f.get('producto') || '').trim();
    const handle = String(f.get('handle') || '').trim();
    const cantidad = parseInt(String(f.get('cantidad') || '0'), 10);
    const nombre = String(f.get('nombre') || '').trim();
    const empresa = String(f.get('empresa') || '').trim();
    const telefono = String(f.get('telefono') || '').trim();
    const correo = String(f.get('correo') || '').trim();
    const ciudad = String(f.get('ciudad') || '').trim();
    const notas = String(f.get('notas') || '').trim();
    const color = String(f.get('color') || '').trim();
    const tallas = String(f.get('tallas') || '').trim();
    const colorHilo = String(f.get('color_hilo') || '').trim();
    const disenoNombre = String(f.get('diseno_nombre') || '').trim();
    const diseno = String(f.get('diseno') || '');

    const precioUnitario = num(f.get('precio_unitario'));
    const subtotalPrenda = num(f.get('subtotal_prenda'));
    const descuento = num(f.get('descuento'));
    const bordadoUnitario = num(f.get('bordado_unitario')) || 5000;
    const total = num(f.get('total'));

    if (!producto || !nombre || !telefono) {
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
    const slug = `bordado-${handle || 'prenda'}-${ts}`;

    let disenoUrl = null;
    try {
      if (diseno) {
        const parts = dataUrlParts(diseno);
        const ext = parts ? extension(parts.mime) : 'png';
        disenoUrl = await subir(SERVICE_KEY, `${slug}-diseno.${ext}`, diseno);
      }
    } catch (e) {
      console.error('upload storage', e);
      return Response.json({ok: false, error: 'No se pudo subir el diseño.'}, {status: 500});
    }

    const resumen = [
      `${cantidad} u de ${producto}`,
      color ? `color ${color}` : null,
      tallas ? `tallas ${tallas}` : null,
      colorHilo ? `hilo ${colorHilo}` : null,
    ]
      .filter(Boolean)
      .join(' · ');

    const payload = {
      ticket_number: `MAY-${ts.toString(36).toUpperCase()}`,
      from_number: telefono,
      customer_phone: telefono,
      customer_email: correo || null,
      product_name: `${producto} · ${cantidad} u · ${tecnica}`,
      issue_type: 'personalizacion',
      issue_description: `Pedido de bordado: ${resumen}. Total cotizado $${total.toLocaleString('es-CO')}. Revisar diseño, llamar al cliente y hacer prueba de bordado antes de producir.`,
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
        correo,
        ciudad,
        telefono,
        notas,
        color,
        tallas,
        color_hilo: colorHilo,
        diseno_nombre: disenoNombre,
        diseno_url: disenoUrl,
        precios: {
          unitario: precioUnitario,
          subtotal_prenda: subtotalPrenda,
          descuento_volumen: descuento,
          bordado_unitario: bordadoUnitario,
          total,
        },
        pendiente: ['revisar diseño', 'llamar al cliente', 'prueba de bordado'],
        origen: 'pagina-personalizado-bordado',
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
      return Response.json({ok: false, error: 'No se pudo registrar el pedido.'}, {status: 500});
    }

    return Response.json({ok: true, ticket: payload.ticket_number, disenoUrl});
  } catch (err) {
    console.error('api.personalizado-mayor', err);
    return Response.json({ok: false, error: 'Ocurrió un error.'}, {status: 500});
  }
}
