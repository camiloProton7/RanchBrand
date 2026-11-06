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
    {talla: '3XL', alto: 192, peso: 112},
    {talla: '4XL', alto: 195, peso: 124},
  ],
  Mujer: [
    {talla: 'S', alto: 159, peso: 51},
    {talla: 'M', alto: 164, peso: 59},
    {talla: 'L', alto: 169, peso: 67},
    {talla: 'XL', alto: 174, peso: 76},
    {talla: '2XL', alto: 179, peso: 87},
    {talla: '3XL', alto: 183, peso: 98},
    {talla: '4XL', alto: 187, peso: 110},
  ],
};

// largo del pie en centimetros contra talla colombiana (infantil y adulto)
const CALZADO = [
  {cm: 17, talla: 27},
  {cm: 17.5, talla: 28},
  {cm: 18, talla: 29},
  {cm: 18.5, talla: 30},
  {cm: 19, talla: 31},
  {cm: 19.5, talla: 32},
  {cm: 20, talla: 33},
  {cm: 21, talla: 34},
  {cm: 21.5, talla: 35},
  {cm: 22.5, talla: 36},
  {cm: 23, talla: 37},
  {cm: 23.5, talla: 38},
  {cm: 24.5, talla: 39},
  {cm: 25, talla: 40},
  {cm: 25.5, talla: 41},
  {cm: 26, talla: 42},
  {cm: 26.5, talla: 43},
  {cm: 27, talla: 44},
];

/** Rango de centimetros que cubren las tallas que existen de verdad. */
function rangoCalzado(tallas) {
  const nums = tallas.map((t) => Number(t)).filter((n) => !Number.isNaN(n));
  if (!nums.length) return {min: 22, max: 27.5};
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const abajo = CALZADO.find((f) => f.talla === min);
  const arriba = CALZADO.find((f) => f.talla === max);
  return {
    min: abajo ? abajo.cm : 22,
    max: arriba ? arriba.cm : 27.5,
  };
}

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

function tallaCalzado(cm, tallas = []) {
  // solo se ofrecen tallas que el producto tiene; si no hay lista, la tabla completa
  const posibles = tallas
    .map((t) => Number(t))
    .filter((n) => !Number.isNaN(n));
  const filas = posibles.length
    ? CALZADO.filter((f) => posibles.includes(f.talla))
    : CALZADO;
  if (!filas.length) return '';

  let mejor = filas[0];
  let mejorDist = Infinity;
  for (const fila of filas) {
    const d = Math.abs(cm - fila.cm);
    if (d < mejorDist) {
      mejorDist = d;
      mejor = fila;
    }
  }
  return mejor.talla;
}

/** Dibujo del pie visto desde arriba con la cota del largo. */
function PieMedido({cm}) {
  // el pie crece con la medida: 22 cm se ve corto, 27,5 se ve largo
  const f = 0.86 + ((cm - 22) / 5.5) * 0.28;
  const largo = 150 * f;
  const x0 = 26;
  const x1 = x0 + largo;
  const y = 46;

  return (
    <svg className="gt-pie" viewBox="0 0 210 108" role="img" aria-label={`Pie de ${cm} centímetros`}>
      {/* pie de perfil: talon, empeine y dedos sobre la linea de suelo */}
      <g transform={`translate(${x0} 0) scale(${f} 1)`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 78c-2-18 4-28 16-32 12-4 24-5 36-9 16-6 32-11 48-11 14 0 26 6 32 16 5 8 7 16 5 24-2 8-10 12-20 13H28" />
        <path d="M8 78h152" strokeWidth="1.1" opacity="0.35" />
        <path d="M148 34c6 2 10 7 11 13" opacity="0.4" />
        <path d="M138 55c4 3 7 7 8 12" opacity="0.3" />
      </g>

      {/* cota: talon a punta */}
      <g stroke="currentColor" strokeWidth="1.2" opacity="0.9">
        <path d={`M${x0} ${y - 26}v-9`} />
        <path d={`M${x1} ${y - 26}v-9`} />
        <path d={`M${x0} ${y - 30}h${largo}`} strokeDasharray="3 3" />
        <path d={`M${x0} ${y - 30}l5-3v6z`} fill="currentColor" stroke="none" />
        <path d={`M${x1} ${y - 30}l-5-3v6z`} fill="currentColor" stroke="none" />
      </g>

      <text
        x={(x0 + x1) / 2}
        y={y - 36}
        textAnchor="middle"
        className="gt-pie-texto"
      >
        {cm.toFixed(1).replace('.', ',')} cm
      </text>
    </svg>
  );
}

export default function GuiaTallas({
  abierto,
  cerrar,
  tipo,
  tallas = [],
  hormaProducto = '',
  onElegir,
}) {
  const esCalzado = tipo === 'calzado';

  const rango = useMemo(() => rangoCalzado(tallas), [tallas]);

  const [horma, setHorma] = useState(hormaProducto || 'Hombre');
  const [alto, setAlto] = useState(174);
  const [peso, setPeso] = useState(70);
  const [pie, setPie] = useState(() => (rango.min + rango.max) / 2);

  // si el producto ya define la horma, la guia la respeta
  useEffect(() => {
    if (hormaProducto) setHorma(hormaProducto);
  }, [hormaProducto]);

  useEffect(() => {
    setPie((rango.min + rango.max) / 2);
  }, [rango.min, rango.max]);

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
    () => (esCalzado ? tallaCalzado(pie, tallas) : tallaRopa(horma, alto, peso)),
    [esCalzado, horma, alto, peso, pie, tallas],
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
            <PieMedido cm={pie} />
            <div className="gt-campo-head">
              <span>Largo del pie</span>
              <strong>{pie.toFixed(1).replace('.', ',')} cm</strong>
            </div>
            <input
              type="range"
              min={rango.min}
              max={rango.max}
              step="0.5"
              value={pie}
              onChange={(e) => setPie(Number(e.target.value))}
              className="gt-range"
              aria-label="Largo del pie en centímetros"
            />
            <div className="gt-escala">
              <span>{rango.min} cm</span>
              <span>{String(rango.max).replace('.', ',')} cm</span>
            </div>
          </div>
        ) : (
          <>
            {!hormaProducto && (
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
            )}

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
          {esCalzado
            ? 'Mide con el pie apoyado y al final del día, cuando está un poco más hinchado. Si quedas entre dos números, elige el mayor.'
            : 'Es una orientación. Si quedas entre dos tallas, elige la mayor: la prenda va pensada para llevar una capa debajo.'}
        </p>
      </div>
    </div>
  );
}
