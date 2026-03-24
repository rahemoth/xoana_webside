'use client';

import { useQuery } from '@tanstack/react-query';
import { trafficApi, orderApi } from '@/lib/api';
import { useStore } from '@/store';
import { motion } from 'framer-motion';
import { Users, Package, BarChart3, ShoppingBag, TrendingUp, ArrowUpRight } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminDashboard() {
  const { user, _hasHydrated } = useStore();
  const isAdmin = _hasHydrated && !!user && user.role === 'ADMIN';

  const { data: statsData } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => trafficApi.getStats(7),
    enabled: isAdmin,
  });

  const { data: ordersData } = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: () => orderApi.getAllAdmin({ page: 0, size: 5 }),
    enabled: isAdmin,
  });

  const stats = statsData?.data?.data || {};
  const recentOrders = ordersData?.data?.data?.content || [];

  const cards = [
    { label: '总用户数', value: stats.totalUsers || 2, icon: Users, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', trend: '' },
    { label: '总订单数', value: stats.totalOrders || 0, icon: ShoppingBag, color: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400', trend: '' },
    { label: '7日访问量', value: stats.totalVisits || 0, icon: BarChart3, color: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', trend: '' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">仪表盘</h1>
        <p className="text-zinc-500 dark:text-zinc-400">欢迎回来，查看最新数据</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div className={`rounded-xl p-2.5 ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <span className="flex items-center gap-0.5 text-xs font-medium text-green-600">
                <ArrowUpRight className="h-3 w-3" />{card.trend}
              </span>
            </div>
            <p className="mt-4 text-2xl font-bold text-zinc-900 dark:text-white">{card.value}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900">
        <h2 className="mb-4 font-semibold text-zinc-900 dark:text-white">最近订单</h2>
        {recentOrders.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-400">暂无订单</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  {['订单号', '金额', '状态', '时间'].map(h => (
                    <th key={h} className="pb-3 text-left font-medium text-zinc-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order: any) => (
                  <tr key={order.id} className="border-b border-zinc-50 dark:border-zinc-800/50">
                    <td className="py-3 font-medium text-zinc-900 dark:text-white">{order.orderNo}</td>
                    <td className="py-3 text-zinc-700 dark:text-zinc-300">{formatPrice(order.totalAmount)}</td>
                    <td className="py-3"><span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">{order.status}</span></td>
                    <td className="py-3 text-zinc-500">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
