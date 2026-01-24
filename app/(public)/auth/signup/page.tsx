'use client';

import React, { Suspense } from "react"

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { setToken, setUser } from '@/features/auth/auth';
import { authRepository } from '@/shared/api/repositories';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const incomingNext = searchParams.get('next');
  const planParam = searchParams.get('plan');
  const redirectTarget = incomingNext || '/app';
  const loginQuery = incomingNext ? `?next=${encodeURIComponent(incomingNext)}` : '';
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Call auth repository (automatically uses mock or real API based on env)
      const response = await authRepository.signup({
        email: formData.email,
        password: formData.password,
      });

      // Store token and user
      setToken(response.accessToken);
      setUser(response.user);

      // Store plan preference if provided
      if (planParam) {
        localStorage.setItem('adcendy_plan', planParam);
      }

      // Redirect to target
      router.push(redirectTarget);
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 space-y-6 border border-border bg-card">
        <div className="text-center space-y-2">
          <h1 className="font-space-grotesk text-2xl font-bold">Create Account</h1>
          <p className="text-sm text-muted-foreground">Join AdCendy today</p>
        </div>

        <form className="space-y-4" onSubmit={handleSignup}>
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
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href={`/auth/login${loginQuery}`} className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
}
