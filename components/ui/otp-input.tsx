/**
 * OTP Input Component
 * 
 * A reusable component for entering OTP codes with auto-advance functionality.
 * Features:
 * - 6-digit numeric input
 * - Auto-advance to next field on digit entry
 * - Auto-backspace on delete
 * - Paste support (entire OTP code)
 * - Accessible with proper labeling
 */

'use client';

import React, { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface OtpInputProps {
  /** Number of digits in the OTP (default: 6) */
  length?: number;
  /** Callback when OTP is complete */
  onComplete?: (otp: string) => void;
  /** Callback on every change */
  onChange?: (otp: string) => void;
  /** Disable input */
  disabled?: boolean;
  /** Error state */
  error?: boolean;
  /** Auto-focus first input on mount */
  autoFocus?: boolean;
  /** Class name for container */
  className?: string;
}

export function OtpInput({
  length = 6,
  onComplete,
  onChange,
  disabled = false,
  error = false,
  autoFocus = true,
  className,
}: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  // Notify parent of changes
  useEffect(() => {
    const otpValue = otp.join('');
    onChange?.(otpValue);
    
    if (otpValue.length === length) {
      onComplete?.(otpValue);
    }
  }, [otp, length, onChange, onComplete]);

  const handleChange = (index: number, value: string) => {
    // Only allow numeric input
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (numericValue.length === 0) {
      // Handle delete
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    // Handle single digit
    if (numericValue.length === 1) {
      const newOtp = [...otp];
      newOtp[index] = numericValue;
      setOtp(newOtp);
      
      // Auto-advance to next field
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
      return;
    }

    // Handle paste of multiple digits
    if (numericValue.length > 1) {
      handlePaste(numericValue, index);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (otp[index] === '') {
        // Move to previous field if current is empty
        if (index > 0) {
          inputRefs.current[index - 1]?.focus();
        }
      } else {
        // Clear current field
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (pastedData: string, startIndex: number = 0) => {
    const numericData = pastedData.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    
    // Fill from start index
    for (let i = 0; i < numericData.length && startIndex + i < length; i++) {
      newOtp[startIndex + i] = numericData[i];
    }
    
    setOtp(newOtp);
    
    // Focus last filled input or last input
    const lastFilledIndex = Math.min(startIndex + numericData.length, length - 1);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const handlePasteEvent = (e: ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    handlePaste(pastedData, index);
  };

  return (
    <div className={cn('flex gap-2 justify-center', className)}>
      {otp.map((digit, index) => (
        <Input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={(e) => handlePasteEvent(e, index)}
          disabled={disabled}
          className={cn(
            'w-12 h-12 text-center text-lg font-semibold',
            error && 'border-red-500 focus-visible:ring-red-500'
          )}
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </div>
  );
}
