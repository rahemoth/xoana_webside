'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/lib/api';
import { useStore } from '@/store';
import { MagicCard } from '@/components/magic';
import { formatPrice } from '@/lib/utils';

interface Product {
  id: number;
  name: string;
  nameEn?: string;
  price: number;
  coverImage?: string;
  category?: string;
  stock: number;
}

export function FeaturedProducts() {
  const t = useTranslations('home.featured');
  const pt = useTranslations('products');
  const { addToCart } = useStore();

  const { data } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productApi.getFeatured(),
  });

  const products: Product[] = data?.data?.data || [];

  // Mock products if backend not available
  const displayProducts = products.length > 0 ? products : [
    { id: 1, name: 'Pro Classic 指板', price: 299, stock: 10, coverImage: '', category: 'Pro Series' },
    { id: 2, name: 'Street Deck X', price: 399, stock: 5, coverImage: '', category: 'Street' },
    { id: 3, name: 'Limited 联名款', price: 599, stock: 3, coverImage: '', category: 'Limited' },
    { id: 4, name: 'Mini Cruiser', price: 199, stock: 15, coverImage: '', category: 'Cruiser' },
  ];

  return (
    <section className="bg-white py-24 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 flex items-end justify-between"
        >
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-zinc-400">
              {t('title')}
            </p>
            <h2 className="text-4xl font-bold text-zinc-900 dark:text-white">
              {t('subtitle')}
            </h2>
          </div>
          <Link
            href="/products"
            className="group hidden items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white sm:flex"
          >
            {t('viewAll')}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayProducts.slice(0, 4).map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <MagicCard className="group overflow-hidden" gradientColor="#f4f4f5">
                <Link href={`/products/${product.id}`}>
                  <div className="relative overflow-hidden">
                    <div className="flex h-52 items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
                      {product.coverImage ? (
                        <img
                          src={product.coverImage}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                          <span className="text-2xl font-bold">X</span>
                        </div>
                      )}
                    </div>
                    {product.category && (
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-zinc-700 backdrop-blur-sm dark:bg-zinc-900/90 dark:text-zinc-300">
                        {product.category}
                      </span>
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-semibold text-zinc-900 transition-colors hover:text-violet-600 dark:text-white dark:hover:text-violet-400">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-zinc-900 dark:text-white">
                      {formatPrice(product.price)}
                    </span>
                    <button
                      onClick={() => addToCart({ id: product.id, name: product.name, price: product.price, quantity: 1, image: product.coverImage })}
                      className="flex items-center gap-1 rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                    >
                      <ShoppingCart className="h-3 w-3" />
                      {pt('addToCart')}
                    </button>
                  </div>
                </div>
              </MagicCard>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            {t('viewAll')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
