'use client';

import { useState } from 'react';
import axios from 'axios';
import API from '../../src/services/api';

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });

  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName || !form.email || !form.password || !form.phone) {
      setSuccess(false);
      setMessage('All fields are required');
      return;
    }

    if (!/^\d{11}$/.test(form.phone)) {
      setSuccess(false);
      setMessage('Phone number must be exactly 11 digits');
      return;
    }

    try {
      const res = await API.post('/auth/register', form);

      setSuccess(true);
      setMessage(res.data.message || 'Registered successfully');

      setForm({
        fullName: '',
        email: '',
        password: '',
        phone: '',
      });
    } catch (error: unknown) {
      setSuccess(false);

      if (axios.isAxiosError(error)) {
        setMessage(error.response?.data?.message || 'Registration failed');
      } else {
        setMessage('Registration failed');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-white to-emerald-200 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <span className="text-2xl">💊</span>
          </div>

          <h1 className="text-3xl font-bold text-green-700">
            Create Account
          </h1>

          <p className="text-gray-500 mt-2">
            Register to access the pharmacy system
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>

            <input
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              value={form.fullName}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

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
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>

            <input
              name="phone"
              type="text"
              placeholder="01700000000"
              value={form.phone}
              onChange={handleChange}
              maxLength={11}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <p className="text-xs text-gray-400 mt-1">
              Phone number must be exactly 11 digits
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-green-600 py-2.5 font-semibold text-white hover:bg-green-700 transition"
          >
            Register
          </button>
        </form>

        {message && (
          <p
            className={`text-center mt-4 text-sm ${
              success ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {message}
          </p>
        )}

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-green-700 font-semibold">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}