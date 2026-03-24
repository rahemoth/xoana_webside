import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(price);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

/**
 * Converts a relative upload URL (e.g. /uploads/image.jpg) to an absolute URL
 * pointing to the backend server. This is necessary because uploaded files are
 * served by the backend, not the Next.js frontend.
 */
export function getImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (url.startsWith('/uploads/')) {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    return `${apiBase}${url}`;
  }
  return url;
}
