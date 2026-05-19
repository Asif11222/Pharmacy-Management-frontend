'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import API from '../../src/services/api';

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await API.post('/auth/login', {
        email: form.email.trim(),
        password: form.password,
      });

      localStorage.setItem('token', res.data.accessToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      setMessage('Login successful');

      router.push(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setMessage(error.response?.data?.message || 'Login failed');
      } else {
        setMessage('Login failed');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-white to-green-200 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-green-700">
            Pharmacy Login
          </h1>
          <p className="text-gray-500 mt-2">
            Welcome back to your pharmacy dashboard
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

             <p className="text-right text-sm">
             <a href="/forgot-password" className="text-green-700 font-semibold">
              Forgot password?
              </a>
               </p>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Login
          </button>
        </form>

        {message && (
          <p className="text-center mt-4 text-sm text-red-500">
            {message}
          </p>
        )}

        <p className="text-center text-sm text-gray-600 mt-6">
          Do not have an account?{' '}
          <a href="/register" className="text-green-700 font-semibold">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}