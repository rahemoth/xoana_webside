'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/lib/api';
import { Navbar, Footer } from '@/components/layout/Navbar';
import { useStore } from '@/store';
import { useTranslations } from 'next-intl';
import { ShoppingCart, ArrowLeft, Package, Ruler, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatPrice } from '@/lib/utils';
import { useState } from 'react';
import Link from 'next/link';

const MOCK_PRODUCTS: Record<number, {
  id: number;
  name: string;
  price: number;
  stock: number;
  description: string;
  category: string;
  material: string;
  dimensions: string;
  images: string[];
}> = {
  1: { id: 1, name: 'Pro Classic 指板', price: 299, stock: 10, description: '经典专业系列指板，采用优质枫木制作，表面经过精细处理，适合初学者与进阶玩家。每一块都经过严格的质量检测，确保最佳的手感体验。', category: 'Pro Series', material: '枫木', dimensions: '100mm × 34mm', images: [] },
  2: { id: 2, name: 'Street Deck X', price: 399, stock: 5, description: '街式风格指板，灵感来自街头滑板文化，具有独特的图案设计和优质的手感。', category: 'Street', material: '硬枫木', dimensions: '100mm × 32mm', images: [] },
  3: { id: 3, name: 'Limited 联名款', price: 599, stock: 3, description: '限量联名款指板，每块独一无二，附带专属编号证书。', category: 'Limited', material: '竹木混合', dimensions: '100mm × 33mm', images: [] },
  4: { id: 4, name: 'Mini Cruiser', price: 199, stock: 15, description: '迷你巡航款指板，轻便易携带，适合日常练习。', category: 'Cruiser', material: '枫木', dimensions: '80mm × 30mm', images: [] },
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('products');
  const { addToCart } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const id = Number(params.id);

  const { data } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getById(id),
    enabled: !isNaN(id),
  });

  const product = data?.data?.data || MOCK_PRODUCTS[id] || MOCK_PRODUCTS[1];

  const handleAddToCart = () => {
    addToCart({ id: product.id, name: product.name, price: product.price, quantity, image: product.coverImage || product.images?.[0] });
  };

  const handleBuyNow = () => {
    addToCart({ id: product.id, name: product.name, price: product.price, quantity, image: product.coverImage || product.images?.[0] });
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <button onClick={() => router.back()} className="mb-8 flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          {t('loading') ? '返回' : '返回'}
        </button>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Images */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
              {product.coverImage || (product.images && product.images[activeImage]) ? (
                <img
                  src={product.coverImage || product.images[activeImage]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="h-32 w-32 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-700 opacity-70" />
                </div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {product.images.map((img: string, i: number) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`aspect-square overflow-hidden rounded-xl border-2 transition-all ${i === activeImage ? 'border-violet-500' : 'border-transparent'}`}>
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
            {product.category && (
              <span className="mb-3 inline-block w-fit rounded-full bg-violet-100 px-3 py-1 text-sm font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                {product.category}
              </span>
            )}
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">{product.name}</h1>
            <p className="mt-4 text-4xl font-bold text-zinc-900 dark:text-white">{formatPrice(product.price)}</p>

            <div className="mt-6 space-y-3">
              {product.material && (
                <div className="flex items-center gap-3 text-sm">
                  <Package className="h-4 w-4 text-zinc-400" />
                  <span className="text-zinc-500 dark:text-zinc-400">{t('material')}:</span>
                  <span className="text-zinc-900 dark:text-white">{product.material}</span>
                </div>
              )}
              {product.dimensions && (
                <div className="flex items-center gap-3 text-sm">
                  <Ruler className="h-4 w-4 text-zinc-400" />
                  <span className="text-zinc-500 dark:text-zinc-400">{t('dimensions')}:</span>
                  <span className="text-zinc-900 dark:text-white">{product.dimensions}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Tag className="h-4 w-4 text-zinc-400" />
                <span className="text-zinc-500 dark:text-zinc-400">库存:</span>
                <span className={product.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}>
                  {product.stock > 0 ? `${product.stock} 件` : t('outOfStock')}
                </span>
              </div>
            </div>

            {product.description && (
              <div className="mt-6">
                <h3 className="mb-2 font-semibold text-zinc-900 dark:text-white">{t('description')}</h3>
                <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{product.description}</p>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-6 flex items-center gap-4">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('quantity')}:</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300">-</button>
                <span className="w-8 text-center text-zinc-900 dark:text-white">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300">+</button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-4">
              <button
                disabled={product.stock === 0}
                onClick={handleAddToCart}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-zinc-900 px-6 py-4 font-semibold text-zinc-900 transition-all hover:bg-zinc-50 disabled:opacity-50 dark:border-white dark:text-white dark:hover:bg-zinc-900"
              >
                <ShoppingCart className="h-5 w-5" />
                {t('addToCart')}
              </button>
              <button
                disabled={product.stock === 0}
                onClick={handleBuyNow}
                className="flex flex-1 items-center justify-center rounded-2xl bg-zinc-900 px-6 py-4 font-semibold text-white transition-all hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900"
              >
                {t('buyNow')}
              </button>
            </div>

            {/* View cart link */}
            <Link href="/cart" className="mt-3 text-center text-sm text-violet-600 hover:text-violet-700 dark:text-violet-400">
              查看购物车 →
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
