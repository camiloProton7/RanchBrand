/**
 * Conversions API de Meta → trackea el evento "Purchase" (compra) desde el servidor.
 *
 * Recibe el webhook de Shopify "orders/create" (JSON de la orden),
 * y envía el evento Purchase a Meta vía CAPI con email/teléfono hasheados (SHA256).
 *
 * POST /api/meta-capi
 */

const PIXEL_ID = '377899811794334';

async function sha256(text) {
  if (!text) return '';
  const data = new TextEncoder().encode(String(text).trim().toLowerCase());
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function action({request, context}) {
  const token = context?.env?.META_CAPI_TOKEN || process.env.META_CAPI_TOKEN;
  if (!token) {
    console.error('META_CAPI_TOKEN no configurado');
    return Response.json({ok: false, error: 'Token CAPI no configurado'}, {status: 500});
  }

  try {
    const order = await request.json();

    const email = order.email || order.contact_email || order.customer?.email || '';
    const phone =
      order.phone ||
      order.shipping_address?.phone ||
      order.billing_address?.phone ||
      '';

    const lineItems = order.line_items || [];
    const contentIds = lineItems
      .map((li) => li.product_id || li.variant_id)
      .filter(Boolean);

    const value = Number(order.total_price || order.current_total_price || 0);
    const currency = (order.currency || 'COP').toUpperCase();

    const [em, ph] = await Promise.all([sha256(email), sha256(phone)]);

    const eventId = `order_${order.id || Date.now()}`;

    const body = {
      data: [
        {
          event_name: 'Purchase',
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          event_source_url: 'https://ranch.com.co',
          action_source: 'website',
          user_data: {
            ...(em ? {em: [em]} : {}),
            ...(ph ? {ph: [ph]} : {}),
            client_ip_address: request.headers.get('x-forwarded-for') || '',
            client_user_agent: request.headers.get('user-agent') || '',
          },
          custom_data: {
            currency,
            value,
            content_ids: contentIds,
            content_type: 'product',
            num_items: lineItems.reduce((s, li) => s + (Number(li.quantity) || 0), 0),
          },
        },
      ],
    };

    const res = await fetch(
      `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${token}`,
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
      },
    );

    const result = await res.json();

    if (!res.ok) {
      console.error('CAPI Meta falló', res.status, JSON.stringify(result));
      return Response.json({ok: false, error: 'Meta rechazó el evento'}, {status: 502});
    }

    return Response.json({ok: true, events_received: result?.events_received ?? 1});
  } catch (err) {
    console.error('api.meta-capi error', err);
    return Response.json({ok: false, error: 'Error interno'}, {status: 500});
  }
}
