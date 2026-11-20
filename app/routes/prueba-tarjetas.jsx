import {useLoaderData} from 'react-router';

/**
 * Ambiente de prueba: tres diseños de tarjeta de producto para comparar.
 * No está enlazado desde ninguna parte del sitio y no toca los estilos reales.
 */

const Q = `#graphql
  query PruebaTarjetas {
    collection(handle: "chaquetas") {
      products(first: 4, sortKey: BEST_SELLING) {
        nodes {
          title
          handle
          availableForSale
          priceRange { minVariantPrice { amount } }
          compareAtPriceRange { minVariantPrice { amount } }
          images(first: 1) { nodes { url altText } }
        }
      }
    }
  }
`;

export async function loader({context}) {
  const data = await context.storefront.query(Q);
  return {productos: data?.collection?.products?.nodes ?? []};
}

const pesos = (n) =>
  '$ ' + Math.round(Number(n)).toLocaleString('es-CO', {maximumFractionDigits: 0});

export default function PruebaTarjetas() {
  const {productos} = useLoaderData();

  return (
    <div className="tst">
      <style dangerouslySetInnerHTML={{__html: CSS}} />

      <header className="tst-head">
        <p className="tst-eyebrow">Ambiente de prueba</p>
        <h1>Tres formas de la misma tarjeta</h1>
        <p className="tst-sub">
          Misma grilla de dos columnas a 390 px. Solo cambia cómo entra la foto.
        </p>
      </header>

      <section className="tst-bloque">
        <h2>A · Foto a sangre</h2>
        <p className="tst-nota">
          Sin marco blanco alrededor: la foto ocupa toda la tarjeta y el texto va
          en una franja abajo. Gana unos 14 px de ancho y desaparece el borde.
        </p>
        <div className="tst-grid">
          {productos.map((p) => {
            const foto = p.images?.nodes?.[0]?.url;
            const antes = Number(p.compareAtPriceRange?.minVariantPrice?.amount || 0);
            const precio = Number(p.priceRange?.minVariantPrice?.amount || 0);
            return (
              <a key={p.handle} className="tst-a" href={`/products/${p.handle}`}>
                <span className="tst-a-foto">
                  {foto ? <img src={foto} alt={p.title} /> : null}
                  {antes > precio ? (
                    <span className="tst-off">
                      −{Math.round((1 - precio / antes) * 100)}%
                    </span>
                  ) : null}
                </span>
                <span className="tst-info">
                  <span className="tst-nombre">{p.title}</span>
                  <span className="tst-precios">
                    {pesos(precio)}
                    {antes > precio ? <em>antes {pesos(antes)}</em> : null}
                  </span>
                </span>
              </a>
            );
          })}
        </div>
      </section>

      <section className="tst-bloque">
        <h2>B · Zoom sobre la foto</h2>
        <p className="tst-nota">
          Se queda el marco claro y la tarjeta actual, pero la prenda se agranda
          un 22 % dentro del marco. El fondo es del mismo tono, así que no se nota
          el corte.
        </p>
        <div className="tst-grid">
          {productos.map((p) => {
            const foto = p.images?.nodes?.[0]?.url;
            const antes = Number(p.compareAtPriceRange?.minVariantPrice?.amount || 0);
            const precio = Number(p.priceRange?.minVariantPrice?.amount || 0);
            return (
              <a key={p.handle} className="tst-b" href={`/products/${p.handle}`}>
                <span className="tst-b-foto">
                  {foto ? <img src={foto} alt={p.title} /> : null}
                  {antes > precio ? (
                    <span className="tst-off">−{Math.round((1 - precio / antes) * 100)}%</span>
                  ) : null}
                </span>
                <span className="tst-info">
                  <span className="tst-nombre">{p.title}</span>
                  <span className="tst-precios">
                    {pesos(precio)}
                    {antes > precio ? <em>antes {pesos(antes)}</em> : null}
                  </span>
                </span>
              </a>
            );
          })}
        </div>
      </section>

      <section className="tst-bloque">
        <h2>C · Foto vertical</h2>
        <p className="tst-nota">
          La foto pasa de cuadrada a retrato (4:5), más alta que ancha. La prenda
          gana altura y la tarjeta se siente de catálogo, no de marketplace.
        </p>
        <div className="tst-grid">
          {productos.map((p) => {
            const foto = p.images?.nodes?.[0]?.url;
            const antes = Number(p.compareAtPriceRange?.minVariantPrice?.amount || 0);
            const precio = Number(p.priceRange?.minVariantPrice?.amount || 0);
            return (
              <a key={p.handle} className="tst-c" href={`/products/${p.handle}`}>
                <span className="tst-c-foto">
                  {foto ? <img src={foto} alt={p.title} /> : null}
                  {antes > precio ? (
                    <span className="tst-off">−{Math.round((1 - precio / antes) * 100)}%</span>
                  ) : null}
                </span>
                <span className="tst-info">
                  <span className="tst-nombre">{p.title}</span>
                  <span className="tst-precios">
                    {pesos(precio)}
                    {antes > precio ? <em>antes {pesos(antes)}</em> : null}
                  </span>
                </span>
              </a>
            );
          })}
        </div>
      </section>

      <p className="tst-pie">
        Ninguna de estas tres está publicada. Elige una y la monto sobre las
        tarjetas reales del sitio.
      </p>
    </div>
  );
}

