import {useState} from 'react';
import {useLoaderData} from 'react-router';

/**
 * Ambiente de prueba: upsell DESPUÉS de "Comprar ahora".
 * Dos mecánicas para comparar. No toca el carrito real ni se enlaza en el sitio.
 */

const Q = `#graphql
  query PruebaUpsell {
    principal: product(handle: "chaqueta-impermeable-mojave") {
      title handle
      priceRange { minVariantPrice { amount } }
      images(first: 1) { nodes { url } }
    }
    c1: product(handle: "gorra-camuflada-heritage") { title handle priceRange { minVariantPrice { amount } } images(first: 1) { nodes { url } } }
    c2: product(handle: "billetera-anti-clonacion-copia") { title handle priceRange { minVariantPrice { amount } } images(first: 1) { nodes { url } } }
    c3: product(handle: "camisa-outdoor-the-ranch") { title handle priceRange { minVariantPrice { amount } } images(first: 1) { nodes { url } } }
    c4: product(handle: "licorera-metalica") { title handle priceRange { minVariantPrice { amount } } images(first: 1) { nodes { url } } }
  }
`;

export async function loader({context}) {
  const d = await context.storefront.query(Q);
  const comp = ["c1", "c2", "c3", "c4"].map((k) => d?.[k]).filter(Boolean);
  return {principal: d?.principal, complementos: comp};
}

const plata = (n) => '$ ' + Math.round(Number(n)).toLocaleString('es-CO');

