'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { articleApi } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { Clock, Eye, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate, getImageUrl, transformHtmlImageUrls } from '@/lib/utils';

interface Article {
  id: number;
  title: string;
  content?: string;
  summary?: string;
  coverImage?: string;
  createdAt: string;
  viewCount: number;
  author?: string;
  category?: string;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('articles');
  const id = Number(params.id);

  const { data, isLoading } = useQuery({
    queryKey: ['article', id],
    queryFn: () => articleApi.getById(id),
    enabled: !isNaN(id),
  });

  const article = data?.data?.data as Article | undefined;

  if (isNaN(id)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-zinc-950">
        <p className="text-zinc-500 dark:text-zinc-400">无效的文章 ID</p>
        <button onClick={() => router.back()} className="mt-4 text-sm text-violet-600 hover:text-violet-700">返回</button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-zinc-950">
        <p className="text-zinc-500 dark:text-zinc-400">文章不存在</p>
        <button onClick={() => router.back()} className="mt-4 text-sm text-violet-600 hover:text-violet-700">返回</button>
      </div>
    );
  }

  // Fix embedded image URLs in article HTML content so they resolve to the backend
  const contentHtml = transformHtmlImageUrls(article.content || '');

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
              <img src={getImageUrl(article.coverImage)} alt={article.title} className="w-full object-cover" />
            </div>
          )}

          <div
            className="prose prose-zinc mt-8 max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </motion.article>
      </main>
    </div>
  );
}