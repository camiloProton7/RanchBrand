import {useMemo} from 'react';

/**
 * Ficha editorial de la Camisa Outdoor UPF 50+ (verde oliva / beige).
 * Solo se monta para ese handle: el resto de las fichas siguen igual.
 * Todo el copy sale de los atributos reales del producto; nada inventado.
 */

const DETALLES = [
  {
    titulo: 'Bolsillos de carga',
    texto: 'Doble capa para el almacenamiento diario: lo que usas todo el día, siempre a mano.'
  },
  {
    titulo: 'Cremallera segura',
    texto: 'Bolsillo con cierre para guardar objetos de valor sin que se salgan en el movimiento.'
  },
  {
    titulo: 'Malla en la espalda',
    texto: 'Ventilación de malla que mantiene la circulación de aire y la comodidad todo el día.'
  },
  {
    titulo: 'Manga convertible',
    texto: 'Se remanga fácilmente y se convierte en manga corta cuando aprieta el calor.'
  },
];

const SPECS = [
  ['Protección', 'UPF 50+'],
  ['Tela', '100% poliéster'],
  ['Secado', 'Rápido'],
  ['Manga', 'Convertible'],
];

export default function ProductStory() {
  const detalles = useMemo(() => DETALLES, []);
  return (
    <section className="trp-story" aria-label="Por qué esta camisa">
      <p className="trp-story-kicker">The Ranch · Outdoor</p>
      <h2 className="trp-story-title">Hecha para el sol y el agua</h2>
      <p className="trp-story-lead">
        Una camisa de faena para los días largos afuera: liviana, fresca y con la protección que el sol de acá no
        perdona. El poliéster de alta calidad aguanta el uso y el tejido transpirable seca rápido, así que el sudor y
        las salpicaduras se van solos.
      </p>
      <p className="trp-story-lead">
        Corte cómodo, movimiento libre y detalles pensados para llevar el equipo encima sin cargar las manos.
      </p>

      <div className="trp-story-detalles">
        {detalles.map((d) => (
          <article key={d.titulo} className="trp-story-detalle">
            <span className="trp-story-icono" aria-hidden="true">
              {String(detalles.indexOf(d) + 1).padStart(2, '0')}
            </span>
            <h3>{d.titulo}</h3>
            <p>{d.texto}</p>
          </article>
        ))}
      </div>

      <ul className="trp-story-specs">
        {SPECS.map(([k, v]) => (
          <li key={k}>
            <span>{k}</span>
            <strong>{v}</strong>
          </li>
        ))}
      </ul>

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
