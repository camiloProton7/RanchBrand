import {useEffect, useMemo, useState} from 'react';

/**
 * Guía de tallas.
 *
 * Ropa: pide estatura y peso y sugiere la talla por cercanía a la medida
 * central de cada una. Calzado: pide el largo del pie en centímetros.
 *
 * Los rangos son orientativos: sirven para decidir entre dos tallas, no para
 * prometer un calce exacto.
 */

// medida central de cada talla, en centímetros y kilos
const ROPA = {
  Hombre: [
    {talla: 'S', alto: 168, peso: 60},
    {talla: 'M', alto: 174, peso: 70},
    {talla: 'L', alto: 179, peso: 79},
    {talla: 'XL', alto: 183, peso: 89},
    {talla: '2XL', alto: 188, peso: 100},
  ],
  Mujer: [
    {talla: 'S', alto: 159, peso: 51},
    {talla: 'M', alto: 164, peso: 59},
    {talla: 'L', alto: 169, peso: 67},
    {talla: 'XL', alto: 174, peso: 76},
    {talla: '2XL', alto: 179, peso: 87},
  ],
};

// largo del pie en centimetros contra talla colombiana
const CALZADO = [
  {cm: 22.5, talla: 35},
  {cm: 23, talla: 36},
  {cm: 23.5, talla: 37},
  {cm: 24, talla: 38},
  {cm: 24.5, talla: 39},
  {cm: 25, talla: 40},
  {cm: 25.5, talla: 41},
  {cm: 26, talla: 42},
  {cm: 26.5, talla: 43},
  {cm: 27, talla: 44},
];

function tallaRopa(horma, alto, peso) {
  const tabla = ROPA[horma] || ROPA.Hombre;
  let mejor = tabla[0];
  let mejorDist = Infinity;
  for (const fila of tabla) {
    // la estatura pesa mas que el peso al elegir talla
    const d = Math.hypot((alto - fila.alto) * 1.6, (peso - fila.peso) * 0.9);
    if (d < mejorDist) {
      mejorDist = d;
      mejor = fila;
    }
  }
  return mejor.talla;
}

function tallaCalzado(cm) {
  let mejor = CALZADO[0];
  let mejorDist = Infinity;
  for (const fila of CALZADO) {
    const d = Math.abs(cm - fila.cm);
    if (d < mejorDist) {
      mejorDist = d;
      mejor = fila;
    }
  }
  return mejor.talla;
}

export default function GuiaTallas({abierto, cerrar, tipo, tallas = [], onElegir}) {
  const esCalzado = tipo === 'calzado';

  const [horma, setHorma] = useState('Hombre');
  const [alto, setAlto] = useState(174);
  const [peso, setPeso] = useState(70);
  const [pie, setPie] = useState(25.5);

  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e) => {
      if (e.key === 'Escape') cerrar();
    };
    document.addEventListener('keydown', alTeclear);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', alTeclear);
      document.body.style.overflow = '';
    };
  }, [abierto, cerrar]);

  const sugerida = useMemo(
    () => (esCalzado ? tallaCalzado(pie) : tallaRopa(horma, alto, peso)),
    [esCalzado, horma, alto, peso, pie],
  );

  const existe = tallas.some((t) => String(t) === String(sugerida));

  if (!abierto) return null;

  return (
    <div className="gt-fondo" onClick={cerrar} role="presentation">
      <div
        className="gt-hoja"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Guía de tallas"
      >
        <button type="button" className="gt-cerrar" onClick={cerrar} aria-label="Cerrar">
          ×
        </button>

        <p className="gt-rotulo">{esCalzado ? 'Calzado' : 'Prendas'}</p>
        <h2 className="gt-titulo">Encuentra tu talla</h2>
        <p className="gt-intro">
          {esCalzado
            ? 'Mide tu pie desde el talón hasta la punta del dedo más largo.'
            : 'Con tu estatura y tu peso te decimos por dónde empezar.'}
        </p>

        {esCalzado ? (
          <div className="gt-campo">
            <div className="gt-campo-head">
              <span>Largo del pie</span>
              <strong>{pie.toFixed(1).replace('.', ',')} cm</strong>
            </div>
            <input
              type="range"
              min="22"
              max="27.5"
              step="0.5"
              value={pie}
              onChange={(e) => setPie(Number(e.target.value))}
              className="gt-range"
              aria-label="Largo del pie en centímetros"
            />
            <div className="gt-escala">
              <span>22 cm</span>
              <span>27,5 cm</span>
            </div>
          </div>
        ) : (
          <>
            <div className="gt-hormas" role="group" aria-label="Horma">
              {Object.keys(ROPA).map((h) => (
                <button
                  key={h}
                  type="button"
                  className={'gt-horma' + (horma === h ? ' is-on' : '')}
                  onClick={() => setHorma(h)}
                >
                  {h}
                </button>
              ))}
            </div>

            <div className="gt-campo">
              <div className="gt-campo-head">
                <span>Estatura</span>
                <strong>{alto} cm</strong>
              </div>
              <input
                type="range"
                min="150"
                max="200"
                step="1"
                value={alto}
                onChange={(e) => setAlto(Number(e.target.value))}
                className="gt-range"
                aria-label="Estatura en centímetros"
              />
              <div className="gt-escala">
                <span>150</span>
                <span>200</span>
              </div>
            </div>

            <div className="gt-campo">
              <div className="gt-campo-head">
                <span>Peso</span>
                <strong>{peso} kg</strong>
              </div>
              <input
                type="range"
                min="45"
                max="115"
                step="1"
                value={peso}
                onChange={(e) => setPeso(Number(e.target.value))}
                className="gt-range"
                aria-label="Peso en kilos"
              />
              <div className="gt-escala">
                <span>45</span>
                <span>115</span>
              </div>
            </div>
          </>
        )}

        <div className="gt-resultado">
          <div>
            <p className="gt-resultado-rotulo">Tu talla</p>
            <p className="gt-resultado-talla">{sugerida}</p>
          </div>
          {onElegir && existe && (
            <button
              type="button"
              className="gt-usar"
              onClick={() => {
                onElegir(String(sugerida));
                cerrar();
              }}
            >
              Elegir {sugerida}
            </button>
          )}
          {onElegir && !existe && (
            <p className="gt-sin">No disponible en este producto</p>
          )}
        </div>

        <p className="gt-nota">
          Es una orientación. Si quedas entre dos tallas, elige la mayor para
          chaquetas y la tuya habitual para calzado.
        </p>
      </div>
    </div>
  );
}
