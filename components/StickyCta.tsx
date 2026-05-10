'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
};

export function StickyCta({
  children,
  variant = 'primary',
  className,
  ...rest
}: Props) {
  const base =
    'w-full rounded-xl py-4 text-base font-semibold transition active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed';
  const styles =
    variant === 'primary'
      ? 'bg-grounded-green text-white shadow-card hover:bg-grounded-green/95'
      : 'border-2 border-grounded-green text-grounded-green bg-transparent hover:bg-grounded-green/5';

  return (
    <div className="sticky bottom-0 left-0 right-0 z-20 -mx-6 mt-8 bg-gradient-to-t from-birch-skin via-birch-skin/95 to-birch-skin/0 px-6 pb-6 pt-6">
      <button {...rest} className={`${base} ${styles} ${className ?? ''}`}>
        {children}
      </button>
    </div>
  );
}
