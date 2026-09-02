import {useEffect, useState} from 'react';

const NAMES = [
  'Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Diana', 'Andrés', 'Camila',
  'Santiago', 'Valentina', 'Felipe', 'Laura', 'Jorge', 'Paola', 'Diego',
];
const CITIES = [
  'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga', 'Cartagena',
  'Pereira', 'Cúcuta', 'Ibagué', 'Manizales', 'Chía', 'Villavicencio',
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Social proof de la PDP: contador de personas viendo el producto
 * + popup flotante de "compra reciente" (nombre + ciudad + foto).
 * Datos simulados, rotando en intervalos.
 */
export function SocialProof({title, image}) {
  const [viewers, setViewers] = useState(() => 17 + Math.floor(Math.random() * 18));
  const [popup, setPopup] = useState(null);

  // Contador de personas viendo (fluctúa levemente)
  useEffect(() => {
    const id = setInterval(() => {
      setViewers((v) => Math.max(14, Math.min(42, v + (Math.random() < 0.5 ? -1 : 1))));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  // Popup de compra reciente (aparece cada cierto tiempo)
  useEffect(() => {
    let hideTimer;
    let showTimer;

    const showPopup = () => {
      setPopup({
        name: randomItem(NAMES),
        city: randomItem(CITIES),
        mins: 1 + Math.floor(Math.random() * 29),
      });
      hideTimer = setTimeout(() => {
        setPopup(null);
        showTimer = setTimeout(showPopup, 12000 + Math.floor(Math.random() * 8000));
      }, 5200);
    };

    const first = setTimeout(showPopup, 6000);

    return () => {
      clearTimeout(first);
      clearTimeout(hideTimer);
      clearTimeout(showTimer);
    };
  }, []);

  return (
    <>
      <div className="trp-viewing" aria-live="polite">
        <span aria-hidden="true">👀</span>
        <span>
          <strong>{viewers}</strong> personas están viendo este producto
        </span>
      </div>

      {popup ? (
        <div className="trp-socpopup" role="status" aria-live="polite">
          {image ? (
            <img className="trp-socpopup-img" src={image} alt="" />
          ) : null}
          <div className="trp-socpopup-text">
            <span className="trp-socpopup-line1">
              <strong>{popup.name}</strong> de {popup.city}
            </span>
            <span className="trp-socpopup-line2">
              compró {title} hace {popup.mins} min
            </span>
          </div>
        </div>
      ) : null}
    </>
  );
}
