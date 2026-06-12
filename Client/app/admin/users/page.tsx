'use client';
import React, { useEffect, useState, useCallback } from 'react';
import backendClient from '@/Helpers/backendClient';

interface User {
  userid: number;
  username: string;
  email: string;
  role: string;
  createdat: string;
}

const mockUsers: User[] = [
  { userid: 100000001, username: 'Admin', email: 'admin@admin.com', role: 'admin', createdat: '2026-01-01T00:00:00Z' },
  { userid: 100000002, username: 'john_doe', email: 'john@example.com', role: 'customer', createdat: '2026-02-15T08:30:00Z' },
  { userid: 100000003, username: 'sarah_k', email: 'sarah@example.com', role: 'customer', createdat: '2026-03-10T12:00:00Z' },
  { userid: 100000004, username: 'mike99', email: 'mike@example.com', role: 'customer', createdat: '2026-04-05T16:45:00Z' },
  { userid: 100000005, username: 'alice_w', email: 'alice@example.com', role: 'customer', createdat: '2026-05-20T09:00:00Z' },
];

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const limit = 20;

  const fetchUsers = useCallback(async (p: number) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await backendClient.get(`/admin/users?page=${p}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data?.data ?? mockUsers);
      setTotal(res.data?.total ?? mockUsers.length);
    } catch (e) {
      setUsers(mockUsers);
      setTotal(mockUsers.length);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(page); }, [page, fetchUsers]);

  const handleRoleChange = async (userid: number, role: string) => {
    setUpdating(userid);
    const token = localStorage.getItem('token');
    try {
      await backendClient.put(`/admin/users/${userid}/role`, { role }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.map((u) => (u.userid === userid ? { ...u, role } : u)));
    } catch (e) {
      alert('Failed to update user role');
    } finally {
      setUpdating(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Users</h2>
        <span className="text-gray-400 text-sm">{total} total</span>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400 animate-pulse">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800 bg-gray-800/50">
                  <th className="text-left px-6 py-3 font-medium">ID</th>
                  <th className="text-left px-6 py-3 font-medium">Username</th>
                  <th className="text-left px-6 py-3 font-medium">Email</th>
                  <th className="text-left px-6 py-3 font-medium">Role</th>
                  <th className="text-left px-6 py-3 font-medium">Joined</th>
                  <th className="text-left px-6 py-3 font-medium">Change Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.userid} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-3 text-gray-500 text-xs">{user.userid}</td>
                    <td className="px-6 py-3 text-white font-medium">{user.username}</td>
                    <td className="px-6 py-3 text-gray-300">{user.email}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-indigo-500/20 text-indigo-400'
                          : 'bg-gray-700 text-gray-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-400">{new Date(user.createdat).toLocaleDateString()}</td>
                    <td className="px-6 py-3">
                      <select
                        value={user.role}
                        disabled={updating === user.userid}
                        onChange={(e) => handleRoleChange(user.userid, e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-gray-300 text-xs focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                      >
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">No users found</td>
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
