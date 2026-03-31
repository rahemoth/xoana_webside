'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '@/lib/api';

const FALLBACK_COLORS = [
  'from-violet-500 to-purple-700',
  'from-blue-500 to-cyan-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-600',
];

const SIZES = [
  'col-span-2 row-span-2',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-2 row-span-1',
];

export function GallerySection() {
  const t = useTranslations('home.gallery');

  const { data: settingsData } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => settingsApi.get(),
    staleTime: 5 * 60 * 1000,
  });

  const s = settingsData?.data?.data || {};
  const galleryImages = [
    s.galleryImage1 || '',
    s.galleryImage2 || '',
    s.galleryImage3 || '',
    s.galleryImage4 || '',
    s.galleryImage5 || '',
  ];

  return (
    <section className="bg-white py-24 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-zinc-400">
            Gallery
          </p>
          <h2 className="text-4xl font-bold text-zinc-900 dark:text-white">
            {t('title')}
          </h2>
        </motion.div>

        <div className="grid auto-rows-[200px] grid-cols-3 gap-4">
          {SIZES.map((size, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`relative overflow-hidden rounded-2xl ${size} cursor-pointer`}
            >
              {galleryImages[i] ? (
                <Image
                  src={galleryImages[i]}
                  alt={`Gallery ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${FALLBACK_COLORS[i]}`}>
                  <span className="text-6xl font-black text-white/20">X</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
