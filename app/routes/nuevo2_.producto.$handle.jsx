import {useLoaderData, Link, useNavigate} from 'react-router';
import {addToCart, buyNow, getCartCount} from '~/lib/cart';
import {useEffect, useMemo, useRef, useState} from 'react';
import styles from '~/styles/home-nuevo.css?url';
import Sellos from '~/components/Sellos';
import Carroza from '~/components/Carroza';
import Buscador from '~/components/Buscador';
import GuiaTallas from '~/components/GuiaTallas';
import Anadido from '~/components/Anadido';
import {handleImpulsado} from '~/data/impulsados';
import MenuLateral from '~/components/MenuLateral';
import {useHeaderScroll} from '~/lib/useHeaderScroll';
import {Rail, Tarjeta} from '~/components/Tarjeta';
import Pie from '~/components/Pie';

export const links = () => [{rel: 'stylesheet', href: styles}];

const PRODUCTO = `#graphql
  query Producto($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      productType
      vendor
      tags
      collections(first: 2) { nodes { handle title } }
      priceRange { minVariantPrice { amount currencyCode } }
      images(first: 12) { nodes { url altText } }
      options { name values }
      variants(first: 60) {
        nodes {
          id
          title
          availableForSale
          quantityAvailable
          selectedOptions { name value }
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
        }
      }
      metafields(identifiers: [
        {namespace: "reviews", key: "rating"},
        {namespace: "reviews", key: "rating_count"}
      ]) { key value }
    }
  }
`;

const RECOS = `#graphql
  query Recos($id: ID!) {
    productRecommendations(productId: $id) {
      id
      title
      handle
      priceRange { minVariantPrice { amount currencyCode } }
      compareAtPriceRange { minVariantPrice { amount } }
      images(first: 2) { nodes { url altText } }
      metafields(identifiers: [
        {namespace: "reviews", key: "rating"},
        {namespace: "reviews", key: "rating_count"}
      ]) { key value }
    }
  }
`;

const POR_HANDLE = `#graphql
  query PorHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      priceRange { minVariantPrice { amount currencyCode } }
      compareAtPriceRange { minVariantPrice { amount } }
      variants(first: 1) { nodes { id availableForSale } }
      images(first: 2) { nodes { url altText } }
      metafields(identifiers: [
        {namespace: "reviews", key: "rating"},
        {namespace: "reviews", key: "rating_count"}
      ]) { key value }
    }
  }
`;

const DE_COLECCION = `#graphql
  query DeColeccion($handle: String!, $excluir: String!) {
    collection(handle: $handle) {
      products(first: 10, sortKey: BEST_SELLING) {
        nodes {
          id title handle
          priceRange { minVariantPrice { amount currencyCode } }
          variants(first: 1) { nodes { id availableForSale } }
          images(first: 2) { nodes { url altText } }
          metafields(identifiers: [
            {namespace: "reviews", key: "rating"},
            {namespace: "reviews", key: "rating_count"}
          ]) { key value }
        }
      }
    }
  }
`;

