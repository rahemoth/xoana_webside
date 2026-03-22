'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Particles } from '@/components/magic';

export function HeroSection() {
  const t = useTranslations('home.hero');

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950">
      <Particles quantity={80} />

      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-blue-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 backdrop-blur-sm">
            <Sparkles className="mr-2 h-4 w-4 text-violet-400" />
            独立手指滑板 · 极致工艺
          </div>

          <h1 className="mb-6 text-6xl font-bold tracking-tight text-white md:text-8xl">
            <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              XOANA
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              {t('title').replace('XOANA ', '')}
            </span>
          </h1>

          <p className="mx-auto mb-4 max-w-2xl text-xl font-light text-white/60">
            {t('subtitle')}
          </p>
          <p className="mx-auto mb-10 max-w-xl text-base text-white/40">
            {t('description')}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/products"
              className="group flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-zinc-900 shadow-lg transition-all hover:bg-zinc-100 hover:shadow-xl"
            >
              {t('shopNow')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#brand"
              className="flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 text-base font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10"
            >
              {t('learnMore')}
            </Link>
          </div>
        </motion.div>

        {/* Floating product showcase */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20 grid grid-cols-3 gap-4 sm:grid-cols-3 md:gap-6"
        >
          {[
            { label: 'Pro Series', color: 'from-violet-500 to-purple-600' },
            { label: 'Street Deck', color: 'from-blue-500 to-cyan-600' },
            { label: 'Limited Ed.', color: 'from-rose-500 to-pink-600' },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
            >
              <div className={`mb-3 h-32 rounded-xl bg-gradient-to-br ${item.color} opacity-80 transition-opacity group-hover:opacity-100`} />
              <p className="text-sm font-medium text-white/70">{item.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-10 w-6 rounded-full border-2 border-white/20 p-1"
        >
          <div className="h-2 w-full rounded-full bg-white/40" />
        </motion.div>
      </motion.div>
    </section>
  );
}
