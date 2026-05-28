'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { BackButton } from '@/components/BackButton';
import { BottomNav } from '@/components/BottomNav';
import { useAppStore } from '@/lib/store';
import { MOCK_TRANSACTIONS } from '@/lib/mockData';

const TABS = ['All', 'In', 'Out', 'Upcoming'] as const;
type Tab = (typeof TABS)[number];

const ACTION_BUTTONS = [
  {
    label: 'Withdraw',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    action: 'withdraw',
  },
  {
    label: 'About my account',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={2} />
        <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      </svg>
    ),
    action: 'about',
  },
  {
    label: 'Set savings goal',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={2} />
        <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      </svg>
    ),
    action: 'goal',
  },
] as const;

export default function AccountDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { isInitialized, isAuthenticated, accounts } = useAppStore();
  const [activeTab, setActiveTab] = useState<Tab>('All');

  const account = accounts.find((a) => a.id === id);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) router.replace('/login');
  }, [isInitialized, isAuthenticated, router]);

  if (!isInitialized || !isAuthenticated || !account) return null;

  function handleAction(action: string) {
    if (action === 'goal') {
      router.push(`/accounts/${id}/goal`);
    }
  }

  return (
    <main className="flex min-h-dvh flex-col pb-24">
      {/* Top bar */}
      <div className="px-5 pt-6">
        <div className="flex items-center gap-3">
          <BackButton href="/home" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-charcoal/45">{account.iban}</p>
          </div>
        </div>
      </div>

      {/* Balance hero */}
      <div className="mt-6 px-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-charcoal/45">
          {{ savings: 'Savings balance', checking: 'Checking balance', investment: 'Investment balance' }[account.type]}
        </p>
        <p className="mt-1 font-display text-3xl font-bold text-grounded-green" style={{ fontWeight: 700 }}>
          {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(account.balance)}
        </p>
        <p className="mt-0.5 text-xs text-charcoal/45">{account.ownerName}</p>
      </div>

      <div className="mt-5 flex flex-col gap-4 px-5">
        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-2.5">
          {ACTION_BUTTONS.map((btn) => (
            <button
              key={btn.action}
              type="button"
              onClick={() => handleAction(btn.action)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-grounded-green/10 bg-white px-2 py-4 text-center shadow-card transition active:scale-95 hover:bg-grounded-green/5"
            >
              <span className="text-grounded-green">{btn.icon}</span>
              <span className="text-[11px] font-medium leading-tight text-charcoal/75">
                {btn.label}
              </span>
            </button>
          ))}
        </div>

        {/* Transaction filter tabs */}
        <div className="flex gap-1 rounded-xl bg-grounded-green/5 p-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
                activeTab === tab
                  ? 'bg-white text-grounded-green shadow-card'
                  : 'text-charcoal/45 hover:text-charcoal/65'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Transaction list */}
        {(() => {
          const filtered = MOCK_TRANSACTIONS.filter(t =>
            activeTab === 'All' ? true :
            activeTab === 'In' ? t.type === 'credit' :
            activeTab === 'Out' ? t.type === 'debit' :
            false // Upcoming — empty for now
          );
          if (filtered.length === 0) return (
            <p className="py-10 text-center text-sm text-charcoal/40">No transactions yet.</p>
          );
          let lastDate = '';
          return (
            <div className="flex flex-col">
              {filtered.map(t => {
                const showDate = t.date !== lastDate;
                lastDate = t.date;
                return (
                  <div key={t.id}>
                    {showDate && (
                      <p className="pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal/35 first:pt-0">
                        {t.date}
                      </p>
                    )}
                    <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3.5 mb-2 shadow-card">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-grounded-green/6 text-lg">
                        {t.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-charcoal">{t.label}</p>
                        <p className="text-xs text-charcoal/45">{t.sublabel}</p>
                      </div>
                      <p className={`text-sm font-bold tabular-nums ${t.type === 'credit' ? 'text-grounded-green' : 'text-charcoal'}`}>
                        {t.type === 'credit' ? '+' : ''}
                        {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(t.amount)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      <BottomNav />
    </main>
  );
}
