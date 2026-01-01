'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

const menuItems = [
  {
    title: 'Món ăn',
    href: '/menu',
  },
  {
    title: 'Đơn hàng',
    href: '/orders',
    authRequired: true,
  },
  {
    title: 'Đăng nhập',
    href: '/login',
    authRequired: false,
  },
  {
    title: 'Quản lý',
    href: '/manage/dashboard',
    authRequired: true,
  },
];

export default function NavItems({ className }: { className?: string }) {
  const { isReady, isAuthenticated } = useAuth();

  // Avoid rendering auth-dependent items until after client mount.
  // This prevents server/client markup mismatch during hydration.
  if (!isReady) return null;

  return (
    <>
      {menuItems.map((item) => {
        if (
          (item.authRequired === false && isAuthenticated) ||
          (item.authRequired === true && !isAuthenticated)
        )
          return null;

        return (
          <Link href={item.href} key={item.href} className={className}>
            {item.title}
          </Link>
        );
      })}
    </>
  );
}
