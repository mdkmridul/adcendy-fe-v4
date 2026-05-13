'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

const IntelligenceStreamCanvas = dynamic(
  () => import('./IntelligenceStreamCanvas').then(m => ({ default: m.IntelligenceStreamCanvas })),
  { ssr: false },
);

const MONO: React.CSSProperties = { fontFamily: '"Geist Mono", "Courier New", monospace' };
const SERIF: React.CSSProperties = {
  fontFamily: '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Baskerville, Georgia, serif',
  fontFeatureSettings: '"kern" 1, "liga" 1',
  textRendering: 'optimizeLegibility',
};

const ANNOTATIONS = [
  { id: '01', label: ['DEMAND', 'SIGNALS'], left: '42%', top: 40, gain: 2.55, baseOffset: -10 },
  { id: '02', label: ['COMPETITION', 'SHIFTS'], left: '57%', top: 30, gain: 3.1, baseOffset: 6 },
  { id: '03', label: ['POSITIONING', 'GAPS'], left: '72%', top: 20, gain: 2.85, baseOffset: -4 },
  { id: '04', label: ['STRATEGIC', 'WINDOW'], left: '85%', top: 10, gain: 3.35, baseOffset: 14 },
];

export function IntelligenceStreamHero() {
  const [heroH, setHeroH] = useState(900);
  const [markerYNorms, setMarkerYNorms] = useState<number[]>([0.68, 0.62, 0.56, 0.5]);
  const [markerBaseNorms, setMarkerBaseNorms] = useState<number[]>([0.68, 0.62, 0.56, 0.5]);
  const markerTargetRef = useRef<number[]>([0.68, 0.62, 0.56, 0.5]);
  const markerDisplayRef = useRef<number[]>([0.68, 0.62, 0.56, 0.5]);
  const markerBaseRef = useRef<number[]>([0.68, 0.62, 0.56, 0.5]);

  useEffect(() => {
    const section = document.getElementById('intelligence-stream-hero');
    if (!section) return;
    const update = () => setHeroH(section.getBoundingClientRect().height || window.innerHeight || 900);
    const ro = new ResizeObserver(update);
    ro.observe(section);
    update();
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let raf = 0;
    let lastCommit = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastCommit) / 1000, 0.05);
      const fastLerp = 1 - Math.exp(-14 * dt);
      const slowLerp = 1 - Math.exp(-2.8 * dt);

      for (let i = 0; i < 4; i++) {
        const t = markerTargetRef.current[i] ?? 0.6;
        const d = markerDisplayRef.current[i] ?? t;
        const b = markerBaseRef.current[i] ?? t;
        markerDisplayRef.current[i] = d + (t - d) * fastLerp;
        markerBaseRef.current[i] = b + (t - b) * slowLerp;
      }

      if (now - lastCommit > 16) {
        setMarkerYNorms([...markerDisplayRef.current]);
        setMarkerBaseNorms([...markerBaseRef.current]);
        lastCommit = now;
      }

      raf = requestAnimationFrame(tick);
    };

    const onMarkers = (ev: Event) => {
      const e = ev as CustomEvent<{ yNorms?: number[] }>;
      if (!Array.isArray(e.detail?.yNorms) || e.detail.yNorms.length < 4) return;
      const nextRaw = e.detail.yNorms;
      markerTargetRef.current = nextRaw.map(v => Math.max(0, Math.min(1, v)));
    };
    window.addEventListener('stream-markers', onMarkers as EventListener);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('stream-markers', onMarkers as EventListener);
    };
  }, []);

  return (
    <section id="intelligence-stream-hero" className="relative w-full overflow-hidden" style={{ minHeight: '100svh', background: 'transparent' }}>
      <div className="absolute inset-0">
        <IntelligenceStreamCanvas />
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 4,
          background:
            'linear-gradient(90deg, rgba(4,8,11,0.88) 0%, rgba(4,8,11,0.76) 26%, rgba(4,8,11,0.44) 48%, rgba(4,8,11,0.14) 66%, rgba(4,8,11,0.00) 84%)',
        }}
      />

      {ANNOTATIONS.map((ann, idx) => {
        const topPx = (ann.top / 100) * heroH;
        const currNorm = markerYNorms[idx] ?? 0.6;
        const baseNorm = markerBaseNorms[idx] ?? currNorm;
        const baseYPx = baseNorm * heroH;
        const deltaYPx = (currNorm - baseNorm) * heroH;

        // Base is tied to stream's local mid band; crest up -> shorter, trough down -> longer.
        const baseHeight = baseYPx - topPx - 64;
        const dynamicHeight = baseHeight + ann.baseOffset + deltaYPx * ann.gain;
        const lineHeight = Math.max(90, Math.min(320, dynamicHeight));

        return (
          <div
            key={ann.id}
            className="absolute hidden lg:block pointer-events-none"
            style={{ left: ann.left, top: `${ann.top}%`, transform: 'translateX(-50%)', zIndex: 6 }}
          >
            <div
              style={{
                ...MONO,
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'rgba(237,232,220,0.74)',
                lineHeight: 1.4,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '1px' }}>
                <span style={{ color: 'rgba(212,168,83,0.82)' }}>{ann.id}</span>
                <span>{ann.label[0]}</span>
              </div>
              <div style={{ paddingLeft: '22px' }}>{ann.label[1]}</div>
            </div>
            <div
              style={{
                margin: '10px auto 0',
                width: '1px',
                height: `${lineHeight}px`,
                background: 'linear-gradient(to bottom, rgba(237,232,220,0.56), rgba(237,232,220,0.16))',
              }}
            />
            <div
              style={{
                width: '5px',
                height: '5px',
                margin: '0 auto',
                borderRadius: '999px',
                background:
                  idx % 2 === 0
                    ? 'radial-gradient(circle, rgba(246,252,255,0.88) 0%, rgba(192,222,236,0.62) 52%, rgba(192,222,236,0) 78%)'
                    : 'radial-gradient(circle, rgba(255,244,224,0.86) 0%, rgba(246,202,142,0.58) 52%, rgba(246,202,142,0) 78%)',
                boxShadow:
                  idx % 2 === 0
                    ? '0 0 6px rgba(192,222,236,0.26)'
                    : '0 0 6px rgba(246,202,142,0.24)',
                opacity: 0.82,
              }}
            />
          </div>
        );
      })}

      <div
        className="relative z-10 flex flex-col"
        style={{ minHeight: '100svh', padding: 'clamp(86px,10vw,122px) clamp(24px,5vw,64px)' }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '760px',
            marginTop: 'clamp(2px, 1.2vh, 16px)',
            minHeight: 'clamp(360px, 46vh, 480px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
          }}
        >
          <h1
            style={{
              ...SERIF,
              fontSize: 'clamp(46px, 5.5vw, 80px)',
              lineHeight: 0.98,
              fontWeight: 400,
              letterSpacing: '-0.024em',
              color: 'rgba(237,232,220,0.93)',
              margin: '0 0 clamp(18px,2.4vw,30px) 0',
              width: '100%',
            }}
          >
            <span style={{ display: 'block', width: '100%', textAlign: 'left' }}>Marketing Intelligence</span>
            <span style={{ display: 'block', width: '100%', textAlign: 'center' }}>in motion</span>
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p
              style={{
                fontSize: 'clamp(14px, 1.15vw, 18px)',
                lineHeight: 1.48,
                color: 'rgba(237,232,220,0.58)',
                width: 'min(100%, 60ch)',
                margin: '0 auto',
                textAlign: 'center',
                fontFamily: 'inherit',
              }}
            >
              Real-time analysis of demand, competition,
              and positioning signals to reveal what others miss.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
