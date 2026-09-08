/**
 * Endpoint de personalización de productos (grabado láser).
 * POST /api/personalizar
 * Recibe: product, handle, variantId, text, font, scale, pos, render (dataURL), logo (dataURL opcional)
 * Sube el render y el logo a Supabase Storage y guarda el pedido en tickets
 * (issue_type 'personalizacion').
 */

const SUPABASE_URL = 'https://rattwfjkxgqvxmxlybcz.supabase.co';
const BUCKET = 'personalizaciones';

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

async function uploadImage(key, path, dataUrl) {
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
  if (!res.ok) {
    throw new Error(`upload ${path} falló: ${res.status}`);
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

export async function action({request, context}) {
  try {
    const formData = await request.formData();
    const product = String(formData.get('product') || '').trim();
    const handle = String(formData.get('handle') || '').trim();
    const variantId = String(formData.get('variantId') || '').trim();
    const text = String(formData.get('text') || '').trim();
    const font = String(formData.get('font') || '');
    const scale = String(formData.get('scale') || '1');
    const pos = String(formData.get('pos') || '{}');
    const render = String(formData.get('render') || '');
    const logo = String(formData.get('logo') || '');

    if (!product || !render) {
      return Response.json({ok: false, error: 'Faltan datos'}, {status: 400});
    }

    const SERVICE_ROLE_KEY =
      context?.env?.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SERVICE_ROLE_KEY) {
      return Response.json({ok: false, error: 'Configuración incompleta'}, {status: 500});
    }

    const ts = Date.now();
    const slug = `${handle || 'prenda'}-${ts}`;

    let renderUrl = null;
    let logoUrl = null;
    try {
      renderUrl = await uploadImage(SERVICE_ROLE_KEY, `${slug}-render.png`, render);
      if (logo) {
        logoUrl = await uploadImage(SERVICE_ROLE_KEY, `${slug}-logo.png`, logo);
      }
    } catch (e) {
      console.error('upload storage', e);
      return Response.json({ok: false, error: 'No se pudo subir la imagen'}, {status: 500});
    }

    const payload = {
      ticket_number: `CUST-${ts.toString(36).toUpperCase()}`,
      from_number: 'web-personalizacion',
      customer_phone: null,
      product_name: product,
      issue_type: 'personalizacion',
      issue_description: JSON.stringify({text, font, scale, pos}),
      status: 'open',
      priority: 'high',
      context_data: {
        handle,
        variantId,
        text,
        font,
        scale,
        pos: JSON.parse(pos || '{}'),
        render_url: renderUrl,
        logo_url: logoUrl,
      },
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/tickets`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error('supabase tickets', res.status, await res.text());
      return Response.json({ok: false, error: 'No se pudo guardar el pedido'}, {status: 500});
    }

    return Response.json({ok: true, renderUrl, logoUrl});
  } catch (err) {
    console.error('api.personalizar error', err);
    return Response.json({ok: false, error: 'Ocurrió un error'}, {status: 500});
  }
}
