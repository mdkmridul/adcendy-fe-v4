'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMarketingAuth } from '@/src/lib/auth/useAuth';

const MONO: React.CSSProperties = {
  fontFamily: '"Geist Mono", "Courier New", monospace',
};

const NAV_LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Deliverables', href: '#what-you-get' },
  { label: 'Compare', href: '#comparison' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQs', href: '#faq' },
];

export function IntelligenceStreamNav() {
  const { status } = useMarketingAuth();
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/auth/login');
    router.prefetch('/auth/signup');
  }, [router]);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-400"
      style={{
        background: 'rgba(8,8,7,0.92)',
        borderBottom: '1px solid rgba(237,232,220,0.07)',
        backdropFilter: 'blur(14px)',
      }}
    >
      <div
        className="max-w-none flex items-center justify-between"
        style={{ padding: '0 clamp(24px, 4vw, 64px)', height: '60px' }}
      >
        <Link
          href="/"
          className="inline-flex items-center"
          style={{
            textDecoration: 'none',
          }}
        >
          <Image
            src="/Adcendy-logo-tight.svg"
            alt="Adcendy"
            width={340}
            height={56}
            className="h-10 w-[340px]"
            style={{ transform: 'translateX(-162px) scaleX(1.28)', transformOrigin: 'left center' }}
            priority
          />
        </Link>

        <div className="hidden md:flex items-center" style={{ gap: '44px' }}>
          {NAV_LINKS.map(link => (
            <Link
              key={link.label}
              href={link.href}
              style={{
                ...MONO,
                fontSize: '10px',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.16em',
                color: 'rgba(237,232,220,0.42)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              className="hover:text-amber-300/70"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div>
          {status === 'authed' ? (
            <Link
              href="/app"
              style={{
                ...MONO,
                fontSize: '10px',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.16em',
                color: 'rgba(212,168,83,0.80)',
                border: '1px solid rgba(212,168,83,0.32)',
                padding: '6px 16px',
                borderRadius: '3px',
                textDecoration: 'none',
              }}
            >
              Dashboard -&gt;
            </Link>
          ) : (
            <Link
              href="/auth/login"
              style={{
                ...MONO,
                fontSize: '10px',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.16em',
                color: 'rgba(212,168,83,0.80)',
                border: '1px solid rgba(212,168,83,0.32)',
                padding: '6px 16px',
                borderRadius: '3px',
                textDecoration: 'none',
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