export async function loader({params, context}) {
  const handle = params.handle;
  const fresco = import.meta.env.DEV ? {cache: context.storefront.CacheNone()} : undefined;
  const data = await context.storefront.query(PRODUCTO, {...fresco, variables: {handle}});
  const p = data.product;
  if (!p) throw new Response('Producto no encontrado', {status: 404});

  const optimizar = (url, ancho) => {
    if (!url) return '';
    const base = url.split('?')[0];
    const v = url.includes('?v=') ? '?' + url.split('?')[1].split('&')[0] : '';
    return `${base}${v}${v ? '&' : '?'}width=${ancho}`;
  };

  const mf = (p.metafields || []).filter(Boolean);
  let valor = 0;
  const r = mf.find((m) => m.key === 'rating');
  if (r?.value) {
    try {
      valor = Number(JSON.parse(r.value).value) || 0;
    } catch {
      valor = Number(r.value) || 0;
    }
  }
  const cuenta = Number(mf.find((m) => m.key === 'rating_count')?.value) || 0;

  const fmt = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });

  const texto = (p.descriptionHtml || '')
    .replace(/<\/(p|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/[ \t]+/g, ' ')
    .replace(/ +([,.;:!?])/g, '$1')
    .trim();

  const aTarjeta = (x) => {
    const m = (x.metafields || []).filter(Boolean);
    let v = 0;
    const r2 = m.find((k) => k.key === 'rating');
    if (r2?.value) {
      try {
        v = Number(JSON.parse(r2.value).value) || 0;
      } catch {
        v = Number(r2.value) || 0;
      }
    }
    return {
      id: x.id,
      titulo: x.title,
      handle: x.handle,
      precio: fmt.format(Number(x.priceRange.minVariantPrice.amount)),
      antes: Number(x.compareAtPriceRange?.minVariantPrice?.amount) > 0 &&
        Number(x.compareAtPriceRange.minVariantPrice.amount) !== Number(x.priceRange.minVariantPrice.amount)
        ? fmt.format(Number(x.compareAtPriceRange.minVariantPrice.amount))
        : null,
      valor: v,
      cuenta: Number(m.find((k) => k.key === 'rating_count')?.value) || 0,
      imagen: optimizar(x.images.nodes[0]?.url, 440),
      img1: optimizar(x.images.nodes[0]?.url, 520),
      precioNum: Number(x.priceRange.minVariantPrice.amount),
      varianteId: x.variants?.nodes?.[0]?.id || '',
      imgs: x.images.nodes.map((n) => optimizar(n.url, 440)),
    };
  };

  // Recomendados: una sola llamada. La coleccion del producto ya trae
  // articulos del mismo tipo; pedir productRecommendations aparte era un
  // viaje extra a Shopify que retrasaba toda la ficha.
  let recos = [];
  const cols = (p.collections?.nodes || []).map((c) => c.handle).filter(Boolean);

  // El producto que se empuja se pide a la vez que los recomendados: en
  // serie sumaba un viaje mas a Shopify y la ficha se sentia lenta.
  const meta = handleImpulsado(cols, p.handle);
  const pedidoSugerido = meta
    ? context.storefront
        .query(POR_HANDLE, {...fresco, variables: {handle: meta}})
        .catch(() => null)
    : Promise.resolve(null);

  // Primero la coleccion visible del producto (una sola llamada). Si esa
  // coleccion esta archivada o vacia, se prueba la siguiente y, como ultimo
  // recurso, productRecommendations.
  for (const h of cols) {
    if (recos.length >= 2) break;
    try {
      const dc = await context.storefront.query(DE_COLECCION, {
        ...fresco,
        variables: {handle: h, excluir: p.handle},
      });
      const lista = (dc.collection?.products?.nodes || [])
        .filter((x) => x.handle !== p.handle)
        .slice(0, 8)
        .map(aTarjeta);
      if (lista.length > recos.length) recos = lista;
    } catch {
      /* coleccion no visible: se intenta la siguiente */
    }
  }

  if (recos.length < 2) {
    try {
      const rr = await context.storefront.query(RECOS, {...fresco, variables: {id: p.id}});
      const lista = (rr.productRecommendations || []).filter(Boolean).map(aTarjeta);
      if (lista.length > recos.length) recos = lista;
    } catch {
      /* sin recomendaciones: la seccion no se muestra */
    }
  }

  // pieza que se empuja en el aviso de compra: se pide directo por su handle
  // para tener siempre su variante y poder sumarla en un toque
  const sp = await pedidoSugerido;
  let sugerido = sp?.product ? aTarjeta(sp.product) : null;
  if (!sugerido) sugerido = recos[0] || null;

  return {
    recos,
    sugerido,
    id: p.id,
    titulo: p.title,
    handle: p.handle,
    tipo: p.productType,
    precio: fmt.format(Number(p.priceRange.minVariantPrice.amount)),
    precioNum: Number(p.priceRange.minVariantPrice.amount),
    valor,
    cuenta,
    fotos: p.images.nodes.map((n) => optimizar(n.url, 720)),
    opciones: p.options,
    variantes: p.variants.nodes.map((v) => ({
      id: v.id,
      titulo: v.title,
      disponible: v.availableForSale,
      stock: v.quantityAvailable,
      precio: fmt.format(Number(v.price.amount)),
      precioNum: Number(v.price.amount),
      antes: Number(v.compareAtPrice?.amount) > 0 && Number(v.compareAtPrice.amount) !== Number(v.price.amount)
        ? fmt.format(Number(v.compareAtPrice.amount))
        : null,
      opciones: v.selectedOptions,
    })),
    descripcion: texto,
    parrafos: texto.split('\n').map((t) => t.trim()).filter((t) => t.length > 2),
  };
}

export const meta = ({data}) => [{title: `${data?.titulo ?? 'Producto'} · The Ranch`}];

