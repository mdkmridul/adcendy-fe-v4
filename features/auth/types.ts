export type Role = 'CLIENT' | 'REVIEWER' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}
