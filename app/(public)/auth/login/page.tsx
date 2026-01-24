'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { setToken, setUser } from '@/features/auth/auth';
import type { Role } from '@/features/auth/types';
import Loading from './loading';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next');
  const redirectTarget = nextParam || '/app';
  const signupQuery = nextParam ? `?next=${encodeURIComponent(nextParam)}` : '';
  const [isLoading, setIsLoading] = useState(false);

  const handleMockLogin = async (role: Role) => {
    setIsLoading(true);
    
    // Mock token generation
    const mockToken = `mock.${role}.${Date.now()}`;
    const mockUser = {
      id: `user-${Date.now()}`,
      email: `${role.toLowerCase()}@adcendy.com`,
      name: role === 'CLIENT' ? 'Demo User' : role === 'REVIEWER' ? 'Reviewer' : 'Administrator',
      role,
    };

    setToken(mockToken);
    setUser(mockUser);
    
    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 300));
    router.push(redirectTarget);
  };

  return (
    <Card className="w-full max-w-md p-8 space-y-6 border border-border bg-card">
      <div className="text-center space-y-2">
        <h1 className="font-space-grotesk text-2xl font-bold">Welcome to AdCendy</h1>
        <p className="text-sm text-muted-foreground">Sign in to your account</p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleMockLogin('CLIENT');
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="your@email.com" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="••••••••" required />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In as Client'}
        </Button>
      </form>

      <div className="space-y-2 border-t border-border pt-4">
        <p className="text-xs text-muted-foreground text-center font-semibold">
          Quick access for testing:
        </p>
        <Button
          type="button"
          variant="outline"
          className="w-full text-sm bg-transparent"
          onClick={() => handleMockLogin('REVIEWER')}
          disabled={isLoading}
        >
          Sign In as Reviewer
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full text-sm bg-transparent"
          onClick={() => handleMockLogin('ADMIN')}
          disabled={isLoading}
        >
          Sign In as Admin
        </Button>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link href={`/auth/signup${signupQuery}`} className="text-primary hover:underline">
          Sign up
        </Link>
      </div>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <Suspense fallback={<Loading />}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
