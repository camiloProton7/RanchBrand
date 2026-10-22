import {Link} from 'react-router';
import {optimizeImage} from '~/lib/image';

/** Datos de respaldo.
 *
 *  El home le pasa el producto real de Shopify (`product`), así que esto solo
 *  se usa si la camisa no viniera en la colección. La foto se lee del producto
 *  a propósito: antes estaba escrita a mano y el 02-oct-2026 apareció rota,
 *  porque el archivo había sido borrado del CDN y el home seguía pidiéndolo.
 */
const CAMISA = {
  title: 'Camisa Outdoor protección solar UPF 50+',
  handle: 'camisa-outdoor-proteccion-solar-upf-50',
  image:
    'https://cdn.shopify.com/s/files/1/0678/1386/7760/files/opt-a40af08a.webp?v=1789999406',
};

const money = (n) => '$' + Number(n || 0).toLocaleString('es-CO', {maximumFractionDigits: 0});

export default function CamisaFeature({product}) {
  const title = product?.title || CAMISA.title;
  const handle = product?.handle || CAMISA.handle;
  // La foto del modelo viene recortada y con fondo negro: en la tarjeta beige se
  // veía como un bloque oscuro. Si el producto trae la toma de maniquí fantasma
  // (producto plano sobre claro), esa manda en el destacado.
  const imagenes = product?.images?.nodes || [];
  const plana = imagenes.find((i) => /maniqui/i.test(i.url || ''));
  const image =
    plana?.url ||
    product?.featuredImage?.url ||
    imagenes[0]?.url ||
    CAMISA.image;

  const price = Number(product?.priceRange?.minVariantPrice?.amount || 0);
  const compare = Number(product?.compareAtPriceRange?.minVariantPrice?.amount || 0);
  const enPreventa = compare > price && price > 0;

  return (
    <section className="tr-camisa-feature" aria-label="Camisa destacada">
      <div className="tr-camisa-feature-inner">
        <div className="tr-camisa-feature-info">
          <span className="tr-camisa-feature-badge">🔥 Nuevo lanzamiento</span>
          <h2 className="tr-camisa-feature-title">{title}</h2>
          <p className="tr-camisa-feature-desc">
            Protección UPF 50, secado rápido y bolsillos funcionales. Tallas S a XL.
          </p>
          {price > 0 ? (
            <p className="tr-camisa-feature-price">
              {enPreventa ? <s>{money(compare)}</s> : null}
              <strong>{money(price)}</strong>
              {enPreventa ? <em>Preventa · entrega del 10 al 15 de noviembre</em> : null}
            </p>
          ) : null}
          <Link className="tr-camisa-feature-cta" to={`/products/${handle}`}>
            Ver camisa →
          </Link>
        </div>
        <Link className="tr-camisa-feature-media" to={`/products/${handle}`}>
          <img
            className="tr-camisa-feature-img"
            src={optimizeImage(image, 1200)}
            alt={title}
            loading="eager"
            fetchpriority="high"
          />
        </Link>
      </div>
    </section>
  );
}
