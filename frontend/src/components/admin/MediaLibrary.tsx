'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Link2, Loader2, Trash2, Upload } from 'lucide-react';
import { getApiErrorMessage, mediaApi, uploadApi } from '@/lib/api';
import { galleryImageUrl } from '@/lib/gallery';
import { formatDate } from '@/lib/utils';
import { QueryFeedback } from '@/components/ui/query-feedback';
import { Pagination } from '@/components/ui/pagination';
import type { MediaAsset } from '@/types/models';

const PAGE_SIZE = 60;

interface MediaLibraryProps {
  // When provided, clicking a tile picks that image for the caller.
  onSelect?: (src: string) => void;
  selected?: string;
  // Multi-selection highlight, e.g. while picking several gallery images.
  selectedMany?: string[];
}

export function MediaLibrary({ onSelect, selected, selectedMany }: MediaLibraryProps) {
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const uploadLock = useRef(false);
  const [page, setPage] = useState(0);
  const [progress, setProgress] = useState<{ completed: number; total: number } | null>(null);
  const [message, setMessage] = useState('');
  const [failures, setFailures] = useState<string[]>([]);
  const [copied, setCopied] = useState('');

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['admin-media', page],
    queryFn: async () => (await mediaApi.list({ page, size: PAGE_SIZE })).data,
  });
  const items: MediaAsset[] = data?.data?.content ?? [];
  const total = data?.data?.totalElements ?? 0;
  const totalPages = data?.data?.totalPages ?? 0;

  const deleteMutation = useMutation({
    mutationFn: (filename: string) => mediaApi.remove(filename),
    onSuccess: () => {
      setMessage('图片已从图片库删除。');
      void queryClient.invalidateQueries({ queryKey: ['admin-media'] });
    },
    onError: (error) => setMessage(getApiErrorMessage(error, '删除失败，请重试。')),
  });

  const uploadFiles = async (files: File[]) => {
    if (!files.length || uploadLock.current) return;
    uploadLock.current = true;
    setFailures([]);
    setMessage('');
    setProgress({ completed: 0, total: files.length });
    const failed: string[] = [];
    let added = 0;
    try {
      // One request per file so a single bad image cannot fail the whole batch.
      for (const [index, file] of files.entries()) {
        if (!file.type.startsWith('image/')) {
          failed.push(`${file.name}：请选择图片文件`);
        } else if (file.size > 10 * 1024 * 1024) {
          failed.push(`${file.name}：单张图片不能超过 10 MB`);
        } else {
          try {
            const response = await uploadApi.uploadImage(file);
            const src = response.data?.data;
            if (typeof src !== 'string' || !src) throw new Error('未返回图片地址');
            added++;
          } catch (error) {
            failed.push(`${file.name}：${getApiErrorMessage(error, '上传失败，请重试')}`);
          }
        }
        setProgress({ completed: index + 1, total: files.length });
      }
      setFailures(failed);
      setMessage(`已上传 ${added} 张图片${failed.length ? `，${failed.length} 张未上传` : ''}。`);
      if (added) {
        setPage(0);
        await queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      }
    } finally {
      setProgress(null);
      uploadLock.current = false;
    }
  };

  const handleDelete = (asset: MediaAsset) => {
    if (deleteMutation.isPending) return;
    if (confirm(
      `确认从图片库移除这张图片？\n${asset.filename}\n\n` +
      '· 只是从图片库隐藏，文件保留在磁盘上，图片地址仍然有效\n' +
      '· 仍被商品、文章或设置使用的图片无法移除\n' +
      '· 当前连接的是临时数据库时，检测不到正式数据库里的引用'
    )) {
      deleteMutation.mutate(asset.filename);
    }
  };

  const copySrc = async (src: string) => {
    try {
      await navigator.clipboard.writeText(src);
      setCopied(src);
      setTimeout(() => setCopied(''), 1500);
    } catch {
      setMessage(`复制失败，请手动复制：${src}`);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium text-zinc-900 dark:text-white">图片库（{total} 张）</p>
          <p className="mt-1 text-sm text-zinc-500">
            可一次选择多张批量上传，单张最大 10 MB；最新上传的排在最前。图片保存在后端 uploads 目录，不受数据库重置影响；
            移除只是从图片库隐藏，文件不会被删除。
          </p>
        </div>
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={!!progress}
          className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
        >
          {progress ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {progress ? `上传中 ${progress.completed}/${progress.total}` : '批量上传图片'}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          aria-label="批量上传图片"
          onChange={(event) => {
            const files = Array.from(event.target.files || []);
            event.target.value = '';
            void uploadFiles(files);
          }}
        />
      </div>

      {(message || copied) && (
        <p role="status" aria-live="polite" className="text-sm text-zinc-600 dark:text-zinc-300">
          {copied ? `已复制图片地址：${copied}` : message}
        </p>
      )}
      {failures.length > 0 && (
        <ul role="alert" className="max-h-40 overflow-y-auto rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {failures.map((failure, index) => <li key={index}>{failure}</li>)}
        </ul>
      )}

      <QueryFeedback pending={isPending} error={isError} retry={() => { void refetch(); }} />

      {!isPending && !isError && items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
          图片库还是空的，点击“批量上传图片”开始。
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {items.map((asset) => (
            <div key={asset.filename} className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => onSelect?.(asset.src)}
                disabled={!onSelect}
                aria-label={onSelect ? `选择图片 ${asset.filename}` : asset.filename}
                title={`${asset.filename} · ${formatDate(asset.uploadedAt)}`}
                className="group relative block aspect-square w-full bg-zinc-50 enabled:cursor-pointer dark:bg-zinc-800"
              >
                <Image
                  src={galleryImageUrl(asset.src)}
                  alt={asset.filename}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  className="object-cover"
                />
                {onSelect && (
                  <span className="absolute bottom-2 right-2 rounded-lg bg-black/60 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                    选择这张
                  </span>
                )}
                {selected === asset.src || selectedMany?.includes(asset.src) ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
                    <Check className="h-8 w-8" />
                  </span>
                ) : null}
              </button>
              <div className="flex items-center justify-between gap-2 p-2 text-xs text-zinc-500">
                <span>{Math.max(1, Math.round(asset.size / 1024))} KB</span>
                <span className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => { void copySrc(asset.src); }}
                    aria-label={`复制 ${asset.filename} 的地址`}
                    title="复制图片地址"
                    className="rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Link2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(asset)}
                    disabled={deleteMutation.isPending}
                    aria-label={`删除 ${asset.filename}`}
                    title="从图片库移除（文件保留在磁盘）"
                    className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-40 dark:hover:bg-red-950"
                  >
                    {deleteMutation.isPending && deleteMutation.variables === asset.filename
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Trash2 className="h-4 w-4" />}
                  </button>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} disabled={isPending || !!progress} />
    </div>
  );
}
