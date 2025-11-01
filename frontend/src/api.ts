import type { AuthResponse, Sweet, SweetFormPayload, SweetSearchParams } from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers ?? undefined);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const token = localStorage.getItem('token');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const text = await response.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export const auth = {
  login: (email: string, password: string) => request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email: string, password: string, name?: string) => request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
};

const buildSearchQuery = (params: SweetSearchParams): string => {
  const query = new URLSearchParams();
  if (params.q) query.set('q', params.q);
  if (params.category) query.set('category', params.category);
  if (params.minPrice !== undefined) query.set('minPrice', String(params.minPrice));
  if (params.maxPrice !== undefined) query.set('maxPrice', String(params.maxPrice));
  const qs = query.toString();
  return qs ? `?${qs}` : '';
};

export const sweets = {
  list: () => request<Sweet[]>('/sweets'),
  search: (params: SweetSearchParams) => request<Sweet[]>(`/sweets/search${buildSearchQuery(params)}`),
  purchase: (id: string, quantity = 1) => request<Sweet>(`/sweets/${id}/purchase`, { method: 'POST', body: JSON.stringify({ quantity }) }),
  create: (data: SweetFormPayload) => request<Sweet>('/sweets', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<SweetFormPayload>) => request<Sweet>(`/sweets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/sweets/${id}`, { method: 'DELETE' }),
  restock: (id: string, quantity: number) => request<Sweet>(`/sweets/${id}/restock`, { method: 'POST', body: JSON.stringify({ quantity }) }),
};