'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import API from '../../src/services/api';

type Order = {
  id: number;
  userId?: number | null;
  totalAmount: number;
  status:
    | 'pending'
    | 'accepted'
    | 'delivered'
    | 'rejected'
    | 'cancelled'
    | 'delivery_failed'
    | 'approved';
  createdAt?: string;
};

type StoredUser = {
  id: number;
  fullName: string;
  role: 'user' | 'admin';
};

export default function OrderPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);

  const pendingOrders = orders.filter((order) => order.status === 'pending');
  const acceptedOrders = orders.filter((order) => order.status === 'accepted');
  const historyOrders = orders.filter(
    (order) => order.status !== 'pending' && order.status !== 'accepted',
  );

  const loadData = async (initialLoad = false) => {
    if (initialLoad) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError('');

    try {
      const response = await API.get('/orders');
      setOrders(response.data);
    } catch (requestError: unknown) {
      if (axios.isAxiosError(requestError)) {
        setError(requestError.response?.data?.message || 'Failed to load orders');
      } else {
        setError('Failed to load orders');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');

    if (userRaw) {
      try {
        setUser(JSON.parse(userRaw) as StoredUser);
      } catch {
        setUser(null);
      }
    }

    if (!token) {
      router.push('/login');
      return;
    }

    if (!userRaw) {
      router.push('/login');
      return;
    }

    try {
      const storedUser = JSON.parse(userRaw) as StoredUser;

      if (storedUser.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      setUser(storedUser);
      setAuthReady(true);
      loadData(true);
    } catch {
      router.push('/login');
    }
  }, [router]);

  const updateOrderStatus = async (orderId: number, status: Order['status']) => {
    try {
      await API.patch(`/orders/${orderId}/status`, { status });
      setMessage(`Order #${orderId} updated to ${status}`);
      await loadData(false);
    } catch (requestError: unknown) {
      if (axios.isAxiosError(requestError)) {
        setError(requestError.response?.data?.message || 'Failed to update order status');
      } else {
        setError('Failed to update order status');
      }
    }
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-100 px-4 py-8 text-black">
        <div className="mx-auto max-w-6xl rounded-3xl bg-white p-10 text-center text-gray-500 shadow-lg ring-1 ring-gray-100">
          Checking session...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-100 px-4 py-8 text-black">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-green-100">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-600">
                Order Management
              </p>
              <h1 className="mt-2 text-3xl font-bold text-green-800">Separate Order Page</h1>
              <p className="mt-2 text-sm text-gray-600">
                Accept pending orders, reject them, and move processed orders to history.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => router.push('/admin')}
                className="rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => loadData(false)}
                className="rounded-xl border border-green-200 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {message && <p className="mt-4 text-sm font-medium text-green-700">{message}</p>}
          {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
        </section>

        {loading && orders.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center text-gray-500 shadow-lg ring-1 ring-gray-100">
            Loading orders...
          </div>
        ) : (
          <section className="grid gap-8">
            <div className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-gray-100">
              <h2 className="text-2xl font-bold text-green-800">Pending Orders</h2>
              <p className="mt-1 text-sm text-gray-500">Accept or reject new orders here.</p>

              {pendingOrders.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
                  No pending orders.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {pendingOrders.map((order) => (
                    <div key={order.id} className="rounded-2xl border border-gray-200 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">Order #{order.id}</p>
                          <p className="text-sm text-gray-600">
                            User ID: {order.userId ?? 'N/A'} · Total: {Number(order.totalAmount).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">Status: {order.status}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(order.id, 'accepted')}
                            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(order.id, 'rejected')}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-gray-100">
              <h2 className="text-2xl font-bold text-green-800">Accepted Orders</h2>
              <p className="mt-1 text-sm text-gray-500">Accepted orders move to the payment page.</p>

              {acceptedOrders.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
                  No accepted orders yet.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {acceptedOrders.map((order) => (
                    <div key={order.id} className="rounded-2xl border border-gray-200 p-4">
                      <p className="font-semibold text-gray-900">Order #{order.id}</p>
                      <p className="text-sm text-gray-600">
                        User ID: {order.userId ?? 'N/A'} · Total: {Number(order.totalAmount).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">Ready for payment collection.</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-gray-100">
              <h2 className="text-2xl font-bold text-green-800">Order History</h2>
              <p className="mt-1 text-sm text-gray-500">
                Delivered, rejected, cancelled, and delivery-failed orders.
              </p>

              {historyOrders.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
                  No order history yet.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {historyOrders.map((order) => (
                    <div key={order.id} className="rounded-2xl border border-gray-200 p-4">
                      <p className="font-semibold text-gray-900">Order #{order.id}</p>
                      <p className="text-sm text-gray-600">
                        User ID: {order.userId ?? 'N/A'} · Total: {Number(order.totalAmount).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">Status: {order.status}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}