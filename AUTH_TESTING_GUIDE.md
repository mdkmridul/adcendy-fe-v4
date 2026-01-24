# Auth Flows Testing Guide

This document provides manual testing steps for the newly implemented authentication flows in AdCendy.

## Prerequisites

- Backend server running on http://localhost:3001
- Frontend server running on http://localhost:3000
- Backend must have the following endpoints implemented:
  - POST /v1/auth/signup/start
  - POST /v1/auth/signup/verify
  - POST /v1/auth/login
  - POST /v1/auth/password/forgot
  - POST /v1/auth/password/reset

## Test Scenarios

### 1. Two-Step Signup Flow with OTP Verification

#### Scenario 1.1: Successful Signup
**Steps:**
1. Navigate to http://localhost:3000/auth/signup
2. Fill in the signup form:
   - Name: "Test User" (optional)
   - Email: "test@example.com"
   - Password: "SecurePass123"
3. Click "Continue"
4. **Expected:** OTP verification screen appears with:
   - Masked email (e.g., "t***t@example.com")
   - 6-digit OTP input fields
   - Timer showing expiration countdown
   - "Resend OTP" button
5. Check email for 6-digit OTP code
6. Enter the OTP code (fields should auto-advance)
7. **Expected:** Automatically verifies when all 6 digits entered
8. **Expected:** Redirects to:
   - `/app/campaigns` (if no next param or lastCampaignId)
   - The URL specified in `?next=` parameter (if provided)
   - `/app/campaigns/{id}/overview` (if lastCampaignId exists)
9. **Expected:** User is logged in (check token in localStorage)

#### Scenario 1.2: Invalid OTP
**Steps:**
1. Follow steps 1-4 from Scenario 1.1
2. Enter incorrect OTP: "123456"
3. **Expected:** Error message appears: "Invalid OTP. Please try again."
4. **Expected:** OTP fields are cleared
5. **Expected:** User remains on OTP verification screen

#### Scenario 1.3: Expired OTP
**Steps:**
1. Follow steps 1-4 from Scenario 1.1
2. Wait for timer to reach 0:00
3. **Expected:** Error message: "OTP has expired. Please request a new one."
4. **Expected:** OTP input is disabled
5. **Expected:** "Resend OTP" button is enabled
6. Click "Resend OTP"
7. **Expected:** New OTP is sent
8. **Expected:** Timer resets
9. **Expected:** OTP input is re-enabled

#### Scenario 1.4: Email Already Exists
**Steps:**
1. Navigate to http://localhost:3000/auth/signup
2. Enter email that already exists in database
3. Click "Continue"
4. **Expected:** Error message: "Email already registered" or similar
5. **Expected:** User remains on credentials step

#### Scenario 1.5: Back Button
**Steps:**
1. Follow steps 1-4 from Scenario 1.1
2. Click "Back" button
3. **Expected:** Returns to credentials entry screen
4. **Expected:** Form data is preserved (email, password, name)

#### Scenario 1.6: Close Button
**Steps:**
1. Navigate to http://localhost:3000/auth/signup
2. Click "X" button in top-right corner
3. **Expected:** Redirects to landing page (/)

---

### 2. Login Flow

#### Scenario 2.1: Successful Login
**Steps:**
1. Navigate to http://localhost:3000/auth/login
2. Enter valid credentials:
   - Email: "existing@example.com"
   - Password: "CorrectPassword"
3. Click "Sign In"
4. **Expected:** Redirects based on priority:
   - `?next=` parameter > lastCampaignId > `/app/campaigns`
5. **Expected:** User is logged in (token stored)
6. **Expected:** auth-change event is dispatched

#### Scenario 2.2: Invalid Credentials
**Steps:**
1. Navigate to http://localhost:3000/auth/login
2. Enter invalid credentials
3. Click "Sign In"
4. **Expected:** Error message: "Invalid email or password"
5. **Expected:** User remains on login page
6. **Expected:** Password field is cleared (or not - check UX preference)

#### Scenario 2.3: Forgot Password Link
**Steps:**
1. Navigate to http://localhost:3000/auth/login
2. Locate "Forgot password?" link next to Password label
3. Click the link
4. **Expected:** Navigates to /auth/forgot-password

---

### 3. Forgot Password Flow

#### Scenario 3.1: Complete Reset Flow
**Steps:**
1. Navigate to http://localhost:3000/auth/forgot-password
2. Enter email: "reset@example.com"
3. Click "Send Reset Code"
4. **Expected:** OTP verification screen appears with:
   - Masked email
   - 6-digit OTP input
   - Password fields (New Password, Confirm Password)
   - Timer
