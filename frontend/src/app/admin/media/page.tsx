'use client';

import { MediaLibrary } from '@/components/admin/MediaLibrary';

export default function AdminMediaPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">图片库</h1>
        <p className="mt-1 text-sm text-zinc-500">
          所有上传过的图片都集中在这里，添加产品或文章时可以直接选用，不必重复上传。
        </p>
      </div>
      <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900">
        <MediaLibrary />
      </div>
    </div>
  );
}
