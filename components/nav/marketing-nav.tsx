'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMarketingAuth } from '@/src/lib/auth/useAuth';

const ANCHOR_LINKS = [
  { label: 'How it works', href: '#how' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

function MarketingNavContent() {
  const pathname = usePathname() ?? '/';
  const searchParams = useSearchParams();
  const { status, user, logout } = useMarketingAuth();
  const [mounted, setMounted] = useState(false);
  const isAuthed = status === 'authed';

  // Prevent hydration mismatch by only using searchParams after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const queryString = mounted ? searchParams?.toString() : '';
  const currentPath = `${pathname}${queryString ? `?${queryString}` : ''}`;
  const nextParam = encodeURIComponent(currentPath || '/');

  const loginHref = `/auth/login?next=${nextParam}`;
  const signupHref = `/auth/signup?next=${nextParam}`;

  return (
    <nav className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
          AdCendy
        </Link>

        <div className="hidden items-center gap-6 text-sm font-semibold text-muted-foreground md:flex">
          {ANCHOR_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {!isAuthed ? (
            <>
              <Link href={loginHref}>
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href={signupHref}>
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/app">
                <Button size="sm">Go to app</Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="px-3">
                    {user?.name ?? user?.email ?? 'Account'}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/app">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export function MarketingNav() {
  return (
    <Suspense fallback={
      <nav className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
            AdCendy
          </Link>
        </div>
      </nav>
    }>
      <MarketingNavContent />
    </Suspense>
  );
}
