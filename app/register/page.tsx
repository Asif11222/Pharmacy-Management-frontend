'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import API from '../../src/services/api';

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });

  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('idle');

    try {
      const res = await API.post('/auth/register', form);
      setMessage(res.data.message || 'Registered successfully');
      setStatus('success');
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;

      setMessage(errorMessage || 'Registration failed');
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.18),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.18),_transparent_28%),linear-gradient(180deg,_#f8fffe_0%,_#eff6ff_45%,_#f8fafc_100%)] text-slate-900">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:56px_56px] opacity-30" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.45)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative flex flex-col justify-between overflow-hidden bg-slate-950 p-8 text-white sm:p-10 lg:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(45,212,191,0.22),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.22),_transparent_36%)]" />
            <div className="absolute -left-20 top-10 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="absolute -bottom-20 right-0 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl" />

            <div className="relative space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-emerald-50">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Pharmacy management onboarding
              </div>

              <div className="space-y-5">
                <p className="max-w-md text-sm uppercase tracking-[0.35em] text-cyan-100/70">
                  Join the workflow
                </p>
                <h1 className="max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
                  Create your account and start managing orders, and stock in one place.
                </h1>
                <p className="max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
                  A clean onboarding experience for your pharmacy team, designed to keep registration
                  fast, secure, and easy to understand.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { title: 'Fast setup', text: 'Get started in minutes.' },
                  { title: 'Secure access', text: 'Protected account creation.' },
                  { title: 'Team ready', text: 'Built for daily operations.' },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm"
                  >
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mt-10 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/8 px-5 py-4 backdrop-blur-sm">
              <div>
                <p className="text-sm font-medium text-white">Need a quicker path?</p>
                <p className="text-sm text-slate-300">Keep the form minimal and focused on the essentials.</p>
              </div>
              <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-lg sm:flex">
                +
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center bg-slate-50 p-6 sm:p-8 lg:p-12">
            <div className="w-full max-w-md">
              <div className="mb-8 space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-700">
                  Register now
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
                  Set up your account
                </h2>
                <p className="text-sm leading-7 text-slate-600">
                  Add your details below to create your pharmacy profile and continue into the system.
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-sm font-medium text-slate-700">
                    Full name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Jane Doe"
                    value={form.fullName}
                    onChange={handleChange}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="jane@pharmacy.com"
                    value={form.email}
                    onChange={handleChange}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={handleChange}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-slate-700">
                    Phone number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 234 567 890"
                    value={form.phone}
                    onChange={handleChange}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isSubmitting ? 'Creating account...' : 'Create account'}
                </button>

                {message && (
                  <p
                    className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${
                      status === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-rose-200 bg-rose-50 text-rose-700'
                    }`}
                  >
                    {message}
                  </p>
                )}
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                By continuing, you agree to keep account access secure for your pharmacy team.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}