import {useEffect, useRef, useState} from 'react';

export default function VideoFinal({mp4Src, poster, bgFallback = '#000'}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Cargar video
    video.load();
    
    // Si ya tiene datos (por caché), marcar como listo de una vez
    if (video.readyState >= 3) {
      setIsLoaded(true);
    }
    video.onloadeddata = () => setIsLoaded(true);

    // --- LÓGICA DE SCROLL MEJORADA ---
    const handleScroll = () => {
      if (!containerRef.current || !video.duration) return;
      
      // TRUCO: Buscamos el contenedor 'abuelo' que tiene el scroll real (.hero-container)
      // Si no lo encuentra, usa el contenedor actual (fallback)
      const track = containerRef.current.closest('.hero-container') || containerRef.current;
      
      const rect = track.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calcular la distancia total que se puede scrollear
      const totalDist = rect.height - windowHeight;
      
      if (totalDist > 0) {
          // Invertimos el top (porque se vuelve negativo al bajar)
          const scrolled = 0 - rect.top;
          let percent = scrolled / totalDist;
          
          // Limitar entre 0 y 1
          percent = Math.max(0, Math.min(1, percent));
          
          if(Number.isFinite(video.duration)) {
              video.currentTime = video.duration * percent;
          }
      }
    };

    window.addEventListener('scroll', handleScroll, {passive: true});
    window.addEventListener('resize', handleScroll); // Recalcular si cambia el tamaño
    handleScroll(); // Ajuste inicial

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
            display: 'block' // Evita bordes extraños
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