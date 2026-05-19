'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import API from '../../src/services/api';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    token: '',
    newPassword: '',
  });

  const [message, setMessage] = useState('');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');

    if (tokenFromUrl) {
      setForm((currentForm) => ({
        ...currentForm,
        token: tokenFromUrl,
      }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await API.post('/auth/reset-password', form);
      setMessage(res.data.message);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setMessage(error.response?.data?.message || 'Reset failed');
      } else {
        setMessage('Reset failed');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-green-700 text-center mb-4">
          Reset Password
        </h1>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <input
            name="token"
            placeholder="Reset token"
            value={form.token}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-lg text-black placeholder:text-gray-500"
          />

          <input
            name="newPassword"
            type="password"
            placeholder="Enter new password"
            value={form.newPassword}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-lg text-black placeholder:text-gray-500"
          />

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg"
          >
            Reset Password
          </button>
        </form>

        {message && <p className="mt-4 text-center text-sm">{message}</p>}

        <p className="mt-3 text-center text-xs text-gray-500">
          If you opened the link from your email, the token is filled in automatically.
        </p>

        <p className="text-center text-sm mt-4">
          Back to{' '}
          <a href="/login" className="text-green-700 font-semibold">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}