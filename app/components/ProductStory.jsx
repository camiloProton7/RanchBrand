/**
 * Ficha infográfica de la Camisa Outdoor UPF 50+ (verde oliva / beige).
 * Solo se monta para ese handle: el resto de las fichas sigue igual.
 * Todo el copy sale de los atributos reales del producto; nada inventado.
 */

const DATOS = [
  {valor: 'UPF 50+', etiqueta: 'Protección solar'},
  {valor: '100%', etiqueta: 'Poliéster'},
  {valor: 'Secado', etiqueta: 'Rápido'},
];

const DETALLES = [
  {
    titulo: 'Bolsillos de carga',
    texto: 'Doble capa para el almacenamiento diario.',
    icono: (
      <>
        <path d="M4 9.5h16v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8Z" />
        <path d="M4 12.5h16" />
        <path d="M9.5 6.5h5" />
      </>
    ),
  },
  {
    titulo: 'Cremallera segura',
    texto: 'Lo de valor, guardado sin que se salga.',
    icono: (
      <>
        <path d="M8 3v18" />
        <path d="M8 5h3M8 8h3M8 11h3M8 14h3M8 17h3" />
        <path d="M14 11.5 18 9" />
      </>
    ),
  },
  {
    titulo: 'Malla en la espalda',
    texto: 'Aire que corre todo el día.',
    icono: (
      <>
        <path d="M3 9h9a3 3 0 1 0-3-3" />
        <path d="M3 14h13a3 3 0 1 1-3 3" />
        <path d="M3 19h6" />
      </>
    ),
  },
  {
    titulo: 'Manga convertible',
    texto: 'Se remanga y queda manga corta.',
    icono: (
      <>
        <path d="M7 4h6l3 5-2.5 2.5L16 15l-3 5H8l-2-6 2-2-1-8Z" />
        <path d="M13.5 12.5h2" />
      </>
    ),
  },
];

const SELLOS = ['✨ Tela premium', '🌬️ Transpirable', '🧵 Costuras reforzadas', '🚚 Envío a toda Colombia'];

export default function ProductStory() {
  return (
    <section className="trp-story" aria-label="Por qué esta camisa">
      <p className="trp-story-kicker">The Ranch · Outdoor</p>
      <h2 className="trp-story-title">Hecha para el sol y el agua</h2>
      <p className="trp-story-lead">
        Liviana y fresca para los días largos afuera. Seca rápido, ventila por la espalda y lleva el equipo encima.
      </p>

      <div className="trp-story-datos">
        {DATOS.map((d) => (
          <div key={d.etiqueta} className="trp-story-dato">
            <strong>{d.valor}</strong>
            <span>{d.etiqueta}</span>
          </div>
        ))}
      </div>

      <div className="trp-story-detalles">
        {DETALLES.map((d) => (
          <article key={d.titulo} className="trp-story-detalle">
            <span className="trp-story-icono" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {d.icono}
              </svg>
            </span>
            <div>
              <h3>{d.titulo}</h3>
              <p>{d.texto}</p>
            </div>
          </article>
        ))}
      </div>

      <ul className="trp-story-sellos">
        {SELLOS.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>

      <p className="trp-story-edicion">Edición limitada</p>

      <div className="trp-story-cuidado">
        <div>
          <h3>Materiales</h3>
          <ul>
            <li>100% poliéster de alta calidad.</li>
            <li>Tejido transpirable de secado rápido.</li>
            <li>Malla de ventilación en la espalda.</li>
            <li>Bolsillos de carga y bolsillo con cremallera.</li>
          </ul>
        </div>
        <div>
          <h3>Cuidados</h3>
          <ul>
            <li>Lavar a máquina con agua fría, ciclo suave.</li>
            <li>No usar blanqueador.</li>
            <li>Secar a la sombra.</li>
            <li>Planchar a baja temperatura si es necesario.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
