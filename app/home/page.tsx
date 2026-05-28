'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TriodosLogo } from '@/components/TriodosLogo';
import { AccountCard } from '@/components/AccountCard';
import { AccountCardCompact } from '@/components/AccountCardCompact';
import { BottomNav } from '@/components/BottomNav';
import { useAppStore } from '@/lib/store';

export default function HomePage() {
  const router = useRouter();
  const { isInitialized, isAuthenticated, accounts, goals } = useAppStore();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isInitialized, isAuthenticated, router]);

  if (!isInitialized || !isAuthenticated) return null;

  const checkingAccounts = accounts.filter((a) => a.type === 'checking');
  const savingsAccounts = accounts.filter((a) => a.type === 'savings');
  const investmentAccounts = accounts.filter((a) => a.type === 'investment');
  // Checking on top, savings below
  const primaryAccounts = [...checkingAccounts, ...savingsAccounts];

  return (
    <main className="flex min-h-screen flex-col px-5 pb-24 pt-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-grounded-green whitespace-nowrap" style={{ fontWeight: 700 }}>
          Account overview
        </h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/login')}
            aria-label="Lock / log out"
            className="flex h-8 w-8 items-center justify-center rounded-full text-charcoal/40 transition hover:bg-grounded-green/8 hover:text-grounded-green active:scale-95"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth={2} />
              <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
            </svg>
          </button>
          <TriodosLogo />
        </div>
      </header>

      {/* Quick action pills */}
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full border border-grounded-green/20 bg-white px-4 py-2 text-sm font-medium text-grounded-green shadow-card transition active:scale-95"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Transfer
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full border border-grounded-green/20 bg-white px-4 py-2 text-sm font-medium text-grounded-green shadow-card transition active:scale-95"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth={2} />
            <path d="M9 9h.01M9 15h.01M15 9h.01M15 15h.01M12 12h.01" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
          </svg>
          QR scanner
        </button>
      </div>

      {/* Private accounts — savings + checking side by side */}
      {primaryAccounts.length > 0 && (
        <section className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-charcoal/50">
            My accounts
          </p>
          <div className="flex flex-col gap-3">
            {primaryAccounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onClick={() => router.push(`/accounts/${account.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Goals CTA — Set goals / See goals */}
      {(() => {
        const activeGoals = goals.filter((g) => !g.completedAt);
        const hasGoals = goals.length > 0;
        const hasActive = activeGoals.length > 0;
        const goalsLabel = hasGoals ? 'See goals' : 'Set goals';
        const goalsSubtitle = hasActive
          ? `${activeGoals.length} active goal${activeGoals.length > 1 ? 's' : ''}`
          : hasGoals ? 'View your completed goals'
          : 'Define your savings goals';
        const goalsHref = '/goals';
        return (
          <button
            type="button"
            onClick={() => router.push(goalsHref)}
            className="mt-6 flex w-full items-center justify-between gap-3 rounded-2xl border border-grounded-lupine/30 bg-grounded-lupine/15 px-5 py-4 text-left transition active:scale-[0.99] hover:bg-grounded-lupine/20"
          >
            <div>
              <p className="text-sm font-bold text-grounded-lupine">{goalsLabel}</p>
              <p className="text-xs text-grounded-lupine/60">{goalsSubtitle}</p>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-grounded-lupine">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        );
      })()}

      {/* Private investing (kept for future investment accounts) */}
      {investmentAccounts.length > 0 && (
        <section className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-charcoal/50">
            Private investing
          </p>
          <div className="flex flex-col gap-3">
            {investmentAccounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onClick={() => router.push(`/accounts/${account.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Open new account */}
      <button
        type="button"
        className="mt-6 w-full rounded-2xl border border-grounded-green/20 py-4 text-sm font-semibold text-grounded-green transition hover:bg-grounded-green/5 active:scale-[0.99]"
      >
        + Open new account
      </button>

      <BottomNav />
    </main>
  );
}
