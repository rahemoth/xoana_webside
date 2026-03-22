'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/lib/api';
import { Navbar, Footer } from '@/components/layout/Navbar';
import Link from 'next/link';
import { Search, ShoppingCart, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '@/store';
import { formatPrice } from '@/lib/utils';
import { MagicCard } from '@/components/magic';

interface Product {
  id: number;
  name: string;
  price: number;
  coverImage?: string;
  category?: string;
  stock: number;
  description?: string;
}

const CATEGORIES = ['全部', 'Pro Series', 'Street', 'Limited', 'Cruiser', 'Mini'];

const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'Pro Classic 指板', price: 299, stock: 10, coverImage: '', category: 'Pro Series', description: '经典专业系列，适合初学者与进阶玩家' },
  { id: 2, name: 'Street Deck X', price: 399, stock: 5, coverImage: '', category: 'Street', description: '街式风格，灵感来自街头滑板文化' },
  { id: 3, name: 'Limited 联名款', price: 599, stock: 3, coverImage: '', category: 'Limited', description: '限量联名款，每块独一无二' },
  { id: 4, name: 'Mini Cruiser', price: 199, stock: 15, coverImage: '', category: 'Cruiser', description: '迷你巡航款，轻便易携带' },
  { id: 5, name: 'Pro Elite V2', price: 499, stock: 8, coverImage: '', category: 'Pro Series', description: 'Pro系列升级版，更高品质材料' },
  { id: 6, name: 'Street Shadow', price: 359, stock: 12, coverImage: '', category: 'Street', description: '暗黑街式风格，彰显个性' },
  { id: 7, name: 'Mini Pocket', price: 169, stock: 20, coverImage: '', category: 'Mini', description: '口袋系列，随时随地练习' },
  { id: 8, name: 'Limited X-Edition', price: 799, stock: 1, coverImage: '', category: 'Limited', description: 'X特别版，全球限量50块' },
];

export default function ProductsPage() {
  const t = useTranslations('products');
  const { addToCart } = useStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('全部');
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, category, search],
    queryFn: () => productApi.getAll({
      page,
      size: 12,
      category: category !== '全部' ? category : undefined,
      keyword: search || undefined,
    }),
  });

  const serverProducts: Product[] = data?.data?.data?.content || [];
  const products = serverProducts.length > 0 ? serverProducts : MOCK_PRODUCTS.filter(p => {
    const matchCat = category === '全部' || p.category === category;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">{t('title')}</h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t('subtitle')}</p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder={t('search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 focus:border-violet-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  category === cat
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800 h-72" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-zinc-400">{t('noProducts')}</div>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <MagicCard className="group overflow-hidden" gradientColor="#f4f4f5">
                  <Link href={`/products/${product.id}`}>
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
                      {product.coverImage ? (
                        <img src={product.coverImage} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 opacity-70`} />
                        </div>
                      )}
                      {product.stock <= 3 && product.stock > 0 && (
                        <span className="absolute right-2 top-2 rounded-full bg-orange-500 px-2 py-0.5 text-xs font-medium text-white">
                          仅剩{product.stock}件
                        </span>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-zinc-700">{t('outOfStock')}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    {product.category && (
                      <span className="mb-1 block text-xs text-zinc-400">{product.category}</span>
                    )}
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-semibold text-zinc-900 line-clamp-1 dark:text-white">{product.name}</h3>
                    </Link>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-bold text-zinc-900 dark:text-white">{formatPrice(product.price)}</span>
                      <button
                        disabled={product.stock === 0}
                        onClick={() => addToCart({ id: product.id, name: product.name, price: product.price, quantity: 1, image: product.coverImage })}
                        className="flex items-center gap-1 rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900"
                      >
                        <ShoppingCart className="h-3 w-3" />
                        {t('addToCart')}
                      </button>
                    </div>
                  </div>
                </MagicCard>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
