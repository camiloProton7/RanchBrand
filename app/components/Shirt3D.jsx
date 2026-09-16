import {useEffect, useRef} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Visor 3D de la camisa con simulación de tela (Verlet).
 * - Rotación 360° arrastrando (OrbitControls).
 * - La tela cuelga y ondula (gravedad + viento).
 * - Se puede agarrar la tela con el cursor y arrastrarla.
 */
export default function Shirt3D({imageUrl, alt = ''}) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 520;

    // ── Escena ─────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f5f0e6');

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 2.6);
    camera.lookAt(0, -0.1, 0);

    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // ── Luces ──────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(2, 3, 2);
    key.castShadow = true;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 0.6);
    rim.position.set(-2, 1, -1);
    scene.add(rim);

    // ── Controles de rotación ──────────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, -0.15, 0);
    controls.minDistance = 1.6;
    controls.maxDistance = 4.5;
    controls.enablePan = false;
    controls.minPolarAngle = 0.4;
    controls.maxPolarAngle = Math.PI - 0.3;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.1;

    // ── Percha ─────────────────────────────────────────────
    const hanger = new THREE.Group();
    const hookMat = new THREE.MeshStandardMaterial({color: '#8a7a5f', roughness: 0.5, metalness: 0.4});
    const hook = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.02, 12, 32), hookMat);
    hook.position.y = 1.05;
    hook.rotation.x = 0;
    hanger.add(hook);
    const barMat = new THREE.MeshStandardMaterial({color: '#6f6048', roughness: 0.55, metalness: 0.3});
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 12), barMat);
    bar.position.y = 0.92;
    bar.rotation.z = Math.PI / 2;
    hanger.add(bar);
    scene.add(hanger);

    // ── Textura de la camisa ───────────────────────────────
    let texture = null;
    const loader = new THREE.TextureLoader();
    if (imageUrl) {
      loader.load(imageUrl, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.RepeatWrapping;
        texture = tex;
        clothMat.map = tex;
        clothMat.needsUpdate = true;
      });
    }

    // ── Malla de tela (Verlet cloth) — cilindro de torso ──
    const COLS = 24; // alrededor
    const ROWS = 14; // de arriba (hombros) a abajo (dobladillo)
    const R = 0.42; // radio del torso
    const H = 0.95; // alto total

    const positions = new Float32Array(COLS * ROWS * 3);
    const prev = new Float32Array(COLS * ROWS * 3);
    const uv = new Float32Array(COLS * ROWS * 2);
    const indices = [];
    const idx = (c, r) => c + r * COLS;

    for (let r = 0; r < ROWS; r++) {
      const y = 0.72 - (r / (ROWS - 1)) * H;
      const a = (r / (ROWS - 1)) * Math.PI * 2 * 0.98; // ligera torsión
      for (let c = 0; c < COLS; c++) {
        const th = (c / COLS) * Math.PI * 2;
        const i = idx(c, r);
        positions[i * 3] = Math.cos(th) * R;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = Math.sin(th) * R;
        prev[i * 3] = positions[i * 3];
        prev[i * 3 + 1] = positions[i * 3 + 1];
        prev[i * 3 + 2] = positions[i * 3 + 2];
        uv[i * 2] = c / COLS;
        uv[i * 2 + 1] = 1 - r / (ROWS - 1);
      }
    }

    // Triángulos (con el arrollamiento del cilindro)
    for (let r = 0; r < ROWS - 1; r++) {
      for (let c = 0; c < COLS; c++) {
        const c2 = (c + 1) % COLS;
        const a = idx(c, r);
        const b = idx(c2, r);
        const d = idx(c, r + 1);
        const e = idx(c2, r + 1);
        indices.push(a, b, d, b, e, d);
      }
    }

    const clothGeom = new THREE.BufferGeometry();
    clothGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    clothGeom.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    clothGeom.setIndex(indices);
    clothGeom.computeVertexNormals();

    const clothMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      roughness: 0.9,
    });
    const cloth = new THREE.Mesh(clothGeom, clothMat);
    cloth.castShadow = true;
    cloth.receiveShadow = true;
    scene.add(cloth);

    // Restricciones de distancia (estructural + corte)
    const restLen = [];
    const restC = [];
    const restR = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = idx(c, r);
        // horizontal
        const c2 = (c + 1) % COLS;
        const j = idx(c2, r);
        restC.push(i, j);
        restLen.push(distance(i, j));
        // vertical
        if (r < ROWS - 1) {
          const k = idx(c, r + 1);
          restC.push(i, k);
          restLen.push(distance(i, k));
        }
        // diagonal (corte)
        if (r < ROWS - 1) {
          const k = idx((c + 1) % COLS, r + 1);
          restC.push(i, k);
          restLen.push(distance(i, k));
        }
      }
    }

    function distance(i, j) {
      const dx = positions[i * 3] - positions[j * 3];
      const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
      const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    // Fijar hombros (fila superior) — la camisa cuelga de la percha
    const pinned = new Uint8Array(COLS * ROWS);
    for (let c = 0; c < COLS; c++) {
      pinned[idx(c, 0)] = 1;
    }

    // ── Física (Verlet integration) ────────────────────────
    const GRAVITY = -9.8;
    const DAMPING = 0.985;
    let wind = 0;

    function step(dt) {
      const sdt = dt * dt;
      wind = Math.sin(performance.now() * 0.0012) * 0.25;

      for (let i = 0; i < COLS * ROWS; i++) {
        if (pinned[i]) continue;
        const ix = i * 3;
        const px = positions[ix];
        const py = positions[ix + 1];
        const pz = positions[ix + 2];
        const vx = (px - prev[ix]) * DAMPING;
        const vy = (py - prev[ix + 1]) * DAMPING;
        const vz = (pz - prev[ix + 2]) * DAMPING;
        prev[ix] = px;
        prev[ix + 1] = py;
        prev[ix + 2] = pz;
        positions[ix] = px + vx + wind * sdt * 0.4;
        positions[ix + 1] = py + vy + GRAVITY * sdt * 0.15;
        positions[ix + 2] = pz + vz;
      }

      // Restricciones (varias iteraciones para rigidez)
      for (let iter = 0; iter < 3; iter++) {
        for (let k = 0; k < restLen.length; k++) {
          const i = restC[k * 2];
          const j = restC[k * 2 + 1];
          const ix = i * 3;
          const jx = j * 3;
          let dx = positions[jx] - positions[ix];
          let dy = positions[jx + 1] - positions[ix + 1];
          let dz = positions[jx + 2] - positions[ix + 2];
          let d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6;
          const diff = (d - restLen[k]) / d;
          const pi = pinned[i] ? 0 : 1;
          const pj = pinned[j] ? 0 : 1;
          const w = pi + pj || 1;
          dx *= diff * (pi / w);
          dy *= diff * (pi / w);
          dz *= diff * (pi / w);
          positions[ix] += dx;
          positions[ix + 1] += dy;
          positions[ix + 2] += dz;
          positions[jx] -= dx * (pj / (pi || 1));
          positions[jx + 1] -= dy * (pj / (pi || 1));
          positions[jx + 2] -= dz * (pj / (pi || 1));
        }
      }
    }

    // ── Interacción: agarrar la tela ───────────────────────
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let grabbed = -1;
    let dragging = false;

    function pickVertex(evt) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(cloth);
      if (!hits.length) return -1;
      const face = hits[0];
      const pos = face.point;
      let best = -1;
      let bestDist = 0.15;
      for (let i = 0; i < COLS * ROWS; i++) {
        if (pinned[i]) continue;
        const dx = pos.x - positions[i * 3];
        const dy = pos.y - positions[i * 3 + 1];
        const dz = pos.z - positions[i * 3 + 2];
        const d = dx * dx + dy * dy + dz * dz;
        if (d < bestDist * bestDist) {
          bestDist = Math.sqrt(d);
          best = i;
        }
      }
      return best;
    }

    function onDown(evt) {
      grabbed = pickVertex(evt);
      if (grabbed >= 0) {
        dragging = true;
        controls.enabled = false;
      }
    }
    function onMove(evt) {
      if (!dragging || grabbed < 0) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      // Proyectar el vértice al plano perpendicular a la cámara a su distancia
      const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
        camera.getWorldDirection(new THREE.Vector3()).negate(),
        new THREE.Vector3(positions[grabbed * 3], positions[grabbed * 3 + 1], positions[grabbed * 3 + 2]),
      );
      const pt = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, pt);
      if (pt) {
        positions[grabbed * 3] = pt.x;
        positions[grabbed * 3 + 1] = pt.y;
        positions[grabbed * 3 + 2] = pt.z;
        prev[grabbed * 3] = pt.x;
        prev[grabbed * 3 + 1] = pt.y;
        prev[grabbed * 3 + 2] = pt.z;
      }
    }
    function onUp() {
      dragging = false;
      grabbed = -1;
      controls.enabled = true;
    }

    renderer.domElement.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    // ── Loop de animación ──────────────────────────────────
    let raf;
    let last = performance.now();
    function animate(now) {
      const dt = Math.min((now - last) / 1000, 0.033);
      last = now;
      if (!dragging) step(dt);
      clothGeom.attributes.position.needsUpdate = true;
      clothGeom.computeVertexNormals();
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);

    // ── Resize ─────────────────────────────────────────────
    function onResize() {
      const w = container.clientWidth || 400;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    // ── Limpieza ───────────────────────────────────────────
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      controls.dispose();
      clothGeom.dispose();
      clothMat.dispose();
      if (texture) texture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [imageUrl]);

  return (
    <div
      ref={mountRef}
      className="tr-shirt3d"
      role="img"
      aria-label={alt || 'Camisa 3D interactiva'}
      style={{width: '100%', height: '100%', cursor: 'grab'}}
    />
  );
}
