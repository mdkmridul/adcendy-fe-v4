'use client';

import { useState, useEffect } from 'react';
import { LANDING_DESIGN_CONFIG } from '../config/landingDesignConfig';
import type { LandingDesignVariant } from '../types/landing.types';

export function LandingVariantToggle() {
  const [variant, setVariant] = useState<LandingDesignVariant | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(LANDING_DESIGN_CONFIG.localStorageKey) as LandingDesignVariant | null;
    setVariant(stored === 'v1' || stored === 'v2' ? stored : LANDING_DESIGN_CONFIG.defaultVariant);
  }, []);

  if (variant === null) return null;

  const toggle = () => {
    const next: LandingDesignVariant = variant === 'v1' ? 'v2' : 'v1';
    localStorage.setItem(LANDING_DESIGN_CONFIG.localStorageKey, next);
    window.location.reload();
  };

  return (
    <button
      onClick={toggle}
      title={`Switch to ${variant === 'v1' ? 'Intelligence Stream (v2)' : 'Classic (v1)'}`}
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        zIndex: 100,
        fontFamily: '"Geist Mono", monospace',
        fontSize: '9px',
        textTransform: 'uppercase',
        letterSpacing: '0.16em',
        color: 'rgba(212,168,83,0.75)',
        background: 'rgba(8,8,7,0.72)',
        border: '1px solid rgba(212,168,83,0.28)',
        borderRadius: '20px',
        padding: '5px 12px',
        backdropFilter: 'blur(10px)',
        cursor: 'pointer',
        transition: 'border-color 0.2s, color 0.2s',
      }}
    >
      {variant === 'v1' ? 'v1 → v2' : 'v2 → v1'}
    </button>
  );
}
