'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type RippleButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  rippleColor?: string;
};

export function RippleButton({
  className,
  children,
  rippleColor = 'rgba(255, 255, 255, 0.35)',
  onClick,
  ...props
}: RippleButtonProps) {
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '9999px';
    ripple.style.pointerEvents = 'none';
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.background = rippleColor;
    ripple.style.transform = 'scale(0)';
    ripple.style.opacity = '1';
    ripple.style.transition = 'transform 500ms ease, opacity 700ms ease';

    // Ensure container positioning
    const computed = window.getComputedStyle(button);
    if (computed.position === 'static') {
      button.style.position = 'relative';
    }
    button.style.overflow = 'hidden';

    button.appendChild(ripple);

    requestAnimationFrame(() => {
      ripple.style.transform = 'scale(1)';
      ripple.style.opacity = '0';
    });

    window.setTimeout(() => {
      ripple.remove();
    }, 750);
  };

  return (
    <button
      ref={buttonRef}
      className={cn('relative overflow-hidden', className)}
      onClick={(e) => {
        createRipple(e);
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </button>
  );
}
