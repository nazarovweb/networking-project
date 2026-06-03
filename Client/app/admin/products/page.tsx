'use client';
import React, { useEffect, useState, useCallback } from 'react';
import backendClient from '@/Helpers/backendClient';

interface Product {
  productid: string;
  title: string;
  price: string;
  discount: string;
  stock: number;
  category: string;
  imglink: string;
}

interface EditForm {
  title: string;
  description: string;
  price: string;
  discount: string;
  stock: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ title: '', description: '', price: '', discount: '', stock: '' });
  const [saving, setSaving] = useState(false);
  const limit = 20;

  const fetchProducts = useCallback(async (p: number) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await backendClient.get(`/admin/products?page=${p}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data.data);
      setTotal(res.data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(page); }, [page, fetchProducts]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    const token = localStorage.getItem('token');
    try {
      await backendClient.delete(`/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts(page);
    } catch (e) {
      alert('Failed to delete product');
    }
  };

  const openEdit = (product: Product) => {
    setEditTarget(product);
    setEditForm({
      title: product.title,
      description: '',
      price: product.price,
      discount: product.discount,
      stock: String(product.stock),
    });
  };

  const handleSave = async () => {
    if (!editTarget) return;
    setSaving(true);
    const token = localStorage.getItem('token');
    try {
      await backendClient.put(`/admin/products/${editTarget.productid}`, editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditTarget(null);
      fetchProducts(page);
    } catch (e) {
      alert('Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Products</h2>
        <span className="text-gray-400 text-sm">{total} total</span>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400 animate-pulse">Loading products...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800 bg-gray-800/50">
                  <th className="text-left px-6 py-3 font-medium">Image</th>
                  <th className="text-left px-6 py-3 font-medium">Title</th>
                  <th className="text-left px-6 py-3 font-medium">Price</th>
                  <th className="text-left px-6 py-3 font-medium">Discount</th>
                  <th className="text-left px-6 py-3 font-medium">Stock</th>
                  <th className="text-left px-6 py-3 font-medium">Category</th>
                  <th className="text-left px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.productid} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-3">
                      {p.imglink ? (
                        <img src={p.imglink} alt={p.title} className="w-12 h-12 object-cover rounded-lg" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                          <i className="fa-solid fa-image text-gray-600" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3 text-white font-medium max-w-xs truncate">{p.title}</td>
                    <td className="px-6 py-3 text-white">${Number(p.price).toFixed(2)}</td>
                    <td className="px-6 py-3 text-green-400">${Number(p.discount).toFixed(2)}</td>
                    <td className="px-6 py-3">
                      <span className={p.stock > 0 ? 'text-green-400' : 'text-red-400'}>{p.stock}</span>
                    </td>
                    <td className="px-6 py-3 text-gray-300">{p.category ?? '—'}</td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="px-3 py-1 rounded bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/40 transition-colors text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.productid)}
                          className="px-3 py-1 rounded bg-red-600/20 text-red-400 hover:bg-red-600/40 transition-colors text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">No products found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 rounded bg-gray-800 text-gray-300 disabled:opacity-40 hover:bg-gray-700 transition-colors text-sm"
            >
              Previous
            </button>
            <span className="text-gray-400 text-sm">Page {page} of {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 rounded bg-gray-800 text-gray-300 disabled:opacity-40 hover:bg-gray-700 transition-colors text-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-white font-semibold text-lg">Edit Product</h3>
              <button onClick={() => setEditTarget(null)} className="text-gray-400 hover:text-white">
                <i className="fa-solid fa-xmark text-xl" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { key: 'title', label: 'Title', type: 'text' },
                { key: 'description', label: 'Description', type: 'text' },
                { key: 'price', label: 'Price', type: 'number' },
                { key: 'discount', label: 'Discounted Price', type: 'number' },
                { key: 'stock', label: 'Stock', type: 'number' },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="block text-gray-400 text-sm mb-1">{label}</label>
                  <input
                    type={type}
                    value={(editForm as any)[key]}
                    onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-gray-800 flex gap-3 justify-end">
              <button
                onClick={() => setEditTarget(null)}
                className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-sm disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
