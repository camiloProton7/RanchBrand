/**
 * Ficha editorial de la Camisa Outdoor UPF 50+.
 * Solo se monta para ese handle. Sin tarjetas, sin sellos ni iconos genéricos:
 * texto, fotos reales del producto y aire. El copy sale de los atributos reales.
 */

const DETALLES = [
  {
    titulo: 'Bolsillos de carga',
    texto: 'Doble capa para el almacenamiento diario: lo que usas todo el día, siempre a mano.',
  },
  {
    titulo: 'Cremallera segura',
    texto: 'Un bolsillo con cierre para lo que no puede perderse en el movimiento.',
  },
  {
    titulo: 'Malla en la espalda',
    texto: 'Ventilación que mantiene el aire corriendo en las horas de sol pleno.',
  },
  {
    titulo: 'Manga convertible',
    texto: 'Se remanga y queda manga corta cuando aprieta el calor.',
  },
];

export default function ProductStory({fotos = []}) {
  // Fotos reales del producto: la del campo y la del bolsillo en uso.
  const campo = fotos[8] || fotos[0] || null;
  const otra = fotos[1] || fotos[5] || null;

  return (
    <section className="trp-ed" aria-label="Sobre la camisa">
      <p className="trp-ed-kicker">The Ranch · Outdoor</p>
      <h2 className="trp-ed-title">
        Hecha para el sol <em>y el agua</em>
      </h2>
      <p className="trp-ed-lead">
        Una camisa de faena para los días largos afuera. Liviana, fresca y con la protección que el sol de acá no
        perdona: el poliéster aguanta el uso, el tejido seca rápido y la espalda ventila.
      </p>

      {campo ? (
        <figure className="trp-ed-foto">
          <img src={campo} alt="Camisa Outdoor en el campo" loading="lazy" />
        </figure>
      ) : null}

      <ol className="trp-ed-lista">
        {DETALLES.map((d, i) => (
          <li key={d.titulo}>
            <span className="trp-ed-num" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <h3>{d.titulo}</h3>
              <p>{d.texto}</p>
            </div>
          </li>
        ))}
      </ol>

      {otra ? (
        <figure className="trp-ed-foto trp-ed-foto--uso">
          <img src={otra} alt="Camisa Outdoor" loading="lazy" />
        </figure>
      ) : null}

      <p className="trp-ed-datos">UPF 50+ · 100% poliéster · Secado rápido · Manga convertible</p>

      <div className="trp-ed-notas">
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
          <h3>Cuidado</h3>
          <ul>
            <li>Agua fría, ciclo suave.</li>
            <li>Sin blanqueador.</li>
            <li>Secar a la sombra.</li>
            <li>Plancha a baja temperatura si hace falta.</li>
          </ul>
        </div>
      </div>

      <p className="trp-ed-firma">The Ranch — Colombia</p>
    </section>
  );
}
