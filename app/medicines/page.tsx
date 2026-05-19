"use client";

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
	expiryDate?: string | null;
	createdAt?: string;
};

type MedicineForm = {
	name: string;
	category: string;
	price: string;
	stock: string;
	description: string;
	expiryDate: string;
};

const emptyForm: MedicineForm = {
	name: '',
	category: '',
	price: '',
	stock: '',
	description: '',
	expiryDate: '',
};

export default function MedicinesPage() {
	const router = useRouter();
	const [medicines, setMedicines] = useState<Medicine[]>([]);
	const [form, setForm] = useState<MedicineForm>(emptyForm);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');

	useEffect(() => {
		const token = localStorage.getItem('token');
		const userRaw = localStorage.getItem('user');
		const role = userRaw ? JSON.parse(userRaw).role : null;

		if (!token) {
			router.push('/login');
			return;
		}

		if (role !== 'admin') {
			router.push('/dashboard');
			return;
		}

		fetchMedicines();
	}, [router]);

	const fetchMedicines = async () => {
		setLoading(true);
		setError('');

		try {
			const res = await API.get('/medicines');
			setMedicines(res.data);
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

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		setForm((current) => ({
			...current,
			[e.target.name]: e.target.value,
		}));
	};

	const resetForm = () => {
		setForm(emptyForm);
		setEditingId(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		setMessage('');
		setError('');

		const payload = {
			name: form.name,
			category: form.category,
			price: Number(form.price),
			stock: Number(form.stock),
			description: form.description || undefined,
			expiryDate: form.expiryDate || undefined,
		};

		if (!payload.name || !payload.category || !payload.price || !payload.stock) {
			setError('Name, category, price, and stock are required');
			setSaving(false);
			return;
		}

		try {
			if (editingId) {
				await API.patch(`/medicines/${editingId}`, payload);
				setMessage('Medicine updated successfully');
			} else {
				await API.post('/medicines', payload);
				setMessage('Medicine added successfully');
			}

			resetForm();
			await fetchMedicines();
		} catch (requestError: unknown) {
			if (axios.isAxiosError(requestError)) {
				setError(requestError.response?.data?.message || 'Failed to save medicine');
			} else {
				setError('Failed to save medicine');
			}
		} finally {
			setSaving(false);
		}
	};

	const handleEdit = (medicine: Medicine) => {
		setEditingId(medicine.id);
		setForm({
			name: medicine.name,
			category: medicine.category,
			price: String(medicine.price),
			stock: String(medicine.stock),
			description: medicine.description ?? '',
			expiryDate: medicine.expiryDate ?? '',
		});
		setMessage('');
		setError('');
	};

	const handleDelete = async (id: number) => {
		const confirmed = window.confirm('Delete this medicine?');

		if (!confirmed) {
			return;
		}

		try {
			await API.delete(`/medicines/${id}`);
			setMessage('Medicine deleted successfully');

			if (editingId === id) {
				resetForm();
			}

			await fetchMedicines();
		} catch (requestError: unknown) {
			if (axios.isAxiosError(requestError)) {
				setError(requestError.response?.data?.message || 'Failed to delete medicine');
			} else {
				setError('Failed to delete medicine');
			}
		}
	};

	const stats = [
		{ label: 'Total Medicines', value: medicines.length },
		{
			label: 'Low Stock',
			value: medicines.filter((medicine) => medicine.stock <= 10).length,
		},
		{
			label: 'Expired/No Expiry',
			value: medicines.filter((medicine) => !medicine.expiryDate).length,
		},
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-100 px-4 py-8 text-black">
			<div className="mx-auto max-w-7xl space-y-8">
				<section className="rounded-3xl bg-white/90 p-6 shadow-xl ring-1 ring-green-100 backdrop-blur">
					<div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
						<div>
							<p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-600">
								Dashboard
							</p>
							<h1 className="mt-2 text-3xl font-bold text-green-800">
								Medicine Management
							</h1>
							<p className="mt-2 max-w-2xl text-sm text-gray-600">
								Add, update, review, and remove medicines from one place. Use the
								quick action to change your password from the dashboard.
							</p>
						</div>

						<div className="flex flex-wrap gap-3">
							<button
								type="button"
								onClick={() => router.push('/change-password')}
								className="rounded-xl border border-green-200 bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800"
							>
								Change Password
							</button>
							<button
								type="button"
								onClick={() => router.push('/order')}
								className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
							>
								View Orders
							</button>
						</div>
					</div>

					<div className="mt-6 grid gap-4 sm:grid-cols-3">
						{stats.map((stat) => (
							<div key={stat.label} className="rounded-2xl bg-green-50 p-4">
								<p className="text-sm text-gray-600">{stat.label}</p>
								<p className="mt-1 text-3xl font-bold text-green-800">{stat.value}</p>
							</div>
						))}
					</div>
				</section>

				<section className="grid gap-8 lg:grid-cols-[380px_1fr]">
					<div className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-gray-100">
						<div className="mb-5">
							<h2 className="text-2xl font-bold text-green-800">
								{editingId ? 'Edit Medicine' : 'Add Medicine'}
							</h2>
							<p className="mt-1 text-sm text-gray-500">
								Fill the form to create a new medicine entry.
							</p>
						</div>

						<form className="space-y-4" onSubmit={handleSubmit}>
							<input
								name="name"
								value={form.name}
								onChange={handleChange}
								placeholder="Medicine name"
								className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-black placeholder:text-gray-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
							/>

							<input
								name="category"
								value={form.category}
								onChange={handleChange}
								placeholder="Category"
								className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-black placeholder:text-gray-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
							/>

							<div className="grid grid-cols-2 gap-3">
								<input
									name="price"
									type="number"
									min="0"
									step="0.01"
									value={form.price}
									onChange={handleChange}
									placeholder="Price"
									className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-black placeholder:text-gray-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
								/>

								<input
									name="stock"
									type="number"
									min="0"
									step="1"
									value={form.stock}
									onChange={handleChange}
									placeholder="Stock"
									className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-black placeholder:text-gray-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
								/>
							</div>

							<input
								name="expiryDate"
								type="date"
								value={form.expiryDate}
								onChange={handleChange}
								className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-black placeholder:text-gray-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
							/>

							<textarea
								name="description"
								value={form.description}
								onChange={handleChange}
								placeholder="Description"
								rows={4}
								className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-black placeholder:text-gray-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
							/>

							<div className="flex flex-wrap gap-3">
								<button
									type="submit"
									disabled={saving}
									className="rounded-xl bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
								>
									{saving ? 'Saving...' : editingId ? 'Update Medicine' : 'Add Medicine'}
								</button>

								{editingId && (
									<button
										type="button"
										onClick={resetForm}
										className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
									>
										Cancel Edit
									</button>
								)}
							</div>
						</form>

						{message && <p className="mt-4 text-sm font-medium text-green-700">{message}</p>}
						{error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
					</div>

					<div className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-gray-100">
						<div className="mb-5 flex items-center justify-between gap-4">
							<div>
								<h2 className="text-2xl font-bold text-green-800">Medicine List</h2>
								<p className="mt-1 text-sm text-gray-500">Manage your inventory below.</p>
							</div>

							<button
								type="button"
								onClick={fetchMedicines}
								className="rounded-xl border border-green-200 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-50"
							>
								Refresh
							</button>
						</div>

						{loading ? (
							<div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
								Loading medicines...
							</div>
						) : medicines.length === 0 ? (
							<div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
								No medicines found. Add your first item from the form.
							</div>
						) : (
							<div className="overflow-hidden rounded-2xl border border-gray-200">
								<div className="overflow-x-auto">
									<table className="min-w-full divide-y divide-gray-200 text-sm">
										<thead className="bg-green-50 text-left text-gray-700">
											<tr>
												<th className="px-4 py-3 font-semibold">Name</th>
												<th className="px-4 py-3 font-semibold">Category</th>
												<th className="px-4 py-3 font-semibold">Price</th>
												<th className="px-4 py-3 font-semibold">Stock</th>
												<th className="px-4 py-3 font-semibold">Expiry</th>
												<th className="px-4 py-3 font-semibold">Actions</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-100 bg-white">
											{medicines.map((medicine) => (
												<tr key={medicine.id} className="align-top">
													<td className="px-4 py-4 font-medium text-gray-900">{medicine.name}</td>
													<td className="px-4 py-4 text-gray-700">{medicine.category}</td>
													<td className="px-4 py-4 text-gray-700">
														{Number(medicine.price).toFixed(2)}
													</td>
													<td className="px-4 py-4 text-gray-700">{medicine.stock}</td>
													<td className="px-4 py-4 text-gray-700">
														{medicine.expiryDate || 'N/A'}
													</td>
													<td className="px-4 py-4">
														<div className="flex flex-wrap gap-2">
															<button
																type="button"
																onClick={() => handleEdit(medicine)}
																className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700"
															>
																Edit
															</button>
															<button
																type="button"
																onClick={() => handleDelete(medicine.id)}
																className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
															>
																Delete
															</button>
														</div>
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
			</div>
		</div>
	);
}
