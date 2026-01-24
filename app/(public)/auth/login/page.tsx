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
import { authRepository } from '@/shared/api/repositories';
import Loading from './loading';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next');
  const redirectTarget = nextParam || '/app';
  const signupQuery = nextParam ? `?next=${encodeURIComponent(nextParam)}` : '';
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Call auth repository (automatically uses mock or real API based on env)
      const response = await authRepository.login({
        email: formData.email,
        password: formData.password,
      });

      // Store token and user
      setToken(response.accessToken);
      setUser(response.user);

      // Redirect to target
      router.push(redirectTarget);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
      setIsLoading(false);
    }
  };

  const handleMockLogin = async (role: Role) => {
    setIsLoading(true);
    setError(null);
    
    // Mock token generation
    const mockToken = `mock.${role}.${Date.now()}`;
    const mockUser = {
      id: `user-${Date.now()}`,
      email: `${role.toLowerCase()}@adcendy.com`,
      role,
      createdAt: new Date().toISOString(),
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
        onSubmit={handleLogin}
      >
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            name="email"
            type="email" 
            placeholder="your@email.com" 
            value={formData.email}
            onChange={handleInputChange}
            required 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            name="password"
            type="password" 
            placeholder="••••••••" 
            value={formData.password}
            onChange={handleInputChange}
            required 
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="space-y-2 border-t border-border pt-4">
        <p className="text-xs text-muted-foreground text-center font-semibold">
          Quick access for testing (Mock Mode):
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
