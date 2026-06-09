import type { Role, AuthUser } from './types';

export const ROLE_ORDER: readonly Role[] = ['CLIENT', 'REVIEWER', 'ADMIN'] as const;

const exactRolePathPolicies: Array<{ pattern: RegExp; exactRole: Role }> = [
  { pattern: /^\/admin(?:\/|$)/, exactRole: 'ADMIN' },
  { pattern: /^\/app\/campaigns(?:\/|$)/, exactRole: 'CLIENT' },
  { pattern: /^\/app\/checkout(?:\/|$)/, exactRole: 'CLIENT' },
  { pattern: /^\/app\/account(?:\/|$)/, exactRole: 'CLIENT' },
  { pattern: /^\/app\/strategy(?:\/|$)/, exactRole: 'CLIENT' },
  { pattern: /^\/app\/weekly(?:\/|$)/, exactRole: 'CLIENT' },
  { pattern: /^\/app\/intelligence(?:\/|$)/, exactRole: 'CLIENT' },
];

const routePatternPolicies: Array<{ pattern: RegExp; requiredRole: Role }> = [
  { pattern: /^\/admin\/campaigns\/[^/]+\/review(?:\/|$)/, requiredRole: 'ADMIN' },
];

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
  '/admin': 'ADMIN',
  '/admin/campaigns': 'ADMIN',
  '/admin/reviewers': 'ADMIN',
  '/admin/jobs': 'ADMIN',
  '/admin/ai': 'ADMIN',
  '/admin/health': 'ADMIN',
  '/admin/runs': 'ADMIN',
  '/app/campaigns': 'CLIENT',
  '/app/checkout': 'CLIENT',
  '/app/account': 'CLIENT',
  '/app/strategy': 'CLIENT',
  '/app/weekly': 'CLIENT',
  '/app/intelligence': 'CLIENT',
  '/app/admin': 'ADMIN',
  '/app/admin/campaigns': 'ADMIN',
  '/app/admin/reviewers': 'ADMIN',
  '/app/admin/jobs': 'ADMIN',
  '/app/admin/ai': 'ADMIN',
  '/app/admin/ai-usage': 'ADMIN',
  '/app/admin/health': 'ADMIN',
  '/app/admin/runs': 'ADMIN',
  '/app/reviewer': 'REVIEWER',
  '/app/reviewer/strategy-reviews': 'REVIEWER',
  '/app/reviewer/tasks': 'REVIEWER',
  '/app/reviewer/section-reviews': 'REVIEWER',
  '/app/reviewer/runs': 'REVIEWER',
  '/app/reviewer/campaigns': 'REVIEWER',
  '/app/review': 'REVIEWER',
};

export function getRequiredRoleForPath(path: string): Role | null {
  for (const policy of routePatternPolicies) {
    if (policy.pattern.test(path)) {
      return policy.requiredRole;
    }
  }

  const requiredRole = routePolicies[path];
  if (requiredRole) {
    return requiredRole;
  }

  const segments = path.split('/');
  for (let i = segments.length; i > 0; i--) {
    const parentPath = segments.slice(0, i).join('/');
    const parentRequiredRole = routePolicies[parentPath];
    if (parentRequiredRole) {
      return parentRequiredRole;
    }
  }

  return null;
}

/**
 * Check if a user can access a specific path
 */
export function canAccessPath(user: AuthUser | null, path: string): boolean {
  if (!user) return false;

  for (const policy of exactRolePathPolicies) {
    if (policy.pattern.test(path)) {
      return user.role === policy.exactRole;
    }
  }

  const requiredRole = getRequiredRoleForPath(path);
  return requiredRole ? hasRoleAtLeast(user.role, requiredRole) : true;
}

/**
 * Get accessible routes for a given role
 */
export function getAccessibleRoutes(role: Role): string[] {
  return Object.entries(routePolicies)
    .filter(([path, requiredRole]) => {
      for (const policy of exactRolePathPolicies) {
        if (policy.pattern.test(path)) {
          return role === policy.exactRole;
        }
      }

      return hasRoleAtLeast(role, requiredRole);
    })
    .map(([path]) => path);
}
