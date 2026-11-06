import {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router';

const PUNTOS = [
  {id: 'gorras', nombre: 'Gorras', x: 18.1, y: 17.0, to: '/collections/gorras'},
  {id: 'chaquetas', nombre: 'Chaquetas', x: 46.0, y: 23.3, to: '/collections/chaquetas'},
  {id: 'historia', nombre: 'Nuestra Historia', x: 81.0, y: 24.7, to: null},
  {id: 'camisas', nombre: 'Camisas', x: 22.3, y: 44.7, to: '/collections/camisetas'},
  {id: 'botas', nombre: 'Botas', x: 59.4, y: 41.3, to: '/collections/botas-1'},
  {id: 'contacto', nombre: 'Contáctenos', x: 83.0, y: 52.8, to: null},
  {id: 'blog', nombre: 'Blog', x: 75.6, y: 72.2, to: null},
];

const ANCHO = 16;
const ALTO = 9;

const aMundo = (x, y) => ({x: (x / 100 - 0.5) * ANCHO, z: (y / 100 - 0.5) * ALTO});


function Joystick({mandoRef}) {
  const base = useRef(null);
  const knob = useRef(null);
  const activo = useRef(false);

  const mover = (e) => {
    const el = base.current;
    const m = mandoRef.current;
    if (!el || !m) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const radio = r.width / 2 - 15;

    let dx = e.clientX - cx;
    let dy = e.clientY - cy;
    const d = Math.hypot(dx, dy) || 1;
    if (d > radio) {
      dx = (dx / d) * radio;
      dy = (dy / d) * radio;
    }

    if (knob.current) knob.current.style.transform = `translate(${dx}px, ${dy}px)`;

    const f = Math.min(1, Math.hypot(dx, dy) / radio);
    const norma = Math.hypot(dx, dy) || 1;
    m.fuerza = f < 0.12 ? 0 : f;
    m.x = dx / norma;
    m.z = dy / norma;
  };

  const soltar = () => {
    activo.current = false;
    const m = mandoRef.current;
    if (m) {
      m.fuerza = 0;
      m.x = 0;
      m.z = 0;
    }
    if (knob.current) knob.current.style.transform = 'translate(0px, 0px)';
  };

  return (
    <div
      className="hn-joy"
      ref={base}
      onPointerDown={(e) => {
        activo.current = true;
        e.currentTarget.setPointerCapture?.(e.pointerId);
        mover(e);
      }}
      onPointerMove={(e) => {
        if (activo.current) mover(e);
      }}
      onPointerUp={soltar}
      onPointerCancel={soltar}
      onPointerLeave={soltar}
      role="slider"
      aria-label="Mover el caballo"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
    >
      <span className="hn-joy-knob" ref={knob} />
      <span className="hn-joy-hint" aria-hidden="true">Arrastra</span>
    </div>
  );
}

export default function MapaMundo({completo = false}) {
  const stage = useRef(null);
  const mandoRef = useRef(null);
  const [cerca, setCerca] = useState(null);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    let vivo = true;
    let frame;
    let renderer;
    let escena;
    let caballo;
    let mixer;
    let acciones = {};
    let actual = null;
    let obs;

    const mando = {x: 0, z: 0, fuerza: 0};
    const posicion = {x: 0, z: 2.6};
    let rumbo = Math.PI * 0.72;
    let velocidad = 0;
    let cercanoActual = null;
    const anillos = [];

    (async () => {
      const THREE = await import('three');
      const {GLTFLoader} = await import('three/examples/jsm/loaders/GLTFLoader.js');
      if (!vivo || !stage.current) return;

      const cont = stage.current;
      const w = cont.clientWidth || 390;
      const h = cont.clientHeight || 520;

      escena = new THREE.Scene();
      escena.background = new THREE.Color(0xd6c1a0);
      escena.fog = new THREE.Fog(0xd6c1a0, 6.5, 15);

      const camara = new THREE.PerspectiveCamera(36, w / h, 0.1, 200);
      camara.position.set(0, 4.8, 5.6);

      renderer = new THREE.WebGLRenderer({antialias: true, alpha: false});
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.setSize(w, h, false);
      renderer.domElement.style.cssText = 'display:block;width:100%;height:100%';
      cont.appendChild(renderer.domElement);

      escena.add(new THREE.AmbientLight(0xfff2dd, 2.1));
      const sol = new THREE.DirectionalLight(0xfff0d8, 2.8);
      sol.position.set(-6, 12, 5);
      escena.add(sol);

      // la mesa donde se apoya el mapa
      const mesa = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 20),
        new THREE.MeshStandardMaterial({color: 0xcbb08b, roughness: 1})
      );
      mesa.rotation.x = -Math.PI / 2;
      mesa.position.y = -0.04;
      escena.add(mesa);

      // el mapa como suelo
      const tex = await new THREE.TextureLoader().loadAsync('/mapa-pueblo.jpg');
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      const suelo = new THREE.Mesh(
        new THREE.PlaneGeometry(ANCHO, ALTO),
        new THREE.MeshStandardMaterial({map: tex, roughness: 0.95, metalness: 0})
      );
      suelo.rotation.x = -Math.PI / 2;
      escena.add(suelo);

      // marcadores de los lugares
      for (const p of PUNTOS) {
        const {x, z} = aMundo(p.x, p.y);
        const aro = new THREE.Mesh(
          new THREE.RingGeometry(0.15, 0.22, 32),
          new THREE.MeshBasicMaterial({color: 0xa8452a, transparent: true, opacity: 0.32, side: THREE.DoubleSide})
        );
        aro.rotation.x = -Math.PI / 2;
        aro.position.set(x, 0.02, z);
        aro.userData = {id: p.id};
        escena.add(aro);

        const disco = new THREE.Mesh(
          new THREE.CircleGeometry(0.055, 24),
          new THREE.MeshBasicMaterial({color: 0x7d3418, transparent: true, opacity: 0.55})
        );
        disco.rotation.x = -Math.PI / 2;
        disco.position.set(x, 0.03, z);
        escena.add(disco);

        anillos.push({id: p.id, aro});
      }

      // el caballo guardado
      const gltf = await new GLTFLoader().loadAsync('/models/horse.glb');
      if (!vivo) return;

      caballo = gltf.scene;
      caballo.traverse((o) => {
        if (!o.isMesh) return;
        o.frustumCulled = false;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) {
          if (!m) continue;
          m.metalness = 0.05;
          m.roughness = 0.78;
          if (m.color) m.color.multiplyScalar(1.45);
          m.needsUpdate = true;
        }
      });

      // escala: el modelo viene enorme, se normaliza por altura
      const caja = new THREE.Box3().setFromObject(caballo);
      const alto = caja.max.y - caja.min.y || 1;
      const escala = 0.88 / alto;
      caballo.scale.setScalar(escala);

      caballo.position.set(posicion.x, 0, posicion.z);
      escena.add(caballo);

      const sombra = new THREE.Mesh(
        new THREE.CircleGeometry(0.52, 32),
        new THREE.MeshBasicMaterial({color: 0x3a2a18, transparent: true, opacity: 0.26, depthWrite: false})
      );
      sombra.rotation.x = -Math.PI / 2;
      sombra.scale.set(1, 0.52, 1);
      sombra.position.set(posicion.x, 0.015, posicion.z + 0.06);
      escena.add(sombra);

      mixer = new THREE.AnimationMixer(caballo);
      for (const clip of gltf.animations) {
        acciones[clip.name] = mixer.clipAction(clip);
      }
      const correr = acciones['Gallop'] || acciones['Walk'] || Object.values(acciones)[0];
      const quieto = acciones['Idle'] || acciones['Idle_2'] || correr;
      if (correr) {
        correr.play();
        actual = correr;
      }

      // el control es el joystick, así el gesto no se roba al scroll

      const reloj = new THREE.Clock();

      const animar = () => {
        frame = requestAnimationFrame(animar);
        const dt = Math.min(0.05, reloj.getDelta());

        const empuje = mando.fuerza;
        const quiereVel = empuje > 0.08 ? 1.5 + empuje * 2.4 : 0;
        velocidad += (quiereVel - velocidad) * (quiereVel ? 0.14 : 0.10);

        if (velocidad > 0.05 && empuje > 0.02) {
          const paso = velocidad * dt;
          posicion.x += mando.x * paso;
          posicion.z += mando.z * paso;

          const quiero = Math.atan2(mando.x, mando.z);
          let delta = quiero - rumbo;
          delta = ((delta + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
          rumbo += delta * Math.min(1, dt * 7);
        }

        // el caballo no se sale del mapa
        posicion.x = Math.max(-ANCHO / 2 + 1.6, Math.min(ANCHO / 2 - 1.6, posicion.x));
        posicion.z = Math.max(-ALTO / 2 + 1.5, Math.min(ALTO / 2 - 1.5, posicion.z));

        if (caballo) {
          caballo.position.set(posicion.x, 0, posicion.z);
          caballo.rotation.y = rumbo;
          sombra.position.set(posicion.x, 0.015, posicion.z + 0.06);
        }

        // animación: galope al andar, quieto al parar
        if (mixer) {
          const va = velocidad > 0.25;
          const objetivo = va ? correr : quieto;
          if (objetivo && objetivo !== actual) {
            actual?.fadeOut(0.25);
            objetivo.reset().fadeIn(0.25).play();
            actual = objetivo;
          }
          if (actual) actual.timeScale = va ? 0.55 + velocidad * 0.35 : 1;
          mixer.update(dt);
        }

        // la cámara persigue al caballo
        camara.position.x += (posicion.x - camara.position.x) * Math.min(1, dt * 2.4);
        camara.position.z += (posicion.z + 5.6 - camara.position.z) * Math.min(1, dt * 2.4);
        camara.position.y += (4.8 - camara.position.y) * Math.min(1, dt * 2.4);
        camara.lookAt(posicion.x, 0.75, posicion.z + 0.7);

        // el lugar más cercano enciende su aro
        let cercaDe = null;
        let menor = 1.35;
        for (const p of PUNTOS) {
          const m = aMundo(p.x, p.y);
          const d = Math.hypot(m.x - posicion.x, m.z - posicion.z);
          if (d < menor) {
            menor = d;
            cercaDe = p;
          }
        }
        if (cercaDe?.id !== cercanoActual) {
          cercanoActual = cercaDe?.id || null;
          setCerca(cercaDe ? {id: cercaDe.id, nombre: cercaDe.nombre, to: cercaDe.to} : null);
        }
        for (const a of anillos) {
          const activo = a.id === cercanoActual;
          const t = performance.now() * 0.001;
          const pulso = activo ? 1.18 + Math.sin(t * 3) * 0.10 : 1;
          a.aro.scale.setScalar(pulso);
          a.aro.material.opacity = activo ? 0.95 : 0.5;
        }

        renderer.render(escena, camara);
      };
      animar();
      setListo(true);
      mandoRef.current = mando;
      window.__mundo = {camara, caballo, escena, THREE, mando, posicion};

      obs = new ResizeObserver(() => {
        const nw = cont.clientWidth;
        const nh = cont.clientHeight;
        if (!nw || !nh) return;
        renderer.setSize(nw, nh, false);
        camara.aspect = nw / nh;
        camara.updateProjectionMatrix();
      });
      obs.observe(cont);
    })();

    return () => {
      vivo = false;
      cancelAnimationFrame(frame);
      obs?.disconnect();
      renderer?.dispose();
      if (renderer?.domElement?.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <section className={"hn-world" + (completo ? " is-full" : "")}>
      <div className="hn-world-stage" ref={stage} />

      <header className="hn-world-head">
        <p className="hn-world-eyebrow">El pueblo</p>
        <h2 className="hn-world-title">Recórrelo a caballo</h2>
        <p className="hn-world-sub">Mueve el joystick para cabalgar. Cuando llegues, entra.</p>
      </header>

      <Joystick mandoRef={mandoRef} />

      {!listo && <p className="hn-world-cargando">Ensillando…</p>}

      {cerca && cerca.to && (
        <Link className="hn-world-cta" to={cerca.to}>
          Entrar a {cerca.nombre}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      )}

      {cerca && !cerca.to && (
        <p className="hn-world-pronto">{cerca.nombre}: muy pronto</p>
      )}
    </section>
  );
}
