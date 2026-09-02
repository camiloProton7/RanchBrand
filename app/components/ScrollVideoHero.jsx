import {useEffect, useRef, useState} from 'react';

const MENU_ITEMS = [
  {label: 'Home', href: '/'},
  {label: 'Gorras', href: '/collections/gorras-truckers'},
  {label: 'Chaquetas', href: '/collections/chaquetas'},
  {label: 'Camisetas', href: '/collections/camisetas'},
];

const clamp = (value, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

/**
 * A single sticky scene whose native scroll progress controls both the video
 * playhead and the editorial navigation's spatial transition.
 */
export function ScrollVideoHero({
  videoSrc = '/home-video.mp4?v=4',
  posterSrc = '/home-poster.webp?v=4',
  logoSrc,
}) {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const videoLayerRef = useRef(null);
  const menuRef = useRef(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    const videoLayer = videoLayerRef.current;
    const menu = menuRef.current;

    if (!section || !video || !videoLayer || !menu) return;

    // Forzar la carga del video (iOS/Android ignoran preload="auto").
    video.load();

    // Si el video ya cargó (caché / carga rápida), marcarlo listo de inmediato
    // para que no quede invisible en la primera visita.
    if (video.readyState >= 2) {
      setIsVideoReady(true);
    }

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    let targetProgress = 0;
    let targetFade = 0;
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
      targetFade = clamp(-rect.top / (rect.height || 1));
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
      // Fundido del video al final del scroll TOTAL del hero (no solo del
      // scrubbing) para que no quede un hueco negro antes de la siguiente sección.
      const videoFade = 1 - clamp((targetFade - 0.85) / 0.15);

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

      section.style.setProperty('--hero-progress', String(progress));
      section.style.setProperty(
        '--scroll-cue-opacity',
        String(1 - clamp(progress * 5)),
      );

      // Scroll-scrubbing: el video avanza con el scroll. Solo se hace seek
      // cuando el video ya tiene datos (readyState >= 3) para que no se trabe.
      if (
        !reducedMotion &&
        video.readyState >= 3 &&
        Number.isFinite(video.duration) &&
        video.duration > 0
      ) {
        video.currentTime = clamp(progress) * video.duration;
      }

      if (Math.abs(targetProgress - renderedProgress) >= 0.0005) {
        queueFrame();
      }
    };

    const unlockVideo = () => {
      if (reducedMotion) return;
      video.play().then(() => video.pause()).catch(() => {});
    };

    // Forzar desbloqueo/carga inmediato (en móvil preload se ignora).
    unlockVideo();
    video.addEventListener('loadeddata', unlockVideo, {once: true});

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
          {!isVideoReady ? (
            <img className="tr-video-poster" src={posterSrc} alt="" />
          ) : null}
          <video
            ref={videoRef}
            className={`tr-scroll-video ${isVideoReady ? 'is-ready' : ''}`}
            poster={posterSrc}
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
          >
            <source src="/home-video-hevc.mp4?v=4" type='video/mp4; codecs="hvc1"' />
            <source src={videoSrc} type="video/mp4" />
          </video>
        </div>

        <div className="tr-film-shade" aria-hidden="true" />
        <div className="tr-editorial-grid" aria-hidden="true" />

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

        <div className="tr-scroll-cue" aria-hidden="true">
          <span>Scroll to explore</span>
          <i />
        </div>
      </div>
    </section>
  );
}
