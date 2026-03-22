'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar, Footer } from '@/components/layout/Navbar';

export default function LayoutShell({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');

    if (isAdmin) return <>{children}</>;

    return (
        <>
            <Navbar />
            {children}
            <Footer />
        </>
    );
}