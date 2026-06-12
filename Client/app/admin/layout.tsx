'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import backendClient from '@/Helpers/backendClient';

const navLinks = [
  { href: '/admin', label: 'Dashboard', icon: 'fa-gauge' },
  { href: '/admin/products', label: 'Products', icon: 'fa-box' },
  { href: '/admin/orders', label: 'Orders', icon: 'fa-cart-shopping' },
  { href: '/admin/users', label: 'Users', icon: 'fa-users' },
  { href: '/admin/reviews', label: 'Reviews', icon: 'fa-star' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-lg animate-pulse">Verifying admin access...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-16'
        } transition-all duration-300 bg-gray-900 border-r border-gray-800 flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          {sidebarOpen && (
            <span className="text-white font-bold text-lg tracking-wide">Admin Panel</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white transition-colors ml-auto"
          >
            <i className={`fa-solid ${sidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`} />
          </button>
        </div>
        <nav className="flex-1 py-4">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                  active
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <i className={`fa-solid ${link.icon} w-5 text-center`} />
                {sidebarOpen && <span className="text-sm font-medium">{link.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <Link
            href="/"
            className={`flex items-center gap-3 text-gray-400 hover:text-white transition-colors ${
              !sidebarOpen ? 'justify-center' : ''
            }`}
          >
            <i className="fa-solid fa-arrow-left w-5 text-center" />
            {sidebarOpen && <span className="text-sm">Back to Site</span>}
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
          <h1 className="text-gray-300 text-sm">
            D quyib bering  /{') '}
            <span className="text-white font-semibold">
              {navLinks.find((l) => l.href === pathname)?.label ?? 'Admin'}
            </span>
          </h1>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
