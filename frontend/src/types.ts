export type UserRole = 'USER' | 'ADMIN';

export interface AuthUser {
  id: string;
  role: UserRole;
}

export interface AuthResponse {
  token?: string;
  error?: string;
}

export interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => void;
}

export interface ApiErrorResponse {
  error: string;
}

export interface Sweet {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  createdAt: string;
}

export type SweetFormPayload = Pick<Sweet, 'name' | 'category' | 'price' | 'quantity'>;

export interface SweetSearchParams {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}
