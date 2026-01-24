'use client';

import React, { Suspense } from "react"

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OtpInput } from '@/components/ui/otp-input';
import { setToken, setUser } from '@/features/auth/auth';
import { authApi } from '@/src/lib/api/auth';
import { getAuthRedirectUrl } from '@/src/lib/auth-redirect';
import { X, ArrowLeft, Mail, Clock } from 'lucide-react';

type SignupStep = 'credentials' | 'verify-otp';

interface VerificationState {
  verificationId: string;
  expiresAt: string;
  email: string;
  password: string;
  name?: string;
}

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const incomingNext = searchParams.get('next');
  const planParam = searchParams.get('plan');
  const loginQuery = incomingNext ? `?next=${encodeURIComponent(incomingNext)}` : '';
  
  const [step, setStep] = useState<SignupStep>('credentials');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [verificationState, setVerificationState] = useState<VerificationState | null>(null);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  // Timer for OTP expiration
  useEffect(() => {
    if (!verificationState?.expiresAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expires = new Date(verificationState.expiresAt).getTime();
      const remaining = Math.max(0, Math.floor((expires - now) / 1000));
      setRemainingTime(remaining);

      if (remaining === 0) {
        setError('OTP has expired. Please request a new one.');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [verificationState?.expiresAt]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleStartSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Start signup and request OTP
      const result = await authApi.signupStart({
        email: formData.email,
        password: formData.password,
        name: formData.name || undefined,
      });

      // Store verification state and move to OTP step
      setVerificationState({
        verificationId: result.verificationId,
        expiresAt: result.expiresAt,
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });
      setStep('verify-otp');
      setIsLoading(false);
    } catch (err: any) {
      console.error('Signup start error:', err);
      setError(err.message || 'Failed to start signup. Please try again.');
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (otpCode: string) => {
    if (!verificationState) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Step 2: Verify OTP and complete signup
      const result = await authApi.signupVerify({
        verificationId: verificationState.verificationId,
        otp: otpCode,
      });

      // Store token and user
      setToken(result.accessToken);
      setUser(result.user);

      // Store plan preference if provided
      if (planParam) {
        localStorage.setItem('adcendy_plan', planParam);
      }

      // Calculate redirect URL
      const redirectUrl = getAuthRedirectUrl(incomingNext);
      console.log('Signup successful, redirecting to:', redirectUrl);
      
      // Dispatch auth-change event for reactive components
      window.dispatchEvent(new Event('auth-change'));
      
      // Use replace to avoid back button issues
      router.replace(redirectUrl);
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Invalid OTP. Please try again.');
      setIsLoading(false);
      setOtp(''); // Clear OTP on error
    }
  };

  const handleResendOtp = async () => {
    if (!verificationState) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Resend OTP by calling start again with same credentials
      const result = await authApi.signupStart({
        email: verificationState.email,
        password: verificationState.password,
        name: verificationState.name || undefined,
      });

      // Update verification state with new ID and expiry
      setVerificationState({
        ...verificationState,
        verificationId: result.verificationId,
        expiresAt: result.expiresAt,
      });
      setOtp('');
      setIsLoading(false);
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      setError(err.message || 'Failed to resend OTP. Please try again.');
      setIsLoading(false);
    }
  };

  const handleBackToCredentials = () => {
    setStep('credentials');
    setVerificationState(null);
    setOtp('');
    setError(null);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const maskEmail = (email: string): string => {
    const [local, domain] = email.split('@');
    if (local.length <= 2) return email;
    return `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 space-y-6 border border-border bg-card relative">
        {/* Close button to go back to landing page */}
        <Link 
          href="/"
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back to home"
        >
          <X className="w-5 h-5" />
        </Link>

        {step === 'credentials' ? (
          <>
            <div className="text-center space-y-2">
              <h1 className="font-space-grotesk text-2xl font-bold">Create Account</h1>
              <p className="text-sm text-muted-foreground">Join AdCendy today</p>
            </div>

            <form className="space-y-4" onSubmit={handleStartSignup}>
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Name (optional)</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleInputChange}
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
                {isLoading ? 'Sending OTP...' : 'Continue'}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href={`/auth/login${loginQuery}`} className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <button
                onClick={handleBackToCredentials}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <div className="text-center space-y-2">
                <h1 className="font-space-grotesk text-2xl font-bold">Verify Your Email</h1>
                <p className="text-sm text-muted-foreground">
                  We've sent a 6-digit code to
                </p>
                <div className="flex items-center justify-center gap-2 text-sm font-medium">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  {verificationState && maskEmail(verificationState.email)}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-center block">Enter OTP Code</Label>
                <OtpInput
                  length={6}
                  onChange={setOtp}
                  onComplete={handleVerifyOtp}
                  disabled={isLoading || remainingTime === 0}
                  error={!!error}
                />
              </div>

              {remainingTime !== null && remainingTime > 0 && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Code expires in {formatTime(remainingTime)}</span>
                </div>
              )}

              {remainingTime === 0 && (
                <div className="text-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Sending...' : 'Resend OTP'}
                  </Button>
                </div>
              )}

              {remainingTime !== null && remainingTime > 0 && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-sm text-primary hover:underline disabled:opacity-50"
                  >
                    Didn't receive the code? Resend
                  </button>
                </div>
              )}

              {isLoading && otp.length === 6 && (
                <div className="text-center">
                  <Button type="button" className="w-full" disabled>
                    Verifying...
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
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
