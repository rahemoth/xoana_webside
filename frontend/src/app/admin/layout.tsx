'use client';

import { useStore } from '@/store';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, Package, FileText, ShoppingBag, BarChart3, Settings, LogOut, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/admin', label: '仪表盘', icon: LayoutDashboard },
  { href: '/admin/products', label: '产品管理', icon: Package },
  { href: '/admin/articles', label: '文章管理', icon: FileText },
  { href: '/admin/orders', label: '订单管理', icon: ShoppingBag },
  { href: '/admin/users', label: '用户管理', icon: Users },
  { href: '/admin/messages', label: '联系消息', icon: MessageSquare },
  { href: '/admin/traffic', label: '流量统计', icon: BarChart3 },
  { href: '/admin/settings', label: '内容设置', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, clearAuth } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/login');
    }
  }, [user]);

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 flex h-full w-64 flex-col bg-white shadow-sm dark:bg-zinc-900">
        <div className="border-b border-zinc-100 p-6 dark:border-zinc-800">
          <Link href="/" className="text-xl font-bold text-zinc-900 dark:text-white">XOANA</Link>
          <p className="mt-0.5 text-xs text-zinc-400">管理后台</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                        : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-zinc-100 p-4 dark:border-zinc-800">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
              {user?.nickname?.[0] || 'A'}
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-white">{user?.nickname || user?.username}</p>
              <p className="text-xs text-zinc-400">管理员</p>
            </div>
          </div>
          <button
            onClick={() => { clearAuth(); router.push('/login'); }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <LogOut className="h-4 w-4" /> 退出登录
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-64 flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}
