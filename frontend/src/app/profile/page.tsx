'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useStore } from '@/store';
import { Navbar, Footer } from '@/components/layout/Navbar';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { orderApi, userApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { User, Package, Settings, LogOut, ChevronRight } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

type Tab = 'orders' | 'settings';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const { user, clearAuth, setAuth } = useStore();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('orders');
  const [form, setForm] = useState({ nickname: user?.nickname || '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);

  if (!user) {
    router.push('/login');
    return null;
  }

  const { data: ordersData } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => orderApi.getMyOrders({ page: 0, size: 20 }),
  });

  const orders = ordersData?.data?.data?.content || [];

  const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    PAID: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    SHIPPED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    DELIVERED: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    CANCELLED: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
    REFUNDED: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await userApi.updateProfile(form);
      if (res.data?.data) {
        const updated = res.data.data;
        const storeData = localStorage.getItem('xoana-store');
        const token = storeData ? JSON.parse(storeData)?.state?.token || '' : '';
        setAuth({ ...user, nickname: updated.nickname, phone: updated.phone, address: updated.address }, token);
      }
    } catch {}
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-700 text-2xl font-bold text-white">
            {(user.nickname || user.username)?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{user.nickname || user.username}</h1>
            <p className="text-zinc-500">{user.email}</p>
            {user.role === 'ADMIN' && (
              <span className="mt-1 inline-block rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">管理员</span>
            )}
          </div>
          <div className="ml-auto flex gap-2">
            {user.role === 'ADMIN' && (
              <button onClick={() => router.push('/admin')} className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300">
                进入后台
              </button>
            )}
            <button onClick={() => { clearAuth(); router.push('/'); }} className="flex items-center gap-1 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300">
              <LogOut className="h-4 w-4" /> 退出
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mb-6 flex border-b border-zinc-200 dark:border-zinc-800">
          {([
            { id: 'orders', label: t('orders'), icon: Package },
            { id: 'settings', label: t('settings'), icon: Settings },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium transition-colors ${tab === id ? 'border-zinc-900 text-zinc-900 dark:border-white dark:text-white' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="py-16 text-center text-zinc-400">暂无订单</div>
            ) : orders.map((order: any) => (
              <div key={order.id} className="rounded-2xl border border-zinc-100 p-5 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-white">订单号: {order.orderNo}</p>
                    <p className="text-sm text-zinc-400">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[order.status] || ''}`}>
                      {t(`orderStatus.${order.status}` as any)}
                    </span>
                    <p className="font-bold text-zinc-900 dark:text-white">{formatPrice(order.totalAmount)}</p>
                  </div>
                </div>
                {order.items && order.items.length > 0 && (
                  <div className="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm text-zinc-500">
                        <span>{item.productName} × {item.quantity}</span>
                        <span>{formatPrice(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Settings Tab */}
        {tab === 'settings' && (
          <form onSubmit={handleSave} className="max-w-lg space-y-4">
            {[
              { key: 'nickname', label: t('nickname'), type: 'text' },
              { key: 'phone', label: t('phone'), type: 'tel' },
              { key: 'address', label: t('address'), type: 'text' },
            ].map(field => (
              <div key={field.key}>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{field.label}</label>
                <input type={field.type} value={form[field.key as keyof typeof form]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 focus:border-violet-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
              </div>
            ))}
            <button type="submit" disabled={saving} className="rounded-xl bg-zinc-900 px-6 py-3 font-semibold text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900">
              {saving ? '保存中...' : t('save')}
            </button>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}
