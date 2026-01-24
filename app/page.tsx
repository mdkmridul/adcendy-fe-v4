'use client';

import { StarfieldHero } from '@/components/sections/starfield-hero';
import { HowItWorks } from '@/components/sections/how-it-works';
import { WhatYouGet } from '@/components/sections/what-you-get';
import { ScrollTellingSection } from '@/components/sections/scroll-telling-sticky';
import { Pricing } from '@/components/sections/pricing-section';
import { FAQ } from '@/components/sections/faq-section';
import { StickyFooterCTA } from '@/components/sections/sticky-footer-cta';

export default function Home() {
  return (
    <main className="bg-background text-foreground">
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
