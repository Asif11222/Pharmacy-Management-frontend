'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import API from '../../src/services/api';

type Medicine = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  description?: string | null;
};

type CartItem = {
  medicineId: number;
  name: string;
  quantity: number;
  price: number;
};

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

type StoredUser = {
  id: number;
  fullName: string;
  role: 'user' | 'admin';
};

export default function UserDashboardPage() {
  const router = useRouter();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedMedicineId, setSelectedMedicineId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);

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
    } else {
      setUser(null);
    }

    if (!token) {
      router.push('/login');
      return;
    }

    setAuthReady(true);
    fetchMedicines();

    if (userRaw) {
      try {
        const storedUser = JSON.parse(userRaw) as StoredUser;
        fetchOrders(storedUser.id);
      } catch {
        fetchOrders();
      }
    }
  }, [router]);

  const fetchMedicines = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await API.get('/medicines');
      setMedicines(res.data);

      if (res.data.length > 0 && !selectedMedicineId) {
        setSelectedMedicineId(String(res.data[0].id));
      }
    } catch (requestError: unknown) {
      if (axios.isAxiosError(requestError)) {
        setError(requestError.response?.data?.message || 'Failed to load medicines');
      } else {
        setError('Failed to load medicines');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async (userId?: number) => {
    if (!userId) {
      return;
    }

    try {
      const res = await API.get(`/orders/user/${userId}`);
      setOrders(res.data);
    } catch {
      setOrders([]);
    }
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-100 px-4 py-8 text-black">
        <div className="mx-auto max-w-7xl rounded-3xl bg-white p-10 text-center text-gray-500 shadow-lg ring-1 ring-gray-100">
          Checking session...
        </div>
      </div>
    );
  }

  const selectedMedicine = medicines.find(
    (medicine) => medicine.id === Number(selectedMedicineId),
  );

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const addToCart = () => {
    if (!selectedMedicine) {
      setError('Select a medicine first');
      return;
    }

    const quantityNumber = Number(quantity);

    if (!quantityNumber || quantityNumber < 1) {
      setError('Quantity must be at least 1');
      return;
    }

    if (quantityNumber > selectedMedicine.stock) {
      setError('Quantity exceeds available stock');
      return;
    }

    setCart((current) => {
      const existing = current.find((item) => item.medicineId === selectedMedicine.id);

      if (existing) {
        return current.map((item) =>
          item.medicineId === selectedMedicine.id
            ? { ...item, quantity: item.quantity + quantityNumber }
            : item,
        );
      }

      return [
        ...current,
        {
          medicineId: selectedMedicine.id,
          name: selectedMedicine.name,
          quantity: quantityNumber,
          price: Number(selectedMedicine.price),
        },
      ];
    });

    setMessage('Medicine added to cart');
    setError('');
  };

  const removeCartItem = (medicineId: number) => {
    setCart((current) => current.filter((item) => item.medicineId !== medicineId));
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      setError('Add at least one medicine to place an order');
      return;
    }

    const cartSnapshot = [...cart];

    try {
      const res = await API.post('/orders', {
        userId: user?.id,
        items: cartSnapshot.map((item) => ({
          medicineId: item.medicineId,
          quantity: item.quantity,
        })),
      });

      localStorage.setItem(`latestOrder:${user?.id ?? 'guest'}`, JSON.stringify(res.data.order));
      setMedicines((current) =>
        current.map((medicine) => {
          const cartItem = cartSnapshot.find((item) => item.medicineId === medicine.id);

          if (!cartItem) {
            return medicine;
          }

          return {
            ...medicine,
            stock: Math.max(medicine.stock - cartItem.quantity, 0),
          };
        }),
      );
      setCart([]);
      setMessage(`Order created successfully. Order ID: ${res.data.order.id}`);
      setError('');
      await fetchOrders(user?.id);
    } catch (requestError: unknown) {
      if (axios.isAxiosError(requestError)) {
        setError(requestError.response?.data?.message || 'Failed to create order');
      } else {
        setError('Failed to create order');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-100 px-4 py-8 text-black">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-green-100">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-600">
                User Dashboard
              </p>
              <h1 className="mt-2 text-3xl font-bold text-green-800">
                Welcome{user ? `, ${user.fullName}` : ''}
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Browse medicines, add them to cart, place an order, then complete payment.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => router.push('/change-password')}
                className="rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
              >
                Change Password
              </button>
              <button
                type="button"
                onClick={() => router.push('/payments')}
                className="rounded-xl border border-green-200 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
              >
                View COD Status
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-green-50 p-4">
              <p className="text-sm text-gray-600">Medicines available</p>
              <p className="mt-1 text-3xl font-bold text-green-800">{medicines.length}</p>
            </div>
            <div className="rounded-2xl bg-green-50 p-4">
              <p className="text-sm text-gray-600">Items in cart</p>
              <p className="mt-1 text-3xl font-bold text-green-800">{cart.length}</p>
            </div>
            <div className="rounded-2xl bg-green-50 p-4">
              <p className="text-sm text-gray-600">Order total</p>
              <p className="mt-1 text-3xl font-bold text-green-800">{totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[380px_1fr]">
          <div className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-gray-100">
            <h2 className="text-2xl font-bold text-green-800">Add to Cart</h2>
            <p className="mt-1 text-sm text-gray-500">
              Select a medicine and quantity. Stock is checked before adding.
            </p>

            {loading ? (
              <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
                Loading medicines...
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <select
                  value={selectedMedicineId}
                  onChange={(e) => setSelectedMedicineId(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-black focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                >
                  {medicines.map((medicine) => (
                    <option key={medicine.id} value={medicine.id}>
                      {medicine.name} - {medicine.category} - Stock {medicine.stock}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Quantity"
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-black focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                />

                <button
                  type="button"
                  onClick={addToCart}
                  className="w-full rounded-xl bg-green-700 px-4 py-2.5 font-semibold text-white hover:bg-green-800"
                >
                  Add Medicine
                </button>
              </div>
            )}

            {message && <p className="mt-4 text-sm font-medium text-green-700">{message}</p>}
            {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-gray-100">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-green-800">Cart</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Order medicines here. Stock will reduce after submission.
                </p>
              </div>

              <button
                type="button"
                onClick={placeOrder}
                className="rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
              >
                Place Order
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
                Your cart is empty.
              </div>
            ) : (
              <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-green-50 text-left text-gray-700">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Medicine</th>
                        <th className="px-4 py-3 font-semibold">Qty</th>
                        <th className="px-4 py-3 font-semibold">Price</th>
                        <th className="px-4 py-3 font-semibold">Subtotal</th>
                        <th className="px-4 py-3 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {cart.map((item) => (
                        <tr key={item.medicineId}>
                          <td className="px-4 py-4 font-medium text-gray-900">{item.name}</td>
                          <td className="px-4 py-4 text-gray-700">{item.quantity}</td>
                          <td className="px-4 py-4 text-gray-700">{item.price.toFixed(2)}</td>
                          <td className="px-4 py-4 text-gray-700">
                            {(item.quantity * item.price).toFixed(2)}
                          </td>
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              onClick={() => removeCartItem(item.medicineId)}
                              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-gray-100">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-green-800">My Orders</h2>
              <p className="mt-1 text-sm text-gray-500">
                Track the status of your submitted orders here.
              </p>
            </div>

            <button
              type="button"
                onClick={() => fetchOrders(user?.id)}
              className="rounded-xl border border-green-200 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
            >
              Refresh
            </button>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-green-50 text-left text-gray-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Order</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {orders.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-center text-gray-500" colSpan={4}>
                        No orders yet.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-4 py-4 font-medium text-gray-900">#{order.id}</td>
                        <td className="px-4 py-4 text-gray-700">{Number(order.totalAmount).toFixed(2)}</td>
                        <td className="px-4 py-4 text-gray-700">{order.status}</td>
                        <td className="px-4 py-4 text-gray-700">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}