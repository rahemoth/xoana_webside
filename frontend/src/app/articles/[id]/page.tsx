'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { articleApi } from '@/lib/api';
import { Navbar, Footer } from '@/components/layout/Navbar';
import { useTranslations } from 'next-intl';
import { Clock, Eye, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '@/lib/utils';

const MOCK_ARTICLES: Record<number, { id: number; title: string; content: string; createdAt: string; viewCount: number; author: string; category: string; }> = {
  1: { id: 1, title: '如何选择适合自己的指板', content: `<h2>材质选择</h2><p>枫木是最常见的指板材质，具有良好的弹性和耐久性。竹木材质更轻，适合追求轻盈手感的玩家。</p><h2>尺寸选择</h2><p>标准指板宽度为32-34mm，长度约100mm。初学者建议选择宽一点的板，更容易控制。</p><h2>握感测试</h2><p>最重要的是亲自试握，找到最适合自己手型的指板。</p>`, createdAt: '2024-01-15', viewCount: 256, author: 'XOANA Team', category: '教程' },
  2: { id: 2, title: 'XOANA 2024新品发布预告', content: `<h2>2024全新系列</h2><p>XOANA将于2024年推出全新的产品线，包含Pro Elite、Street Shadow以及限量版联名款。</p><p>每款产品都经过全新的设计迭代，在保持经典手感的同时，融入了更多现代元素。</p>`, createdAt: '2024-01-10', viewCount: 189, author: 'XOANA Team', category: '新品' },
};

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('articles');
  const id = Number(params.id);

  const { data } = useQuery({
    queryKey: ['article', id],
    queryFn: () => articleApi.getById(id),
    enabled: !isNaN(id),
  });

  const article = data?.data?.data || MOCK_ARTICLES[id] || MOCK_ARTICLES[1];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16 sm:px-6">
        <button onClick={() => router.back()} className="mb-8 flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
          <ArrowLeft className="h-4 w-4" /> 返回
        </button>

        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {article.category && (
            <span className="mb-4 inline-block rounded-full bg-violet-100 px-3 py-1 text-sm font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
              {article.category}
            </span>
          )}
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">{article.title}</h1>
          <div className="mt-4 flex items-center gap-4 text-sm text-zinc-400">
            {article.author && <span>{article.author}</span>}
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(article.createdAt)}</span>
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{article.viewCount} 次阅读</span>
          </div>

          {article.coverImage && (
            <div className="mt-8 overflow-hidden rounded-2xl">
              <img src={article.coverImage} alt={article.title} className="w-full object-cover" />
            </div>
          )}

          <div
            className="prose prose-zinc dark:prose-invert mt-8 max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </motion.article>
      </main>
      <Footer />
    </div>
  );
}