5. Check email for OTP code
6. Enter OTP code
7. Enter new password: "NewSecurePass123"
8. Confirm password: "NewSecurePass123"
9. Click "Reset Password"
10. **Expected:** Success screen appears with:
    - Green checkmark icon
    - "Password Reset Successful" message
    - "Continue to Sign In" button
11. Click "Continue to Sign In"
12. **Expected:** Redirects to /auth/login

#### Scenario 3.2: Password Mismatch
**Steps:**
1. Follow steps 1-6 from Scenario 3.1
2. Enter new password: "Password123"
3. Enter confirm password: "DifferentPass123"
4. Click "Reset Password"
5. **Expected:** Error: "Passwords do not match"
6. **Expected:** User remains on reset screen

#### Scenario 3.3: Short Password
**Steps:**
1. Follow steps 1-6 from Scenario 3.1
2. Enter new password: "short"
3. Enter confirm password: "short"
4. Click "Reset Password"
5. **Expected:** Error: "Password must be at least 8 characters"

#### Scenario 3.4: Invalid Email
**Steps:**
1. Navigate to http://localhost:3000/auth/forgot-password
2. Enter email that doesn't exist: "nonexistent@example.com"
3. Click "Send Reset Code"
4. **Expected:** Either:
   - Error message (if backend validates)
   - OR Success message (security best practice - don't reveal user existence)

#### Scenario 3.5: Expired Reset OTP
**Steps:**
1. Follow steps 1-5 from Scenario 3.1
2. Wait for timer to reach 0:00
3. **Expected:** Error: "OTP has expired. Please request a new one."
4. **Expected:** "Resend OTP" button appears
5. Click "Resend OTP"
6. **Expected:** New OTP sent, timer resets

---

### 4. Redirect Logic

#### Scenario 4.1: Redirect with Next Parameter
**Steps:**
1. Navigate to http://localhost:3000/auth/login?next=/app/campaigns/test-id/wizard
2. Login successfully
3. **Expected:** Redirects to /app/campaigns/test-id/wizard

#### Scenario 4.2: Redirect with Last Campaign ID
**Steps:**
1. Open browser console
2. Set lastCampaignId: `localStorage.setItem('adcendy_last_campaign_id', 'campaign-123')`
3. Navigate to http://localhost:3000/auth/login (no next param)
4. Login successfully
5. **Expected:** Redirects to /app/campaigns/campaign-123/overview

#### Scenario 4.3: Default Redirect
**Steps:**
1. Open browser console
2. Clear lastCampaignId: `localStorage.removeItem('adcendy_last_campaign_id')`
3. Navigate to http://localhost:3000/auth/login (no next param)
4. Login successfully
5. **Expected:** Redirects to /app/campaigns

#### Scenario 4.4: Signup with Plan Parameter
**Steps:**
1. Navigate to http://localhost:3000/auth/signup?plan=premium
2. Complete signup flow
3. **Expected:** After signup, check localStorage:
   - `localStorage.getItem('adcendy_plan')` should be "premium"

---

### 5. OTP Input Component Behavior

#### Scenario 5.1: Auto-Advance
**Steps:**
1. Navigate to any OTP screen (signup or password reset)
2. Click on first input field
3. Type "1"
4. **Expected:** Focus automatically moves to second field
5. Continue typing "234567"
6. **Expected:** All fields filled, focus on last field

#### Scenario 5.2: Backspace Navigation
**Steps:**
1. Navigate to any OTP screen
2. Fill all 6 digits
3. Press Backspace
4. **Expected:** Current digit is cleared
5. Press Backspace again
6. **Expected:** Focus moves to previous field

#### Scenario 5.3: Paste OTP Code
**Steps:**
1. Navigate to any OTP screen
2. Copy OTP code to clipboard: "123456"
3. Click on first input field
4. Paste (Ctrl+V / Cmd+V)
5. **Expected:** All 6 fields are filled with "123456"
6. **Expected:** Focus moves to last field

#### Scenario 5.4: Arrow Key Navigation
**Steps:**
1. Navigate to any OTP screen
2. Click on third input field
3. Press Left Arrow key
4. **Expected:** Focus moves to second field
5. Press Right Arrow key twice
6. **Expected:** Focus moves to fourth field

---

### 6. Error Handling

#### Scenario 6.1: Network Error
**Steps:**
1. Stop backend server
2. Try to signup/login/reset password
3. **Expected:** User-friendly error message displayed
4. **Expected:** Form remains accessible for retry

#### Scenario 6.2: Invalid Response
**Steps:**
1. If possible, configure backend to return malformed response
2. Try any auth action
3. **Expected:** Graceful error handling (no crash)
4. **Expected:** Error message displayed

---

### 7. UI/UX Checks

#### Scenario 7.1: Loading States
**Steps:**
1. Perform any auth action (signup, login, reset)
2. **Expected:** Button shows loading text:
   - "Sending OTP..." / "Verifying..." / "Signing in..."
3. **Expected:** Button is disabled during loading
4. **Expected:** Form inputs remain accessible for visual reference

#### Scenario 7.2: Error Clearing
**Steps:**
1. Trigger any error (invalid credentials, etc.)
2. Start typing in any input field
3. **Expected:** Error message disappears

#### Scenario 7.3: Responsive Design
**Steps:**
1. Test all auth pages on different screen sizes:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1440px)
2. **Expected:** All layouts are readable and functional
3. **Expected:** OTP inputs are appropriately sized
4. **Expected:** Buttons are easily clickable on mobile

