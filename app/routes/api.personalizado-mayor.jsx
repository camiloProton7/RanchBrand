/**
 * Solicitud de bordado al por mayor.
 * POST /api/personalizado-mayor
 *
 * No pasa por checkout ni cobra nada: guarda el pedido con el diseño,
 * crea el ticket y manda el correo con todos los datos al equipo.
 */

const SUPABASE_URL = 'https://rattwfjkxgqvxmxlybcz.supabase.co';
const BUCKET = 'personalizaciones';
const MINIMO = 8;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const FROM_EMAIL = 'proton.lab4@gmail.com';
const TO_EMAIL = 'proton.lab4@gmail.com';

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
  return {mime, bytes, base64: data};
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

const cop = (n) => '$' + Number(n || 0).toLocaleString('es-CO');

const esc = (s) =>
  String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

function fila(etiqueta, valor) {
  if (!valor) return '';
  return `<tr><td style="padding:5px 14px 5px 0;color:#7a7064;font-size:13px">${etiqueta}</td><td style="padding:5px 0;font-size:13px;font-weight:600">${esc(valor)}</td></tr>`;
}

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
    if (telefono.replace(/\D/g, '').length < 10) {
      return Response.json(
        {ok: false, error: 'Necesitamos un teléfono completo para llamarte.'},
        {status: 400},
      );
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
    const ticket = `MAY-${ts.toString(36).toUpperCase()}`;

    let disenoUrl = null;
    let disenoExt = 'png';
    try {
      if (diseno) {
        const parts = dataUrlParts(diseno);
        disenoExt = parts ? extension(parts.mime) : 'png';
        disenoUrl = await subir(SERVICE_KEY, `${slug}-diseno.${disenoExt}`, diseno);
      }
    } catch (e) {
      console.error('upload storage', e);
      return Response.json({ok: false, error: 'No se pudo subir el diseño.'}, {status: 500});
    }

    const resumen = [
      `${cantidad} u de ${producto}`,
      tallas ? `tallas ${tallas}` : null,
      colorHilo ? `hilo ${colorHilo}` : null,
    ]
      .filter(Boolean)
      .join(' · ');

    const payload = {
      ticket_number: ticket,
      from_number: telefono,
      customer_phone: telefono,
      customer_email: correo || null,
      product_name: `${producto} · ${cantidad} u · ${tecnica}`,
      issue_type: 'personalizacion',
      issue_description: `Pedido de bordado: ${resumen}. Total cotizado ${cop(total)}. Revisar diseño, llamar al cliente y hacer prueba de bordado antes de producir.`,
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

    /* ---------- correo al equipo ---------- */
    const API_KEY = context?.env?.BREVO_API_KEY || process.env.BREVO_API_KEY;
    let correoOk = false;

    if (API_KEY) {
      const html = `
        <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1a1714;max-width:560px">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#b34a2a;font-weight:700">
            The Ranch · Bordado al por mayor
          </p>
          <h2 style="margin:0 0 4px;font-size:21px">Nuevo pedido ${esc(ticket)}</h2>
          <p style="margin:0 0 18px;font-size:14px;color:#7a7064">
            ${esc(cantidad)} unidades de ${esc(producto)}
          </p>

          <table style="border-collapse:collapse;margin-bottom:16px">
            ${fila('Cliente', nombre)}
            ${fila('Teléfono', telefono)}
            ${fila('Correo', correo)}
            ${fila('Ciudad', ciudad)}
            ${fila('Empresa', empresa)}
          </table>

          <h3 style="margin:0 0 8px;font-size:14px">Prendas</h3>
          <table style="border-collapse:collapse;margin-bottom:16px">
            ${fila('Prenda', producto)}
            ${fila('Colores y tallas', tallas)}
            ${fila('Color del hilo', colorHilo)}
            ${fila('Unidades', String(cantidad))}
          </table>

          <h3 style="margin:0 0 8px;font-size:14px">Cuenta</h3>
          <table style="border-collapse:collapse;margin-bottom:16px">
            ${fila('Prenda', cop(subtotalPrenda))}
            ${fila('Descuento por volumen', descuento ? '−' + cop(descuento) : '—')}
            ${fila(`Bordado (${cop(bordadoUnitario)} × ${cantidad})`, cop(bordadoUnitario * cantidad))}
            <tr><td style="padding:9px 14px 0 0;font-size:14px;font-weight:700;border-top:1px solid #e6ddcd">Total</td>
                <td style="padding:9px 0 0;font-size:17px;font-weight:800;border-top:1px solid #e6ddcd">${cop(total)}</td></tr>
          </table>

          ${notas ? `<p style="margin:0 0 16px"><strong>Indicaciones:</strong><br>${esc(notas).replace(/\n/g, '<br>')}</p>` : ''}

          ${disenoUrl ? `<p style="margin:0 0 18px"><a href="${disenoUrl}" style="color:#b34a2a;font-weight:700">Ver el diseño${disenoNombre ? ` (${esc(disenoNombre)})` : ''}</a></p>` : ''}

          <div style="background:#f5f0e6;border-left:3px solid #b34a2a;padding:12px 14px;border-radius:0 10px 10px 0;font-size:13px">
            <strong>Antes de producir:</strong> revisar el diseño, llamar al cliente para confirmar
            características y hacer una prueba del bordado.
          </div>
        </div>`;

      const mail = {
        sender: {name: 'The Ranch · Bordado', email: FROM_EMAIL},
        to: [{email: TO_EMAIL, name: 'The Ranch'}],
        subject: `Bordado ${ticket} · ${producto} · ${cantidad} u · ${nombre}`,
        htmlContent: html,
      };
      if (correo) mail.replyTo = {email: correo, name: nombre};

      const partes = diseno ? dataUrlParts(diseno) : null;
      if (partes && partes.bytes.length < 6 * 1024 * 1024) {
        mail.attachment = [{
          content: partes.base64,
          name: disenoNombre || `diseno-${ticket}.${disenoExt}`,
        }];
      }

      try {
        const r = await fetch(BREVO_API_URL, {
          method: 'POST',
          headers: {'api-key': API_KEY, 'Content-Type': 'application/json'},
          body: JSON.stringify(mail),
        });
        correoOk = r.ok;
        if (!r.ok) console.error('Brevo falló', r.status, await r.text());
      } catch (e) {
        console.error('Brevo error', e);
      }
    } else {
      console.error('BREVO_API_KEY no configurado');
    }

    return Response.json({ok: true, ticket, disenoUrl, correo: correoOk});
  } catch (err) {
    console.error('api.personalizado-mayor', err);
    return Response.json({ok: false, error: 'Ocurrió un error.'}, {status: 500});
  }
}
