import {useEffect, useRef} from 'react';

const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

const PHOTO_1 =
  'https://rattwfjkxgqvxmxlybcz.supabase.co/storage/v1/object/public/whatsapp-images/home/desert-model-1.webp';
const PHOTO_2 =
  'https://rattwfjkxgqvxmxlybcz.supabase.co/storage/v1/object/public/whatsapp-images/home/desert-model-2.webp';

/**
 * Campaña editorial "Desert" — sección premium con scroll-scrubbing.
 * La foto principal pasa de blanco/negro a color con un zoom sutil,
 * y al final aparece un segundo ángulo con el CTA.
 */
export default function DesertCampaign({
  productUrl = 'https://ranch.com.co/products/gorra-desert',
  price = '$172.000',
}) {
  const sectionRef = useRef(null);
  const photo1Ref = useRef(null);
  const photo2Ref = useRef(null);
  const giantRef = useRef(null);
  const infoRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const measure = () => {
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, rect.height - window.innerHeight);
      const progress = clamp(-rect.top / distance);

      // Foto 1: blanco/negro → color + zoom-out suave
      if (photo1Ref.current) {
        const colorIn = clamp((progress - 0.02) / 0.62);
        photo1Ref.current.style.filter = `grayscale(${1 - colorIn}) saturate(${
          0.4 + colorIn * 0.6
        }) contrast(${0.95 + colorIn * 0.05})`;
        photo1Ref.current.style.transform = `scale(${1.16 - colorIn * 0.16})`;
      }

      // Foto 2: segundo ángulo aparece al final (crossfade)
      if (photo2Ref.current) {
        const secondIn = clamp((progress - 0.6) / 0.34);
        photo2Ref.current.style.opacity = String(secondIn);
        photo2Ref.current.style.transform = `scale(${1.1 - secondIn * 0.1})`;
      }

      // Texto gigante se revela
      if (giantRef.current) {
        const reveal = clamp((progress - 0.12) / 0.34);
        giantRef.current.style.opacity = String(reveal);
        giantRef.current.style.transform = `translate(-50%, -50%) translateY(${
          (1 - reveal) * 46
        }px)`;
      }

      // Info (frase + CTA) se revela al final
      if (infoRef.current) {
        const reveal = clamp((progress - 0.55) / 0.3);
        infoRef.current.style.opacity = String(reveal);
        infoRef.current.style.transform = `translate(-50%, ${(1 - reveal) * 30}px)`;
      }
    };

    measure();
    window.addEventListener('scroll', measure, {passive: true});
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="tr-desert-campaign"
      aria-label="Gorra Desert — campaña"
    >
      <div className="tr-desert-stage">
        <img
          ref={photo1Ref}
          className="tr-desert-photo tr-desert-photo-1"
          src={PHOTO_1}
          alt="Modelo con la Gorra Desert"
          draggable={false}
        />
        <img
          ref={photo2Ref}
          className="tr-desert-photo tr-desert-photo-2"
          src={PHOTO_2}
          alt="Gorra Desert — detalle"
          draggable={false}
        />
        <div className="tr-desert-shade" aria-hidden="true" />
        <span ref={giantRef} className="tr-desert-giant" aria-hidden="true">
          DESERT
        </span>
        <div ref={infoRef} className="tr-desert-info">
          <span className="tr-desert-eyebrow">The Ranch — Edición Desert</span>
          <p className="tr-desert-tagline">
            Hecha para el calor. Hecha para el desierto.
          </p>
          <a className="tr-desert-cta" href={productUrl}>
            <span>Descubre la Gorra Desert</span>
            <span className="tr-desert-cta-arrow">→</span>
          </a>
          <span className="tr-desert-price">{price}</span>
        </div>
      </div>
    </section>
  );
}
