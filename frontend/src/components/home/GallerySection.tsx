'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

const galleryItems = [
  { id: 1, color: 'from-violet-500 to-purple-700', size: 'col-span-2 row-span-2' },
  { id: 2, color: 'from-blue-500 to-cyan-600', size: 'col-span-1 row-span-1' },
  { id: 3, color: 'from-rose-500 to-pink-600', size: 'col-span-1 row-span-1' },
  { id: 4, color: 'from-amber-500 to-orange-600', size: 'col-span-1 row-span-1' },
  { id: 5, color: 'from-emerald-500 to-teal-600', size: 'col-span-2 row-span-1' },
];

export function GallerySection() {
  const t = useTranslations('home.gallery');

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
          {galleryItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`overflow-hidden rounded-2xl bg-gradient-to-br ${item.color} ${item.size} cursor-pointer`}
            >
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-6xl font-black text-white/20">X</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
