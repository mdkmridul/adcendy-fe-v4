'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from './ThemeToggle';
import { clearAuth, getUser } from '@/features/auth/auth';
import { hasRoleAtLeast } from '@/features/auth/rbac';
import type { AuthUser, Role } from '@/features/auth/types';
import { authRepository } from '@/shared/api/repositories';

interface NavItem {
  href: string;
  label: string;
  minimumRole: Role;
  visibleFor?: Role[];
}

const allNavItems: NavItem[] = [
  { href: '/app/reviewer/strategy-reviews', label: 'Reviewer Inbox', minimumRole: 'REVIEWER', visibleFor: ['REVIEWER'] },
  { href: '/admin', label: 'Admin', minimumRole: 'ADMIN', visibleFor: ['ADMIN'] },
  { href: '/admin/campaigns', label: 'Admin Campaigns', minimumRole: 'ADMIN', visibleFor: ['ADMIN'] },
  { href: '/admin/reviewers', label: 'Reviewers', minimumRole: 'ADMIN', visibleFor: ['ADMIN'] },
  { href: '/admin/jobs', label: 'Jobs', minimumRole: 'ADMIN', visibleFor: ['ADMIN'] },
  { href: '/admin/ai', label: 'AI', minimumRole: 'ADMIN', visibleFor: ['ADMIN'] },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(() => getUser());
  const isClientShell = user?.role === 'CLIENT';

  useEffect(() => {
    const syncUser = () => {
      setUser(getUser());
    };

    syncUser();
    window.addEventListener('auth-change', syncUser);
    window.addEventListener('storage', syncUser);

    return () => {
      window.removeEventListener('auth-change', syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, []);

  const visibleNavItems = useMemo(() => {
    if (!user) {
      return [];
    }

    return allNavItems.filter((item) => {
      if (!hasRoleAtLeast(user.role, item.minimumRole)) {
        return false;
      }

      if (item.visibleFor && !item.visibleFor.includes(user.role)) {
        return false;
      }

      return true;
    });
  }, [user]);

  const handleLogout = async () => {
    try {
      await authRepository.logout();
    } catch {
      // Local session should still be cleared if the backend logout call fails.
    }

    clearAuth();
    router.push('/auth/login');
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  if (isClientShell) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="border-b border-border bg-card/95">
          <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <Link
                href="/app/campaigns"
                className="inline-flex items-center"
              >
                <Image
                  src="/Adcendy-logo-tight.svg"
                  alt="Adcendy"
                  width={340}
                  height={56}
                  className="h-10 w-[340px]"
                  style={{ transform: 'translateX(-46px) scaleX(1.22)', transformOrigin: 'left center' }}
                  priority
                />
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right text-xs text-muted-foreground md:block">
                <p className="font-semibold">{user?.email}</p>
                <p>{user?.role}</p>
              </div>
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-background">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <aside className="hidden w-64 flex-col border-r border-border bg-card md:flex">
        <div className="flex items-center gap-2 border-b border-border px-6 py-4">
          <Image
            src="/Adcendy-logo-tight.svg"
            alt="Adcendy"
            width={300}
            height={50}
            className="h-9 w-[300px]"
            style={{ transform: 'translateX(-40px) scaleX(1.2)', transformOrigin: 'left center' }}
            priority
          />
        </div>
        <nav className="flex-1 space-y-2 px-4 py-6">
          {visibleNavItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button variant={isActive(item.href) ? 'default' : 'ghost'} className="w-full justify-start">
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
        <div className="space-y-3 border-t border-border px-4 py-4">
          <div className="flex items-start justify-between gap-2 px-2">
            <div className="text-xs text-muted-foreground">
              <p className="font-semibold">{user?.email}</p>
              <p className="text-xs">{user?.role}</p>
            </div>
            <ThemeToggle />
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleLogout}
            size="sm"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
          <div className="flex flex-1 items-center gap-2">
            <Image
              src="/Adcendy-logo-tight.svg"
              alt="Adcendy"
              width={260}
              height={44}
              className="h-8 w-[260px]"
              style={{ transform: 'translateX(-36px) scaleX(1.18)', transformOrigin: 'left center' }}
              priority
            />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex items-center gap-2 border-b border-border px-6 py-4">
                  <Image
                    src="/Adcendy-logo-tight.svg"
                    alt="Adcendy"
                    width={300}
                    height={50}
                    className="h-9 w-[300px]"
                    style={{ transform: 'translateX(-40px) scaleX(1.2)', transformOrigin: 'left center' }}
                    priority
                  />
                </div>
                <nav className="space-y-2 px-4 py-6">
                  {visibleNavItems.map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
                      <Button
                        variant={isActive(item.href) ? 'default' : 'ghost'}
                        className="w-full justify-start"
                      >
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </nav>
                <div className="absolute bottom-0 left-0 right-0 space-y-3 border-t border-border px-4 py-4">
                  <div className="px-2 text-xs text-muted-foreground">
                    <p className="font-semibold">{user?.email}</p>
                    <p className="text-xs">{user?.role}</p>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={handleLogout}
                    size="sm"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-background">{children}</main>
      </div>
    </div>
  );
}
