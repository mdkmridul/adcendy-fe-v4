'use client';

import dynamic from 'next/dynamic';
import { MarketingNav } from '@/components/nav/marketing-nav';
import { StarfieldHero } from '@/components/sections/starfield-hero';

const ProblemSection   = dynamic(() => import('@/components/sections/problem-section').then(m => ({ default: m.ProblemSection })), { ssr: false });
const HowItWorks       = dynamic(() => import('@/components/sections/how-it-works').then(m => ({ default: m.HowItWorks })), { ssr: false });
const WhatYouGet       = dynamic(() => import('@/components/sections/what-you-get').then(m => ({ default: m.WhatYouGet })), { ssr: false });
const WhoItsFor        = dynamic(() => import('@/components/sections/who-its-for').then(m => ({ default: m.WhoItsFor })), { ssr: false });
const WhyNotAI         = dynamic(() => import('@/components/sections/why-not-ai').then(m => ({ default: m.WhyNotAI })), { ssr: false });
const ComparisonTable  = dynamic(() => import('@/components/sections/comparison-table').then(m => ({ default: m.ComparisonTable })), { ssr: false });
const Pricing          = dynamic(() => import('@/components/sections/pricing-section').then(m => ({ default: m.Pricing })), { ssr: false });
const Manifesto        = dynamic(() => import('@/components/sections/manifesto-section').then(m => ({ default: m.Manifesto })), { ssr: false });
const FAQ              = dynamic(() => import('@/components/sections/faq-section').then(m => ({ default: m.FAQ })), { ssr: false });
const FinalCTA         = dynamic(() => import('@/components/sections/final-cta-section').then(m => ({ default: m.FinalCTA })), { ssr: false });
const MarketingFooter  = dynamic(() => import('@/components/sections/marketing-footer').then(m => ({ default: m.MarketingFooter })), { ssr: false });
const StickyFooterCTA  = dynamic(() => import('@/components/sections/sticky-footer-cta').then(m => ({ default: m.StickyFooterCTA })), { ssr: false });

export default function Home() {
  return (
    <main className="bg-background text-foreground">
      <MarketingNav />
      <StarfieldHero />
      <ProblemSection />
      <HowItWorks />
      <WhatYouGet />
      <WhoItsFor />
      <WhyNotAI />
      <ComparisonTable />
      <Pricing />
      <Manifesto />
      <FAQ />
      <FinalCTA />
      <MarketingFooter />
      <StickyFooterCTA />
    </main>
  );
}
