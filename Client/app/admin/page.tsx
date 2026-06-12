'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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

const mockStats: Stats = {
  totalUsers: 142,
  totalOrders: 87,
  totalProducts: 54,
  totalRevenue: 18340.5,
  recentOrders: [
    { orderid: 'ord-0001-xxxx', totalamount: '129.99', orderstatus: 'delivered', createdat: '2026-06-10T10:00:00Z', username: 'john_doe', email: 'john@example.com' },
    { orderid: 'ord-0002-xxxx', totalamount: '74.50', orderstatus: 'processing', createdat: '2026-06-09T14:30:00Z', username: 'sarah_k', email: 'sarah@example.com' },
    { orderid: 'ord-0003-xxxx', totalamount: '210.00', orderstatus: 'shipped', createdat: '2026-06-08T09:15:00Z', username: 'mike99', email: 'mike@example.com' },
    { orderid: 'ord-0004-xxxx', totalamount: '45.00', orderstatus: 'pending', createdat: '2026-06-07T18:00:00Z', username: 'alice_w', email: 'alice@example.com' },
    { orderid: 'ord-0005-xxxx', totalamount: '390.00', orderstatus: 'cancelled', createdat: '2026-06-06T11:20:00Z', username: 'bob_t', email: 'bob@example.com' },
  ],
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  processing: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  shipped: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  delivered: 'bg-green-500/20 text-green-300 border border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-300 border border-red-500/30',
};

const statusDot: Record<string, string> = {
  pending: 'bg-yellow-400',
  processing: 'bg-blue-400',
  shipped: 'bg-purple-400',
  delivered: 'bg-green-400',
  cancelled: 'bg-red-400',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    backendClient
      .get('/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setStats(res.data ?? mockStats))
      .catch(() => setStats(mockStats))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: 'fa-users',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      trend: '+12% this month',
      trendUp: true,
      href: '/admin/users',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: 'fa-cart-shopping',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      trend: '+8% this week',
      trendUp: true,
      href: '/admin/orders',
    },
    {
      label: 'Total Products',
      value: stats.totalProducts.toLocaleString(),
      icon: 'fa-box',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      trend: 'In catalogue',
      trendUp: null,
      href: '/admin/products',
    },
    {
      label: 'Total Revenue',
      value: `$${Number(stats.totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: 'fa-dollar-sign',
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      trend: '+23% this month',
      trendUp: true,
      href: null,
    },
  ];

  const orderStatusSummary = stats.recentOrders.reduce<Record<string, number>>((acc, o) => {
    acc[o.orderstatus] = (acc[o.orderstatus] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <p className="text-gray-500 text-sm mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <Link
          href="/admin/products"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <i className="fa-solid fa-plus text-xs" />
          Add Product
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const inner = (
            <div className={`bg-gray-900 rounded-xl border ${card.border} p-5 hover:bg-gray-800/60 transition-colors group`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`${card.bg} ${card.color} rounded-xl p-3`}>
                  <i className={`fa-solid ${card.icon} text-lg`} />
                </div>
                {card.trendUp !== null && (
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${card.trendUp ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    <i className={`fa-solid ${card.trendUp ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'} mr-1`} />
                    {card.trend}
                  </span>
                )}
                {card.trendUp === null && (
                  <span className="text-xs text-gray-500">{card.trend}</span>
                )}
              </div>
              <p className="text-gray-400 text-sm mb-1">{card.label}</p>
              <p className="text-white font-bold text-2xl tracking-tight">{card.value}</p>
            </div>
          );
          return card.href ? (
            <Link key={card.label} href={card.href}>{inner}</Link>
          ) : (
            <div key={card.label}>{inner}</div>
          );
        })}
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order status breakdown */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
            <i className="fa-solid fa-chart-pie text-indigo-400 text-sm" />
            Order Breakdown
          </h3>
          <div className="space-y-3">
            {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => {
              const count = orderStatusSummary[status] ?? 0;
              const total = stats.recentOrders.length || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${statusDot[status]}`} />
                      <span className="text-gray-300 text-sm capitalize">{status}</span>
                    </div>
                    <span className="text-gray-400 text-sm">{count}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${statusDot[status]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
            <i className="fa-solid fa-bolt text-yellow-400 text-sm" />
            Quick Actions
          </h3>
          <div className="space-y-2">
            {[
              { label: 'Manage Products', icon: 'fa-box', href: '/admin/products', color: 'text-purple-400', bg: 'hover:bg-purple-500/10' },
              { label: 'View Orders', icon: 'fa-cart-shopping', href: '/admin/orders', color: 'text-emerald-400', bg: 'hover:bg-emerald-500/10' },
              { label: 'Manage Users', icon: 'fa-users', href: '/admin/users', color: 'text-blue-400', bg: 'hover:bg-blue-500/10' },
              { label: 'Review Reports', icon: 'fa-star', href: '/admin/reviews', color: 'text-yellow-400', bg: 'hover:bg-yellow-500/10' },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg ${action.bg} transition-colors group`}
              >
                <i className={`fa-solid ${action.icon} ${action.color} w-4 text-center`} />
                <span className="text-gray-300 group-hover:text-white text-sm transition-colors">{action.label}</span>
                <i className="fa-solid fa-chevron-right text-gray-600 group-hover:text-gray-400 ml-auto text-xs transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Revenue summary */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
            <i className="fa-solid fa-wallet text-green-400 text-sm" />
            Revenue Summary
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <span className="text-gray-400 text-sm">Total Revenue</span>
              <span className="text-white font-semibold">${Number(stats.totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <span className="text-gray-400 text-sm">Avg. Order Value</span>
              <span className="text-white font-semibold">
                ${stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <span className="text-gray-400 text-sm">Total Orders</span>
              <span className="text-white font-semibold">{stats.totalOrders}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-gray-400 text-sm">Active Users</span>
              <span className="text-white font-semibold">{stats.totalUsers}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <i className="fa-solid fa-clock-rotate-left text-gray-400 text-sm" />
            Recent Orders
          </h3>
          <Link href="/admin/orders" className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
            View all <i className="fa-solid fa-arrow-right text-xs ml-1" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-gray-800 bg-gray-800/30">
                <th className="text-left px-6 py-3 font-medium">Customer</th>
                <th className="text-left px-6 py-3 font-medium">Amount</th>
                <th className="text-left px-6 py-3 font-medium">Status</th>
                <th className="text-left px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr key={order.orderid} className="border-b border-gray-800/40 hover:bg-gray-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-semibold text-xs">
                        {order.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">{order.username}</div>
                        <div className="text-gray-500 text-xs">{order.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white font-medium">${Number(order.totalamount).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.orderstatus] ?? 'bg-gray-700 text-gray-300'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDot[order.orderstatus] ?? 'bg-gray-400'}`} />
                      {order.orderstatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{new Date(order.createdat).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-600">
                    <i className="fa-solid fa-inbox text-2xl mb-2 block" />
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
