'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import API from '../../src/services/api';

type Order = {
  id: number;
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

type Payment = {
  id: number;
  orderId: number;
  amount: number;
  method: 'cod';
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  createdAt?: string;
};

type StoredUser = {
  id: number;
  fullName: string;
  role: 'user' | 'admin';
};

export default function PaymentsPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);

  const isAdmin = user?.role === 'admin';
  const acceptedOrders = orders.filter((order) => order.status === 'accepted');
  const actionablePayments = payments.filter((payment) =>
    acceptedOrders.some((order) => order.id === payment.orderId),
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setMounted(true);

    const userRaw = localStorage.getItem('user');

    if (userRaw) {
      try {
        setUser(JSON.parse(userRaw) as StoredUser);
      } catch {
        setUser(null);
      }
    }

    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
      return;
    }

    loadData();
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const userRaw = localStorage.getItem('user');
      const storedUser = userRaw ? (JSON.parse(userRaw) as StoredUser) : null;
      const isAdminUser = storedUser?.role === 'admin';

      const [ordersResponse, paymentsResponse] = await Promise.all([
        isAdminUser ? API.get('/orders') : storedUser ? API.get(`/orders/user/${storedUser.id}`) : API.get('/orders'),
        isAdminUser ? API.get('/payments') : API.get('/payments'),
      ]);

      setOrders(ordersResponse.data);
      setPayments(paymentsResponse.data);
      setMessage('Cash on delivery orders are shown below.');
    } catch (requestError: unknown) {
      if (axios.isAxiosError(requestError)) {
        setError(requestError.response?.data?.message || 'Failed to load COD data');
      } else {
        setError('Failed to load COD data');
      }
    } finally {
      setLoading(false);
    }
  };

  const paymentStatusLabel = (status: Payment['status']) => {
    if (status === 'paid') {
      return 'Collected';
    }

    if (status === 'failed' || status === 'cancelled') {
      return 'Cancelled';
    }

    return 'Pending';
  };

  const updatePaymentStatus = async (paymentId: number, status: Payment['status']) => {
    try {
      await API.patch(`/payments/${paymentId}/status`, { status });
      setMessage(`Payment #${paymentId} updated to ${status}`);
      await loadData();
    } catch (requestError: unknown) {
      if (axios.isAxiosError(requestError)) {
        setError(requestError.response?.data?.message || 'Failed to update payment status');
      } else {
        setError('Failed to update payment status');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-100 px-4 py-8 text-black">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-green-100">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-600">
                Cash on Delivery
              </p>
              <h1 className="mt-2 text-3xl font-bold text-green-800">
                Orders and Payment Status
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                No online payment or transaction ID is needed. The payment is collected when the medicine is delivered.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
              >
                Back to Dashboard
              </button>
              {mounted && user && (
                <div className="rounded-xl bg-green-50 px-4 py-2 text-sm font-semibold text-green-800">
                  {user.fullName}
                </div>
              )}
            </div>
          </div>

          {message && <p className="mt-4 text-sm font-medium text-green-700">{message}</p>}
          {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
        </section>

        {isAdmin ? (
          <section className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-gray-100 lg:col-span-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-green-800">Payment Collection</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Accepted orders appear here. Click Paid or Unpaid to move them into order history.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadData}
                  className="rounded-xl border border-green-200 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
                >
                  Refresh
                </button>
              </div>

              <div className="mt-6 space-y-3">
                {loading ? (
                  <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
                    Loading payments...
                  </div>
                ) : actionablePayments.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
                    No accepted orders waiting for payment collection.
                  </div>
                ) : (
                  actionablePayments.map((payment) => (
                    <div key={payment.id} className="rounded-2xl border border-gray-200 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">Payment #{payment.id}</p>
                          <p className="text-sm text-gray-600">
                            Order #{payment.orderId} · Cash on Delivery · {Number(payment.amount).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">Status: {paymentStatusLabel(payment.status)}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {payment.status === 'pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() => updatePaymentStatus(payment.id, 'paid')}
                                className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                              >
                                Paid
                              </button>
                              <button
                                type="button"
                                onClick={() => updatePaymentStatus(payment.id, 'cancelled')}
                                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                              >
                                Unpaid
                              </button>
                            </>
                          )}

                          <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
                            COD
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-gray-100">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-green-800">My Orders</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Order status starts pending and is updated by admin.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadData}
                  className="rounded-xl border border-green-200 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
                  Loading orders...
                </div>
              ) : orders.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
                  No orders yet.
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="rounded-2xl border border-gray-200 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-gray-900">Order #{order.id}</p>
                          <p className="text-sm text-gray-600">Total: {Number(order.totalAmount).toFixed(2)}</p>
                          <p className="text-sm text-gray-500">Status: {order.status}</p>
                        </div>
                        <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
                          COD
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-gray-100">
              <h2 className="text-2xl font-bold text-green-800">Recent Payments</h2>
              <p className="mt-1 text-sm text-gray-500">
                Payment is created automatically in pending state and updated by admin when collected.
              </p>

              <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-green-50 text-left text-gray-700">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Order</th>
                        <th className="px-4 py-3 font-semibold">Amount</th>
                        <th className="px-4 py-3 font-semibold">Method</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {payments.length === 0 ? (
                        <tr>
                          <td className="px-4 py-6 text-center text-gray-500" colSpan={4}>
                            No payment records yet.
                          </td>
                        </tr>
                      ) : (
                        payments.map((payment) => (
                          <tr key={payment.id}>
                            <td className="px-4 py-4 font-medium text-gray-900">#{payment.orderId}</td>
                            <td className="px-4 py-4 text-gray-700">{Number(payment.amount).toFixed(2)}</td>
                            <td className="px-4 py-4 text-gray-700">Cash on Delivery</td>
                            <td className="px-4 py-4 text-gray-700">{paymentStatusLabel(payment.status)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
