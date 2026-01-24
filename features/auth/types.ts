export type Role = 'CLIENT' | 'REVIEWER' | 'ADMIN';

// Use OpenAPI generated AuthUserDto structure
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  createdAt: string; // ISO date string from API
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}
