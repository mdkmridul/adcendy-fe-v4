'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

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
              fontSize: 'clamp(38px, 4.6vw, 68px)',
              lineHeight: 1.02,
              fontWeight: 400,
              letterSpacing: '-0.022em',
              color: 'rgba(237,232,220,0.93)',
              margin: '0 0 clamp(18px,2.4vw,30px) 0',
              width: '100%',
            }}
          >
            <span style={{ display: 'block' }}>Intelligence your team can&apos;t build.</span>
            <span style={{ display: 'block', color: 'rgba(240,193,122,0.92)' }}>A marketing strategy they can own.</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(15px, 1.2vw, 18px)',
              lineHeight: 1.55,
              color: 'rgba(237,232,220,0.66)',
              maxWidth: '62ch',
              margin: '0 0 clamp(14px,1.6vw,20px) 0',
            }}
          >
            AdCendy maps your market — what your competitors are doing across advertising and search, where the
            keyword and channel opportunities sit, and the gaps no one&apos;s filling — then turns it into a clear,
            executable marketing strategy. You get the direction and the intelligence behind it. Your team runs with it.
          </p>

          <p
            style={{
              ...SERIF,
              fontStyle: 'italic',
              fontSize: 'clamp(14px, 1.05vw, 16px)',
              lineHeight: 1.5,
              color: 'rgba(237,232,220,0.50)',
              maxWidth: '62ch',
              margin: '0 0 clamp(26px,3vw,38px) 0',
            }}
          >
            Not a marketing agency, and not a replacement for your team — the strategic head that points your
            execution in the right direction.
          </p>

          <div className="flex flex-col sm:flex-row" style={{ gap: '14px' }}>
            <Link
              href="/sample-report"
              style={{
                ...MONO,
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: '#10161a',
                background: 'rgba(240,193,122,0.92)',
                padding: '14px 24px',
                borderRadius: '3px',
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              See what&apos;s inside a report -&gt;
            </Link>
            <Link
              href="#who-its-for"
              style={{
                ...MONO,
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: 'rgba(237,232,220,0.78)',
                border: '1px solid rgba(237,232,220,0.24)',
                padding: '14px 24px',
                borderRadius: '3px',
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              Check if AdCendy is right for you
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
