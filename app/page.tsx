'use client';

import dynamic from 'next/dynamic';
import { MarketingNav } from '@/components/nav/marketing-nav';
import { StarfieldHero } from '@/components/sections/starfield-hero';

// Lazy load below-the-fold sections for better initial load performance
const HowItWorks = dynamic(() => import('@/components/sections/how-it-works').then(m => ({ default: m.HowItWorks })), { ssr: false });
const WhatYouGet = dynamic(() => import('@/components/sections/what-you-get').then(m => ({ default: m.WhatYouGet })), { ssr: false });
const ScrollTellingSection = dynamic(() => import('@/components/sections/scroll-telling-sticky').then(m => ({ default: m.ScrollTellingSection })), { ssr: false });
const Pricing = dynamic(() => import('@/components/sections/pricing-section').then(m => ({ default: m.Pricing })), { ssr: false });
const FAQ = dynamic(() => import('@/components/sections/faq-section').then(m => ({ default: m.FAQ })), { ssr: false });
const StickyFooterCTA = dynamic(() => import('@/components/sections/sticky-footer-cta').then(m => ({ default: m.StickyFooterCTA })), { ssr: false });

export default function Home() {
  return (
    <main className="bg-background text-foreground">
      <MarketingNav />
      <StarfieldHero />
      <HowItWorks />
      <WhatYouGet />
      <ScrollTellingSection />
      <Pricing />
      <FAQ />
      <StickyFooterCTA />
    </main>
  );
}
