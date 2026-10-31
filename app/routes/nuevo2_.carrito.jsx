import {useLoaderData, Link} from 'react-router';
import {useEffect, useState} from 'react';
import styles from '~/styles/home-nuevo.css?url';
import Pie from '~/components/Pie';
import Carroza from '~/components/Carroza';
import {
  formatPrice,
  getCart,
  getCartUrl,
  removeFromCart,
  updateQty,
} from '~/lib/cart';

export const links = () => [{rel: 'stylesheet', href: styles}];

const DESTACADOS = `#graphql
  query DestacadosCesta {
    collection(handle: "gorras") {
      products(first: 6, sortKey: BEST_SELLING) {
        nodes {
          id
          title
          handle
          priceRange { minVariantPrice { amount } }
          images(first: 1) { nodes { url } }
        }
      }
    }
  }
`;

export async function loader({context}) {
  const opt = import.meta.env.DEV ? {cache: context.storefront.CacheNone()} : {};
  const d = await context.storefront.query(DESTACADOS, opt);

  const fmt = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });

  return {
    sugeridos: (d.collection?.products?.nodes || []).map((p) => ({
      id: p.id,
      titulo: p.title,
      handle: p.handle,
      precio: fmt.format(Number(p.priceRange.minVariantPrice.amount)),
      img: p.images.nodes[0]?.url?.replace(
        /(\.(jpg|jpeg|png|webp))(\?|$)/i,
        '.webp?width=600&$3',
      ),
    })),
  };
}

export default function Cesta() {
  const {sugeridos} = useLoaderData();
  const [lineas, setLineas] = useState([]);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    const leer = () => setLineas(getCart());
    leer();
    setListo(true);
    window.addEventListener('ranch-cart-updated', leer);
    window.addEventListener('storage', leer);
    return () => {
      window.removeEventListener('ranch-cart-updated', leer);
      window.removeEventListener('storage', leer);
    };
  }, []);

  const total = lineas.reduce(
    (s, i) => s + Number(i.price || 0) * Number(i.qty || 0),
    0,
  );
  const unidades = lineas.reduce((s, i) => s + Number(i.qty || 0), 0);

  const cambiar = (id, qty) => setLineas(updateQty(id, qty));
  const quitar = (id) => setLineas(removeFromCart(id));

  if (!listo) return <main className="hc" />;

  if (!lineas.length) {
    return (
      <main className="hc hc-vacia">
        <header className="hc-barra">
          <Link
            to="/nuevo2"
            aria-label="Volver a la tienda"
            className="hc-volver"
            onClick={(e) => {
              e.preventDefault();
              const i = window.history.state?.idx;
              if (typeof i === 'number' && i > 0) window.history.back();
              else window.location.assign('/nuevo2');
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </Link>
          <Link to="/nuevo2" className="hc-logo" aria-label="The Ranch, ir al inicio">
            <img src="/logo-tinta.png" alt="The Ranch" />
          </Link>
          <span className="hc-barra-hueco" />
        </header>

        <div className="hc-vacia-cuerpo">
          <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1">
            <path d="M4 7h16l-1.3 12.2a2 2 0 0 1-2 1.8H7.3a2 2 0 0 1-2-1.8z" />
            <path d="M9 7V5.6A3 3 0 0 1 12 3a3 3 0 0 1 3 2.6V7" />
          </svg>
          <h1>Tu carrito está vacío</h1>
          <p>Todavía no has elegido nada. Empieza por lo que más sale.</p>
          <div className="hc-vacia-botones">
            <Link to="/nuevo2" className="hc-vacia-cta">
              Volver a la tienda
            </Link>
            <Link to="/nuevo2/coleccion/gorras" className="hc-vacia-cta">
              Ver gorras
            </Link>
            <Link to="/nuevo2/coleccion/chaquetas" className="hc-vacia-cta is-claro">
              Ver chaquetas
            </Link>
          </div>
        </div>

        <Pie />
      </main>
    );
  }

  return (
    <main className="hc hc-cesta">
      <header className="hc-barra">
        <Link
          to="/nuevo2"
          aria-label="Volver a la tienda"
          className="hc-volver"
          onClick={(e) => {
            e.preventDefault();
            const i = window.history.state?.idx;
            if (typeof i === 'number' && i > 0) window.history.back();
            else window.location.assign('/nuevo2');
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </Link>
        <Link to="/nuevo2" className="hc-logo" aria-label="The Ranch, ir al inicio">
          <img src="/logo-tinta.png" alt="The Ranch" />
        </Link>
        <span className="hc-barra-hueco">
          <Carroza />
        </span>
      </header>

      <div className="hc-cesta-cabeza">
        <h1 className="hc-cesta-titulo">Tu carrito</h1>
        <span className="hc-piezas">{unidades} {unidades === 1 ? 'pieza' : 'piezas'}</span>
      </div>

      <Link to="/nuevo2" className="hc-seguir">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M15 5l-7 7 7 7" />
        </svg>
        Seguir comprando
      </Link>

      <ul className="hc-lineas">
        {lineas.map((l) => (
          <li key={l.variantId} className="hc-linea">
            <Link to={`/nuevo2/producto/${l.handle}`} className="hc-linea-foto">
              {l.image ? <img src={l.image} alt={l.title} loading="lazy" /> : null}
            </Link>

            <div className="hc-linea-info">
              <Link to={`/nuevo2/producto/${l.handle}`} className="hc-linea-nombre">
                {l.title}
              </Link>
              {l.opciones ? <span className="hc-linea-var">{l.opciones}</span> : null}

              <div className="hc-linea-pie">
                <div className="hc-cant">
                  <button
                    type="button"
                    onClick={() => cambiar(l.variantId, l.qty - 1)}
                    aria-label="Quitar una"
                  >
                    −
                  </button>
                  <span>{l.qty}</span>
                  <button
                    type="button"
                    onClick={() => cambiar(l.variantId, l.qty + 1)}
                    aria-label="Añadir una"
                  >
                    +
                  </button>
                </div>

                <strong>{formatPrice(Number(l.price || 0) * l.qty)}</strong>
              </div>

              <button
                type="button"
                className="hc-linea-quitar"
                onClick={() => quitar(l.variantId)}
              >
                Quitar
              </button>
            </div>
          </li>
        ))}
      </ul>

      <section className="hc-resumen">
        <div>
          <span>Subtotal</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div>
          <span>Envío</span>
          <span className="hc-resumen-tenue">Se calcula al pagar</span>
        </div>
        <div className="hc-resumen-total">
          <span>Total</span>
          <strong>{formatPrice(total)}</strong>
        </div>
      </section>

      {sugeridos.length > 0 && (
        <section className="hc-suma">
          <h2>Suma a tu pedido</h2>
          <div className="hc-suma-rail">
            {sugeridos.map((p) => (
              <Link key={p.id} to={`/nuevo2/producto/${p.handle}`} className="hc-suma-card">
                <img src={p.img} alt={p.titulo} loading="lazy" />
                <span>{p.titulo}</span>
                <strong>{p.precio}</strong>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="hc-barra-pago">
        <div>
          <span>Total</span>
          <strong>{formatPrice(total)}</strong>
        </div>
        <a href={getCartUrl()} className="hc-pagar">
          Finalizar pedido
        </a>
      </div>
    </main>
  );
}
