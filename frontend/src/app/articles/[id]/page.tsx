'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { articleApi } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { Clock, Eye, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '@/lib/utils';

const MOCK_ARTICLES: Record<
  number,
  {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    viewCount: number;
    author: string;
    category: string;
    coverImage?: string;
  }
> = {

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
    <div className="bg-white dark:bg-zinc-950">
      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16 sm:px-6">
        <button
          onClick={() => router.back()}
          className="mb-8 flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
        >
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
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(article.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.viewCount} 次阅读
            </span>
          </div>

          {article.coverImage && (
            <div className="mt-8 overflow-hidden rounded-2xl">
              <img src={article.coverImage} alt={article.title} className="w-full object-cover" />
            </div>
          )}

          <div
            className="prose prose-zinc mt-8 max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: (article as any).content }}
          />
        </motion.article>
      </main>
    </div>
  );
}