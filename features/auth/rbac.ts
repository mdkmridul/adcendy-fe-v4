import type { Role, AuthUser } from './types';

export const ROLE_ORDER: readonly Role[] = ['CLIENT', 'REVIEWER', 'ADMIN'] as const;

/**
 * Check if a user's role has at least the required permission level
 * ADMIN >= REVIEWER >= CLIENT
 */
export function hasRoleAtLeast(userRole: Role, requiredRole: Role): boolean {
  const userIndex = ROLE_ORDER.indexOf(userRole);
  const requiredIndex = ROLE_ORDER.indexOf(requiredRole);
  return userIndex >= requiredIndex;
}

/**
 * Route access policies based on role
 */
export const routePolicies: Record<string, Role> = {
  '/app/campaigns': 'CLIENT',
  '/app/strategy': 'CLIENT',
  '/app/weekly': 'CLIENT',
  '/app/intelligence': 'CLIENT',
  '/app/admin': 'ADMIN',
  '/app/admin/jobs': 'ADMIN',
  '/app/admin/ai-usage': 'ADMIN',
  '/app/review': 'REVIEWER',
};

/**
 * Check if a user can access a specific path
 */
export function canAccessPath(user: AuthUser | null, path: string): boolean {
  if (!user) return false;

  // Exact match
  const requiredRole = routePolicies[path];
  if (requiredRole) {
    return hasRoleAtLeast(user.role, requiredRole);
  }

  // Check parent paths
  const segments = path.split('/');
  for (let i = segments.length; i > 0; i--) {
    const parentPath = segments.slice(0, i).join('/');
    const parentRequiredRole = routePolicies[parentPath];
    if (parentRequiredRole) {
      return hasRoleAtLeast(user.role, parentRequiredRole);
    }
  }

  return true; // Default allow if no policy found
}

/**
 * Get accessible routes for a given role
 */
export function getAccessibleRoutes(role: Role): string[] {
  return Object.entries(routePolicies)
    .filter(([_, requiredRole]) => hasRoleAtLeast(role, requiredRole))
    .map(([path]) => path);
}