export default function PruebaUpsell() {
  const {principal, complementos} = useLoaderData();
  const base = Number(principal?.priceRange?.minVariantPrice?.amount || 0);
  const [hoja, setHoja] = useState(false);
  const [pantalla, setPantalla] = useState(false);
  const [elegidos, setElegidos] = useState([]);

  const alterna = (h) =>
    setElegidos((e) => (e.includes(h) ? e.filter((x) => x !== h) : [...e, h]));

  const suma = elegidos.reduce((t, h) => {
    const p = complementos.find((c) => c.handle === h);
    return t + Number(p?.priceRange?.minVariantPrice?.amount || 0);
  }, 0);

  return (
    <div className="up">
      <style dangerouslySetInnerHTML={{__html: CSS}} />

      <header className="up-head">
        <p className="up-eyebrow">Ambiente de prueba</p>
        <h1>Upsell después de “Comprar ahora”</h1>
        <p className="up-sub">
          El cliente toca comprar y, antes del checkout, ve el complemento. Dos
          formas de hacerlo: hoja inferior con varios, o pantalla con uno solo.
        </p>
      </header>

      <section className="up-bloque">
        <h2>A · Hoja inferior</h2>
        <p className="up-nota">
          Sube desde abajo, deja ver la ficha detrás, permite elegir más de uno y
          muestra el total actualizado.
        </p>
        <button className="up-buy" onClick={() => setHoja(true)}>
          Comprar ahora
          <span>{plata(base)}</span>
        </button>
      </section>

      <section className="up-bloque">
        <h2>B · Pantalla de un solo complemento</h2>
        <p className="up-nota">
          Una pieza grande, una decisión: agregar o seguir. Más directa, menos
          opciones, y el “no” siempre visible.
        </p>
        <button className="up-buy" onClick={() => setPantalla(true)}>
          Comprar ahora
          <span>{plata(base)}</span>
        </button>
      </section>

      <section className="up-bloque">
        <h2>Cómo se vería el complemento en la ficha</h2>
        <div className="up-ficha">
          <img src={principal?.images?.nodes?.[0]?.url} alt={principal?.title} />
          <div>
            <p className="up-ficha-nombre">{principal?.title}</p>
            <p className="up-ficha-precio">{plata(base)}</p>
          </div>
        </div>
      </section>

      {hoja && (
        <div className="up-velo" onClick={() => setHoja(false)}>
          <div className="up-hoja" onClick={(e) => e.stopPropagation()}>
            <span className="up-tirador" />
            <p className="up-hoja-rotulo">Antes de pagar</p>
            <h3 className="up-hoja-titulo">Completa el equipo</h3>
            <p className="up-hoja-sub">
              Si lo sumas ahora, el complemento va con 10 % menos.
            </p>

            <div className="up-lista">
              {complementos.slice(0, 3).map((c) => {
                const p = Number(c.priceRange.minVariantPrice.amount);
                const on = elegidos.includes(c.handle);
                return (
                  <button
                    key={c.handle}
                    className={'up-item' + (on ? ' is-on' : '')}
                    onClick={() => alterna(c.handle)}
                  >
                    <img src={c.images.nodes[0]?.url} alt={c.title} />
                    <span className="up-item-txt">
                      <span className="up-item-nombre">{c.title}</span>
                      <span className="up-item-precio">
                        {plata(p * 0.9)}
                        <em>antes {plata(p)}</em>
                      </span>
                    </span>
                    <span className="up-check" aria-hidden="true">
                      {on ? '✓' : '+'}
                    </span>
                  </button>
                );
              })}
            </div>

            <button className="up-cta">
              {elegidos.length ? 'Agregar y pagar' : 'Ir a pagar'}
              <span>{plata(base + suma * 0.9)}</span>
            </button>
            <button className="up-no" onClick={() => setHoja(false)}>
              No, gracias · seguir solo con mi pedido
            </button>
          </div>
        </div>
      )}

      {pantalla && (
        <div className="up-pantalla">
          <p className="up-eyebrow up-centro">Un paso antes de pagar</p>
          <h3 className="up-pantalla-titulo">Llévala completa</h3>

          {complementos[0] && (
            <div className="up-grande">
              <img
                src={complementos[0].images.nodes[0]?.url}
                alt={complementos[0].title}
              />
              <p className="up-grande-nombre">{complementos[0].title}</p>
              <p className="up-grande-precio">
                {plata(Number(complementos[0].priceRange.minVariantPrice.amount) * 0.9)}
                <em>antes {plata(Number(complementos[0].priceRange.minVariantPrice.amount))}</em>
              </p>
            </div>
          )}

          <button className="up-cta">
            Sí, agrégala
            <span>
              {plata(
                base +
                  (complementos[0]
                    ? Number(complementos[0].priceRange.minVariantPrice.amount) * 0.9
                    : 0),
              )}
            </span>
          </button>
          <button className="up-no" onClick={() => setPantalla(false)}>
            No, seguir a pagar
          </button>
        </div>
      )}
    </div>
  );
}

