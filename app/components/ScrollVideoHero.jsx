import {useEffect, useRef, useState} from 'react';

const MENU_ITEMS = [
  {label: 'B2B', numeral: 'I', href: 'https://ranch.com.co/'},
  {
    label: 'Collections',
    numeral: 'II',
    href: 'https://ranch.com.co/collections',
  },
  {label: 'About', numeral: 'III', href: 'https://ranch.com.co/'},
  {
    label: 'Contact',
    numeral: 'IV',
    href: 'https://ranch.com.co/pages/contact',
  },
];

const clamp = (value, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

/**
 * A single sticky scene whose native scroll progress controls both the video
 * playhead and the editorial navigation's spatial transition.
 */
export function ScrollVideoHero({
  videoSrc = '/video-scroll.mp4',
  posterSrc = '/poster-hero.jpg',
}) {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const videoLayerRef = useRef(null);
  const menuRef = useRef(null);
  const mobileDockRef = useRef(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    const videoLayer = videoLayerRef.current;
    const menu = menuRef.current;
    const mobileDock = mobileDockRef.current;

    if (!section || !video || !videoLayer || !menu || !mobileDock) return;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    let targetProgress = 0;
    let renderedProgress = 0;
    let frameId = 0;

    const measureProgress = () => {
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, rect.height - window.innerHeight);
      targetProgress = clamp(-rect.top / distance);
    };

    const renderFrame = () => {
      const smoothing = reducedMotion ? 1 : 0.11;
      renderedProgress += (targetProgress - renderedProgress) * smoothing;

      if (Math.abs(targetProgress - renderedProgress) < 0.0005) {
        renderedProgress = targetProgress;
      }

      const progress = reducedMotion ? 0 : renderedProgress;
      const depth = clamp((progress - 0.12) / 0.38);
      const dock = clamp((progress - 0.45) / 0.4);
      const isDesktop = window.innerWidth >= 900;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const x = isDesktop ? dock * (-(viewportWidth / 2) + 190) : 0;
      const y = isDesktop ? 0 : dock * (-(viewportHeight / 2) + 220);
      const scale = isDesktop ? 1 - dock * 0.54 : 1 - dock * 0.15;
      const rotateX = -depth * 1.25;
      const rotateY = depth * 2.1;
      const z = depth * 26;
      const videoScale = 1 + progress * 0.1;
      const videoY = progress * -1.8;

      videoLayer.style.transform = `translate3d(0, ${videoY}%, 0) scale(${videoScale})`;
      menu.style.transform = [
        'translate(-50%, -50%)',
        `translate3d(${x}px, ${y}px, ${z}px)`,
        `scale(${scale})`,
        `rotateX(${rotateX}deg)`,
        `rotateY(${rotateY}deg)`,
      ].join(' ');

      const mobileMenuFade = isDesktop
        ? 1
        : 1 - clamp((progress - 0.72) / 0.14);
      const mobileDockFade = isDesktop
        ? 0
        : clamp((progress - 0.76) / 0.14);

      menu.style.opacity = String(mobileMenuFade);
      menu.style.pointerEvents = mobileMenuFade > 0.2 ? 'auto' : 'none';
      mobileDock.style.opacity = String(mobileDockFade);
      mobileDock.style.pointerEvents = mobileDockFade > 0.75 ? 'auto' : 'none';
      mobileDock.setAttribute('aria-hidden', String(mobileDockFade < 0.75));
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

      frameId = window.requestAnimationFrame(renderFrame);
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
    frameId = window.requestAnimationFrame(renderFrame);
    window.addEventListener('scroll', measureProgress, {passive: true});
    window.addEventListener('resize', measureProgress);
    window.addEventListener('pointerdown', unlockVideo, {once: true});

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', measureProgress);
      window.removeEventListener('resize', measureProgress);
      window.removeEventListener('pointerdown', unlockVideo);
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
            muted
            playsInline
            preload="auto"
            tabIndex={-1}
            onLoadedData={() => setIsVideoReady(true)}
            onLoadedMetadata={(event) => {
              event.currentTarget.pause();
              event.currentTarget.currentTime = 0;
            }}
          />
        </div>

        <div className="tr-film-shade" aria-hidden="true" />
        <div className="tr-editorial-grid" aria-hidden="true" />

        <header className="tr-masthead">
          <a className="tr-wordmark" href="https://ranch.com.co/">
            The Ranch
          </a>
          <a className="tr-shop-link" href="https://ranch.com.co/collections/all">
            Shop <span aria-hidden="true">↗</span>
          </a>
        </header>

        <nav ref={menuRef} className="tr-editorial-menu" aria-label="Principal">
          <div className="tr-menu-heading" aria-label="The Ranch Edition">
            <span>The</span>
            <span className="tr-heading-script">Ranch</span>
            <span>Edition</span>
          </div>

          <div className="tr-menu-bottom">
            <p>No seguimos modas. Seguimos principios.</p>
            <ol className="tr-menu-list">
              {MENU_ITEMS.map((item, index) => (
                <li key={item.label} className={index === 0 ? 'is-active' : ''}>
                  <a href={item.href}>
                    <span className="tr-menu-label">{item.label}</span>
                    <span className="tr-menu-leader" aria-hidden="true" />
                    <span className="tr-menu-numeral" aria-hidden="true">
                      {item.numeral}
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <nav
          ref={mobileDockRef}
          className="tr-mobile-dock"
          aria-label="Principal compacta"
          aria-hidden="true"
        >
          <a href="https://ranch.com.co/">The Ranch</a>
          <a href="https://ranch.com.co/collections">Explore</a>
        </nav>

        <div className="tr-scroll-cue" aria-hidden="true">
          <span>Scroll to explore</span>
          <i />
        </div>
      </div>
    </section>
  );
}
