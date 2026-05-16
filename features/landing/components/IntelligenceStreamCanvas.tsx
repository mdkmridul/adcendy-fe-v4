'use client';

import { useEffect, useRef } from 'react';
import { IS_CONFIG, STRANDS, fhash } from '../config/intelligenceStreamHero.config';

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function hash2(x: number, y: number): number {
  const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return v - Math.floor(v);
}

function valueNoise(x: number, y: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const xf = x - x0;
  const yf = y - y0;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const n00 = hash2(x0, y0);
  const n10 = hash2(x0 + 1, y0);
  const n01 = hash2(x0, y0 + 1);
  const n11 = hash2(x0 + 1, y0 + 1);
  const nx0 = lerp(n00, n10, u);
  const nx1 = lerp(n01, n11, u);
  return lerp(nx0, nx1, v);
}

type Particle = {
  strandIdx: number;
  t: number;
  speed: number;
  size: number;
  alpha: number;
  twPhase: number;
  twSpeed: number;
};

function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace('#', '');
  const full = c.length === 3 ? c.split('').map(ch => ch + ch).join('') : c;
  const v = Number.parseInt(full, 16);
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
}

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

function createProgram(gl: WebGLRenderingContext, vsSrc: string, fsSrc: string): WebGLProgram | null {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSrc);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSrc);
  if (!vs || !fs) return null;
  const p = gl.createProgram();
  if (!p) return null;
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    gl.deleteProgram(p);
    return null;
  }
  return p;
}

