import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {

    unoptimized: true,
  },
  experimental: {
    // 防止 Turbopack 在开发模式下将整 个 .next 缓存加载进内存导致内存累积耗尽
    turbopackFileSystemCacheForDev: false,
  },
};

export default withNextIntl(nextConfig);
