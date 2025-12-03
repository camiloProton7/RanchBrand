import {useEffect, useRef, useState} from 'react';

export default function VideoFinal({mp4Src, poster, bgFallback = '#000'}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Protección para servidor
    if (typeof window === 'undefined') return;

    const video = videoRef.current;
    if (!video) return;

    // Cargar video
    video.load();
    
    // Si carga rápido desde caché
    if (video.readyState >= 3) {
        setIsLoaded(true);
    }
    video.onloadeddata = () => setIsLoaded(true);

    // --- LÓGICA DE SCROLL CORREGIDA ---
    const handleScroll = () => {
      if (!containerRef.current || !video.duration) return;

      // EL TRUCO: Buscamos el contenedor padre que tiene el scroll real (.hero-container)
      // Si no lo encuentra, usa el contenedor actual por defecto.
      const track = containerRef.current.closest('.hero-container') || containerRef.current;
      
      const rect = track.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calcular recorrido total disponible (Altura del track - Altura de pantalla)
      const totalDistance = rect.height - windowHeight;

      // Evitar división por cero
      if (totalDistance <= 0) return;

      // Calcular cuánto hemos bajado (invertimos top porque se vuelve negativo al bajar)
      let scrolled = 0 - rect.top;
      
      // Calcular porcentaje (0.0 a 1.0)
      let percent = scrolled / totalDistance;
      
      // Limitar estrictamente entre 0 y 1
      percent = Math.max(0, Math.min(1, percent));
      
      if(Number.isFinite(video.duration)) {
          video.currentTime = video.duration * percent;
      }
    };

    window.addEventListener('scroll', handleScroll, {passive: true});
    window.addEventListener('resize', handleScroll); // Recalcular si cambian tamaño
    
    // Ajuste inicial
    handleScroll();

    return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
    };
  }, [mp4Src]);

  return (
    <div ref={containerRef} style={{width: '100%', height: '100%', position: 'relative', background: bgFallback}}>
      <video
        ref={videoRef}
        src={mp4Src}
        poster={poster}
        playsInline={true}
        webkit-playsinline="true"
        muted={true}
        preload="auto"
        style={{
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', 
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.5s ease',
            display: 'block'
        }}
      />
      
      {/* Fallback Poster */}
      {!isLoaded && poster && (
          <img 
            src={poster} 
            alt="Poster" 
            style={{
                position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', zIndex:-1
            }} 
          />
      )}
    </div>
  );
}