#### Scenario 7.4: Dark Mode
**Steps:**
1. Toggle dark mode (if implemented)
2. Navigate through all auth pages
3. **Expected:** All colors have proper contrast
4. **Expected:** Error messages are readable
5. **Expected:** Focus states are visible

---

## Edge Cases

### Edge Case 1: Multiple Browser Tabs
**Steps:**
1. Open signup in two browser tabs
2. Complete step 1 in both tabs
3. Verify OTP in first tab
4. Try to verify same OTP in second tab
5. **Expected:** Second tab shows "Invalid OTP" or "Already used"

### Edge Case 2: Browser Back Button
**Steps:**
1. Complete signup/login
2. Press browser back button
3. **Expected:** Should not allow access to auth page if already logged in
4. **Expected:** Should redirect to app

### Edge Case 3: Direct URL Access
**Steps:**
1. Try navigating directly to http://localhost:3000/auth/signup (step 2) without step 1
2. **Expected:** Redirected back to step 1 or handled gracefully

---

## API Error Codes to Test

If backend returns specific error codes, test these scenarios:

- `USER_ALREADY_EXISTS` - Email already registered
- `INVALID_CREDENTIALS` - Wrong email/password
- `INVALID_OTP` - Wrong OTP code
- `OTP_EXPIRED` - Expired verification code
- `TOO_MANY_ATTEMPTS` - Rate limiting
- `WEAK_PASSWORD` - Password doesn't meet requirements

---

## Accessibility Testing

### Keyboard Navigation
1. Navigate entire signup flow using only Tab/Shift+Tab/Enter
2. **Expected:** All interactive elements are reachable
3. **Expected:** Focus indicators are visible
4. **Expected:** Logical tab order

### Screen Reader
1. Test with screen reader (NVDA, JAWS, VoiceOver)
2. **Expected:** All form labels are announced
3. **Expected:** Error messages are announced
4. **Expected:** OTP fields have meaningful labels ("OTP digit 1", etc.)

---

## Performance Testing

1. **OTP Timer Accuracy:** Timer should count down smoothly without jumps
2. **Auto-Advance Speed:** Should be immediate, no noticeable lag
3. **API Response Time:** Loading states should appear for requests >300ms

---

## Cleanup After Testing

1. Check localStorage for test artifacts:
   - `adcendy_token`
   - `adcendy_user`
   - `adcendy_plan`
   - `adcendy_last_campaign_id`
2. Remove test user accounts from database if needed
3. Clear browser storage between test runs for consistency

---

## Known Limitations

- OTP codes expire after X minutes (check backend config)
- Maximum OTP resend attempts may be limited (check backend)
- Password reset tokens are single-use
- Mock login shortcuts only available in development mode

---

## Troubleshooting

### Issue: OTP not being sent
- Check backend logs for email service errors
- Verify email configuration in backend
- Check spam/junk folder

### Issue: Redirects not working
- Check browser console for JavaScript errors
- Verify localStorage permissions
- Check for conflicting route guards

### Issue: Token not persisting
- Check localStorage quota
- Verify browser settings allow localStorage
- Check for conflicting extensions

### Issue: TypeScript errors
- Run `pnpm run dev` to check for compile errors
- Check that openapi.ts is up to date: `pnpm run gen:api`
