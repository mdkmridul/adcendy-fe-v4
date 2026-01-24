'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from './ThemeToggle';
import { CampaignSwitcher } from './CampaignSwitcher';
import { cn } from '@/lib/utils';
import { getUser } from '@/features/auth/auth';
import { getAccessibleRoutes } from '@/features/auth/rbac';
import { useRouter } from 'next/navigation';
import type { AuthUser } from '@/features/auth/types';

interface NavItem {
  href: string;
  label: string;
}

const allNavItems: NavItem[] = [
  { href: '/app/campaigns', label: 'Campaigns' },
  { href: '/app/strategy', label: 'Strategy' },
  { href: '/app/weekly', label: 'Weekly' },
  { href: '/app/intelligence', label: 'Intelligence' },
  { href: '/app/review', label: 'Review' },
  { href: '/app/admin', label: 'Admin' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessibleRoutes, setAccessibleRoutes] = useState<string[]>([]);
  const isCampaignPage = pathname.includes('/app/campaigns/');

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
    if (currentUser) {
      setAccessibleRoutes(getAccessibleRoutes(currentUser.role));
    }
  }, []);

  const visibleNavItems = allNavItems.filter(item =>
    accessibleRoutes.includes(item.href)
  );

  const handleLogout = () => {
    const { clearAuth } = require('@/features/auth/auth');
    clearAuth();
    router.push('/auth/login');
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            AC
          </div>
          <span className="font-space-grotesk font-semibold text-foreground">AdCendy</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {visibleNavItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? 'default' : 'ghost'}
                className="w-full justify-start"
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-border space-y-3">
          <div className="text-xs text-muted-foreground px-2">
            <p className="font-semibold">{user?.email}</p>
            <p className="text-xs">{user?.role}</p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleLogout}
            size="sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
          <ThemeToggle />
        </div>
      </aside>

      {/* Mobile Sidebar + Topbar */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              AC
            </div>
            <span className="font-space-grotesk font-semibold text-foreground">AdCendy</span>
            {isCampaignPage && <CampaignSwitcher />}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                    AC
                  </div>
                  <span className="font-space-grotesk font-semibold text-foreground">AdCendy</span>
                </div>
                <nav className="px-4 py-6 space-y-2">
                  {visibleNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Button
                        variant={pathname === item.href ? 'default' : 'ghost'}
                        className="w-full justify-start"
                      >
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </nav>
                <div className="absolute bottom-0 left-0 right-0 px-4 py-4 border-t border-border space-y-3">
                  <div className="text-xs text-muted-foreground px-2">
                    <p className="font-semibold">{user?.email}</p>
                    <p className="text-xs">{user?.role}</p>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={handleLogout}
                    size="sm"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Desktop Topbar with Campaign Switcher */}
        {isCampaignPage && (
          <header className="hidden md:flex items-center gap-4 px-6 py-3 border-b border-border bg-card">
            <CampaignSwitcher />
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
