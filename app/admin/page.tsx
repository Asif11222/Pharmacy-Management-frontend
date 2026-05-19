'use client';

import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-100 px-4 py-8 text-black">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-green-100">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-600">
                Admin Dashboard
              </p>
              <h1 className="mt-2 text-3xl font-bold text-green-800">
                Medicine Management Hub
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-600">
                Manage medicines from one place, then open the separate Order and Payment pages for
                workflow actions.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => router.push('/medicines')}
                className="rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
              >
                Manage Medicines
              </button>
              <button
                type="button"
                onClick={() => router.push('/order')}
                className="rounded-xl border border-green-200 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
              >
                Open Orders
              </button>
              <button
                type="button"
                onClick={() => router.push('/payments')}
                className="rounded-xl border border-green-200 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
              >
                Payments
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}