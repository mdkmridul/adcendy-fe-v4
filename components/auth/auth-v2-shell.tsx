'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect } from 'react';

const IntelligenceStreamCanvas = dynamic(
  () => import('@/features/landing/components/IntelligenceStreamCanvas').then(m => ({ default: m.IntelligenceStreamCanvas })),
  { ssr: false },
);

export function AuthV2Shell({
  title,
  subtitle,
  children,
  modal = false,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  modal?: boolean;
}) {
  useEffect(() => {
    if (!modal) return;

    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyTouchAction = document.body.style.touchAction;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.touchAction = prevBodyTouchAction;
    };
  }, [modal]);

  if (modal) {
    return (
      <div className="fixed inset-0 z-40 bg-[#070d10] text-[#ede8dc] overflow-hidden">
        <div className="absolute inset-0">
          <IntelligenceStreamCanvas />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,8,11,0.88)_0%,rgba(4,8,11,0.76)_26%,rgba(4,8,11,0.44)_48%,rgba(4,8,11,0.14)_66%,rgba(4,8,11,0.00)_84%)]" />

        <div className="relative z-10 h-dvh">
          <div className="h-[60px]" />
          <div className="h-[calc(100dvh-60px)] flex items-center justify-center px-4 py-8">
            <div
              className="relative w-full rounded-md border border-[rgba(237,232,220,0.14)] bg-[rgba(6,10,12,0.72)] shadow-[0_24px_90px_rgba(0,0,0,0.5)] backdrop-blur-[2px]"
              style={{ width: 'min(92vw, 620px)' }}
            >
              <Link
                href="/"
                className="absolute right-4 top-4 z-20 text-xs tracking-[0.14em] uppercase text-[rgba(237,232,220,0.62)] hover:text-[rgba(237,232,220,0.9)]"
              >
                Back
              </Link>

              <div className="px-8 py-10 md:px-10">
                <div className="mb-8">
                  <h1
                    className="text-[48px] leading-[0.98] tracking-[-0.03em] font-medium"
                    style={{ fontFamily: '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Baskerville, Georgia, serif' }}
                  >
                    {title}
                  </h1>
                  <p className="mt-2 text-[15px] text-[rgba(237,232,220,0.62)]">{subtitle}</p>
                </div>
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070d10] text-[#ede8dc] flex items-center justify-center px-4 py-8">
      <div
        className="relative w-full rounded-md border border-[rgba(237,232,220,0.18)] bg-[rgba(6,10,12,0.92)] overflow-hidden shadow-[0_24px_90px_rgba(0,0,0,0.5)]"
        style={{ width: 'min(92vw, 900px)', minHeight: '700px' }}
      >
        <Link
          href="/"
          className="absolute right-4 top-4 z-20 text-xs tracking-[0.14em] uppercase text-[rgba(237,232,220,0.62)] hover:text-[rgba(237,232,220,0.9)]"
        >
          Back
        </Link>

        <div className="grid min-h-[700px] grid-cols-1 md:grid-cols-[37%_63%]">
          <div className="relative hidden md:block border-r border-[rgba(237,232,220,0.08)]">
            <div className="absolute inset-0" style={{ transform: 'scaleX(-1)' }}>
              <IntelligenceStreamCanvas />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(7,13,16,0.16)] via-[rgba(7,13,16,0.45)] to-[rgba(7,13,16,0.88)]" />
          </div>

          <div className="relative z-10 flex items-center justify-center px-8 py-10 md:px-12">
            <div className="w-full max-w-[460px]">
              <div className="mb-10">
                <h1 className="text-[50px] leading-[0.98] tracking-[-0.03em] font-medium">{title}</h1>
                <p className="mt-2 text-[15px] text-[rgba(237,232,220,0.62)]">{subtitle}</p>
              </div>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
