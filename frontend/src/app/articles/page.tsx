'use client';

import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { articleApi } from '@/lib/api';
import { Navbar, Footer } from '@/components/layout/Navbar';
import Link from 'next/link';
import { Clock, Eye, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '@/lib/utils';

interface Article {
  id: number;
  title: string;
  summary?: string;
  coverImage?: string;
  createdAt: string;
  viewCount: number;
  author?: string;
  category?: string;
}

const MOCK_ARTICLES: Article[] = [
  { id: 1, title: '如何选择适合自己的指板', summary: '在众多指板中，如何找到最适合自己的那一款？本文将从材质、尺寸等方面为您详细介绍。', createdAt: '2024-01-15', viewCount: 256, author: 'XOANA Team', category: '教程' },
  { id: 2, title: 'XOANA 2024新品发布预告', summary: '2024年我们将带来全新的产品系列，融合了更多现代元素与传统工艺。', createdAt: '2024-01-10', viewCount: 189, author: 'XOANA Team', category: '新品' },
  { id: 3, title: '手指滑板文化历史', summary: '从上世纪90年代起源到今天，手指滑板已经发展成为一种独特的文化现象。', createdAt: '2024-01-05', viewCount: 312, author: 'XOANA Team', category: '文化' },
  { id: 4, title: '入门技巧：kickflip 教学', summary: '本文将详细介绍如何练习最基础的kickflip动作，适合完全没有基础的新手。', createdAt: '2023-12-28', viewCount: 445, author: 'XOANA Team', category: '教程' },
  { id: 5, title: '指板保养小技巧', summary: '正确保养您的指板可以延长其使用寿命，本文分享几个实用的保养技巧。', createdAt: '2023-12-20', viewCount: 203, author: 'XOANA Team', category: '维护' },
];

export default function ArticlesPage() {
  const t = useTranslations('articles');

  const { data } = useQuery({
    queryKey: ['articles'],
    queryFn: () => articleApi.getAll({ page: 0, size: 20 }),
  });

  const serverArticles: Article[] = data?.data?.data?.content || [];
  const articles = serverArticles.length > 0 ? serverArticles : MOCK_ARTICLES;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">{t('title')}</h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t('subtitle')}</p>
        </div>

        <div className="space-y-8">
          {articles.map((article, i) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row"
            >
              <div className="h-48 w-full shrink-0 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 sm:h-auto sm:w-64">
                {article.coverImage ? (
                  <img src={article.coverImage} alt={article.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full min-h-[120px] items-center justify-center">
                    <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br opacity-50`} style={{ background: `linear-gradient(135deg, hsl(${i * 40 + 250}, 70%, 60%), hsl(${i * 40 + 280}, 70%, 50%))` }} />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-6">
                {article.category && (
                  <span className="mb-2 inline-block w-fit rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                    {article.category}
                  </span>
                )}
                <h2 className="text-xl font-semibold text-zinc-900 transition-colors group-hover:text-violet-600 dark:text-white dark:group-hover:text-violet-400">
                  {article.title}
                </h2>
                {article.summary && (
                  <p className="mt-2 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">{article.summary}</p>
                )}
                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="flex items-center gap-4 text-xs text-zinc-400">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(article.createdAt)}</span>
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{article.viewCount}</span>
                  </div>
                  <Link href={`/articles/${article.id}`} className="flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400">
                    {t('readMore')} <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
