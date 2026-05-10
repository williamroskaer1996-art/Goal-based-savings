'use client';

import { useRouter } from 'next/navigation';

type Props = {
  href?: string; // explicit destination; falls back to router.back()
};

export function BackButton({ href }: Props) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Go back"
      className="flex items-center gap-1.5 rounded-lg py-1 pr-2 text-sm font-medium text-charcoal/60 transition hover:text-grounded-green active:scale-95"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <path
          d="M15 18l-6-6 6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Back
    </button>
  );
}
