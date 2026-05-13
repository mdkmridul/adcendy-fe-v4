import type { LandingDesignVariant } from '../types/landing.types';

export const LANDING_DESIGN_CONFIG = {
  defaultVariant: 'v2' as LandingDesignVariant,
  queryParamKey: 'v',
  localStorageKey: 'adcendy_landing_variant',
} as const;