const CSS = `
:root { --tst-tinta: #1c1712; --tst-papel: #f5f0e6; --tst-tierra: #b34a2a; }
.tst { background: var(--tst-papel); min-height: 100vh; padding: 22px 14px 60px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: var(--tst-tinta); -webkit-font-smoothing: antialiased; }
.tst-head { padding: 0 4px 8px; }
.tst-eyebrow { margin: 0 0 6px; font-size: 10.5px; letter-spacing: .16em;
  text-transform: uppercase; font-weight: 700; color: var(--tst-tierra); }
.tst-head h1 { margin: 0; font-size: 24px; line-height: 1.1; letter-spacing: -.02em; font-weight: 800; }
.tst-sub { margin: 8px 0 0; font-size: 13px; line-height: 1.45; color: rgba(28,23,18,.62); }
.tst-bloque { margin-top: 26px; }
.tst-bloque h2 { margin: 0 0 4px; font-size: 15px; font-weight: 800; letter-spacing: -.01em; }
.tst-nota { margin: 0 0 12px; font-size: 12px; line-height: 1.45; color: rgba(28,23,18,.6); }
.tst-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.tst-info { display: flex; flex-direction: column; gap: 4px; }
.tst-nombre { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden; font-size: 12.5px; line-height: 1.25; font-weight: 700; letter-spacing: -.01em; }
.tst-precios { display: flex; flex-direction: column; gap: 1px; font-size: 13px; font-weight: 800; }
.tst-precios em { font-style: normal; font-size: 10.5px; font-weight: 600;
  color: rgba(28,23,18,.45); }
.tst-off { position: absolute; top: 7px; left: 7px; z-index: 3; padding: 4px 7px;
  border-radius: 6px; background: #7a1a12; color: #fff; font-size: 10px; font-weight: 800; line-height: 1; }

/* A · foto a sangre */
.tst-a { display: block; text-decoration: none; color: inherit; border-radius: 16px;
  overflow: hidden; background: #fffdf8;
  box-shadow: 0 1px 2px rgba(43,31,20,.08), 0 12px 24px -14px rgba(43,31,20,.34); }
.tst-a-foto { position: relative; display: block; aspect-ratio: 1/1; background: #f6f3ec; }
.tst-a-foto img { position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; object-position: center; }
.tst-a .tst-info { padding: 9px 11px 12px; }

/* B · zoom conservando el marco */
.tst-b { display: block; text-decoration: none; color: inherit; border-radius: 22px;
  background: #fffdf8; padding: 7px 7px 12px;
  box-shadow: 0 1px 2px rgba(43,31,20,.08), 0 10px 22px -10px rgba(43,31,20,.30); }
.tst-b-foto { position: relative; display: block; aspect-ratio: 1/1; border-radius: 17px;
  overflow: hidden; background: #f6f3ec; }
.tst-b-foto img { position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: contain; transform: scale(1.22); transform-origin: center; }
.tst-b .tst-info { padding: 9px 4px 0; }

/* C · foto vertical */
.tst-c { display: block; text-decoration: none; color: inherit; border-radius: 16px;
  overflow: hidden; background: #fffdf8;
  box-shadow: 0 1px 2px rgba(43,31,20,.08), 0 12px 24px -14px rgba(43,31,20,.34); }
.tst-c-foto { position: relative; display: block; aspect-ratio: 4/5; background: #f6f3ec; }
.tst-c-foto img { position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; object-position: center; }
.tst-c .tst-info { padding: 9px 11px 12px; }

.tst-pie { margin: 30px 4px 0; font-size: 12px; line-height: 1.5; color: rgba(28,23,18,.55); }
`;
