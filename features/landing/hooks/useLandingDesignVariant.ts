'use client';

import { useState, useEffect } from 'react';
import type { LandingDesignVariant } from '../types/landing.types';
import { LANDING_DESIGN_CONFIG } from '../config/landingDesignConfig';

export function useLandingDesignVariant(): LandingDesignVariant {
  const [variant, setVariant] = useState<LandingDesignVariant>(LANDING_DESIGN_CONFIG.defaultVariant);

  useEffect(() => {
    const qp = new URLSearchParams(window.location.search).get(LANDING_DESIGN_CONFIG.queryParamKey);
    if (qp === 'v1' || qp === 'v2') {
      localStorage.setItem(LANDING_DESIGN_CONFIG.localStorageKey, qp);
      setVariant(qp);
      return;
    }
    const stored = localStorage.getItem(LANDING_DESIGN_CONFIG.localStorageKey);
    if (stored === 'v1' || stored === 'v2') {
      setVariant(stored);
      return;
    }
    setVariant(LANDING_DESIGN_CONFIG.defaultVariant);
  }, []);

  return variant;
}
