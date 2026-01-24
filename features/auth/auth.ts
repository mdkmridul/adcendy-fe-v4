/**
 * Authentication Token Management
 * 
 * Centralized authentication token and user session handling.
 * Uses localStorage for token persistence (client-side only).
 * 
 * For production, consider:
 * - HttpOnly cookies for enhanced security
 * - Token refresh mechanism
 * - Secure token storage (e.g., encrypted storage)
 */

// Storage keys for auth data
const TOKEN_KEY = 'adcendy_token';
const USER_KEY = 'adcendy_user';

import type { AuthUser } from './types';

/**
 * Get the current authentication token
 * @returns JWT token string or null if not authenticated
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Store authentication token
 * @param token - JWT token to store
 */
export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove authentication token
 */
export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Get the current authenticated user
 * @returns User object or null if not authenticated
 */
export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Store authenticated user data
 * @param user - User object to store
 */
export function setUser(user: AuthUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Remove authenticated user data
 */
export function clearUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_KEY);
}

/**
 * Clear all authentication data (token + user)
 * Use this for logout functionality
 */
export function clearAuth(): void {
  clearToken();
  clearUser();
}

/**
 * Check if user is currently authenticated
 * @returns true if both token and user data exist
 */
export function isAuthenticated(): boolean {
  return !!getToken() && !!getUser();
}

/**
 * Set authentication data from login/signup response
 * @param token - JWT token
 * @param user - User object
 */
export function setAuth(token: string, user: AuthUser): void {
  setToken(token);
  setUser(user);
}

