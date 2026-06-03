'use client';
import React, { useEffect, useState, useCallback } from 'react';
import backendClient from '@/Helpers/backendClient';

interface Review {
  reviewid: string;
  rating: number;
  title: string;
  comment: string;
  createdat: string;
  username: string;
  email: string;
  product_title: string;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const fetchReviews = useCallback(async (p: number) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await backendClient.get(`/admin/reviews?page=${p}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(res.data.data);
      setTotal(res.data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReviews(page); }, [page, fetchReviews]);

  const handleDelete = async (reviewid: string) => {
    if (!confirm('Delete this review?')) return;
    const token = localStorage.getItem('token');
    try {
      await backendClient.delete(`/admin/reviews/${reviewid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews((prev) => prev.filter((r) => r.reviewid !== reviewid));
      setTotal((t) => t - 1);
    } catch (e) {
      alert('Failed to delete review');
    }
  };

  const totalPages = Math.ceil(total / limit);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`fa-solid fa-star text-xs ${i < rating ? 'text-yellow-400' : 'text-gray-600'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Reviews</h2>
        <span className="text-gray-400 text-sm">{total} total</span>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400 animate-pulse">Loading reviews...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800 bg-gray-800/50">
                  <th className="text-left px-6 py-3 font-medium">User</th>
                  <th className="text-left px-6 py-3 font-medium">Product</th>
                  <th className="text-left px-6 py-3 font-medium">Rating</th>
                  <th className="text-left px-6 py-3 font-medium">Title</th>
                  <th className="text-left px-6 py-3 font-medium">Comment</th>
                  <th className="text-left px-6 py-3 font-medium">Date</th>
                  <th className="text-left px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review.reviewid} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-3">
                      <div className="text-white font-medium">{review.username}</div>
                      <div className="text-gray-400 text-xs">{review.email}</div>
                    </td>
                    <td className="px-6 py-3 text-gray-300 max-w-xs truncate">{review.product_title}</td>
                    <td className="px-6 py-3">
                      <div className="flex gap-0.5">{renderStars(review.rating)}</div>
                    </td>
                    <td className="px-6 py-3 text-gray-300 max-w-xs truncate">{review.title ?? '—'}</td>
                    <td className="px-6 py-3 text-gray-400 max-w-xs truncate">{review.comment}</td>
                    <td className="px-6 py-3 text-gray-400">{new Date(review.createdat).toLocaleDateString()}</td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => handleDelete(review.reviewid)}
                        className="px-3 py-1 rounded bg-red-600/20 text-red-400 hover:bg-red-600/40 transition-colors text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {reviews.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">No reviews found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

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
    </div>
  );
}
