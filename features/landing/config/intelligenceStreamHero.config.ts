// ---- Canvas constants -----------------------------------------------

export const IS_CONFIG = {
  bgColor: '#070d10',
  grainSize: 256,
  grainOpacity: 0.08,
  nSamples: 128,
  focalPoint: { x: 0.58, y: 0.58 } as const,

  strandCount: 50,
  /** Primary stream flow angle in degrees from +Y axis (0 = bottom->top, 90 = left->right) */
  streamAngleDeg: 75,
  /** Total ribbon body height as fraction of canvas H */
  totalSpread: 0.16,
  /** Base wave amplitude (scaled by strand amplitude and responsive envelopes) */
  baseAmplitude: 0.07,
  /** Spatial wave frequency range along t */
  maxFrequency: 4,
  minFrequency: 3,
  /** Wave animation speed */
  baseWaveSpeed: 0.075,

  /** Flow-field displacement scales */
  flowNoiseScale: 2.4,
  flowAmpX: 0.014, // fraction of W
  flowAmpY: 0.024, // fraction of H
} as const;

// ---- Central spine (retained for compatibility) --------------------
export const STREAM_SPINE: [number, number][] = [
  [-0.16, 0.78],
  [0.00, 0.74],
  [0.18, 0.69],
  [0.36, 0.63],
  [0.54, 0.57],
  [0.72, 0.50],
  [0.90, 0.44],
  [1.08, 0.39],
];

// ---- Deterministic hash ---------------------------------------------
export function fhash(a: number, b: number): number {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// ---- Strand definition ----------------------------------------------

export type StrandKind = 'hair' | 'cool' | 'bright' | 'warm';

export interface StrandDef {
  kind: StrandKind;
  /** Strength bucket controls wave energy and node intensity */
  strength: number;
  /** Axis stack lane: -1 (upper), 0 (center), 1 (lower) */
  axisBand: number;
  /** Normalized position within stream body: -0.5 to +0.5 */
  spreadFrac: number;
  /** Final compositing alpha for the core pass */
  opacity: number;
  /** Raw amplitude 0-1 */
  amplitude: number;
  /** Raw frequency 0-1 */
  frequency: number;
  /** Initial phase radians */
  phase: number;
  /** Raw speed 0-1 */
  speed: number;
  /** Stroke width in CSS px */
  width: number;
  /** Main stroke color */
  color: string;
  /** Particle count bound to this strand */
  particleCount: number;
  /** Occasional outlier that peels away to create wispy divergence */
  outlier: boolean;
}

const PALETTE: Record<StrandKind, string[]> = {
  hair: [
    '#243A42',
    '#2A414A',
    '#304952',
  ],
  cool: [
    '#5E7880',
    '#6A8790',
    '#7D9AA3',
    '#2F4850',
  ],
  bright: [
    '#D8E8EA',
    '#CBE0E4',
    '#AFC7CC',
  ],
  warm: [
    '#D6A05D',
    '#F0C17A',
    '#C3874C',
    '#9A6335',
  ],
};

function buildKinds(count: number): StrandKind[] {
  const nHair = Math.round(count * 0.30);
  const nCool = Math.round(count * 0.42);
  const nBright = Math.round(count * 0.18);
  const nWarm = count - nHair - nCool - nBright;

  const kinds: StrandKind[] = [
    ...Array<StrandKind>(nHair).fill('hair'),
    ...Array<StrandKind>(nCool).fill('cool'),
    ...Array<StrandKind>(nBright).fill('bright'),
    ...Array<StrandKind>(nWarm).fill('warm'),
  ];

  // Seeded shuffle for natural interleaving.
  for (let i = kinds.length - 1; i > 0; i--) {
    const j = Math.floor(fhash(i, 91) * (i + 1));
    [kinds[i], kinds[j]] = [kinds[j], kinds[i]];
  }

  return kinds;
}

function buildStrengths(count: number): number[] {
  const n20 = Math.round(count * 0.5);
  const n40 = Math.round(count * 0.2);
  const n70 = Math.round(count * 0.2);
  const n100 = count - n20 - n40 - n70;

  const strengths = [
    ...Array<number>(n20).fill(0.2),
    ...Array<number>(n40).fill(0.4),
    ...Array<number>(n70).fill(0.7),
    ...Array<number>(n100).fill(1.0),
  ];

  // Deterministic shuffle so stronger bands are interleaved naturally.
  for (let i = strengths.length - 1; i > 0; i--) {
    const j = Math.floor(fhash(i, 911) * (i + 1));
    [strengths[i], strengths[j]] = [strengths[j], strengths[i]];
  }

  return strengths;
}

function buildStrands(count: number): StrandDef[] {
  const kinds = buildKinds(count);
  const strengths = buildStrengths(count);
  const phaseCenter = Math.PI * 0.18;
  const phaseSpread = 1.02;
  const speedUniform = 0.62;

  return Array.from({ length: count }, (_, i) => {
    const kind = kinds[i];
    const strength = strengths[i];
    const palette = PALETTE[kind];
    const color = palette[Math.floor(fhash(i, 50) * palette.length)];

    let opacity: number;
    if (kind === 'hair') opacity = 0.07 + fhash(i, 8) * 0.07;
    else if (kind === 'cool') opacity = 0.15 + fhash(i, 8) * 0.15;
    else if (kind === 'bright') opacity = 0.28 + fhash(i, 8) * 0.22;
    else opacity = 0.26 + fhash(i, 8) * 0.20;

    let wBase: number;
    let wRange: number;
    if (kind === 'hair') {
      wBase = 0.22;
      wRange = 0.28;
    } else if (kind === 'cool') {
      wBase = 0.36;
      wRange = 0.48;
    } else if (kind === 'bright') {
      wBase = 0.58;
      wRange = 0.66;
    } else {
      wBase = 0.46;
      wRange = 0.58;
    }
    const width = wBase + fhash(i, 6) * wRange;

    const particleCount = 50;

    return {
      kind,
      strength,
      axisBand: (i % 3) - 1,
      spreadFrac: i / Math.max(count - 1, 1) - 0.5,
      opacity,
      amplitude: 0.45 + fhash(i, 1) * 0.55,
      // Keep frequencies in a narrower band so crest timing stays clustered.
      frequency: 0.32 + fhash(i, 2) * 0.36,
      // Shared phase neighborhood with mild per-wave jitter.
      phase: phaseCenter + (fhash(i, 3) - 0.5) * phaseSpread,
      // Uniform speed across all waves for symmetric motion.
      speed: speedUniform,
      width,
      color,
      particleCount,
      outlier: fhash(i, 10) > 0.92,
    };
  });
}

export const STRANDS: StrandDef[] = buildStrands(IS_CONFIG.strandCount);