export function IntelligenceStreamCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: true,
      premultipliedAlpha: false,
      powerPreference: 'high-performance',
    });
    if (!gl) return;
    const activeCanvas: HTMLCanvasElement = canvas;
    const glCtx: WebGLRenderingContext = gl;

    const dprCap = 1.4;
    let dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    let W = 1;
    let H = 1;

    let angleRad = 0;
    let dirX = 0;
    let dirY = 0;
    let normalX = 0;
    let normalY = 0;
    let streamSpan = 0;
    let streamAnchorX = 0;
    let streamAnchorY = 0;

    const strands = STRANDS;
    const strandCount = Math.min(IS_CONFIG.strandCount, strands.length);
    const samples = IS_CONFIG.nSamples;

    const lineVertexCount = strandCount * samples;
    const lineData = new Float32Array(lineVertexCount * 6);

    const lineVbo = gl.createBuffer();
    if (!lineVbo) return;

    const lineVS = `
      attribute vec2 aPos;
      attribute vec4 aCol;
      varying vec4 vCol;
      void main() {
        gl_Position = vec4(aPos, 0.0, 1.0);
        vCol = aCol;
      }
    `;

    const lineFS = `
      precision mediump float;
      varying vec4 vCol;
      void main() {
        gl_FragColor = vCol;
      }
    `;

    const pointVS = `
      attribute vec2 aPos;
      attribute vec4 aCol;
      attribute float aSize;
      varying vec4 vCol;
      void main() {
        gl_Position = vec4(aPos, 0.0, 1.0);
        gl_PointSize = aSize;
        vCol = aCol;
      }
    `;

    const pointFS = `
      precision mediump float;
      varying vec4 vCol;
      void main() {
        vec2 p = gl_PointCoord * 2.0 - 1.0;
        float r = length(p);
        if (r > 1.0) discard;
        float core = 1.0 - smoothstep(0.0, 0.28, r);
        float inner = 1.0 - smoothstep(0.18, 0.46, r);
        float ring = smoothstep(0.58, 0.64, r) - smoothstep(0.72, 0.80, r);
        float edge = smoothstep(0.86, 0.98, r);
        float alpha = min(1.0, core * 0.95 + inner * 0.35 + ring * 0.7 + edge * 0.18) * vCol.a;
        vec3 col = mix(vCol.rgb * 0.92, vec3(1.0), core * 0.75 + ring * 0.2);
        gl_FragColor = vec4(col, alpha);
      }
    `;

    const lineProgram = createProgram(gl, lineVS, lineFS);
    const pointProgram = createProgram(gl, pointVS, pointFS);
    if (!lineProgram || !pointProgram) return;

    const linePosLoc = gl.getAttribLocation(lineProgram, 'aPos');
    const lineColLoc = gl.getAttribLocation(lineProgram, 'aCol');

    const ptPosLoc = gl.getAttribLocation(pointProgram, 'aPos');
    const ptColLoc = gl.getAttribLocation(pointProgram, 'aCol');
    const ptSizeLoc = gl.getAttribLocation(pointProgram, 'aSize');

    const mountTimeSec = performance.now() / 1000;
    const particles: Particle[] = strands.flatMap((strand, si) =>
      Array.from({ length: strand.particleCount }, (_, pi) => {
        const speed = (0.008 + fhash(si * 7 + pi, 102) * 0.011) * (0.8 + strand.strength * 0.4);
        const seedT = 0.1 + fhash(si * 7 + pi, 101) * 0.8;
        return {
          strandIdx: si,
          // Phase-lock particle start to absolute clock so route remounts don't look like resets.
          t: (seedT + mountTimeSec * speed) % 1,
          speed,
          size: 1.5 + fhash(si * 7 + pi, 103) * 2.2,
          alpha: (0.5 + fhash(si * 7 + pi, 104) * 0.35) * (0.55 + strand.strength * 0.75),
          twPhase: fhash(si * 7 + pi, 105) * Math.PI * 2,
          twSpeed: 0.7 + fhash(si * 7 + pi, 106) * 1.3,
        };
      }),
    );

    const pointData = new Float32Array(particles.length * 7);
    const pointVbo = gl.createBuffer();
    if (!pointVbo) return;

    let last = performance.now();
    let raf = 0;
    let lastMarkerEmitMs = 0;
    const markerXNorms = [0.42, 0.57, 0.72, 0.85];

    function resize() {
      const r = activeCanvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      activeCanvas.width = Math.floor(W * dpr);
      activeCanvas.height = Math.floor(H * dpr);
      glCtx.viewport(0, 0, activeCanvas.width, activeCanvas.height);

      angleRad = (IS_CONFIG.streamAngleDeg * Math.PI) / 180;
      dirX = Math.sin(angleRad);
      dirY = -Math.cos(angleRad);
      normalX = -dirY;
      normalY = dirX;

      streamSpan = Math.hypot(W, H) * 2.0;
      streamAnchorX = W * 0.32;
      streamAnchorY = H * 0.67;
    }

    function basePointAt(t: number): [number, number] {
      const along = (t - 0.34) * streamSpan;
      const sweep = Math.sin((t - 0.21) * Math.PI * 1.16) * H * 0.075;
      return [
        streamAnchorX + dirX * along + normalX * sweep,
        streamAnchorY + dirY * along + normalY * sweep,
      ];
    }

    function strandPoint(si: number, t: number, time: number): [number, number] {
      const strand = strands[si];
      const [baseX, baseY] = basePointAt(t);
      const laneBias = (fhash(si, 220) - 0.5) * 2;

      const leftSparse = 1.58 - 0.68 * smoothstep(0.0, 0.34, t);
      const centerPinch = 1 - Math.exp(-Math.pow((t - 0.58) / 0.16, 2)) * 0.72;
      const rightDisperse = 1 + smoothstep(0.68, 1.0, t) * 0.46;
      const spreadEnv = leftSparse * centerPinch * rightDisperse;
      const spreadPx = strand.spreadFrac * IS_CONFIG.totalSpread * H * spreadEnv;
      const axisStackOffset = strand.axisBand * H * 0.036;

      const crestStrengthFactor = 0.55 + strand.strength * 0.45;
      const actualAmp = crestStrengthFactor * strand.amplitude * IS_CONFIG.baseAmplitude * H;
      const actualFreq = IS_CONFIG.minFrequency + strand.frequency * (IS_CONFIG.maxFrequency - IS_CONFIG.minFrequency);
      const actualSpd = strand.speed * IS_CONFIG.baseWaveSpeed * 2 * Math.PI;

      const centerCrestBoost = 1 + 0.52 * Math.exp(-Math.pow((t - 0.56) / 0.19, 2));
      const baseWave = actualAmp * 1.55 * centerCrestBoost * Math.sin(2 * Math.PI * actualFreq * t + strand.phase - time * actualSpd);

      const flowU = t * IS_CONFIG.flowNoiseScale * 3.2 + strand.spreadFrac * 1.7 + time * 0.06 * strand.speed;
      const flowV = strand.spreadFrac * IS_CONFIG.flowNoiseScale * 2.4 + time * 0.035 * strand.speed;

      const nA = valueNoise(flowU * 0.95, flowV * 0.95) * 2 - 1;
      const nB = valueNoise(flowU * 0.82 + 11.7, flowV * 0.82 + 19.4) * 2 - 1;
      const nC = valueNoise(flowU * 1.2 + 7.2, flowV * 1.2 + 5.8) * 2 - 1;

      const dxNoise = nA * IS_CONFIG.flowAmpX * W * 0.12;
      const dyNoise = nB * IS_CONFIG.flowAmpY * H * 0.2;
      const turbulence = nC * actualAmp * 0.16;

      const crossBand = Math.exp(-Math.pow((t - 0.59) / 0.28, 2));
      const crossFlow = laneBias * 0.0018 * H * (t - 0.56) * crossBand;

      const warmLift = strand.kind === 'warm' ? smoothstep(0.48, 0.92, t) * H * 0.008 : 0;
      const perpOffset = axisStackOffset + spreadPx + baseWave + dyNoise + turbulence + crossFlow + warmLift;

      return [baseX + dxNoise + normalX * perpOffset, baseY + normalY * perpOffset];
    }

    const strandCache: [number, number][][] = Array.from({ length: strandCount }, () => []);

    function rebuildStrands(time: number) {
      let v = 0;
      for (let si = 0; si < strandCount; si++) {
        const strand = strands[si];
        const [r, g, b] = hexToRgb(strand.color);
        const alpha = (0.16 + strand.opacity * 0.7) * (0.38 + strand.strength * 0.84);
        const widthMul = 1 + strand.strength * 0.9;
        strandCache[si] = new Array(samples);

        for (let i = 0; i < samples; i++) {
          const t = i / (samples - 1);
          const [px, py] = strandPoint(si, t, time);
          strandCache[si][i] = [px, py];
          const nx = (px / W) * 2 - 1;
          const ny = 1 - (py / H) * 2;
          lineData[v++] = nx;
          lineData[v++] = ny;
          lineData[v++] = r;
          lineData[v++] = g;
          lineData[v++] = b;
          lineData[v++] = Math.min(0.95, alpha * widthMul);
        }
      }
    }

    function sampleCache(si: number, t: number): [number, number] {
      const pts = strandCache[si];
      if (!pts || pts.length < 2) return [0, 0];
      const pos = Math.max(0, Math.min(1, t)) * (pts.length - 1);
      const i0 = Math.floor(pos);
      const i1 = Math.min(pts.length - 1, i0 + 1);
      const f = pos - i0;
      const [x0, y0] = pts[i0];
      const [x1, y1] = pts[i1];
      return [x0 + (x1 - x0) * f, y0 + (y1 - y0) * f];
    }

    function localStreamYAtX(xNorm: number): number {
      const xTarget = xNorm * W;
      let sumY = 0;
      let count = 0;

      for (let si = 0; si < strandCount; si += 2) {
        const pts = strandCache[si];
        if (!pts || pts.length < 2) continue;

        let bestY = pts[0][1];
        let bestDx = Math.abs(pts[0][0] - xTarget);

        for (let i = 1; i < pts.length; i++) {
          const dx = Math.abs(pts[i][0] - xTarget);
          if (dx < bestDx) {
            bestDx = dx;
            bestY = pts[i][1];
          }
        }

        // Ignore strands that are too far from the marker column.
        if (bestDx < W * 0.18) {
          sumY += bestY;
          count++;
        }
      }

      return count > 0 ? sumY / count : H * 0.62;
    }

    function rebuildParticles(time: number, dt: number) {
      let p = 0;
      for (let i = 0; i < particles.length; i++) {
        const prt = particles[i];
        if (prt.strandIdx >= strandCount) continue;

        prt.t += prt.speed * dt;
        if (prt.t > 1) prt.t -= 1;

        const [px, py] = sampleCache(prt.strandIdx, prt.t);
        const nx = (px / W) * 2 - 1;
        const ny = 1 - (py / H) * 2;
        const strand = strands[prt.strandIdx];
        const warm = strand.kind === 'warm';
        const tw = 0.72 + 0.28 * Math.sin(time * prt.twSpeed + prt.twPhase);
        const a = Math.min(1, prt.alpha * tw);

        pointData[p++] = nx;
        pointData[p++] = ny;
        pointData[p++] = warm ? 1.0 : 0.9;
        pointData[p++] = warm ? 0.9 : 0.97;
        pointData[p++] = warm ? 0.72 : 1.0;
        pointData[p++] = a;
        pointData[p++] = (prt.size * (0.75 + strand.strength * 0.8)) * dpr;
      }
    }

    function draw(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const time = now / 1000;

      rebuildStrands(time);
      rebuildParticles(time, dt);

      glCtx.clearColor(0.027, 0.051, 0.063, 1);
      glCtx.clear(glCtx.COLOR_BUFFER_BIT);

      glCtx.enable(glCtx.BLEND);
      glCtx.blendFunc(glCtx.SRC_ALPHA, glCtx.ONE);

      glCtx.useProgram(lineProgram);
      glCtx.bindBuffer(glCtx.ARRAY_BUFFER, lineVbo);
      glCtx.bufferData(glCtx.ARRAY_BUFFER, lineData, glCtx.DYNAMIC_DRAW);

      const lineStride = 6 * 4;
      glCtx.enableVertexAttribArray(linePosLoc);
      glCtx.vertexAttribPointer(linePosLoc, 2, glCtx.FLOAT, false, lineStride, 0);
      glCtx.enableVertexAttribArray(lineColLoc);
      glCtx.vertexAttribPointer(lineColLoc, 4, glCtx.FLOAT, false, lineStride, 2 * 4);

      for (let si = 0; si < strandCount; si++) {
        const strand = strands[si];
        glCtx.lineWidth(Math.max(1, Math.floor((0.8 + strand.width * 1.1) * dpr)));
        glCtx.drawArrays(glCtx.LINE_STRIP, si * samples, samples);
      }

      glCtx.useProgram(pointProgram);
      glCtx.bindBuffer(glCtx.ARRAY_BUFFER, pointVbo);
      glCtx.bufferData(glCtx.ARRAY_BUFFER, pointData, glCtx.DYNAMIC_DRAW);

      const ptStride = 7 * 4;
      glCtx.enableVertexAttribArray(ptPosLoc);
      glCtx.vertexAttribPointer(ptPosLoc, 2, glCtx.FLOAT, false, ptStride, 0);
      glCtx.enableVertexAttribArray(ptColLoc);
      glCtx.vertexAttribPointer(ptColLoc, 4, glCtx.FLOAT, false, ptStride, 2 * 4);
      glCtx.enableVertexAttribArray(ptSizeLoc);
      glCtx.vertexAttribPointer(ptSizeLoc, 1, glCtx.FLOAT, false, ptStride, 6 * 4);

      glCtx.drawArrays(glCtx.POINTS, 0, particles.length);

      if (now - lastMarkerEmitMs > 33) {
        const yNorms = markerXNorms.map((xNorm) => {
          const y = localStreamYAtX(xNorm);
          return Math.max(0, Math.min(1, y / Math.max(H, 1)));
        });
        window.dispatchEvent(new CustomEvent('stream-markers', { detail: { yNorms } }));
        lastMarkerEmitMs = now;
      }

      raf = requestAnimationFrame(draw);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(activeCanvas);
    resize();
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      glCtx.deleteBuffer(lineVbo);
      glCtx.deleteBuffer(pointVbo);
      glCtx.deleteProgram(lineProgram);
      glCtx.deleteProgram(pointProgram);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ display: 'block' }} />;
}
