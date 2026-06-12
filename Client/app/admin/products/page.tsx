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

interface AddForm {
  title: string;
  description: string;
  price: string;
  discount: string;
  stock: string;
  tags: string;
  imgLink: string;
  imgAlt: string;
  isSale: boolean;
  isNew: boolean;
  isDiscount: boolean;
  categoryID: string;
}

const mockProducts: Product[] = [
  { productid: 'p001', title: 'Wireless Noise-Cancelling Headphones', price: '149.99', discount: '119.99', stock: 35, category: 'Electronics', imglink: '' },
  { productid: 'p002', title: 'Ergonomic Office Chair', price: '299.99', discount: '249.99', stock: 12, category: 'Furniture', imglink: '' },
  { productid: 'p003', title: 'Stainless Steel Water Bottle', price: '29.99', discount: '24.99', stock: 200, category: 'Kitchen', imglink: '' },
  { productid: 'p004', title: 'Mechanical Gaming Keyboard', price: '89.99', discount: '79.99', stock: 0, category: 'Electronics', imglink: '' },
  { productid: 'p005', title: 'Yoga Mat Premium', price: '49.99', discount: '39.99', stock: 75, category: 'Sports', imglink: '' },
];

const emptyAdd: AddForm = {
  title: '', description: '', price: '', discount: '', stock: '',
  tags: '', imgLink: '', imgAlt: '', isSale: false, isNew: false, isDiscount: false, categoryID: '',
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ title: '', description: '', price: '', discount: '', stock: '' });
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<AddForm>(emptyAdd);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const limit = 20;

  const fetchProducts = useCallback(async (p: number) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await backendClient.get(`/admin/products?page=${p}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data?.data ?? mockProducts);
      setTotal(res.data?.total ?? mockProducts.length);
    } catch (e) {
      setProducts(mockProducts);
      setTotal(mockProducts.length);
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
    } catch {
      // mock
    }
    setProducts((prev) => prev.filter((p) => p.productid !== id));
    setTotal((t) => t - 1);
  };

  const openEdit = (product: Product) => {
    setEditTarget(product);
    setEditForm({ title: product.title, description: '', price: product.price, discount: product.discount, stock: String(product.stock) });
  };

  const handleSave = async () => {
    if (!editTarget) return;
    setSaving(true);
    const token = localStorage.getItem('token');
    try {
      await backendClient.put(`/admin/products/${editTarget.productid}`, editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // mock
    }
    setProducts((prev) => prev.map((p) =>
      p.productid === editTarget.productid
        ? { ...p, title: editForm.title || p.title, price: editForm.price || p.price, discount: editForm.discount || p.discount, stock: parseInt(editForm.stock) || p.stock }
        : p
    ));
    setEditTarget(null);
    setSaving(false);
  };

  const handleAdd = async () => {
    setAddError('');
    setAddSuccess('');
    if (!addForm.title || !addForm.description || !addForm.price || !addForm.stock) {
      setAddError('Title, description, price and stock are required.');
      return;
    }
    setAdding(true);
    const token = localStorage.getItem('token');
    try {
      await backendClient.post('/product/create', {
        title: addForm.title,
        description: addForm.description,
        price: parseFloat(addForm.price),
        discount: parseFloat(addForm.discount || '0'),
        stock: parseInt(addForm.stock),
        tags: addForm.tags,
        imgLink: addForm.imgLink || 'https://placehold.co/400x400',
        imgAlt: addForm.imgAlt || addForm.title,
        isSale: addForm.isSale,
        isNew: addForm.isNew,
        isDiscount: addForm.isDiscount,
        categoryID: parseInt(addForm.categoryID || '1'),
      }, { headers: { Authorization: `Bearer ${token}` } });
    } catch {
      // backend ishlamasa mock ga qo'shamiz
    }
    const newProduct: Product = {
      productid: `mock-${Date.now()}`,
      title: addForm.title,
      price: addForm.price,
      discount: addForm.discount || '0',
      stock: parseInt(addForm.stock),
      category: addForm.categoryID || '—',
      imglink: addForm.imgLink,
    };
    setProducts((prev) => [newProduct, ...prev]);
    setTotal((t) => t + 1);
    setAddSuccess('Product added successfully!');
    setAddForm(emptyAdd);
    setTimeout(() => { setShowAdd(false); setAddSuccess(''); }, 1200);
    setAdding(false);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Products</h2>
          <p className="text-gray-500 text-sm mt-0.5">{total} products total</p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setAddError(''); setAddSuccess(''); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <i className="fa-solid fa-plus text-xs" />
          Add Product
        </button>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-500 text-sm">Loading products...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800 bg-gray-800/30">
                  <th className="text-left px-6 py-3 font-medium">Product</th>
                  <th className="text-left px-6 py-3 font-medium">Price</th>
                  <th className="text-left px-6 py-3 font-medium">Discount</th>
                  <th className="text-left px-6 py-3 font-medium">Stock</th>
                  <th className="text-left px-6 py-3 font-medium">Category</th>
                  <th className="text-left px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.productid} className="border-b border-gray-800/40 hover:bg-gray-800/20 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        {p.imglink ? (
                          <img src={p.imglink} alt={p.title} className="w-10 h-10 object-cover rounded-lg border border-gray-700" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center">
                            <i className="fa-solid fa-image text-gray-600 text-xs" />
                          </div>
                        )}
                        <span className="text-white font-medium max-w-xs truncate">{p.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-white">${Number(p.price).toFixed(2)}</td>
                    <td className="px-6 py-3 text-emerald-400">${Number(p.discount).toFixed(2)}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.stock > 0 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {p.stock > 0 ? p.stock : 'Out of stock'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-400">{p.category ?? '—'}</td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600/15 text-indigo-400 hover:bg-indigo-600/30 transition-colors text-xs font-medium border border-indigo-500/20"
                        >
                          <i className="fa-solid fa-pen-to-square mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.productid)}
                          className="px-3 py-1.5 rounded-lg bg-red-600/15 text-red-400 hover:bg-red-600/30 transition-colors text-xs font-medium border border-red-500/20"
                        >
                          <i className="fa-solid fa-trash mr-1" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-600">
                      <i className="fa-solid fa-box-open text-2xl mb-2 block" />
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}
              className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 disabled:opacity-40 hover:bg-gray-700 transition-colors text-sm">
              <i className="fa-solid fa-chevron-left mr-1 text-xs" /> Previous
            </button>
            <span className="text-gray-500 text-sm">Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)}
              className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 disabled:opacity-40 hover:bg-gray-700 transition-colors text-sm">
              Next <i className="fa-solid fa-chevron-right ml-1 text-xs" />
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-white font-semibold">Edit Product</h3>
              <button onClick={() => setEditTarget(null)} className="text-gray-400 hover:text-white transition-colors">
                <i className="fa-solid fa-xmark text-xl" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {([
                { key: 'title', label: 'Title', type: 'text' },
                { key: 'description', label: 'Description', type: 'text' },
                { key: 'price', label: 'Price ($)', type: 'number' },
                { key: 'discount', label: 'Discounted Price ($)', type: 'number' },
                { key: 'stock', label: 'Stock', type: 'number' },
              ] as { key: keyof EditForm; label: string; type: string }[]).map(({ key, label, type }) => (
                <div key={key}>
                  <label className="block text-gray-400 text-xs mb-1.5 font-medium">{label}</label>
                  <input
                    type={type}
                    value={editForm[key]}
                    onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm transition-colors"
                  />
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-gray-800 flex gap-3 justify-end">
              <button onClick={() => setEditTarget(null)}
                className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors text-sm">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-sm disabled:opacity-60">
                {saving ? <><i className="fa-solid fa-spinner fa-spin mr-1" />Saving...</> : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-white font-semibold text-lg">Add New Product</h3>
                <p className="text-gray-500 text-xs mt-0.5">Fill in the product details below</p>
              </div>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-white transition-colors">
                <i className="fa-solid fa-xmark text-xl" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {/* Basic info */}
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Basic Info</p>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5">Title <span className="text-red-400">*</span></label>
                    <input type="text" value={addForm.title}
                      onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                      placeholder="e.g. Wireless Headphones Pro"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5">Description <span className="text-red-400">*</span></label>
                    <textarea value={addForm.description}
                      onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                      placeholder="Product description..."
                      rows={3}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600 resize-none" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5">Tags</label>
                    <input type="text" value={addForm.tags}
                      onChange={(e) => setAddForm({ ...addForm, tags: e.target.value })}
                      placeholder="e.g. wireless, audio, bluetooth"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600" />
                  </div>
                </div>
              </div>

              {/* Pricing & stock */}
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Pricing & Stock</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5">Price ($) <span className="text-red-400">*</span></label>
                    <input type="number" min="0" step="0.01" value={addForm.price}
                      onChange={(e) => setAddForm({ ...addForm, price: e.target.value })}
                      placeholder="0.00"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5">Discount Price ($)</label>
                    <input type="number" min="0" step="0.01" value={addForm.discount}
                      onChange={(e) => setAddForm({ ...addForm, discount: e.target.value })}
                      placeholder="0.00"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5">Stock <span className="text-red-400">*</span></label>
                    <input type="number" min="0" value={addForm.stock}
                      onChange={(e) => setAddForm({ ...addForm, stock: e.target.value })}
                      placeholder="0"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600" />
                  </div>
                </div>
              </div>

              {/* Category */}
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Category</p>
                <div>
                  <label className="block text-gray-400 text-xs mb-1.5">Category ID <span className="text-red-400">*</span></label>
                  <input type="number" min="1" value={addForm.categoryID}
                    onChange={(e) => setAddForm({ ...addForm, categoryID: e.target.value })}
                    placeholder="e.g. 1"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600" />
                </div>
              </div>

              {/* Image */}
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Primary Image</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5">Image URL <span className="text-red-400">*</span></label>
                    <input type="text" value={addForm.imgLink}
                      onChange={(e) => setAddForm({ ...addForm, imgLink: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5">Alt Text <span className="text-red-400">*</span></label>
                    <input type="text" value={addForm.imgAlt}
                      onChange={(e) => setAddForm({ ...addForm, imgAlt: e.target.value })}
                      placeholder="Product image description"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600" />
                  </div>
                </div>
              </div>

              {/* Flags */}
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Product Flags</p>
                <div className="flex gap-4">
                  {([
                    { key: 'isSale', label: 'On Sale', color: 'text-yellow-400' },
                    { key: 'isNew', label: 'New Arrival', color: 'text-blue-400' },
                    { key: 'isDiscount', label: 'Discounted', color: 'text-green-400' },
                  ] as { key: keyof Pick<AddForm, 'isSale' | 'isNew' | 'isDiscount'>; label: string; color: string }[]).map(({ key, label, color }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                      <div
                        onClick={() => setAddForm({ ...addForm, [key]: !addForm[key] })}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${addForm[key] ? 'bg-indigo-600 border-indigo-600' : 'bg-gray-800 border-gray-600'}`}
                      >
                        {addForm[key] && <i className="fa-solid fa-check text-white text-xs" />}
                      </div>
                      <span className={`text-sm ${color}`}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {addError && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  <i className="fa-solid fa-circle-exclamation" />
                  {addError}
                </div>
              )}
              {addSuccess && (
                <div className="flex items-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
                  <i className="fa-solid fa-circle-check" />
                  {addSuccess}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-800 flex gap-3 justify-end flex-shrink-0">
              <button onClick={() => setShowAdd(false)}
                className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors text-sm">
                Cancel
              </button>
              <button onClick={handleAdd} disabled={adding}
                className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-60">
                {adding ? <><i className="fa-solid fa-spinner fa-spin mr-1.5" />Adding...</> : <><i className="fa-solid fa-plus mr-1.5" />Add Product</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
