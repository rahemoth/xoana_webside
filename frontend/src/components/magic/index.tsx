'use client';

import { motion, useAnimationFrame, useMotionTemplate, useMotionValue, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  children: React.ReactNode;
}

export function ShimmerButton({
  shimmerColor = '#ffffff',
  shimmerSize = '0.05em',
  shimmerDuration = '3s',
  borderRadius = '100px',
  background = 'rgba(0, 0, 0, 1)',
  className,
  children,
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      style={{ '--shimmer-color': shimmerColor, '--spread': shimmerSize, '--shimmer-duration': shimmerDuration, '--radius': borderRadius, '--background': background } as React.CSSProperties}
      className={cn(
        'group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/10 px-6 py-3 text-white [background:var(--background)] [border-radius:var(--radius)]',
        'transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          '-z-30 blur-[2px]',
          'absolute inset-0 overflow-visible [container-type:size]',
        )}
      >
        <div className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
          <div className="animate-spin-around absolute inset-[-100%] w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]" />
        </div>
      </div>
      {children}
      <div
        className={cn(
          'insert-0 absolute size-full',
          'rounded-2xl px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_#ffffff1f]',
          'transform-gpu transition-all duration-300 ease-in-out',
          'group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]',
          'group-active:shadow-[inset_0_-10px_10px_#ffffff3f]',
        )}
      />
    </button>
  );
}

export function MagicCard({
  children,
  className,
  gradientColor = '#262626',
}: {
  children: React.ReactNode;
  className?: string;
  gradientColor?: string;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!divRef.current) return;
    const { left, top } = divRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={cn('group relative rounded-xl border border-white/10 bg-white dark:bg-zinc-900', className)}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`radial-gradient(200px circle at ${mouseX}px ${mouseY}px, ${gradientColor}, transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
}

export function GradientText({
  children,
  className,
  from = '#6366f1',
  to = '#8b5cf6',
}: {
  children: React.ReactNode;
  className?: string;
  from?: string;
  to?: string;
}) {
  return (
    <span
      className={cn('bg-clip-text text-transparent', className)}
      style={{ backgroundImage: `linear-gradient(to right, ${from}, ${to})` }}
    >
      {children}
    </span>
  );
}

export function AnimatedGradientText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'group relative mx-auto flex max-w-fit items-center justify-center rounded-full border border-black/5 bg-white px-4 py-2 text-sm font-medium shadow-[inset_0_-8px_10px_#8fdfff1f] backdrop-blur-sm transition-shadow duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#8fdfff3f] dark:border-white/5 dark:bg-black',
        className
      )}
    >
      <span className="animate-gradient bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#6366f1] bg-[length:200%_100%] bg-clip-text text-transparent">
        {children}
      </span>
    </div>
  );
}

export function Particles({
  className,
  quantity = 50,
}: {
  className?: string;
  quantity?: number;
}) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {Array.from({ length: quantity }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-white/20"
          initial={{
            x: Math.random() * 100 + '%',
            y: Math.random() * 100 + '%',
            opacity: Math.random() * 0.5 + 0.2,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            y: [null, '-10%'],
            opacity: [null, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            repeatType: 'loop',
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
}

export function BorderBeam({
  className,
  size = 200,
  duration = 15,
  borderWidth = 1.5,
  colorFrom = '#6366f1',
  colorTo = '#8b5cf6',
  delay = 0,
}: {
  className?: string;
  size?: number;
  duration?: number;
  borderWidth?: number;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
}) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 rounded-[inherit] [border:calc(var(--border-width)*1px)_solid_transparent]',
        className
      )}
      style={
        {
          '--size': size,
          '--duration': duration,
          '--border-width': borderWidth,
          '--color-from': colorFrom,
          '--color-to': colorTo,
          '--delay': `-${delay}s`,
          mask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
          '-webkit-mask-composite': 'xor',
          maskComposite: 'exclude',
        } as React.CSSProperties
      }
    >
      <div
        className="absolute inset-0 animate-border-beam rounded-[inherit]"
        style={{
          background: `conic-gradient(from 0deg, transparent calc(var(--progress) * 1%), ${colorFrom} calc(var(--progress) * 1% + 1%), ${colorTo} calc(var(--progress) * 1% + 10%), transparent calc(var(--progress) * 1% + 11%))`,
        }}
      />
    </div>
  );
}

export function NumberTicker({
  value,
  direction = 'up',
  className,
  delay = 0,
}: {
  value: number;
  direction?: 'up' | 'down';
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === 'down' ? value : 0);
  const springValue = useTransform(motionValue, (latest) => Intl.NumberFormat('en-US').format(Number(latest.toFixed(0))));

  useAnimationFrame(() => {
    if (!ref.current) return;
    ref.current.textContent = springValue.get();
  });

  return (
    <motion.span
      ref={ref}
      className={cn('tabular-nums', className)}
      onViewportEnter={() => {
        setTimeout(() => motionValue.set(direction === 'down' ? 0 : value), delay * 1000);
      }}
    />
  );
}
