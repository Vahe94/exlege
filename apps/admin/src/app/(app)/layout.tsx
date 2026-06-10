'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { api, getStoredUser, logout, type SessionUser } from '@/lib/api';
import { Button } from '@/components/ui';

const NAV = [
  { href: '/', key: 'dashboard' },
  { href: '/cases', key: 'cases' },
  { href: '/tasks', key: 'tasks' },
  { href: '/documents', key: 'documents' },
  { href: '/posts', key: 'posts' },
  { href: '/leads', key: 'leads' },
  { href: '/notifications', key: 'notifications' },
] as const;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('nav');
  const ta = useTranslations('auth');
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) {
      router.replace('/login');
    } else {
      setUser(stored);
    }
  }, [router]);

  const { data: unread } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => api<{ count: number }>('/notifications/unread-count'),
    refetchInterval: 30_000,
    enabled: !!user,
  });

  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 flex-col border-r bg-white">
        <div className="px-5 py-4 text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
          ExLege
        </div>
        <nav className="flex-1 space-y-0.5 px-2">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between rounded-md px-3 py-2 text-sm ${
                  active
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{t(item.key)}</span>
                {item.key === 'notifications' && (unread?.count ?? 0) > 0 && (
                  <span className="rounded-full bg-red-500 px-1.5 text-xs text-white">
                    {unread?.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-3">
          <div className="mb-2 truncate px-2 text-xs text-gray-500">{user.email}</div>
          <Button
            variant="ghost"
            className="w-full text-left"
            onClick={async () => {
              await logout();
              router.replace('/login');
            }}
          >
            {ta('logout')}
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
