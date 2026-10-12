import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Prices are stored in CNY; only the formatting locale changes with the language.
function formatLocale(locale: string | undefined): string {
  return locale === 'en' ? 'en-US' : 'zh-CN';
}

export function formatPrice(price: number, locale?: string): string {
  return new Intl.NumberFormat(formatLocale(locale), {
    style: 'currency',
    currency: 'CNY',
  }).format(price);
}

export function formatDate(date: string | Date, locale?: string): string {
  return new Intl.DateTimeFormat(formatLocale(locale), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}
