/**
 * Endpoint de carrito abandonado → guarda teléfono + items en Supabase.
 * POST /api/cart
 * Campos: phone, items (JSON string del carrito)
 * Se guarda en la tabla tickets con issue_type 'carrito_abandonado'.
 */

const SUPABASE_URL = 'https://rattwfjkxgqvxmxlybcz.supabase.co';

export async function action({request, context}) {
  try {
    const formData = await request.formData();
    const phone = String(formData.get('phone') || '').trim();
    const itemsRaw = String(formData.get('items') || '').trim();

    if (!phone || !itemsRaw) {
      return Response.json({ok: false, error: 'Faltan datos'}, {status: 400});
    }

    let items = [];
    try {
      items = JSON.parse(itemsRaw);
    } catch {
      return Response.json({ok: false, error: 'Carrito inválido'}, {status: 400});
    }

    if (!Array.isArray(items) || items.length === 0) {
      return Response.json({ok: false, error: 'Carrito vacío'}, {status: 400});
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

    const productName = items[0]?.title || 'Tu pedido';
    const payload = {
      ticket_number: `CART-${Date.now().toString(36).toUpperCase()}`,
      from_number: phone,
      customer_phone: phone,
      product_name: productName,
      issue_type: 'carrito_abandonado',
      issue_description: itemsRaw,
      status: 'open',
      priority: 'medium',
      context_data: {cart: items},
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
      const detail = await res.text();
      console.error('Supabase falló', res.status, detail);
      return Response.json(
        {ok: false, error: 'No se pudo guardar el carrito.'},
        {status: 500},
      );
    }

    return Response.json({ok: true});
  } catch (err) {
    console.error('api.cart error', err);
    return Response.json({ok: false, error: 'Ocurrió un error.'}, {status: 500});
  }
}
