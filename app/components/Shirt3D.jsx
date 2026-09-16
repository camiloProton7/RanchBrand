import {useEffect, useRef} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * Visor 3D de la camisa con ondulación de tela suave.
 * - Rota 360° (OrbitControls).
 * - La tela ondula con el viento (onda sinusoidal, más abajo del dobladillo).
 * - Al agarrar un punto, se deforma localmente y vuelve suave al soltar.
 */
export default function Shirt3D({modelUrl = '/models/camisa_low.glb', imageUrl = '', alt = ''}) {
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
    scene.add(new THREE.AmbientLight(0xffffff, 1.4));
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

    // ── Estado de la tela ──────────────────────────────────
    let cloth = null;
    let clothGeom = null;
    let restPositions = null; // posición de reposo (original)
    let positions = null; // posición renderizada
    let grabOffsets = null; // desplazamiento por agarre (decae a 0)
    let weights = null; // peso de ondulación por vértice (0 arriba, 1 abajo)
    let pinned = null;
    let neighbors = null; // lista de vecinos por vértice (para deformación local)
    let vertexCount = 0;
    let clothMat = null;

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
      let bestDist = 0.14;
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
      if (!pt) return;

      // Desplazar el vértice agarrado hacia el cursor
      grabOffsets[grabbed * 3] = pt.x - restPositions[grabbed * 3];
      grabOffsets[grabbed * 3 + 1] = pt.y - restPositions[grabbed * 3 + 1];
      grabOffsets[grabbed * 3 + 2] = pt.z - restPositions[grabbed * 3 + 2];

      // Deformación local: vecinos directos e indirectos siguen con caída
      const applyInfluence = (v, factor) => {
        const ox = pt.x - restPositions[v * 3];
        const oy = pt.y - restPositions[v * 3 + 1];
        const oz = pt.z - restPositions[v * 3 + 2];
        grabOffsets[v * 3] = ox * factor;
        grabOffsets[v * 3 + 1] = oy * factor;
        grabOffsets[v * 3 + 2] = oz * factor;
      };
      const direct = neighbors[grabbed] || [];
      for (const n of direct) applyInfluence(n, 0.45);
      for (const n of direct) {
        for (const n2 of neighbors[n] || []) {
          if (n2 === grabbed || direct.includes(n2)) continue;
          applyInfluence(n2, 0.2);
        }
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

        geo.computeBoundingBox();
        const bb = geo.boundingBox;
        const center = new THREE.Vector3();
        bb.getCenter(center);
        const size = new THREE.Vector3();
        bb.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const scale = 1.6 / maxDim;

        const posAttr = geo.attributes.position;
        const idxAttr = geo.index;
        const uvAttr = geo.attributes.uv;
        vertexCount = posAttr.count;

        restPositions = new Float32Array(vertexCount * 3);
        positions = new Float32Array(vertexCount * 3);
        grabOffsets = new Float32Array(vertexCount * 3);
        weights = new Float32Array(vertexCount);
        pinned = new Uint8Array(vertexCount);

        let maxY = -Infinity;
        let minY = Infinity;
        for (let i = 0; i < vertexCount; i++) {
          const x = (posAttr.getX(i) - center.x) * scale;
          const y = (posAttr.getY(i) - center.y) * scale;
          const z = (posAttr.getZ(i) - center.z) * scale;
          restPositions[i * 3] = x;
          restPositions[i * 3 + 1] = y;
          restPositions[i * 3 + 2] = z;
          positions[i * 3] = x;
          positions[i * 3 + 1] = y;
          positions[i * 3 + 2] = z;
          if (y > maxY) maxY = y;
          if (y < minY) minY = y;
        }

        // Fijar vértices superiores (hombros/cuello) y calcular peso de ondulación
        const threshold = maxY - (maxY - minY) * 0.12;
        for (let i = 0; i < vertexCount; i++) {
          const y = restPositions[i * 3 + 1];
          if (y >= threshold) pinned[i] = 1;
          weights[i] = Math.min(1, Math.max(0, (maxY - y) / (maxY - minY)));
        }

        // Adyacencia (vecinos directos) para deformación local
        neighbors = Array.from({length: vertexCount}, () => []);
        const indexArray = idxAttr ? idxAttr.array : null;
        const triCount = indexArray ? indexArray.length / 3 : Math.floor(vertexCount / 3);
        const seen = new Set();
        const addEdge = (a, b) => {
          if (a === b) return;
          const key = a < b ? a + '_' + b : b + '_' + a;
          if (seen.has(key)) return;
          seen.add(key);
          neighbors[a].push(b);
          neighbors[b].push(a);
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
          addEdge(a, b);
          addEdge(b, c);
          addEdge(c, a);
        }

        const indices = indexArray ? Array.from(indexArray) : null;
        const uvs = uvAttr ? new Float32Array(uvAttr.array) : null;

        clothGeom = new THREE.BufferGeometry();
        clothGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        if (uvs) clothGeom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        if (indices) clothGeom.setIndex(indices);
        clothGeom.computeVertexNormals();

        let map = null;
        if (mesh.material && mesh.material.map) map = mesh.material.map;
        else if (Array.isArray(mesh.material) && mesh.material[0] && mesh.material[0].map) map = mesh.material[0].map;

        clothMat = new THREE.MeshStandardMaterial({
          map: map || null,
          color: 0xffffff,
          side: THREE.DoubleSide,
          roughness: 0.85,
        });

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

        if (mesh.parent) mesh.parent.remove(mesh);
        else mesh.visible = false;

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

    // ── Ondulación de tela (cada frame) ────────────────────
    function updateCloth(now) {
      if (!cloth) return;
      const t = now * 0.001;
      for (let i = 0; i < vertexCount; i++) {
        const w = weights[i];
        let ox = 0;
        let oz = 0;
        if (w > 0.001) {
          const x = restPositions[i * 3];
          const z = restPositions[i * 3 + 2];
          // onda de viento: más amplitud cuanto más abajo esté el vértice
          ox = Math.sin(t * 1.5 + x * 2.6 + z * 1.7) * 0.035 * w;
          oz = Math.cos(t * 1.15 + x * 1.6 + z * 2.4) * 0.03 * w;
        }
        // el desplazamiento de agarre decae suavemente a 0 (vuelve a reposo)
        grabOffsets[i * 3] *= 0.92;
        grabOffsets[i * 3 + 1] *= 0.92;
        grabOffsets[i * 3 + 2] *= 0.92;

        positions[i * 3] = restPositions[i * 3] + ox + grabOffsets[i * 3];
        positions[i * 3 + 1] = restPositions[i * 3 + 1] + grabOffsets[i * 3 + 1];
        positions[i * 3 + 2] = restPositions[i * 3 + 2] + oz + grabOffsets[i * 3 + 2];
      }
      clothGeom.attributes.position.needsUpdate = true;
      clothGeom.computeVertexNormals();
    }

    // ── Loop de animación ──────────────────────────────────
    let raf;
    function animate(now) {
      updateCloth(now);
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);

    function onResize() {
      const w = container.clientWidth || 400;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

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
