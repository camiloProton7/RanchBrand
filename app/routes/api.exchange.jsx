/**
 * Endpoint de solicitud de cambio → crea un ticket en Supabase `tickets`.
 * POST /api/exchange
 * Campos: name, phone, orderNumber, reason, message
 */

const SUPABASE_URL = 'https://rattwfjkxgqvxmxlybcz.supabase.co';

export async function action({request, context}) {
  try {
    const formData = await request.formData();
    const name = String(formData.get('name') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const orderNumber = String(formData.get('orderNumber') || '').trim();
    const reason = String(formData.get('reason') || '').trim();
    const message = String(formData.get('message') || '').trim();

    if (!name || !phone || !orderNumber || !reason) {
      return Response.json(
        {ok: false, error: 'Completa nombre, teléfono, número de pedido y razón.'},
        {status: 400},
      );
    }

    const SERVICE_ROLE_KEY =
      context?.env?.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY no está configurado');
      return Response.json(
        {ok: false, error: 'Configuración del servidor incompleta.'},
        {status: 500},
      );
    }

    const ticketNumber = `CAMB-${Date.now().toString(36).toUpperCase()}`;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/tickets`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        ticket_number: ticketNumber,
        from_number: 'web',
        customer_name: name,
        customer_phone: phone,
        issue_type: 'cambio',
        issue_description: message
          ? `Cambio por ${reason} — Pedido ${orderNumber}. ${message}`
          : `Cambio por ${reason} — Pedido ${orderNumber}.`,
        status: 'open',
        context_data: {
          source: 'exchange',
          order_number: orderNumber,
          reason,
        },
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error('Supabase insert falló', res.status, detail);
      return Response.json(
        {ok: false, error: 'No pudimos guardar tu solicitud.'},
        {status: 500},
      );
    }

    return Response.json({ok: true, ticketNumber});
  } catch (err) {
    console.error('api.exchange error', err);
    return Response.json(
      {ok: false, error: 'Ocurrió un error. Intenta de nuevo.'},
      {status: 500},
    );
  }
}