const CSS = `
:root{--up-tinta:#1c1712;--up-papel:#f5f0e6;--up-tierra:#b34a2a;--up-vino:#7a1a12}
.up{background:var(--up-papel);min-height:100vh;padding:22px 14px 60px;color:var(--up-tinta);
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased}
.up-head{padding:0 4px 6px}
.up-eyebrow{margin:0 0 6px;font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;font-weight:700;color:var(--up-tierra)}
.up-centro{text-align:center}
.up-head h1{margin:0;font-size:23px;line-height:1.12;letter-spacing:-.02em;font-weight:800}
.up-sub{margin:8px 0 0;font-size:13px;line-height:1.45;color:rgba(28,23,18,.62)}
.up-bloque{margin-top:24px}
.up-bloque h2{margin:0 0 4px;font-size:15px;font-weight:800}
.up-nota{margin:0 0 10px;font-size:12px;line-height:1.45;color:rgba(28,23,18,.6)}
.up-buy{width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;
  padding:15px 18px;border:0;border-radius:12px;background:#1c1712;color:#fffdf8;font-size:14px;font-weight:700}
.up-buy span{font-weight:800}
.up-ficha{display:flex;gap:12px;align-items:center;background:#fffdf8;border-radius:14px;padding:10px;
  box-shadow:0 10px 22px -16px rgba(43,31,20,.5)}
.up-ficha img{width:64px;height:64px;border-radius:9px;object-fit:cover;background:#f6f3ec}
.up-ficha-nombre{margin:0;font-size:12.5px;font-weight:700}
.up-ficha-precio{margin:3px 0 0;font-size:13px;font-weight:800}
/* hoja */
.up-velo{position:fixed;inset:0;z-index:100;background:rgba(14,11,8,.45);display:flex;align-items:flex-end}
.up-hoja{width:100%;max-height:88vh;overflow-y:auto;background:#fffdf8;border-radius:20px 20px 0 0;
  padding:8px 16px calc(18px + env(safe-area-inset-bottom));animation:up-sube .28s ease}
@keyframes up-sube{from{transform:translateY(100%)}to{transform:translateY(0)}}
.up-tirador{display:block;width:38px;height:4px;border-radius:99px;background:rgba(28,23,18,.18);margin:2px auto 12px}
.up-hoja-rotulo{margin:0 0 4px;font-size:10px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:var(--up-tierra)}
.up-hoja-titulo{margin:0;font-size:20px;font-weight:800;letter-spacing:-.02em}
.up-hoja-sub{margin:5px 0 14px;font-size:12.5px;line-height:1.4;color:rgba(28,23,18,.6)}
.up-lista{display:grid;gap:9px}
.up-item{display:flex;align-items:center;gap:11px;width:100%;text-align:left;padding:9px;
  border:1px solid rgba(28,23,18,.1);border-radius:13px;background:#fff;transition:border-color .15s,background .15s}
.up-item.is-on{border-color:var(--up-vino);background:#fdf6f2}
.up-item img{width:56px;height:56px;border-radius:9px;object-fit:cover;background:#f6f3ec;flex:0 0 auto}
.up-item-txt{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1}
.up-item-nombre{font-size:12.5px;font-weight:700;line-height:1.2;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.up-item-precio{font-size:13px;font-weight:800;display:flex;gap:7px;align-items:baseline}
.up-item-precio em{font-style:normal;font-size:11px;font-weight:600;color:rgba(28,23,18,.4)}
.up-check{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;flex:0 0 auto;
  background:rgba(28,23,18,.06);font-size:14px;font-weight:700;color:#5c5348}
.up-item.is-on .up-check{background:var(--up-vino);color:#fff}
.up-cta{width:100%;margin-top:14px;display:flex;align-items:center;justify-content:space-between;gap:10px;
  padding:15px 18px;border:0;border-radius:12px;background:#1c1712;color:#fffdf8;font-size:14.5px;font-weight:700}
.up-no{width:100%;margin-top:9px;padding:12px;border:0;background:transparent;color:rgba(28,23,18,.55);
  font-size:12px;font-weight:600;text-decoration:underline;text-underline-offset:3px}
/* pantalla completa */
.up-pantalla{position:fixed;inset:0;z-index:100;background:var(--up-papel);padding:calc(26px + env(safe-area-inset-top)) 18px calc(20px + env(safe-area-inset-bottom));
  display:flex;flex-direction:column;animation:up-sube .26s ease}
.up-pantalla-titulo{margin:2px 0 16px;font-size:25px;font-weight:800;letter-spacing:-.02em;text-align:center}
.up-grande{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px}
.up-grande img{width:100%;max-width:290px;aspect-ratio:1/1;object-fit:cover;border-radius:16px;background:#f6f3ec;
  box-shadow:0 18px 40px -26px rgba(43,31,20,.55)}
.up-grande-nombre{margin:12px 0 0;font-size:14px;font-weight:700;text-align:center}
.up-grande-precio{margin:2px 0 0;font-size:16px;font-weight:800;display:flex;gap:8px;align-items:baseline;justify-content:center}
.up-grande-precio em{font-style:normal;font-size:12px;font-weight:600;color:rgba(28,23,18,.42)}
`;
