import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { sweets } from '../api';
import { AuthContext } from '../context/AuthContext';

export default function Dashboard() {
  const [items, setItems] = useState<any[]>([]);
  const auth = useContext(AuthContext);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<any>({ name: '', category: '', price: 0, quantity: 0 });

  useEffect(() => {
    (async ()=>{
      const res: any = await sweets.list();
      setItems(Array.isArray(res) ? res : []);
    })();
  }, []);

  const buy = async (id: string) => {
    try {
      const res = await sweets.purchase(id, 1);
      alert('Purchased');
      setItems(items.map(i => i.id === id ? {...i, quantity: res.quantity} : i));
    } catch (err) { console.error(err); alert('Error'); }
  };

  const createSweet = async () => {
    const res: any = await sweets.create(form);
    setItems([res, ...items]);
    setShowCreate(false);
    setForm({ name: '', category: '', price: 0, quantity: 0 });
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this sweet?')) return;
    await sweets.delete(id);
    setItems(items.filter(i => i.id !== id));
  };

  const restock = async (id: string) => {
    const qty = Number(prompt('Quantity to add', '10')) || 0;
    if (qty <= 0) return;
    const res: any = await sweets.restock(id, qty);
    setItems(items.map(i => i.id === id ? res : i));
  };

  const startEdit = (item: any) => {
    const name = prompt('Name', item.name) || item.name;
    const category = prompt('Category', item.category) || item.category;
    const price = Number(prompt('Price', String(item.price)) || item.price);
    const quantity = Number(prompt('Quantity', String(item.quantity)) || item.quantity);
    sweets.update(item.id, { name, category, price, quantity }).then((res:any) => {
      setItems(items.map(i => i.id === item.id ? res : i));
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
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
