import {useEffect, useRef, useState} from 'react';

const MENU_ITEMS = [
  {
    label: 'Gorras',
    href: 'https://ranch.com.co/collections/gorras',
  },
  {
    label: 'Chaquetas',
    href: 'https://ranch.com.co/collections/chaquetas',
  },
  {
    label: 'Accesorios',
    href: 'https://ranch.com.co/collections/all',
  },
];

const clamp = (value, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

/**
 * A single sticky scene whose native scroll progress controls both the video
 * playhead and the editorial navigation's spatial transition.
 */
export function ScrollVideoHero({
  videoSrc = '/home-video.mp4',
  posterSrc = '/home-poster.jpg',
  logoSrc,
}) {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const videoLayerRef = useRef(null);
  const menuRef = useRef(null);
  const mastheadRef = useRef(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    const videoLayer = videoLayerRef.current;
    const menu = menuRef.current;
    const masthead = mastheadRef.current;

    if (!section || !video || !videoLayer || !menu || !masthead) return;

    // Si el video ya cargó (caché / carga rápida), marcarlo listo de inmediato
    // para que no quede invisible en la primera visita.
    if (video.readyState >= 2) {
      setIsVideoReady(true);
    }

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    let targetProgress = 0;
    let renderedProgress = 0;
    let frameId = 0;

    const queueFrame = () => {
      if (!frameId) {
        frameId = window.requestAnimationFrame(renderFrame);
      }
    };

    const measureProgress = () => {
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, rect.height - window.innerHeight);
      targetProgress = clamp(-rect.top / distance);
      queueFrame();
    };

    const renderFrame = () => {
      frameId = 0;
      const smoothing = reducedMotion ? 1 : 0.11;
      renderedProgress += (targetProgress - renderedProgress) * smoothing;

      if (Math.abs(targetProgress - renderedProgress) < 0.0005) {
        renderedProgress = targetProgress;
      }

      const progress = reducedMotion ? 0 : renderedProgress;
      const dock = clamp((progress - 0.4) / 0.4);
      const viewportHeight = window.innerHeight;

      const videoScale = 1 + progress * 0.1;
      const videoY = progress * -1.8;
      // Fundido del video al final del scroll para una transición suave
      // hacia la sección de gorras (fondo negro).
      const videoFade = 1 - clamp((progress - 0.7) / 0.3);

      videoLayer.style.transform = `translate3d(0, ${videoY}%, 0) scale(${videoScale})`;
      videoLayer.style.opacity = String(videoFade);

      // Menú editorial: sube hacia el header y se encoge, luego se desvanece
      const menuY = dock * (-(viewportHeight / 2) + 64);
      const menuScale = 1 - dock * 0.32;
      const menuFade = 1 - clamp((progress - 0.72) / 0.16);
      menu.style.transform = [
        'translate(-50%, -50%)',
        `translate3d(0, ${menuY}px, 0)`,
        `scale(${menuScale})`,
      ].join(' ');
      menu.style.opacity = String(menuFade);
      menu.style.pointerEvents = menuFade > 0.2 ? 'auto' : 'none';

      // Masthead (header): aparece al hacer scroll (desktop y móvil)
      const mastheadFade = clamp((progress - 0.62) / 0.22);
      masthead.style.opacity = String(mastheadFade);
      masthead.style.pointerEvents = mastheadFade > 0.5 ? 'auto' : 'none';

      section.style.setProperty('--hero-progress', String(progress));
      section.style.setProperty(
        '--scroll-cue-opacity',
        String(1 - clamp(progress * 5)),
      );

      if (
        !reducedMotion &&
        Number.isFinite(video.duration) &&
        video.duration > 0
      ) {
        const nextTime = clamp(progress) * Math.max(0, video.duration - 0.04);
        if (Math.abs(video.currentTime - nextTime) > 0.025) {
          video.currentTime = nextTime;
        }
      }

      if (Math.abs(targetProgress - renderedProgress) >= 0.0005) {
        queueFrame();
      }
    };

    const unlockVideo = () => {
      if (reducedMotion || video.readyState < 2) return;
      const playAttempt = video.play();
      if (playAttempt) {
        playAttempt
          .then(() => video.pause())
          .catch(() => {
            // The poster remains visible if a browser declines media warm-up.
          });
      }
    };

    measureProgress();
    window.addEventListener('scroll', measureProgress, {passive: true});
    window.addEventListener('resize', measureProgress);
    window.addEventListener('pointerdown', unlockVideo, {once: true});
    video.addEventListener('loadedmetadata', queueFrame);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', measureProgress);
      window.removeEventListener('resize', measureProgress);
      window.removeEventListener('pointerdown', unlockVideo);
      video.removeEventListener('loadedmetadata', queueFrame);
    };
  }, [videoSrc]);

  return (
    <section
      ref={sectionRef}
      className="tr-scroll-hero"
      aria-label="The Ranch — portada interactiva"
    >
      <div className="tr-scroll-stage">
        <div ref={videoLayerRef} className="tr-video-layer" aria-hidden="true">
          <video
            ref={videoRef}
            className={`tr-scroll-video ${isVideoReady ? 'is-ready' : ''}`}
            src={videoSrc}
            poster={posterSrc}
            crossOrigin="anonymous"
            muted
            playsInline
            preload="auto"
            tabIndex={-1}
            onLoadedData={() => setIsVideoReady(true)}
            onCanPlay={() => setIsVideoReady(true)}
            onLoadedMetadata={(event) => {
              event.currentTarget.pause();
              event.currentTarget.currentTime = 0;
            }}
          />
        </div>

        <div className="tr-film-shade" aria-hidden="true" />
        <div className="tr-editorial-grid" aria-hidden="true" />

        <header ref={mastheadRef} className="tr-masthead">
          <a
            className="tr-masthead-logo"
            href="https://ranch.com.co/"
            aria-label="The Ranch"
          >
            {logoSrc ? <img src={logoSrc} alt="" /> : <span>The Ranch</span>}
          </a>
          <nav className="tr-masthead-nav">
            {MENU_ITEMS.map((item) => (
              <a key={item.label} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <button
            className="tr-masthead-burger"
            type="button"
            aria-label="Abrir menú"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </header>

        <nav ref={menuRef} className="tr-editorial-menu" aria-label="Principal">
          <a
            className="tr-menu-logo"
            href="https://ranch.com.co/"
            aria-label="The Ranch"
          >
            {logoSrc ? (
              <img src={logoSrc} alt="" />
            ) : (
              <span>The Ranch</span>
            )}
          </a>

          <div className="tr-menu-bottom">
            <p>No seguimos modas. Seguimos principios.</p>
            <ol className="tr-menu-list">
              {MENU_ITEMS.map((item, index) => (
                <li key={item.label} className={index === 0 ? 'is-active' : ''}>
                  <a href={item.href}>
                    <span className="tr-menu-label">{item.label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        {mobileMenuOpen && (
          <div className="tr-mobile-menu" role="dialog" aria-label="Menú">
            <div className="tr-mobile-menu-top">
              <a
                className="tr-masthead-logo"
                href="https://ranch.com.co/"
                aria-label="The Ranch"
              >
                {logoSrc ? <img src={logoSrc} alt="" /> : <span>The Ranch</span>}
              </a>
              <button
                className="tr-mobile-menu-close"
                type="button"
                aria-label="Cerrar menú"
                onClick={() => setMobileMenuOpen(false)}
              >
                ✕
              </button>
            </div>
            <nav className="tr-mobile-menu-nav">
              {MENU_ITEMS.map((item, index) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{animationDelay: `${0.12 + index * 0.09}s`}}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        )}

        <div className="tr-scroll-cue" aria-hidden="true">
          <span>Scroll to explore</span>
          <i />
        </div>
      </div>
    </section>
  );
}
