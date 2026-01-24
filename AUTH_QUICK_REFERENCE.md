# Auth Implementation Quick Reference

## File Structure
```
src/lib/api/
  └── auth.ts                    # Auth API wrapper (OpenAPI types)
  
src/lib/
  └── auth-redirect.ts            # Redirect logic utilities

components/ui/
  └── otp-input.tsx               # Reusable OTP input component

app/(public)/auth/
  ├── signup/page.tsx             # 2-step signup with OTP
  ├── login/page.tsx              # Login with forgot link
  └── forgot-password/page.tsx    # Password reset flow
```

## Key Functions

### Auth API (`src/lib/api/auth.ts`)
```typescript
import { authApi } from '@/src/lib/api/auth';

// Signup Step 1: Request OTP
const result = await authApi.signupStart({ 
  email, password, name? 
});
// Returns: { verificationId, expiresAt }

// Signup Step 2: Verify OTP
const session = await authApi.signupVerify({ 
  verificationId, otp 
});
// Returns: { user, accessToken, refreshToken }

// Login
const session = await authApi.login({ 
  email, password 
});

// Forgot Password Step 1: Request reset OTP
const result = await authApi.forgotPassword({ 
  email 
});
// Returns: { resetId, expiresAt }

// Forgot Password Step 2: Reset password
const result = await authApi.resetPassword({ 
  resetId, otp, newPassword 
});
// Returns: { ok: true }
```

### Redirect Logic (`src/lib/auth-redirect.ts`)
```typescript
import { getAuthRedirectUrl } from '@/src/lib/auth-redirect';

// Calculate where to redirect after auth success
const redirectUrl = getAuthRedirectUrl(searchParams.get('next'));
router.replace(redirectUrl);

// Priority: next param > lastCampaignId > /app/campaigns
```

### OTP Input (`components/ui/otp-input.tsx`)
```tsx
import { OtpInput } from '@/components/ui/otp-input';

<OtpInput
  length={6}
  onChange={(otp) => setOtp(otp)}
  onComplete={(otp) => handleVerify(otp)}
  disabled={isLoading}
  error={!!error}
  autoFocus
/>
```

## Auth Success Flow

After any successful auth (signup, login):
```typescript
// 1. Store token
setToken(result.accessToken);

// 2. Store user
setUser(result.user);

// 3. Dispatch event (for reactive components)
window.dispatchEvent(new Event('auth-change'));

// 4. Redirect
const redirectUrl = getAuthRedirectUrl(nextParam);
router.replace(redirectUrl);
```

## Common Patterns

### Multi-Step Form State
```typescript
type Step = 'step1' | 'step2' | 'success';
const [step, setStep] = useState<Step>('step1');

// Store state between steps
const [formState, setFormState] = useState<StateType | null>(null);
```

### OTP Timer
```typescript
const [remainingTime, setRemainingTime] = useState<number | null>(null);

useEffect(() => {
  if (!expiresAt) return;

  const updateTimer = () => {
    const now = new Date().getTime();
    const expires = new Date(expiresAt).getTime();
    const remaining = Math.max(0, Math.floor((expires - now) / 1000));
    setRemainingTime(remaining);
    
    if (remaining === 0) {
      setError('OTP has expired');
    }
  };

  updateTimer();
  const interval = setInterval(updateTimer, 1000);
  return () => clearInterval(interval);
}, [expiresAt]);
```

### Error Clearing
```typescript
const handleInputChange = (e) => {
  setValue(e.target.value);
  if (error) setError(null); // Clear error on input
};
```

## OpenAPI Types Reference

All types come from `src/generated/openapi.ts`:
```typescript
import type { components } from '@/src/generated/openapi';

type SignupStartDto = components['schemas']['SignupStartDto'];
// { email: string, password: string, name?: string }

type SignupStartResponse = components['schemas']['SignupStartResponseDto'];
// { verificationId: string, expiresAt: string }

type SignupVerifyDto = components['schemas']['SignupVerifyDto'];
// { verificationId: string, otp: string }

type AuthSessionDto = components['schemas']['AuthSessionDto'];
// { user: AuthUserDto, accessToken: string, refreshToken: string }

type LoginDto = components['schemas']['LoginDto'];
// { email: string, password: string }

type ForgotPasswordDto = components['schemas']['ForgotPasswordDto'];
// { email: string }

type PasswordResetDto = components['schemas']['PasswordResetDto'];
// { resetId: string, otp: string, newPassword: string }
```

## API Response Structure

All endpoints return wrapped responses:
```typescript
{
  success: boolean;
  data: T;  // The actual data
  meta: {
    requestId: Record<string, never> | null;
    timestamp: string;
  };
}
```

The `authApi` automatically unwraps via `unwrapData()` helper.

## Error Handling

```typescript
try {
  const result = await authApi.someMethod(payload);
  // Handle success
} catch (err: any) {
  setError(err.message || 'Fallback error message');
  setIsLoading(false);
}
```

Errors are normalized by `api.execute()` to have consistent structure.

## Utility Functions

### Mask Email
```typescript
const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@');
  if (local.length <= 2) return email;
  return `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
};
// "test@example.com" → "t**t@example.com"
```

### Format Timer
```typescript
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
// 125 → "2:05"
```

## Testing Helpers

### Set Last Campaign ID
```typescript
localStorage.setItem('adcendy_last_campaign_id', 'campaign-123');
```

### Clear Auth State
```typescript
localStorage.removeItem('adcendy_token');
localStorage.removeItem('adcendy_user');
localStorage.removeItem('adcendy_last_campaign_id');
```

### Check Auth Event Dispatch
```typescript
window.addEventListener('auth-change', () => {
  console.log('Auth state changed');
});
```

## URLs

- Signup: `/auth/signup` or `/auth/signup?next=/some/path`
- Login: `/auth/login` or `/auth/login?next=/some/path`
- Forgot Password: `/auth/forgot-password`
- Landing: `/`

## Environment Variables

Uses existing config:
- `NEXT_PUBLIC_API_URL` - Backend base URL
- Backend endpoints are at `/v1/auth/*`

## Regenerate API Types

When backend OpenAPI spec changes:
```bash
pnpm run gen:api
```

This regenerates `src/generated/openapi.ts` from backend Swagger endpoint.
