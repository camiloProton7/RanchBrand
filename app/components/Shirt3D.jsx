import {useEffect, useRef} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * Visor 3D de la camisa con simulación de tela (Verlet).
 * Carga un modelo .glb y lo convierte en una malla de tela que:
 * - Rota 360° (OrbitControls).
 * - Cuelga y ondula con gravedad + viento.
 * - Se puede agarrar con el cursor y arrastrar.
 */
export default function Shirt3D({modelUrl = '/models/camisa.glb', imageUrl = '', alt = ''}) {
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
    camera.position.set(0, 0.1, 2.4);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xf5f0e6, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // ── Luces ──────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 1.35));
    const key = new THREE.DirectionalLight(0xffffff, 2.0);
    key.position.set(2, 3, 2);
    key.castShadow = true;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.7);
    fill.position.set(-2, 1, -1);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 0.5);
    rim.position.set(0, 2, -2);
    scene.add(rim);

    // ── Controles de rotación ──────────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0, 0);
    controls.minDistance = 1.3;
    controls.maxDistance = 5;
    controls.enablePan = false;
    controls.minPolarAngle = 0.35;
    controls.maxPolarAngle = Math.PI - 0.25;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.1;

    // ── Percha ─────────────────────────────────────────────
    const hanger = new THREE.Group();
    const hookMat = new THREE.MeshStandardMaterial({color: '#8a7a5f', roughness: 0.5, metalness: 0.4});
    const hook = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.02, 12, 32), hookMat);
    hook.position.y = 1.08;
    hanger.add(hook);
    const barMat = new THREE.MeshStandardMaterial({color: '#6f6048', roughness: 0.55, metalness: 0.3});
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.55, 12), barMat);
    bar.position.y = 0.92;
    bar.rotation.z = Math.PI / 2;
    hanger.add(bar);
    scene.add(hanger);

    // ── Física (Verlet) + interacción ──────────────────────
    let cloth = null;
    let clothGeom = null;
    let positions = null;
    let prev = null;
    let restLen = [];
    let restC = [];
    let pinned = null;
    let vertexCount = 0;
    let clothMat = null;
    const GRAVITY = -9.8;
    const DAMPING = 0.985;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let grabbed = -1;
    let dragging = false;

    function pickVertex(evt) {
      if (!cloth) return -1;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(cloth);
      if (!hits.length) return -1;
      const pos = hits[0].point;
      let best = -1;
      let bestDist = 0.12;
      for (let i = 0; i < vertexCount; i++) {
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

    // ── Cargar modelo GLB ─────────────────────────────────
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      modelUrl,
      (gltf) => {
        const mesh = gltf.scene.getObjectByProperty('type', 'Mesh') || gltf.scene;
        const geo = mesh.geometry;

        // Centrar y escalar el modelo
        geo.computeBoundingBox();
        const bb = geo.boundingBox;
        const center = new THREE.Vector3();
        bb.getCenter(center);
        const size = new THREE.Vector3();
        bb.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const scale = 1.6 / maxDim; // altura objetivo ~1.6

        // Extraer geometría
        const posAttr = geo.attributes.position;
        const idxAttr = geo.index;
        const uvAttr = geo.attributes.uv;
        vertexCount = posAttr.count;
        positions = new Float32Array(vertexCount * 3);
        prev = new Float32Array(vertexCount * 3);
        const uvs = uvAttr ? new Float32Array(uvAttr.array) : null;

        for (let i = 0; i < vertexCount; i++) {
          const x = (posAttr.getX(i) - center.x) * scale;
          const y = (posAttr.getY(i) - center.y) * scale;
          const z = (posAttr.getZ(i) - center.z) * scale;
          positions[i * 3] = x;
          positions[i * 3 + 1] = y;
          positions[i * 3 + 2] = z;
          prev[i * 3] = x;
          prev[i * 3 + 1] = y;
          prev[i * 3 + 2] = z;
        }

        // Índices (triángulos) → aristas únicas para restricciones
        const indexArray = idxAttr ? idxAttr.array : null;
        const triCount = indexArray ? indexArray.length / 3 : Math.floor(vertexCount / 3);
        const indices = [];
        const edgeSet = new Set();
        const edgeKey = (a, b) => (a < b ? a + '_' + b : b + '_' + a);

        const pushEdge = (a, b) => {
          if (a === b) return;
          const k = edgeKey(a, b);
          if (!edgeSet.has(k)) {
            edgeSet.add(k);
            restC.push(a, b);
            restLen.push(
              Math.sqrt(
                Math.pow(positions[a * 3] - positions[b * 3], 2) +
                  Math.pow(positions[a * 3 + 1] - positions[b * 3 + 1], 2) +
                  Math.pow(positions[a * 3 + 2] - positions[b * 3 + 2], 2),
              ),
            );
          }
        };

        for (let t = 0; t < triCount; t++) {
          let a, b, c;
          if (indexArray) {
            a = indexArray[t * 3];
            b = indexArray[t * 3 + 1];
            c = indexArray[t * 3 + 2];
          } else {
            a = t * 3;
            b = t * 3 + 1;
            c = t * 3 + 2;
          }
          indices.push(a, b, c);
          pushEdge(a, b);
          pushEdge(b, c);
          pushEdge(c, a);
        }

        // Fijar los vértices superiores (hombros/cuello = 12% más altos)
        let maxY = -Infinity;
        let minY = Infinity;
        for (let i = 0; i < vertexCount; i++) {
          const y = positions[i * 3 + 1];
          if (y > maxY) maxY = y;
          if (y < minY) minY = y;
        }
        const threshold = maxY - (maxY - minY) * 0.12;
        pinned = new Uint8Array(vertexCount);
        for (let i = 0; i < vertexCount; i++) {
          if (positions[i * 3 + 1] >= threshold) pinned[i] = 1;
        }

        // Geometría Verlet
        clothGeom = new THREE.BufferGeometry();
        clothGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        if (uvs) clothGeom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        clothGeom.setIndex(indices);
        clothGeom.computeVertexNormals();

        // Material: reutilizar la textura del GLB o la imagen pasada
        let map = null;
        if (mesh.material && mesh.material.map) {
          map = mesh.material.map;
        } else if (Array.isArray(mesh.material) && mesh.material[0] && mesh.material[0].map) {
          map = mesh.material[0].map;
        }
        clothMat = new THREE.MeshStandardMaterial({
          map: map || null,
          color: map ? 0xffffff : 0xffffff,
          side: THREE.DoubleSide,
          roughness: 0.85,
        });

        // Fallback: si no hay textura en el GLB, usar imageUrl
        if (!map && imageUrl) {
          const tl = new THREE.TextureLoader();
          tl.load(imageUrl, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            clothMat.map = tex;
            clothMat.needsUpdate = true;
          });
        }

        cloth = new THREE.Mesh(clothGeom, clothMat);
        cloth.castShadow = true;
        cloth.receiveShadow = true;
        scene.add(cloth);

        // Ocultar el mesh original del GLB
        if (mesh.parent) mesh.parent.remove(mesh);
        else mesh.visible = false;

        // Ajustar cámara al modelo
        const v3 = new THREE.Vector3();
        clothGeom.computeBoundingBox();
        const cb = clothGeom.boundingBox;
        const cSize = new THREE.Vector3();
        cb.getSize(cSize);
        const cCenter = new THREE.Vector3();
        cb.getCenter(cCenter);
        controls.target.copy(cCenter);
        camera.position.set(cCenter.x, cCenter.y + 0.3, cCenter.z + cSize.z * 1.2 + 1.2);
      },
      undefined,
      (err) => console.error('Error cargando GLB:', err),
    );

    // ── Paso de simulación ────────────────────────────────
    function step(dt) {
      if (!cloth) return;
      const sdt = dt * dt;
      const wind = Math.sin(performance.now() * 0.0012) * 0.22;

      for (let i = 0; i < vertexCount; i++) {
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
        positions[ix] = px + vx + wind * sdt * 0.35;
        positions[ix + 1] = py + vy + GRAVITY * sdt * 0.12;
        positions[ix + 2] = pz + vz;
      }

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

    // ── Loop de animación ──────────────────────────────────
    let raf;
    let last = performance.now();
    function animate(now) {
      const dt = Math.min((now - last) / 1000, 0.033);
      last = now;
      if (!dragging) step(dt);
      if (clothGeom) {
        clothGeom.attributes.position.needsUpdate = true;
        clothGeom.computeVertexNormals();
      }
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
      if (clothGeom) clothGeom.dispose();
      if (clothMat) clothMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [modelUrl, imageUrl]);

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
