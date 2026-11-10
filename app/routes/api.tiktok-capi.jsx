/**
 * Events API de TikTok → manda el evento "CompletePayment" (compra) desde el servidor.
 *
 * Recibe el webhook de Shopify "orders/create" (JSON de la orden) y lo envía
 * a TikTok con correo y teléfono hasheados (SHA256), igual que el pixel del
 * navegador. Así la compra no se pierde cuando el checkout es de Shopify.
 *
 * POST /api/tiktok-capi
 */

const PIXEL_ID = 'CN6H58BC77U606BMCVUG';
const ENDPOINT = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';

async function sha256(texto) {
  if (!texto) return '';
  const datos = new TextEncoder().encode(String(texto).trim().toLowerCase());
  const hash = await crypto.subtle.digest('SHA-256', datos);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// TikTok espera el teléfono en E.164 sin signos: 573001234567
function telefono(valor) {
  const digitos = String(valor || '').replace(/\D/g, '');
  if (!digitos) return '';
  if (digitos.startsWith('57')) return digitos;
  if (digitos.length === 10) return `57${digitos}`;
  return digitos;
}

export async function action({request, context}) {
  const token = context?.env?.TIKTOK_EVENTS_TOKEN || process.env.TIKTOK_EVENTS_TOKEN;
  if (!token) {
    console.error('TIKTOK_EVENTS_TOKEN no configurado');
    return Response.json({ok: false, error: 'Token de TikTok no configurado'}, {status: 500});
  }

  try {
    const orden = await request.json();

    const correo = orden.email || orden.contact_email || orden.customer?.email || '';
    const tel = telefono(
      orden.phone ||
        orden.shipping_address?.phone ||
        orden.billing_address?.phone ||
        orden.customer?.phone,
    );

    const lineas = orden.line_items || [];
    const contenidos = lineas.map((li) => ({
      content_id: String(li.variant_id || li.product_id || ''),
      content_type: 'product',
      content_name: li.title || '',
      quantity: Number(li.quantity) || 1,
      price: Number(li.price) || 0,
    }));

    const valor = Number(orden.total_price || orden.current_total_price || 0);
    const moneda = (orden.currency || 'COP').toUpperCase();
    const eventId = `order_${orden.id || orden.order_number || Date.now()}`;

    const [em, ph, external] = await Promise.all([
      sha256(correo),
      sha256(tel),
      sha256(orden.customer?.id ? String(orden.customer.id) : ''),
    ]);

    const cuerpo = {
      event_source: 'web',
      event_source_id: PIXEL_ID,
      data: [
        {
          event: 'CompletePayment',
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          user: {
            ...(em ? {email: em} : {}),
            ...(ph ? {phone: ph} : {}),
            ...(external ? {external_id: external} : {}),
            ip: request.headers.get('x-forwarded-for') || '',
            user_agent: request.headers.get('user-agent') || '',
          },
          properties: {
            currency: moneda,
            value: valor,
            content_type: 'product',
            contents: contenidos,
          },
          page: {url: 'https://ranch.com.co'},
        },
      ],
    };

    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Access-Token': token},
      body: JSON.stringify(cuerpo),
    });

    const resultado = await res.json().catch(() => ({}));

    if (!res.ok || resultado?.code !== 0) {
      console.error('TikTok CAPI falló', res.status, JSON.stringify(resultado).slice(0, 400));
      return Response.json({ok: false, error: 'TikTok rechazó el evento'}, {status: 502});
    }

    return Response.json({ok: true, code: resultado.code});
  } catch (err) {
    console.error('api.tiktok-capi error', err);
    return Response.json({ok: false, error: 'Error interno'}, {status: 500});
  }
}
