'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { IntelligenceStreamNav } from './IntelligenceStreamNav';
import { IntelligenceStreamHero } from './IntelligenceStreamHero';

const HowItWorks      = dynamic(() => import('@/components/sections/how-it-works').then(m => ({ default: m.HowItWorks })),          { ssr: false });
const WhatYouGet      = dynamic(() => import('@/components/sections/what-you-get').then(m => ({ default: m.WhatYouGet })),          { ssr: false });
const WhoItsFor       = dynamic(() => import('@/components/sections/who-its-for').then(m => ({ default: m.WhoItsFor })),            { ssr: false });
const WhyNotAI        = dynamic(() => import('@/components/sections/why-not-ai').then(m => ({ default: m.WhyNotAI })),              { ssr: false });
const ComparisonTable = dynamic(() => import('@/components/sections/comparison-table').then(m => ({ default: m.ComparisonTable })), { ssr: false });
const Pricing         = dynamic(() => import('@/components/sections/pricing-section').then(m => ({ default: m.Pricing })),          { ssr: false });
const Manifesto       = dynamic(() => import('@/components/sections/manifesto-section').then(m => ({ default: m.Manifesto })),      { ssr: false });
const FAQ             = dynamic(() => import('@/components/sections/faq-section').then(m => ({ default: m.FAQ })),                  { ssr: false });
const FinalCTA        = dynamic(() => import('@/components/sections/final-cta-section').then(m => ({ default: m.FinalCTA })),       { ssr: false });
const MarketingFooter = dynamic(() => import('@/components/sections/marketing-footer').then(m => ({ default: m.MarketingFooter })), { ssr: false });
const StickyFooterCTA = dynamic(() => import('@/components/sections/sticky-footer-cta').then(m => ({ default: m.StickyFooterCTA })), { ssr: false });

// V2 overrides these CSS variables so every section that uses bg-background,
// bg-card, bg-muted, border-border etc. inherits the v2 dark palette instead
// of the default theme values.
const V2_VARS: React.CSSProperties = {
  '--background':         'oklch(0.070 0.012 230)',
  '--card':               'oklch(0.090 0.012 230)',
  '--card-foreground':    'oklch(0.940 0 0)',
  '--muted':              'oklch(0.120 0.012 230)',
  '--muted-foreground':   'oklch(0.620 0 0)',
  '--border':             'oklch(0.195 0.010 230)',
  '--primary':            'oklch(0.775 0.080 85)', // warm gold accents
  '--primary-foreground': 'oklch(0.160 0.010 255)',
  '--accent':             'oklch(0.120 0.010 230)',
  '--accent-foreground':  'oklch(0.940 0 0)',
  '--foreground':         'oklch(0.940 0 0)',
  background: '#070d10',
  color: '#ede8dc',
} as React.CSSProperties;

export function LandingPageV2() {
  // Force dark class on <html> so that all dark: Tailwind variants resolve
  // correctly, regardless of the user's current OS/app theme preference.
  useEffect(() => {
    const html = document.documentElement;
    const hadDark = html.classList.contains('dark');
    html.classList.add('dark');
    return () => {
      if (!hadDark) html.classList.remove('dark');
    };
  }, []);

  return (
    // The `dark` class here activates dark: variants for every child component.
    // The inline CSS variable overrides set the palette to v2's near-black tones.
    <main className="dark landing-v2-root" style={V2_VARS}>
      <IntelligenceStreamNav />
      <IntelligenceStreamHero />
      <div className="v2-content-shell">
        <section id="how-it-works"><HowItWorks /></section>
        <section id="what-you-get"><WhatYouGet /></section>
        <section id="who-its-for"><WhoItsFor /></section>
        <section id="why-not-ai"><WhyNotAI /></section>
        <section id="comparison"><ComparisonTable /></section>
        <section id="pricing"><Pricing /></section>
        <section id="manifesto"><Manifesto /></section>
        <section id="faq"><FAQ /></section>
        <section id="final-cta"><FinalCTA /></section>
        <MarketingFooter />
      </div>
      <StickyFooterCTA />
      <style jsx global>{`
        .landing-v2-root {
          position: relative;
          isolation: isolate;
          min-height: 100svh;
          background-color: #070d10;
          background-image:
            radial-gradient(140% 95% at 50% 36%, rgba(17, 24, 26, 0.78), rgba(7, 13, 16, 0.98)),
            radial-gradient(70% 54% at 18% 16%, rgba(13, 21, 25, 0.24), transparent 74%),
            radial-gradient(74% 62% at 84% 74%, rgba(15, 23, 28, 0.20), transparent 76%),
            linear-gradient(to bottom, #0a1114, #070d10 32%, #05090b 100%);
        }

        .landing-v2-root::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: 0.16;
          background-image:
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 140 140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.86' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.65'/%3E%3C/svg%3E");
          background-size: 210px 210px;
          mix-blend-mode: soft-light;
        }

        .landing-v2-root::after {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background:
            radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 42%, rgba(0, 0, 0, 0.68) 100%),
            repeating-linear-gradient(
              114deg,
              transparent 0 170px,
              rgba(224, 218, 204, 0.016) 170px 171px,
              transparent 171px 360px
            ),
            repeating-linear-gradient(
              18deg,
              transparent 0 210px,
              rgba(220, 214, 198, 0.012) 210px 211px,
              transparent 211px 470px
            ),
            radial-gradient(circle at 12% 28%, rgba(226, 219, 202, 0.055) 0 0.7px, transparent 1.4px),
            radial-gradient(circle at 66% 72%, rgba(226, 219, 202, 0.040) 0 0.8px, transparent 1.6px),
            radial-gradient(circle at 84% 18%, rgba(226, 219, 202, 0.038) 0 0.7px, transparent 1.4px);
          background-size: auto, auto, auto, 320px 320px, 280px 280px, 360px 360px;
        }

        .landing-v2-root > * {
          position: relative;
          z-index: 2;
        }

        .v2-content-shell {
          position: relative;
          isolation: isolate;
          background: #070d10;
        }

        .v2-content-shell::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background:
            linear-gradient(
              90deg,
              rgba(4, 8, 11, 0.88) 0%,
              rgba(4, 8, 11, 0.76) 26%,
              rgba(4, 8, 11, 0.44) 48%,
              rgba(4, 8, 11, 0.14) 66%,
              rgba(4, 8, 11, 0) 84%
            );
        }

        .v2-content-shell > * {
          position: relative;
          z-index: 1;
        }

        .v2-content-shell section {
          background: transparent !important;
          border-top: 1px solid rgba(237, 232, 220, 0.08);
        }

        .v2-content-shell section:first-of-type {
          border-top: 0;
        }

        .v2-content-shell .font-space-grotesk {
          font-family: Georgia, 'Times New Roman', serif !important;
          letter-spacing: -0.012em;
        }

        .v2-content-shell h2 {
          color: rgba(237, 232, 220, 0.92);
          font-weight: 500 !important;
        }

        .v2-content-shell h3 {
          color: rgba(237, 232, 220, 0.90);
        }

        .v2-content-shell p,
        .v2-content-shell li {
          color: rgba(237, 232, 220, 0.62);
        }
      `}</style>
    </main>
  );
}
