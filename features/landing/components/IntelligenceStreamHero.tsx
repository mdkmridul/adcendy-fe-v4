'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';

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

export function IntelligenceStreamHero() {
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
