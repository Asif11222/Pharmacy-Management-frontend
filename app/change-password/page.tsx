'use client';

import { useState } from 'react';
import axios from 'axios';
import API from '../../src/services/api';

export default function ChangePasswordPage() {
  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    if (!token) {
      setMessage('Please login first');
      return;
    }

    try {
      const res = await API.patch('/auth/change-password', form);
      setMessage(res.data.message);

      setForm({
        oldPassword: '',
        newPassword: '',
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setMessage(error.response?.data?.message || 'Password change failed');
      } else {
        setMessage('Password change failed');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-green-700 text-center mb-4">
          Change Password
        </h1>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <input
            name="oldPassword"
            type="password"
            placeholder="Old password"
            value={form.oldPassword}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-lg text-black placeholder:text-gray-500"
          />

          <input
            name="newPassword"
            type="password"
            placeholder="New password"
            value={form.newPassword}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-lg text-black placeholder:text-gray-500"
          />

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg"
          >
            Change Password
          </button>
        </form>

        {message && <p className="mt-4 text-center text-sm">{message}</p>}
      </div>
    </div>
  );
}