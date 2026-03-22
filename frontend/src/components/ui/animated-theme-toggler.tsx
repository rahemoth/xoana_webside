'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function AnimatedThemeToggler({
                                         mounted = true,
                                         className,
                                     }: {
    mounted?: boolean;
    className?: string;
}) {
    const { theme, setTheme } = useTheme();

    const isDark = theme === 'dark';

    return (
        <button
            type="button"
            aria-label="Toggle theme"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={cn(
                'relative grid h-9 w-9 place-items-center rounded-full p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800',
                className
            )}
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={mounted && isDark ? 'sun' : 'moon'}
                    initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.18 }}
                    className="inline-flex"
                >
                    {mounted && isDark ? (
                        <Sun className="h-4 w-4" />
                    ) : (
                        <Moon className="h-4 w-4" />
                    )}
                </motion.span>
            </AnimatePresence>
        </button>
    );
}