export default function ProductoNuevo() {
  const {titulo, tipo, precio, valor, cuenta, fotos, opciones, variantes, handle, parrafos, recos, sugerido} =
    useLoaderData();

  const [foto, setFoto] = useState(0);
  const pista = useRef(null);
  const ir = useNavigate();

  useEffect(() => {
    const leer = () => setEnCesta(getCartCount());
    leer();
    window.addEventListener('ranch-cart-updated', leer);
    return () => window.removeEventListener('ranch-cart-updated', leer);
  }, []);
  const [elegidas, setElegidas] = useState(() => {
    const disp = variantes.filter((v) => v.disponible);

    // Sin stock: se abre en la primera combinacion y se avisa.
    if (!disp.length) {
      const inicial = {};
      const base = variantes[0];
      if (base) base.opciones.forEach((o) => (inicial[o.name] = o.value));
      else opciones.forEach((o) => (inicial[o.name] = o.values[0]));
      return inicial;
    }

    // Con stock: se abre en la combinacion que deja MAS opciones comprables,
    // no en la primera. Si no, un color con una sola talla abre la ficha con
    // casi todas las tallas tachadas y parece agotado.
    // cuantas variantes comprables hay por cada valor de cada opcion
    const conteo = {};
    for (const x of disp) {
      for (const o of x.opciones) {
        conteo[o.name] = conteo[o.name] || {};
        conteo[o.name][o.value] = (conteo[o.name][o.value] || 0) + 1;
      }
    }

    let mejor = disp[0];
    let tope = -1;
    for (const v of disp) {
      const n = v.opciones.reduce(
        (suma, o) => suma + (conteo[o.name]?.[o.value] || 0),
        0,
      );
      if (n > tope) {
        tope = n;
        mejor = v;
      }
    }

    const inicial = {};
    mejor.opciones.forEach((o) => (inicial[o.name] = o.value));
    return inicial;
  });
  const [guiaAbierta, setGuiaAbierta] = useState(false);
  const botonCompra = useRef(null);
  const [barraAbajo, setBarraAbajo] = useState(false);
  const [anadiendo, setAnadiendo] = useState(false);
  const [anadido, setAnadido] = useState(false);
  const [enCesta, setEnCesta] = useState(0);
  const [avisoAbierto, setAvisoAbierto] = useState(false);
  const [modoAviso, setModoAviso] = useState('carrito');
  const [sugeridoAnadido, setSugeridoAnadido] = useState(false);
  const {oculto: barraOculta} = useHeaderScroll({alto: 90});

  // la guia cambia segun lo que se elige: numero de calzado o talla de prenda
  const opcionTalla = opciones.find(
    (o) => o.values.length > 1 && /talla/i.test(o.name),
  );
  // las tallas de calzado llegan como numeros (37, 38...) aunque la opcion
  // se llame solo "Talla", asi que se mira el contenido y no el nombre
  const valoresTalla = opcionTalla?.values || [];
  const numericas = valoresTalla.filter((v) => /^\d+([.,]\d+)?$/.test(String(v).trim()));
  const opcionHorma = opciones.find((o) => /horma/i.test(o.name));
  const tipoGuia = opcionTalla
    ? numericas.length > valoresTalla.length / 2 ||
      /calzado|zapato/i.test(opcionTalla.name)
      ? 'calzado'
      : 'ropa'
    : null;

  // la barra de compra solo aparece cuando el boton grande ya no se ve
  useEffect(() => {
    const el = botonCompra.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observador = new IntersectionObserver(
      ([entrada]) => setBarraAbajo(!entrada.isIntersecting),
      {threshold: 0.6},
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  const variante = useMemo(() => {
    const exacta = variantes.find((v) =>
      v.opciones.every((o) => elegidas[o.name] === o.value)
    );
    return exacta || variantes[0];
  }, [variantes, elegidas]);

  async function agregar() {
    if (!variante?.disponible || anadiendo) return;
    setAnadiendo(true);
    try {
      addToCart({
        variantId: variante.id,
        qty: 1,
        title: titulo,
        image: fotos[0],
        price: variante.precioNum,
        precioTexto: variante.precio,
        opciones: variante.opciones?.map((o) => o.value).join(' · '),
        handle,
      });
      setAnadido(true);
      setModoAviso('carrito');
      setAvisoAbierto(true);
      setTimeout(() => setAnadido(false), 4000);
    } finally {
      setAnadiendo(false);
    }
  }

  /**
   * "Comprar ahora" tambien pasa por la hoja: confirma la pieza y deja el
   * sugerido a un toque, pero la salida principal es el pago.
   */
  function comprarAhora() {
    if (!variante?.disponible) return;
    setModoAviso('pago');
    setSugeridoAnadido(false);
    setAvisoAbierto(true);
  }

  /** Va a la pasarela con la pieza elegida y, si la sumó, el sugerido. */
  function irAPagar() {
    const ids = [variante.id.replace(/\D/g, '') + ':1'];
    if (sugeridoAnadido && sugerido?.varianteId) {
      ids.push(sugerido.varianteId.replace(/\D/g, '') + ':1');
    }
    const total = sugeridoAnadido && sugerido ? variante.precioNum + sugerido.precioNum : variante.precioNum;
    trackCompra(total);
    window.location.href = `https://1caf84-4.myshopify.com/cart/${ids.join(',')}`;
  }

  function trackCompra(valor) {
    try {
      if (window.fbq) window.fbq('track', 'InitiateCheckout', {value: Math.round(valor), currency: 'COP'});
    } catch {
      /* sin pixel: no pasa nada */
    }
  }

  function agregarSugerido() {
    if (!sugerido || sugeridoAnadido) return;
    addToCart({
      variantId: sugerido.varianteId,
      qty: 1,
      title: sugerido.titulo,
      image: sugerido.img1 || sugerido.img,
      price: sugerido.precioNum,
      precioTexto: sugerido.precio,
      handle: sugerido.handle,
    });
    setSugeridoAnadido(true);
  }

  return (
    <div className="hp">
      <div className={"hp-bar" + (barraOculta ? " is-oculto" : "")}>
        <MenuLateral tono="tinta" />
        <Link to="/nuevo2" className="hp-logo" aria-label="The Ranch, ir al inicio"><img src="/logo-tinta.png" alt="The Ranch" width="78" /></Link>
        <span className="hp-bolsa">
          <Buscador tono="oscuro" />
          <Carroza />
        </span>
      </div>

      <section className="hp-galeria">
        <div
          className="hp-fotos"
          ref={pista}
          onScroll={() => {
            const w = pista.current?.clientWidth || 1;
            const i = Math.round(pista.current.scrollLeft / w);
            setFoto(Math.min(fotos.length - 1, Math.max(0, i)));
          }}
        >
          {fotos.map((src, i) => (
            <div key={src} className="hp-foto">
              <img
                src={src}
                alt={`${titulo} ${i + 1}`}
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : 'auto'}
                decoding="async"
              />
            </div>
          ))}
        </div>

        {fotos.length > 1 && (
          <div className="hp-minis">
            {fotos.map((src, i) => (
              <button
                key={src}
                type="button"
                className={'hp-mini' + (i === foto ? ' is-on' : '')}
                onClick={() => {
                  setFoto(i);
                  pista.current?.scrollTo({left: i * (pista.current.clientWidth || 0), behavior: 'smooth'});
                }}
                aria-label={`Foto ${i + 1}`}
              >
                <img src={src} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        )}

        {variante?.stock > 0 && variante.stock <= 5 && (
          <span className="hp-sello-stock">Últimas {variante.stock} unidades</span>
        )}
        {variante?.stock === 0 && <span className="hp-sello-stock is-agotado">Agotada</span>}

        <span className="hp-contador">
          {String(foto + 1).padStart(2, '0')} / {String(fotos.length).padStart(2, '0')}
        </span>
      </section>

      <section className="hp-info">
        {tipo && <p className="hp-tipo">{tipo}</p>}
        <h1 className="hp-titulo">{titulo}</h1>

        {valor >= 4.8 && cuenta >= 20 && (
          <p className="hp-favorito">
            <span aria-hidden="true">★</span> Favorita de {cuenta} clientes
          </p>
        )}

        <div className="hp-linea">
          <span className="hp-precio">{variante?.precio || precio}</span>
          {variante?.antes && (
            <>
              <span className="hp-antes">{variante.antes}</span>
              <span className="hp-dto">
                {(() => {
                  const antesNum = Number(variante.antes.replace(/[^\d]/g, ''));
                  const pct = Math.round((1 - variante.precioNum / antesNum) * 100);
                  return pct > 0 ? `−${pct}%` : `+${Math.abs(pct)}%`;
                })()}
              </span>
            </>
          )}
          {valor > 0 && (
            <span className="hp-rating">
              <span aria-hidden="true">★</span> {valor.toFixed(1)}
              {cuenta > 0 && <em> ({cuenta})</em>}
            </span>
          )}
        </div>

        {opciones.filter((o) => o.values.length > 1).map((o) => (
          <div key={o.name} className="hp-opcion">
            <div className="hp-opcion-head">
              <p className="hp-opcion-nombre">{o.name}</p>
              {tipoGuia && o === opcionTalla && (
                <button
                  type="button"
                  className="hp-guia-link"
                  onClick={() => setGuiaAbierta(true)}
                >
                  Guía de tallas
                </button>
              )}
            </div>
            <div className="hp-chips">
              {o.values.map((v) => {
                const hay = variantes.some(
                  (va) =>
                    va.disponible &&
                    va.opciones.every((oo) =>
                      oo.name === o.name ? oo.value === v : elegidas[oo.name] === oo.value
                    )
                );
                // una opcion sin unidades no se puede elegir: si se marca como
                // activa a la vez que tachada, el cliente ve un boton que dice
                // agotado con la talla ya seleccionada y no entiende nada.
                const activa = hay && elegidas[o.name] === v;
                return (
                  <button
                    key={v}
                    type="button"
                    disabled={!hay}
                    aria-disabled={!hay}
                    className={
                      'hp-chip' + (activa ? ' is-on' : '') + (hay ? '' : ' is-off')
                    }
                    onClick={() => hay && setElegidas((e) => ({...e, [o.name]: v}))}
                  >
                    {v}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <button
          ref={botonCompra}
          type="button"
          className={'hp-comprar' + (anadido ? ' is-ok' : '')}
          onClick={() => (anadido ? ir('/nuevo2/carrito') : agregar())}
          disabled={!variante?.disponible || anadiendo}
        >
          {anadido
            ? 'Ver carrito'
            : variante?.disponible
              ? anadiendo
                ? 'Añadiendo…'
                : 'Añadir al carrito'
              : variantes.some((v) => v.disponible)
                ? 'Agotada en esta talla'
                : 'Agotada'}
        </button>

        <button
          type="button"
          className="hp-ahora"
          onClick={comprarAhora}
          disabled={!variante?.disponible}
        >
          Comprar ahora
        </button>

        <p className="hp-ahora-nota">
          Paga directo, sin pasar por el carrito
        </p>

      </section>

      <section className="hp-relato">
        {parrafos.slice(0, 4).map((t, i) => (
          <p key={i}>{t}</p>
        ))}
      </section>

      {recos.length > 1 && (
        <section className="hp-recos">
          <div className="hp-recos-head">
            <h2>Los clientes también eligieron</h2>
            <span>Desliza →</span>
          </div>
          <Rail className="hp-recos-rail">
            {recos.map((p) => (
              <Tarjeta key={p.id} p={p} ruta="/nuevo2/producto/" />
            ))}
          </Rail>
        </section>
      )}

      <Sellos />
      <Pie />

      {/* barra de compra fija: siempre alcanzable con el pulgar */}
      <div className={'hp-barra' + (barraAbajo ? ' is-visible' : '')}>
        <div className="hp-barra-precio">
          <strong>{variante?.precio || precio}</strong>
          {variante?.antes && <span className="hp-barra-antes">antes {variante.antes}</span>}
        </div>
        <button
          type="button"
          className={'hp-barra-btn' + (anadido ? ' is-ok' : '')}
          onClick={() => (anadido ? ir('/nuevo2/carrito') : agregar())}
          disabled={!variante?.disponible || anadiendo}
        >
          {anadido
            ? 'Ver carrito'
            : variante?.disponible
              ? anadiendo
                ? 'Añadiendo…'
                : 'Añadir'
              : 'Agotada'}
        </button>
      </div>

      <Anadido
        abierto={avisoAbierto}
        cerrar={() => {
          setAvisoAbierto(false);
          setSugeridoAnadido(false);
        }}
        articulo={{titulo, img: fotos[0]}}
        sugerido={
          sugerido
            ? {
                handle: sugerido.handle,
                titulo: sugerido.titulo,
                img: sugerido.img1 || sugerido.img,
                precio: sugerido.precio,
                antes: sugerido.antes,
                varianteId: sugerido.varianteId,
              }
            : null
        }
        onAnadir={agregarSugerido}
        onPagar={irAPagar}
        modo={modoAviso}
        anadiendo={false}
        yaAnadido={sugeridoAnadido}
      />

      {tipoGuia && (
        <GuiaTallas
          abierto={guiaAbierta}
          cerrar={() => setGuiaAbierta(false)}
          tipo={tipoGuia}
          tallas={opcionTalla?.values || []}
          hormaProducto={elegidas[opcionHorma?.name] || ''}
          onElegir={(v) => setElegidas((e) => ({...e, [opcionTalla.name]: v}))}
        />
      )}

    </div>
  );
}
