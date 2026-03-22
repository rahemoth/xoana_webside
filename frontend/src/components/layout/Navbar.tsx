'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { ShoppingCart, Sun, Moon, User, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStore } from '@/store';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

function getCurrentLocale(): string {
  if (typeof document === 'undefined') return 'zh';
  const match = document.cookie.match(/(?:^|;\s*)locale=([^;]+)/);
  return match ? match[1] : 'zh';
}

function setLocaleCookie(locale: string) {
  document.cookie = `locale=${locale}; path=/; max-age=31536000`;
  window.location.reload();
}

export function Navbar() {
  const t = useTranslations('nav');
  const { theme, setTheme } = useTheme();
  const { user, clearAuth, cartCount } = useStore();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<string>('zh');

  useEffect(() => {
    setMounted(true);
    setCurrentLocale(getCurrentLocale());
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLocale = () => {
    const next = currentLocale === 'zh' ? 'en' : 'zh';
    setCurrentLocale(next);
    setLocaleCookie(next);
  };

  const count = mounted ? cartCount() : 0;

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/products', label: t('products') },
    { href: '/articles', label: t('articles') },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-white/90 shadow-sm backdrop-blur-md dark:bg-zinc-900/90'
          : 'bg-transparent'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              XOANA
            </span>
          </Link>

          {/* Desktop Nav — absolutely centred */}
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center space-x-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Language toggle — click to switch ZH ↔ EN */}
            <button
              onClick={toggleLocale}
              className="hidden rounded-full px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 md:flex items-center"
            >
              {mounted ? (currentLocale === 'zh' ? 'EN' : '中文') : 'EN'}
            </button>

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              {mounted && theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative rounded-full p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <ShoppingCart className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white dark:bg-white dark:text-zinc-900">
                  {count}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => router.push('/profile')}
                  className="flex items-center space-x-1 rounded-full p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm">{user.nickname || user.username}</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 md:block"
              >
                {t('login')}
              </Link>
            )}

            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-full p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 md:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 md:hidden"
          >
            <div className="space-y-1 px-4 py-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t('profile')}
                  </Link>
                  <button
                    onClick={() => { clearAuth(); setMobileOpen(false); router.push('/'); }}
                    className="block w-full rounded-lg px-3 py-2 text-left text-base font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    {t('logout')}
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  onClick={() => setMobileOpen(false)}
                >
                  {t('login')}
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">XOANA</h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              独立手指滑板品牌，专注极致工艺与品质
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">产品</h4>
            <ul className="mt-4 space-y-2">
              <li><Link href="/products" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">全部产品</Link></li>
              <li><Link href="/articles" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">文章</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">联系我们</h4>
            <ul className="mt-4 space-y-2">
              <li className="text-sm text-zinc-500 dark:text-zinc-400">contact@xoana.com</li>
              <li className="text-sm text-zinc-500 dark:text-zinc-400">微信: xoana_official</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            © 2024 XOANA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
