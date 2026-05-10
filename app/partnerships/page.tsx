'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { PARTNERSHIPS, TRIODOS_TRANSITIONS } from '@/lib/types';
import type { GoalIconKey } from '@/lib/types';

export default function PartnershipsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isInitialized, isAuthenticated } = useAppStore();

  const returnTo = searchParams.get('returnTo') ?? '/home';
  const iconFilter = searchParams.get('icon') as GoalIconKey | null;

  useEffect(() => {
    if (isInitialized && !isAuthenticated) router.replace('/login');
  }, [isInitialized, isAuthenticated, router]);

  if (!isInitialized || !isAuthenticated) return null;

  // Show relevant partnerships first if an icon is provided
  const relevant = iconFilter
    ? PARTNERSHIPS.filter(p => p.categories.includes(iconFilter))
    : [];
  const other = PARTNERSHIPS.filter(p => !relevant.find(r => r.id === p.id));

  function selectPartnership(id: string) {
    const sep = returnTo.includes('?') ? '&' : '?';
    router.push(`${returnTo}${sep}partnershipId=${id}`);
  }

  return (
    <main className="flex min-h-screen flex-col pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-2">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-card transition hover:bg-grounded-green/5 active:scale-95"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div>
          <h1 className="font-display text-base font-bold text-grounded-green" style={{ fontWeight: 700 }}>
            Partnerships
          </h1>
        </div>
      </div>

      {/* Intro */}
      <div className="px-5 pt-2 pb-5">
        <p className="text-sm text-charcoal/55 leading-relaxed">
          Triodos has partnered with verified sustainable businesses to offer you exclusive discounts when you reach a savings goal.
        </p>
      </div>

      {/* Relevant section */}
      {relevant.length > 0 && (
        <div className="mb-4 px-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-charcoal/40">
            Matched to your goal
          </p>
          <div className="flex flex-col gap-3">
            {relevant.map(p => (
              <PartnerCard key={p.id} p={p} onSelect={() => selectPartnership(p.id)} highlighted />
            ))}
          </div>
        </div>
      )}

      {/* All / other section */}
      <div className="px-5">
        {relevant.length > 0 && other.length > 0 && (
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-charcoal/40">
            All partnerships
          </p>
        )}
        <div className="flex flex-col gap-3">
          {(relevant.length > 0 ? other : PARTNERSHIPS).map(p => (
            <PartnerCard key={p.id} p={p} onSelect={() => selectPartnership(p.id)} />
          ))}
        </div>
      </div>
    </main>
  );
}

function PartnerCard({
  p,
  onSelect,
  highlighted = false,
}: {
  p: (typeof PARTNERSHIPS)[number];
  onSelect: () => void;
  highlighted?: boolean;
}) {
  return (
    <div className={`rounded-2xl border bg-white shadow-card overflow-hidden ${highlighted ? 'border-grounded-green/30' : 'border-grounded-green/10'}`}>
      {/* Top: logo + name + discount */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-grounded-green/6 text-2xl">
          {p.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-charcoal">{p.name}</p>
          <p className="text-xs text-charcoal/50">{p.tagline}</p>
        </div>
        <span className="shrink-0 rounded-full bg-grounded-green px-3 py-1 text-xs font-bold text-white">
          {p.discount}
        </span>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-charcoal/6" />

      {/* Transition badge + description */}
      <div className="px-4 pt-3 pb-3">
        {(() => {
          const tr = TRIODOS_TRANSITIONS[p.transition];
          return (
            <span
              className="mb-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{ backgroundColor: tr.bgColor, color: tr.color }}
            >
              {tr.emoji} {tr.label} transition
            </span>
          );
        })()}
        <p className="text-sm leading-relaxed text-charcoal/60">
          {p.description}
        </p>
      </div>

      {/* CTA */}
      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={onSelect}
          className="w-full rounded-xl bg-grounded-green py-3 text-sm font-semibold text-white shadow-card transition hover:bg-grounded-green/90 active:scale-[0.99]"
        >
          Link to my goal
        </button>
      </div>
    </div>
  );
}
