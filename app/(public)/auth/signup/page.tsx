'use client';

import React from "react"

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { setToken, setUser } from '@/features/auth/auth';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMockSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock user creation with CLIENT role
    const mockToken = `mock.CLIENT.${Date.now()}`;
    const mockUser = {
      id: `user-${Date.now()}`,
      email: formData.email,
      name: formData.name,
      role: 'CLIENT' as const,
    };

    setToken(mockToken);
    setUser(mockUser);

    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 300));
    router.push('/app/campaigns');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 space-y-6 border border-border bg-card">
        <div className="text-center space-y-2">
          <h1 className="font-space-grotesk text-2xl font-bold">Create Account</h1>
          <p className="text-sm text-muted-foreground">Join AdCendy today</p>
        </div>

        <form className="space-y-4" onSubmit={handleMockSignup}>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

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
          <Link href="/auth/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}
