'use client';
import React, { useEffect, useState } from 'react';
import backendClient from '@/Helpers/backendClient';

interface Stats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  recentOrders: RecentOrder[];
}

interface RecentOrder {
  orderid: string;
  totalamount: string;
  orderstatus: string;
  createdat: string;
  username: string;
  email: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  processing: 'bg-blue-500/20 text-blue-400',
  shipped: 'bg-purple-500/20 text-purple-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    backendClient
      .get('/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-red-400">Failed to load stats.</div>;
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: 'fa-users', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Total Orders', value: stats.totalOrders, icon: 'fa-cart-shopping', color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Total Products', value: stats.totalProducts, icon: 'fa-box', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Total Revenue', value: `$${Number(stats.totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: 'fa-dollar-sign', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Dashboard</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-gray-900 rounded-xl border border-gray-800 p-5 flex items-center gap-4">
            <div className={`${card.bg} ${card.color} rounded-lg p-3`}>
              <i className={`fa-solid ${card.icon} text-xl`} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">{card.label}</p>
              <p className="text-white font-bold text-xl">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="px-6 py-4 border-b border-gray-800">
          <h3 className="text-white font-semibold text-lg">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-800">
                <th className="text-left px-6 py-3 font-medium">Order ID</th>
                <th className="text-left px-6 py-3 font-medium">Customer</th>
                <th className="text-left px-6 py-3 font-medium">Amount</th>
                <th className="text-left px-6 py-3 font-medium">Status</th>
                <th className="text-left px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr key={order.orderid} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-3 text-gray-300 font-mono text-xs">{order.orderid.slice(0, 8)}...</td>
                  <td className="px-6 py-3">
                    <div className="text-white font-medium">{order.username}</div>
                    <div className="text-gray-400 text-xs">{order.email}</div>
                  </td>
                  <td className="px-6 py-3 text-white">${Number(order.totalamount).toFixed(2)}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.orderstatus] ?? 'bg-gray-700 text-gray-300'}`}>
                      {order.orderstatus}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-400">{new Date(order.createdat).toLocaleDateString()}</td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No orders yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
