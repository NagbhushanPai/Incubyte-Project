import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sweets } from '../api';
import { useAuth } from '../context/useAuth';
import type { Sweet, SweetFormPayload, SweetSearchParams } from '../types';

export default function Dashboard() {
  const [items, setItems] = useState<Sweet[]>([]);
  const auth = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<SweetFormPayload>({ name: '', category: '', price: 0, quantity: 0 });
  const initialFilters = { q: '', category: '', minPrice: '', maxPrice: '' } as const;
  const [filters, setFilters] = useState<{ q: string; category: string; minPrice: string; maxPrice: string }>({ ...initialFilters });
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSweets = async (criteria?: typeof filters) => {
    setLoading(true);
    setError(null);
    try {
      const active = criteria ?? filters;
      const hasFilters = !!(active.q || active.category || active.minPrice || active.maxPrice);
      const parseNumericFilter = (value: string): number | undefined => {
        if (!value.trim()) return undefined;
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
      };
      const searchPayload: SweetSearchParams | undefined = hasFilters
        ? {
            q: active.q || undefined,
            category: active.category || undefined,
            minPrice: parseNumericFilter(active.minPrice),
            maxPrice: parseNumericFilter(active.maxPrice),
          }
        : undefined;
      const res = hasFilters && searchPayload ? await sweets.search(searchPayload) : await sweets.list();
      const list = Array.isArray(res) ? res : [];
      setItems(list);
      if (!hasFilters) {
        const uniqueCategories = Array.from(new Set(list.map((item) => item.category).filter(Boolean)));
        setCategories(uniqueCategories);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to load sweets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSweets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    await fetchSweets(filters);
  };

  const clearFilters = async () => {
    setFilters({ ...initialFilters });
    await fetchSweets({ ...initialFilters });
  };

  const buy = async (id: string) => {
    try {
      const res = await sweets.purchase(id, 1);
      alert('Purchased');
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: res.quantity } : i)));
    } catch (err) {
      console.error(err);
      alert('Error');
    }
  };

  const createSweet = async () => {
    const res = await sweets.create(form);
    setItems((prev) => [res, ...prev]);
    setCategories((prev) => Array.from(new Set([res.category, ...prev].filter(Boolean))));
    setShowCreate(false);
    setForm({ name: '', category: '', price: 0, quantity: 0 });
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this sweet?')) return;
    await sweets.delete(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const restock = async (id: string) => {
    const qty = Number(prompt('Quantity to add', '10')) || 0;
    if (qty <= 0) return;
    const res = await sweets.restock(id, qty);
    setItems((prev) => prev.map((i) => (i.id === id ? res : i)));
  };

  const startEdit = (item: Sweet) => {
    const name = prompt('Name', item.name) || item.name;
    const category = prompt('Category', item.category) || item.category;
    const priceInput = prompt('Price', String(item.price));
    const quantityInput = prompt('Quantity', String(item.quantity));
  const parsedPrice = priceInput !== null ? Number(priceInput) : item.price;
  const parsedQuantity = quantityInput !== null ? Number(quantityInput) : item.quantity;
  const price = Number.isFinite(parsedPrice) ? parsedPrice : item.price;
  const quantity = Number.isFinite(parsedQuantity) ? parsedQuantity : item.quantity;
  const payload: Partial<SweetFormPayload> = { name, category, price, quantity };
    sweets.update(item.id, payload).then((res) => {
      setItems((prev) => prev.map((i) => (i.id === item.id ? res : i)));
    });
  };

  return (
    <div className="min-h-screen p-6 bg-brand-50">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl">Sweets</h1>
        <div>
          {auth.user ? (
            <>
              <span className="mr-4">{auth.user.role}</span>
              <button onClick={auth.logout} className="px-3 py-1 border rounded">Logout</button>
              {auth.user?.role === 'ADMIN' ? <button onClick={() => setShowCreate(true)} className="ml-3 px-3 py-1 bg-brand-400 text-white rounded">Add sweet</button> : null}
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-1 border rounded mr-2">Login</Link>
              <Link to="/register" className="px-3 py-1 border rounded">Register</Link>
            </>
          )}
        </div>
      </header>

      {showCreate ? (
        <div className="mb-6">
          <div className="bg-white p-4 rounded shadow max-w-md">
            <h3 className="font-semibold mb-2">New sweet</h3>
            <input className="w-full mb-2 border px-2 py-1" placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <input className="w-full mb-2 border px-2 py-1" placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
            <input className="w-full mb-2 border px-2 py-1" placeholder="Price" type="number" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} />
            <input className="w-full mb-2 border px-2 py-1" placeholder="Quantity" type="number" value={form.quantity} onChange={e => setForm({...form, quantity: Number(e.target.value)})} />
            <div className="flex gap-2">
              <button onClick={createSweet} className="px-3 py-1 bg-brand-400 text-white rounded">Create</button>
              <button onClick={() => setShowCreate(false)} className="px-3 py-1 border rounded">Cancel</button>
            </div>
          </div>
        </div>
      ) : null}

      <section className="mb-6 bg-white rounded shadow p-4">
        <form onSubmit={handleSearch} className="grid gap-3 md:grid-cols-5 md:items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700" htmlFor="filter-search">Search</label>
            <input
              id="filter-search"
              className="w-full border px-3 py-2 rounded"
              placeholder="Search by name"
              value={filters.q}
              onChange={(e) => handleFilterChange('q', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="filter-category">Category</label>
            <select
              id="filter-category"
              className="w-full border px-3 py-2 rounded"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="filter-min-price">Min price</label>
            <input
              type="number"
              min="0"
              id="filter-min-price"
              className="w-full border px-3 py-2 rounded"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="filter-max-price">Max price</label>
            <input
              type="number"
              min="0"
              id="filter-max-price"
              className="w-full border px-3 py-2 rounded"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              placeholder="100"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-brand-400 text-white px-3 py-2 rounded">Apply filters</button>
            <button type="button" onClick={clearFilters} className="flex-1 border px-3 py-2 rounded">Reset</button>
          </div>
        </form>
        {loading ? <p className="text-sm text-gray-500 mt-3">Loading sweets...</p> : null}
        {error ? <p className="text-sm text-red-600 mt-3">{error}</p> : null}
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded shadow p-4">
            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-sm text-gray-600">{item.category}</p>
            <p className="mt-2 font-bold">${item.price.toFixed(2)}</p>
            <p className="mt-1">In stock: {item.quantity}</p>
            <div className="mt-4">
              <button disabled={item.quantity <= 0} onClick={() => buy(item.id)} className={`px-3 py-2 rounded ${item.quantity <= 0 ? 'bg-gray-300' : 'bg-brand-400 text-white'}`}>
                {item.quantity <= 0 ? 'Sold out' : 'Purchase'}
              </button>
              {auth.user?.role === 'ADMIN' ? (
                <div className="inline-block ml-2">
                  <button onClick={() => startEdit(item)} className="px-2 py-1 ml-2 border rounded">Edit</button>
                  <button onClick={() => restock(item.id)} className="px-2 py-1 ml-2 border rounded">Restock</button>
                  <button onClick={() => remove(item.id)} className="px-2 py-1 ml-2 border rounded text-red-600">Delete</button>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
