import {useEffect, useRef} from 'react';

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uProg;
uniform float uTime;
uniform float uAspect;
uniform float uImgAspect;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float vnoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i + vec3(0.0,0.0,0.0)), hash(i + vec3(1.0,0.0,0.0)), f.x),
        mix(hash(i + vec3(0.0,1.0,0.0)), hash(i + vec3(1.0,1.0,0.0)), f.x), f.y),
    mix(mix(hash(i + vec3(0.0,0.0,1.0)), hash(i + vec3(1.0,0.0,1.0)), f.x),
        mix(hash(i + vec3(0.0,1.0,1.0)), hash(i + vec3(1.0,1.0,1.0)), f.x), f.y), f.z);
}

float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

vec2 coverUv(vec2 uv) {
  vec2 s = vec2(1.0);
  if (uAspect > uImgAspect) { s.y = uImgAspect / uAspect; }
  else { s.x = uAspect / uImgAspect; }
  return vec2(0.5) + (uv - vec2(0.5)) * s;
}

void main() {
  vec2 uv = vUv;

  float coarse = fbm(vec3(uv.x * 2.4, uv.y * 1.5, uTime * 0.040));
  float fine   = fbm(vec3(uv.x * 26.0, uv.y * 19.0, uTime * 0.065 + 3.0));

  // uv.y = 0 abajo. El ruido deforma el frente.
  float altura = uv.y + (coarse - 0.5) * 0.21 + (fine - 0.5) * 0.030;
  float th = -0.30 + uProg * 1.45;
  float d = altura - th;

  float quemado = 1.0 - smoothstep(-0.012, 0.012, d);
  float filo = exp(-pow(d / 0.0065, 2.0));
  float halo = exp(-pow(d / 0.055, 2.0));

  // la foto se ondula justo antes de prenderse
  float vibra = (fine - 0.5) * 0.013 + sin(uTime * 1.5 + uv.y * 24.0) * 0.0009;
  vec2 uvFoto = uv + vec2(vibra * 0.3, vibra) * (1.0 - quemado) * (0.08 + halo * 1.1);

  vec3 foto = texture2D(uTex, clamp(coverUv(uvFoto), 0.001, 0.999)).rgb;
  foto *= 1.0 - quemado * 0.60;
  foto = mix(foto, foto * vec3(1.12, 0.86, 0.66), halo * 0.7);

  // ceniza: gris muy oscuro con vetas y grano
  vec3 ceniza = vec3(0.042, 0.037, 0.033) * (0.22 + fine * 1.9)
              + vec3(0.016, 0.013, 0.011) * coarse;

  vec3 col = mix(foto, ceniza, quemado);

  // ceniza caliente: franja gris justo detrás del filo
  float gris = exp(-pow((d + 0.030) / 0.018, 2.0)) * quemado;
  col += vec3(0.085, 0.072, 0.062) * gris * (0.55 + fine * 1.2);

  col += vec3(1.0, 0.26, 0.03) * halo * 0.20;
  col += vec3(1.0, 0.80, 0.52) * filo * 0.55;

  // brasas que respiran en la ceniza, pegadas al frente
  float rescoldo = quemado * (1.0 - smoothstep(0.0, 0.16, -d));
  col += vec3(0.70, 0.14, 0.02) * rescoldo * 0.16
       * (0.5 + 0.5 * sin(uTime * 1.7 + coarse * 18.0));

  // viñeta suave para que el texto respire
  float vig = smoothstep(1.25, 0.25, length((uv - vec2(0.5, 0.35)) * vec2(1.15, 1.0)));
  col *= mix(0.80, 1.0, vig);

  gl_FragColor = vec4(col, 1.0);
}`;

function compilar(gl, tipo, fuente) {
  const sh = gl.createShader(tipo);
  gl.shaderSource(sh, fuente);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn('shader:', gl.getShaderInfoLog(sh));
    return null;
  }
  return sh;
}

/**
 * La foto se quema con el scroll. El borde lo dibuja un ruido procedural
 * en el shader, así que no hay canto recto ni dos fotogramas iguales.
 */
export default function HeroBurn({src, wrapRef, alt = ''}) {
  const caja = useRef(null);
  const progreso = useRef(0);

  useEffect(() => {
    const cont = caja.current;
    if (!cont) return;

    const params = new URLSearchParams(window.location.search);
    const congelado = params.get('q');

    let altoPista = 0;
    const medirPista = () => {
      const el = wrapRef?.current;
      altoPista = el ? el.offsetHeight - window.innerHeight : 0;
    };
    medirPista();

    const calcular = () => {
      if (altoPista <= 0) return;
      progreso.current = Math.min(1, Math.max(0, window.scrollY / altoPista));
    };

    if (congelado !== null) {
      progreso.current = Math.min(1, Math.max(0, parseFloat(congelado) || 0));
    } else {
      calcular();
    }

    let pedido = false;
    const alScroll = () => {
      if (congelado !== null || pedido) return;
      pedido = true;
      requestAnimationFrame(() => { calcular(); pedido = false; });
    };
    const alResize = () => { medirPista(); calcular(); };
    window.addEventListener('scroll', alScroll, {passive: true});
    window.addEventListener('resize', alResize);

    const lienzo = document.createElement('canvas');
    lienzo.style.cssText = 'display:block;width:100%;height:100%';
    cont.appendChild(lienzo);

    const gl = lienzo.getContext('webgl', {antialias: false, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: true});
    if (!gl) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = alt;
      img.style.cssText = 'width:100%;height:100%;object-fit:cover';
      cont.appendChild(img);
      return () => window.removeEventListener('scroll', alScroll);
    }

    const vs = compilar(gl, gl.VERTEX_SHADER, VERT);
    const fs = compilar(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    // triángulo que cubre toda la pantalla
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, 'aPos');
    const uTex = gl.getUniformLocation(prog, 'uTex');
    const uProg = gl.getUniformLocation(prog, 'uProg');
    const uTime = gl.getUniformLocation(prog, 'uTime');
    const uAspect = gl.getUniformLocation(prog, 'uAspect');
    const uImgAspect = gl.getUniformLocation(prog, 'uImgAspect');

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([20, 18, 16, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    let imgAspect = 1.5;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgAspect = img.naturalWidth / img.naturalHeight || 1.5;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    };
    img.src = src;

    let w = 0;
    let h = 0;
    const medir = () => {
      w = cont.clientWidth || 390;
      h = cont.clientHeight || 700;
      const dpr = Math.min(1.75, window.devicePixelRatio || 1);
      lienzo.width = Math.round(w * dpr);
      lienzo.height = Math.round(h * dpr);
      gl.viewport(0, 0, lienzo.width, lienzo.height);
    };
    medir();

    const obs = new ResizeObserver(medir);
    obs.observe(cont);

    let frame;
    let suave = 0;
    const t0 = performance.now();

    const dibujar = () => {
      frame = requestAnimationFrame(dibujar);
      suave += (progreso.current - suave) * 0.12;
      // el texto sale una sola vez, con transición: nada de repintar por frame
      const hero = cont.parentElement;
      if (hero) {
        if (suave > 0.24 && !hero.classList.contains('fuera')) hero.classList.add('fuera');
        else if (suave < 0.19 && hero.classList.contains('fuera')) hero.classList.remove('fuera');
      }

      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(uTex, 0);
      gl.uniform1f(uProg, suave);
      gl.uniform1f(uTime, (performance.now() - t0) / 1000);
      gl.uniform1f(uAspect, w / h);
      gl.uniform1f(uImgAspect, imgAspect);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    dibujar();

    window.__heroShader = {gl, prog, get uProg() { return suave; }};

    return () => {
      cancelAnimationFrame(frame);
      obs.disconnect();
      window.removeEventListener('scroll', alScroll);
      window.removeEventListener('resize', alResize);
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
      gl.deleteTexture(tex);
      lienzo.remove();
    };
  }, [src, wrapRef]);

  return <div className="hn-canvas" ref={caja} role="img" aria-label={alt} />;
}
