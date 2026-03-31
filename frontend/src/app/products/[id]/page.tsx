'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/lib/api';
import { useStore } from '@/store';
import { useTranslations } from 'next-intl';
import { ShoppingCart, ArrowLeft, Package, Ruler, Tag, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '@/lib/utils';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

// 从 localStorage 读取保存的产品
const getSavedProducts = () => {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem('xoana_products');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('products');
  const { addToCart } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [savedProducts, setSavedProducts] = useState<any>({});
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // 从 localStorage 读取保存的产品
  useEffect(() => {
    setSavedProducts(getSavedProducts());
  }, []);

  const id = Number(params.id);

  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getById(id),
    enabled: !isNaN(id),
  });

  // 优先使用 API 返回的数据，其次使用 localStorage 保存的，最后使用 MOCK 数据
  const product = data?.data?.data || savedProducts[id] || null;

  // 处理加载状态
  if (isLoading) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
            <p className="text-sm text-zinc-500">加载中...</p>
          </div>
        </div>
    );
  }

  // 处理错误情况 - 产品不存在
  if (error || !product) {
    return (
        <div className="bg-white dark:bg-zinc-950">
          <main className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
            <button
                onClick={() => router.back()}
                className="mb-8 flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> 返回
            </button>
            <div className="py-16 text-center">
              <h1 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-white">产品未找到</h1>
              <p className="text-zinc-500 dark:text-zinc-400">抱歉，您查看的产品不存在或已下架。</p>
              <button
                  onClick={() => router.push('/products')}
                  className="mt-6 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
              >
                返回产品列表
              </button>
            </div>
          </main>
        </div>
    );
  }

  // 根据语言环境选择显示中文还是英文内容
  const isEnglish = locale === 'en';
  const displayName = isEnglish ? (product.nameEn || product.name) : product.name;
  const displayDescription = isEnglish ? (product.descriptionEn || product.description) : product.description;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: displayName,
      price: product.price,
      quantity,
      image: product.coverImage || product.images?.[0],
    });

    // 显示成功提示
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleBuyNow = () => {
    addToCart({
      id: product.id,
      name: displayName,
      price: product.price,
      quantity,
      image: product.coverImage || product.images?.[0],
    });
    router.push('/checkout');
  };

  return (
      <div className="bg-white dark:bg-zinc-950">
        {/* Success Toast */}
        <AnimatePresence>
          {showSuccessToast && (
              <motion.div
                  initial={{ opacity: 0, y: -50, x: '-50%' }}
                  animate={{ opacity: 1, y: 20, x: '-50%' }}
                  exit={{ opacity: 0, y: -50, x: '-50%' }}
                  transition={{ type: 'spring', damping: 20 }}
                  className="fixed left-1/2 top-0 z-50 flex items-center gap-3 rounded-full bg-green-500 px-6 py-3 text-white shadow-lg"
              >
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">
                {locale === 'en' ? 'Added to cart!' : '已成功添加到购物车'}
              </span>
              </motion.div>
          )}
        </AnimatePresence>

        <main className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
          <button
              onClick={() => router.back()}
              className="mb-8 flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> 返回
          </button>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Images */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
                {product.coverImage || (product.images && product.images[activeImage]) ? (
                    <img
                        src={product.coverImage || product.images[activeImage]}
                        alt={displayName}
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
                        <button
                            key={i}
                            onClick={() => setActiveImage(i)}
                            className={`aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                                i === activeImage ? 'border-violet-500' : 'border-transparent'
                            }`}
                        >
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

              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">{displayName}</h1>
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

              {displayDescription && (
                  <div className="mt-6">
                    <h3 className="mb-2 font-semibold text-zinc-900 dark:text-white">{t('description')}</h3>
                    <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{displayDescription}</p>
                  </div>
              )}

              {/* Quantity */}
              <div className="mt-6 flex items-center gap-4">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('quantity')}:</span>
                <div className="flex items-center gap-2">
                  <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-zinc-900 dark:text-white">{quantity}</span>
                  <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300"
                  >
                    +
                  </button>
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
      </div>
  );
}
