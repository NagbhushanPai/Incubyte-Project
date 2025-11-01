const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export async function request(path: string, options: RequestInit = {}) {
  const headers = options.headers ? new Headers(options.headers as any) : new Headers();
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const token = localStorage.getItem('token');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

export const auth = {
  login: (email: string, password: string) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email: string, password: string, name?: string) => request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
};

export const sweets = {
  list: () => request('/sweets'),
  purchase: (id: string, quantity = 1) => request(`/sweets/${id}/purchase`, { method: 'POST', body: JSON.stringify({ quantity }) }),
  create: (data: any) => request('/sweets', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request(`/sweets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/sweets/${id}`, { method: 'DELETE' }),
  restock: (id: string, quantity: number) => request(`/sweets/${id}/restock`, { method: 'POST', body: JSON.stringify({ quantity }) }),
};