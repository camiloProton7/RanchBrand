import {useState} from 'react';

const CASE_TYPES = [
  'Asistencia',
  'Problemas con un producto',
  'Cambio de talla o producto',
  'Garantía',
];

const LINKS = [
  {
    icon: '📦',
    title: 'Seguimiento de tu pedido',
    desc: 'Consulta dónde está tu envío en tiempo real.',
    href: '#',
  },
  {
    icon: '🏷️',
    title: 'Dotaciones',
    desc: 'Uniformes y dotaciones para empresas y equipos.',
    href: '#',
  },
  {
    icon: '🤝',
    title: 'Conviértete en proveedor',
    desc: 'Únete a nuestra red de proveedores de The Ranch.',
    href: '#',
  },
];

export default function UtilityLinks() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <section className="tr-utility" aria-label="Servicios y ayuda">
        <div className="tr-utility-inner">
          <h2 className="tr-utility-title">¿Cómo podemos ayudarte?</h2>
          <div className="tr-utility-grid">
            {LINKS.map((link) => (
              <a key={link.title} className="tr-utility-card" href={link.href}>
                <span className="tr-utility-icon" aria-hidden="true">
                  {link.icon}
                </span>
                <span className="tr-utility-card-title">{link.title}</span>
                <span className="tr-utility-card-desc">{link.desc}</span>
                <span className="tr-utility-card-arrow" aria-hidden="true">
                  →
                </span>
              </a>
            ))}

            <button
              type="button"
              className="tr-utility-card tr-utility-card--cta"
              onClick={() => setContactOpen(true)}
            >
              <span className="tr-utility-icon" aria-hidden="true">
                💬
              </span>
              <span className="tr-utility-card-title">Comunícate con nosotros</span>
              <span className="tr-utility-card-desc">
                Escríbenos y te respondemos lo antes posible.
              </span>
              <span className="tr-utility-card-arrow" aria-hidden="true">
                →
              </span>
            </button>
          </div>
        </div>
      </section>

      {contactOpen ? (
        <ContactModal onClose={() => setContactOpen(false)} />
      ) : null}
    </>
  );
}

function ContactModal({onClose}) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    caseType: CASE_TYPES[0],
    message: '',
  });
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [ticketNumber, setTicketNumber] = useState('');

  const update = (field) => (e) =>
    setForm((prev) => ({...prev, [field]: e.target.value}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const body = new URLSearchParams();
      body.append('name', form.name);
      body.append('email', form.email);
      body.append('phone', form.phone);
      body.append('caseType', form.caseType);
      body.append('message', form.message);

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: body.toString(),
      });
      const data = await res.json();

      if (data.ok) {
        setTicketNumber(data.ticketNumber);
        setStatus('done');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  const close = () => {
    if (status === 'sending') return;
    onClose();
  };

  return (
    <div
      className="tr-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Comunícate con nosotros"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="tr-modal-panel">
        <button
          type="button"
          className="tr-modal-close"
          onClick={close}
          aria-label="Cerrar"
        >
          ×
        </button>

        {status === 'done' ? (
          <div className="tr-modal-success">
            <span className="tr-modal-success-icon" aria-hidden="true">
              ✓
            </span>
            <h3 className="tr-modal-success-title">¡Recibimos tu mensaje!</h3>
            <p className="tr-modal-success-text">
              Tu número de caso es{' '}
              <strong className="tr-modal-ticket">{ticketNumber}</strong>. Te
              contactaremos pronto.
            </p>
            <button type="button" className="tr-modal-button" onClick={onClose}>
              Entendido
            </button>
          </div>
        ) : (
          <form className="tr-modal-form" onSubmit={handleSubmit}>
            <h3 className="tr-modal-title">Comunícate con nosotros</h3>
            <p className="tr-modal-subtitle">
              Déjanos tus datos y te ayudamos con lo que necesites.
            </p>

            <label className="tr-modal-field">
              <span className="tr-modal-label">Nombre *</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={update('name')}
                required
                placeholder="Tu nombre"
                autoComplete="name"
              />
            </label>

            <label className="tr-modal-field">
              <span className="tr-modal-label">Correo</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={update('email')}
                placeholder="tucorreo@ejemplo.com"
                autoComplete="email"
              />
            </label>

            <label className="tr-modal-field">
              <span className="tr-modal-label">Teléfono</span>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={update('phone')}
                placeholder="+57 300 000 0000"
                autoComplete="tel"
              />
            </label>

            <label className="tr-modal-field">
              <span className="tr-modal-label">Tipo de caso *</span>
              <select
                name="caseType"
                value={form.caseType}
                onChange={update('caseType')}
                required
              >
                {CASE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="tr-modal-field">
              <span className="tr-modal-label">Mensaje *</span>
              <textarea
                name="message"
                value={form.message}
                onChange={update('message')}
                required
                rows={4}
                placeholder="Cuéntanos en detalle tu caso…"
              />
            </label>

            {status === 'error' ? (
              <p className="tr-modal-error">
                No pudimos enviar tu solicitud. Intenta de nuevo.
              </p>
            ) : null}

            <button
              type="submit"
              className="tr-modal-button"
              disabled={status === 'sending'}
            >
              {status === 'sending' ? 'Enviando…' : 'Enviar solicitud'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
