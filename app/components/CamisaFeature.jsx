import {Link} from 'react-router';
import {optimizeImage} from '~/lib/image';

const CAMISA = {
  title: 'Camisa Outdoor The Ranch',
  handle: 'camisa-outdoor-the-ranch',
  price: '150000.0',
  image:
    'https://cdn.shopify.com/s/files/1/0678/1386/7760/files/37b302bf-02a3-4f47-9233-177c95d628e6_Maniquifantasma_f7acf7f4-0947-4c9f-b751-d6f864d29581.webp?v=1789420467',
};

export default function CamisaFeature() {
  return (
    <section className="tr-camisa-feature" aria-label="Camisa destacada">
      <div className="tr-camisa-feature-inner">
        <div className="tr-camisa-feature-info">
          <span className="tr-camisa-feature-badge">🔥 Nuevo lanzamiento</span>
          <h2 className="tr-camisa-feature-title">{CAMISA.title}</h2>
          <p className="tr-camisa-feature-desc">
            Protección UPF 50, secado rápido y bolsillos funcionales. Tallas S a XL.
          </p>
          <Link className="tr-camisa-feature-cta" to={`/products/${CAMISA.handle}`}>
            Ver camisa →
          </Link>
        </div>
        <Link className="tr-camisa-feature-media" to={`/products/${CAMISA.handle}`}>
          <img
            className="tr-camisa-feature-img"
            src={optimizeImage(CAMISA.image, 1200)}
            alt={CAMISA.title}
            loading="lazy"
          />
        </Link>
      </div>
    </section>
  );
}
