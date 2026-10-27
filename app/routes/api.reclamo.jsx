/**
 * Puente entre el formulario de reclamos y la función `reclamo` de Supabase.
 * POST /api/reclamo  (mismo origen: evita CORS y bloqueos del navegador)
 */
const ENDPOINT = 'https://rattwfjkxgqvxmxlybcz.supabase.co/functions/v1/reclamo';

export async function action({request}) {
  if (request.method !== 'POST') {
    return Response.json({ok: false, error: 'Método no permitido'}, {status: 405});
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ok: false, error: 'No pudimos leer los datos.'}, {status: 400});
  }

  try {
    const r = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body),
    });
    const data = await r.json().catch(() => ({}));
    return Response.json(data, {status: r.status});
  } catch (error) {
    console.error('reclamo proxy', error);
    return Response.json({ok: false, error: 'No pudimos enviar tu caso. Intenta otra vez.'}, {status: 502});
  }
}

export async function loader() {
  return Response.json({ok: false, error: 'Usa el formulario de /reclamo'}, {status: 405});
}
