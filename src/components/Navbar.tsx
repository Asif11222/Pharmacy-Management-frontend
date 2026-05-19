'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<'user' | 'admin' | null>(null);
  const isAuthPage = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ].includes(pathname);

  const syncAuthState = () => {
    setIsLoggedIn(Boolean(localStorage.getItem('token')));

    try {
      const userRaw = localStorage.getItem('user');
      setRole(userRaw ? JSON.parse(userRaw).role : null);
    } catch {
      setRole(null);
    }
  };

  useEffect(() => {
    syncAuthState();

    const handleStorageChange = () => {
      syncAuthState();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    router.push('/login');
  };

  return (
    <nav className="bg-green-700 text-white px-6 py-4 shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Pharmacy Management
        </Link>

        <div className="flex items-center gap-5 text-sm font-medium">
          {isAuthPage || !isLoggedIn ? (
            <>
              <Link href="/register" className="hover:text-green-200">
                Register
              </Link>

              <Link href="/login" className="hover:text-green-200">
                Login
              </Link>

              <Link href="/forgot-password" className="hover:text-green-200">
                Forgot Password
              </Link>

              <Link href="/reset-password" className="hover:text-green-200">
                Reset Password
              </Link>
            </>
          ) : (
            <>
              <Link href={role === 'admin' ? '/admin' : '/dashboard'} className="hover:text-green-200">
                {role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
              </Link>

              <Link href="/change-password" className="hover:text-green-200">
                Change Password
              </Link>

              <Link href="/order" className="hover:text-green-200">
                Orders
              </Link>

              <Link href="/payments" className="hover:text-green-200">
                Payments
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-md bg-red-500 px-3 py-1 hover:bg-red-600"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}