import React, { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = useAuth();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await auth.login(email, password);
    if (ok) navigate('/');
    else alert('Login failed');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50">
      <form onSubmit={submit} className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl mb-4">Sign in</h2>
        <label className="block mb-2">Email
          <input className="w-full border px-3 py-2 rounded mt-1" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        </label>
        <label className="block mb-4">Password
          <input type="password" className="w-full border px-3 py-2 rounded mt-1" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        </label>
        <button className="w-full bg-brand-400 text-white py-2 rounded">Sign in</button>
        <p className="mt-4 text-sm">No account? <Link to="/register" className="text-brand-600">Register</Link></p>
      </form>
    </div>
  );
}
