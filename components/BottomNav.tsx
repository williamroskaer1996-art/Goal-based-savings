'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  {
    label: 'Overview',
    href: '/home',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M3 12L12 3l9 9M5 10v9a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1v-9"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: 'Payments',
    href: null,
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M7 16V8m0 0L4 11m3-3 3 3M17 8v8m0 0 3-3m-3 3-3-3"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: 'More',
    href: null,
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="5" cy="12" r={active ? 1.8 : 1.5} fill="currentColor" />
        <circle cx="12" cy="12" r={active ? 1.8 : 1.5} fill="currentColor" />
        <circle cx="19" cy="12" r={active ? 1.8 : 1.5} fill="currentColor" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-3 left-1/2 w-[calc(100%-24px)] max-w-[calc(448px-24px)] -translate-x-1/2 rounded-3xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.10)]">
      <div className="flex items-stretch">
        {TABS.map((tab) => {
          const active = tab.href !== null && pathname.startsWith(tab.href);
          const inner = (
            <span
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${
                active ? 'text-grounded-green' : 'text-charcoal/35'
              }`}
            >
              {tab.icon(active)}
              {tab.label}
            </span>
          );

          return tab.href ? (
            <Link key={tab.label} href={tab.href} className="flex flex-1">
              {inner}
            </Link>
          ) : (
            <button key={tab.label} type="button" disabled className="flex flex-1 cursor-default">
              {inner}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
