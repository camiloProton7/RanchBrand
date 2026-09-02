/**
 * Endpoint de contacto web → envía correo por Brevo.
 * POST /api/contact
 * Campos: name, email, phone, caseType, message
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const FROM_EMAIL = 'proton.lab4@gmail.com';
const TO_EMAIL = 'proton.lab4@gmail.com';

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function action({request, context}) {
  try {
    const formData = await request.formData();
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const caseType = String(formData.get('caseType') || '').trim();
    const message = String(formData.get('message') || '').trim();

    if (!name || !message) {
      return Response.json(
        {ok: false, error: 'Por favor completa tu nombre y tu mensaje.'},
        {status: 400},
      );
    }

    const API_KEY = context?.env?.BREVO_API_KEY || process.env.BREVO_API_KEY;
    if (!API_KEY) {
      console.error('BREVO_API_KEY no está configurado');
      return Response.json(
        {ok: false, error: 'Configuración del servidor incompleta. Intenta más tarde.'},
        {status: 500},
      );
    }

    const html = [
      '<h3 style="margin:0 0 12px">Nuevo mensaje de contacto</h3>',
      '<table style="border-collapse:collapse">',
      `<tr><td style="padding:4px 12px 4px 0"><strong>Nombre:</strong></td><td>${esc(name)}</td></tr>`,
      email ? `<tr><td style="padding:4px 12px 4px 0"><strong>Correo:</strong></td><td>${esc(email)}</td></tr>` : '',
      phone ? `<tr><td style="padding:4px 12px 4px 0"><strong>Teléfono:</strong></td><td>${esc(phone)}</td></tr>` : '',
      caseType ? `<tr><td style="padding:4px 12px 4px 0"><strong>Tipo de caso:</strong></td><td>${esc(caseType)}</td></tr>` : '',
      '</table>',
      '<p style="margin:16px 0 4px"><strong>Mensaje:</strong></p>',
      `<p style="margin:0">${esc(message).replace(/\n/g, '<br>')}</p>`,
    ].join('');

    const payload = {
      sender: {name: 'The Ranch', email: FROM_EMAIL},
      to: [{email: TO_EMAIL, name: 'The Ranch'}],
      subject: `Nuevo mensaje: ${caseType || 'Contacto'} — ${name}`,
      htmlContent: html,
    };
    if (email) payload.replyTo = {email, name};

    const res = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error('Brevo falló', res.status, detail);
      return Response.json(
        {ok: false, error: 'No pudimos enviar tu solicitud. Intenta de nuevo.'},
        {status: 500},
      );
    }

    return Response.json({
      ok: true,
      ticketNumber: `WEB-${Date.now().toString(36).toUpperCase()}`,
    });
  } catch (err) {
    console.error('api.contact error', err);
    return Response.json(
      {ok: false, error: 'Ocurrió un error. Intenta de nuevo.'},
      {status: 500},
    );
  }
}
