'use client';

import dynamic from 'next/dynamic';
import { useLandingDesignVariant } from '../hooks/useLandingDesignVariant';

const LandingPageV1 = dynamic(() => import('./LandingPageV1').then(m => ({ default: m.LandingPageV1 })), { ssr: false });
const LandingPageV2 = dynamic(() => import('./LandingPageV2').then(m => ({ default: m.LandingPageV2 })), { ssr: false });
const LandingVariantToggle = dynamic(
  () => import('./LandingVariantToggle').then(m => ({ default: m.LandingVariantToggle })),
  { ssr: false }
);

export function LandingPage() {
  const variant = useLandingDesignVariant();

  return (
    <>
      {variant === 'v1' ? <LandingPageV1 /> : <LandingPageV2 />}
      <LandingVariantToggle />
    </>
  );
}
