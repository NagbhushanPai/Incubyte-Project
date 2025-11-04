import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { sweets } from '../api';
import { useAuth } from '../context/useAuth';
import type { Sweet, SweetFormPayload, SweetSearchParams } from '../types';

const heroCopy = {
  title: 'Sweet Studio Dashboard',
  subtitle: 'Craft irresistible collections, monitor stock in real time, and keep your dessert lovers smiling.'
};

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

  const totalStock = useMemo(() => items.reduce((sum, sweet) => sum + sweet.quantity, 0), [items]);
  const soldOutCount = useMemo(() => items.filter((sweet) => sweet.quantity <= 0).length, [items]);
  const totalValue = useMemo(() => items.reduce((sum, sweet) => sum + sweet.price * sweet.quantity, 0), [items]);

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

  const renderAuthActions = () => {
    if (auth.user) {
      return (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full bg-white/60 px-3 py-1 font-medium text-brand-500 shadow-sm">{auth.user.role}</span>
          {auth.user?.role === 'ADMIN' ? (
            <button onClick={() => setShowCreate(true)} className="rounded-full bg-brand-400 px-4 py-2 text-white shadow-md shadow-brand-200 transition hover:-translate-y-0.5 hover:bg-brand-300">
              Add sweet
            </button>
          ) : null}
          <button onClick={auth.logout} className="rounded-full border border-white/70 px-4 py-2 text-sm font-semibold text-brand-400 transition hover:bg-white hover:text-brand-500">
            Logout
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link to="/login" className="rounded-full border border-white/70 px-4 py-2 font-semibold text-brand-500 transition hover:bg-white">
          Login
        </Link>
        <Link to="/register" className="rounded-full bg-white px-4 py-2 font-semibold text-brand-400 shadow-md transition hover:-translate-y-0.5">
          Register
        </Link>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-6 py-10 lg:px-12">
        <header className="relative overflow-hidden rounded-3xl bg-white/80 p-8 shadow-xl shadow-brand-100 backdrop-blur-sm">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(253,159,147,0.35),_rgba(250,199,198,0))]" />
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-400 shadow-sm">
                Sweet success hub
              </span>
              <h1 className="text-4xl font-semibold text-gray-900 lg:text-5xl">{heroCopy.title}</h1>
              <p className="text-base text-gray-600 lg:text-lg">{heroCopy.subtitle}</p>
            </div>
            {renderAuthActions()}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm">
              <p className="text-sm text-gray-500">Sweets on display</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{items.length}</p>
              <p className="text-xs text-gray-400">Across {categories.length || 'no'} categories</p>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm">
              <p className="text-sm text-gray-500">Inventory balance</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{totalStock}</p>
              <p className="text-xs text-gray-400">Items currently in stock</p>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm">
              <p className="text-sm text-gray-500">Estimated value</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">${totalValue.toFixed(2)}</p>
              <p className="text-xs text-gray-400">Calculated from price × quantity</p>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm">
              <p className="text-sm text-gray-500">Sold out treats</p>
              <p className={`mt-2 text-3xl font-semibold ${soldOutCount > 0 ? 'text-brand-400' : 'text-emerald-500'}`}>{soldOutCount}</p>
              <p className="text-xs text-gray-400">Keep shelves stocked and customers happy</p>
            </div>
          </div>
        </header>

        {showCreate ? (
          <section className="rounded-2xl bg-white p-6 shadow-lg shadow-brand-100">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Create a new sweet</h2>
                <p className="text-sm text-gray-500">Introduce a new delight to your catalogue in seconds.</p>
              </div>
              <button onClick={() => setShowCreate(false)} className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50">Cancel</button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                Name
                <input
                  className="rounded-xl border border-gray-200 px-3 py-2 transition focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  placeholder="Chocolate Fudge Brownie"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                Category
                <input
                  className="rounded-xl border border-gray-200 px-3 py-2 transition focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  placeholder="Cheesecake"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                Price
                <input
                  className="rounded-xl border border-gray-200 px-3 py-2 transition focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="5.99"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                Quantity
                <input
                  className="rounded-xl border border-gray-200 px-3 py-2 transition focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  type="number"
                  min="0"
                  placeholder="24"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                />
              </label>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button onClick={createSweet} className="rounded-full bg-brand-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-200 transition hover:-translate-y-0.5 hover:bg-brand-300">
                Add to catalogue
              </button>
              <p className="text-xs text-gray-400">Tip: Keep your price and quantity accurate to stay ahead of orders.</p>
            </div>
          </section>
        ) : null}

        <section className="rounded-3xl bg-white/90 p-6 shadow-lg shadow-brand-100 backdrop-blur-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Explore your selection</h2>
              <p className="text-sm text-gray-500">Refine sweets by flavour profile, category, or price band.</p>
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="self-start rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Clear filters
            </button>
          </div>

          <form onSubmit={handleSearch} className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <label className="flex flex-col gap-2 text-sm font-medium text-gray-600 md:col-span-2">
              Search keyword
              <input
                id="filter-search"
                className="rounded-xl border border-gray-200 px-3 py-2 transition focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                placeholder='Try "cheesecake" or "berry"'
                value={filters.q}
                onChange={(e) => handleFilterChange('q', e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-gray-600">
              Category
              <select
                id="filter-category"
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 transition focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-gray-600">
              Minimum price
              <input
                type="number"
                min="0"
                id="filter-min-price"
                className="rounded-xl border border-gray-200 px-3 py-2 transition focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                placeholder="0"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-gray-600">
              Maximum price
              <input
                type="number"
                min="0"
                id="filter-max-price"
                className="rounded-xl border border-gray-200 px-3 py-2 transition focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                placeholder="100"
              />
            </label>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-full bg-brand-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-200 transition hover:-translate-y-0.5 hover:bg-brand-300"
              >
                Apply filters
              </button>
            </div>
          </form>
          {loading ? <p className="mt-4 text-sm text-gray-500">Loading sweets...</p> : null}
          {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
        </section>

        <section className="pb-16">
          {items.length === 0 && !loading ? (
            <div className="rounded-3xl border border-dashed border-brand-200 bg-white/60 p-12 text-center text-gray-500">
              <h3 className="text-xl font-semibold text-gray-800">No sweets yet</h3>
              <p className="mt-2 text-sm">Add your first creation to start delighting your customers.</p>
              {auth.user?.role === 'ADMIN' ? (
                <button onClick={() => setShowCreate(true)} className="mt-6 rounded-full bg-brand-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-200 transition hover:-translate-y-0.5 hover:bg-brand-300">
                  Create a sweet
                </button>
              ) : null}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/90 p-6 shadow-md shadow-brand-100 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[radial-gradient(circle,_rgba(253,159,147,0.35),_rgba(250,199,198,0))] opacity-0 transition group-hover:opacity-100" />
                  <div className="relative space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${item.quantity <= 0 ? 'bg-gray-200 text-gray-600' : 'bg-brand-100 text-brand-400'}`}>
                        {item.category || 'Uncategorised'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">Crafted with love &amp; ready to serve.</p>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 font-medium text-brand-400 shadow-sm">
                        ${item.price.toFixed(2)}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-gray-600">
                        {item.quantity > 0 ? `${item.quantity} in stock` : 'Sold out'}
                      </span>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <button
                        disabled={item.quantity <= 0}
                        onClick={() => buy(item.id)}
                        className={`rounded-full px-5 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-brand-200 ${
                          item.quantity <= 0
                            ? 'cursor-not-allowed bg-gray-200 text-gray-500'
                            : 'bg-brand-400 text-white shadow-lg shadow-brand-200 hover:-translate-y-0.5 hover:bg-brand-300'
                        }`}
                      >
                        {item.quantity <= 0 ? 'Sold out' : 'Purchase'}
                      </button>
                      {auth.user?.role === 'ADMIN' ? (
                        <div className="flex flex-wrap gap-2 text-sm">
                          <button onClick={() => restock(item.id)} className="rounded-full border border-gray-200 px-4 py-2 font-medium text-gray-600 transition hover:bg-gray-50">
                            Restock
                          </button>
                          <button onClick={() => startEdit(item)} className="rounded-full border border-gray-200 px-4 py-2 font-medium text-gray-600 transition hover:bg-gray-50">
                            Edit
                          </button>
                          <button onClick={() => remove(item.id)} className="rounded-full border border-red-200 px-4 py-2 font-medium text-red-500 transition hover:bg-red-50">
                            Delete
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
