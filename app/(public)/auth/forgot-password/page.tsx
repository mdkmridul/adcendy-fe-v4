'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OtpInput } from '@/components/ui/otp-input';
import { authApi } from '@/src/lib/api/auth';
import { X, ArrowLeft, Mail, Clock, CheckCircle2 } from 'lucide-react';

type ResetStep = 'request' | 'verify' | 'success';

interface ResetState {
  resetId: string;
  expiresAt: string;
  email: string;
}

function ForgotPasswordContent() {
  const router = useRouter();
  
  const [step, setStep] = useState<ResetStep>('request');
  const [email, setEmail] = useState('');
  const [resetState, setResetState] = useState<ResetState | null>(null);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const resettingRef = useRef(false); // Prevent duplicate API calls

  // Timer for OTP expiration
  useEffect(() => {
    if (!resetState?.expiresAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expires = new Date(resetState.expiresAt).getTime();
      const remaining = Math.max(0, Math.floor((expires - now) / 1000));
      setRemainingTime(remaining);

      if (remaining === 0) {
        setError('OTP has expired. Please request a new one.');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [resetState?.expiresAt]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Request password reset OTP
      const result = await authApi.forgotPassword({ email });

      // Store reset state and move to verification step
      setResetState({
        resetId: result.resetId,
        expiresAt: result.expiresAt,
        email,
      });
      setStep('verify');
      setIsLoading(false);
    } catch (err: any) {
      console.error('Password reset request error:', err);
      // Extract the actual error message from the ApiErrorResponse
      const errorMessage = err?.message || 'Failed to send reset code. Please try again.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetState) return;
    
    // Prevent duplicate submissions
    if (resettingRef.current) {
      console.log('Already resetting password, skipping duplicate call');
      return;
    }
    
    // Validate password match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    // Validate OTP
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    resettingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      // Step 2: Reset password with OTP
      await authApi.resetPassword({
        resetId: resetState.resetId,
        otp,
        newPassword,
      });

      // Clear error and move to success step
      setError(null);
      setIsLoading(false);
      setStep('success');
    } catch (err: any) {
      console.error('Password reset error:', err);
      // Extract the actual error message from the ApiErrorResponse
      const errorMessage = err?.message || 'Failed to reset password. Please try again.';
      setError(errorMessage);
      setIsLoading(false);
      resettingRef.current = false; // Reset on error to allow retry
    }
  };

  const handleResendOtp = async () => {
    if (!resetState) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Resend OTP by requesting reset again
      const result = await authApi.forgotPassword({ email: resetState.email });

      // Update reset state with new ID and expiry
      setResetState({
        ...resetState,
        resetId: result.resetId,
        expiresAt: result.expiresAt,
      });
      setOtp('');
      setIsLoading(false);
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      // Extract the actual error message from the ApiErrorResponse
      const errorMessage = err?.message || 'Failed to resend OTP. Please try again.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleBackToRequest = () => {
    setStep('request');
    setResetState(null);
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    resettingRef.current = false; // Reset ref
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

        {step === 'request' && (
          <>
            <div className="text-center space-y-2">
              <h1 className="font-space-grotesk text-2xl font-bold">Reset Password</h1>
              <p className="text-sm text-muted-foreground">
                Enter your email to receive a reset code
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleRequestReset}>
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
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending Code...' : 'Send Reset Code'}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              Remember your password?{' '}
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </>
        )}

        {step === 'verify' && (
          <>
            <div className="space-y-4">
              <button
                onClick={handleBackToRequest}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <div className="text-center space-y-2">
                <h1 className="font-space-grotesk text-2xl font-bold">Reset Your Password</h1>
                <p className="text-sm text-muted-foreground">
                  We've sent a 6-digit code to
                </p>
                <div className="flex items-center justify-center gap-2 text-sm font-medium">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  {resetState && maskEmail(resetState.email)}
                </div>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleResetPassword}>
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

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  required
                  minLength={8}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  required
                  minLength={8}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || remainingTime === 0 || otp.length !== 6}
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </Button>

              {remainingTime === 0 ? (
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
              ) : (
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
            </form>
          </>
        )}

        {step === 'success' && (
          <>
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h1 className="font-space-grotesk text-2xl font-bold">Password Reset Successful</h1>
                <p className="text-sm text-muted-foreground">
                  Your password has been successfully reset. You can now sign in with your new password.
                </p>
              </div>
            </div>

            <Button 
              onClick={() => router.push('/auth/login')}
              className="w-full"
            >
              Continue to Sign In
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    }>
      <ForgotPasswordContent />
    </Suspense>
  );
}
