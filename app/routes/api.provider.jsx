/**
 * Endpoint de proveedores web → crea una solicitud en Supabase `tickets`.
 * POST /api/provider
 * Campos: name, company, email, phone, productType, message
 * Marca la solicitud como "proveedor" (context_data.source = "provider").
 */

const SUPABASE_URL = 'https://rattwfjkxgqvxmxlybcz.supabase.co';

export async function action({request, context}) {
  try {
    const formData = await request.formData();
    const name = String(formData.get('name') || '').trim();
    const company = String(formData.get('company') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const productType = String(formData.get('productType') || '').trim();
    const message = String(formData.get('message') || '').trim();

    if (!name || !company || !message) {
      return Response.json(
        {ok: false, error: 'Por favor completa tu nombre, empresa y mensaje.'},
        {status: 400},
      );
    }

    const SERVICE_ROLE_KEY =
      context?.env?.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY no está configurado');
      return Response.json(
        {ok: false, error: 'Configuración del servidor incompleta. Intenta más tarde.'},
        {status: 500},
      );
    }

    const ticketNumber = `PRV-${Date.now().toString(36).toUpperCase()}`;

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
        customer_email: email,
        issue_type: 'provider',
        issue_description: message,
        status: 'open',
        context_data: {
          source: 'provider',
          company,
          product_type: productType,
        },
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error('Supabase insert falló', res.status, detail);
      return Response.json(
        {ok: false, error: 'No pudimos guardar tu solicitud. Intenta de nuevo.'},
        {status: 500},
      );
    }

    return Response.json({ok: true, ticketNumber});
  } catch (err) {
    console.error('api.provider error', err);
    return Response.json(
      {ok: false, error: 'Ocurrió un error. Intenta de nuevo.'},
      {status: 500},
    );
  }
}
