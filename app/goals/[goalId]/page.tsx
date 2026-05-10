'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { BackButton } from '@/components/BackButton';
import { BottomNav } from '@/components/BottomNav';
import { useAppStore } from '@/lib/store';
import { GOAL_ICONS } from '@/lib/types';

function formatEur(n: number) {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export default function GoalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const goalId = params.goalId as string;
  const { isInitialized, isAuthenticated, goals, depositToGoal } = useAppStore();

  const goal = goals.find((g) => g.id === goalId);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) router.replace('/login');
  }, [isInitialized, isAuthenticated, router]);

  if (!isInitialized || !isAuthenticated || !goal) return null;

  const icon = GOAL_ICONS[goal.iconKey];
  const pct =
    goal.targetAmount > 0
      ? Math.min(100, (goal.balance / goal.targetAmount) * 100)
      : 0;
  const remaining = Math.max(0, goal.targetAmount - goal.balance);

  return (
    <main className="flex min-h-screen flex-col pb-24">
      {/* Top bar */}
      <div className="px-5 pt-6">
        <BackButton href="/home" />
      </div>

      {/* Goal hero */}
      <div className="mt-6 flex flex-col items-center px-5 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-grounded-lupine/10 text-4xl">
          {icon.emoji}
        </div>
        <h1 className="mt-3 font-display text-xl font-bold text-grounded-green" style={{ fontWeight: 700 }}>
          {goal.name}
        </h1>
        <p className="mt-0.5 text-sm text-charcoal/50">{icon.label}</p>
      </div>

      {/* Progress card */}
      {goal.targetAmount > 0 && (
        <div className="mx-5 mt-6 rounded-2xl border border-grounded-green/10 bg-white p-5 shadow-card">
          {/* Amount row */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-charcoal/45">Saved</p>
              <p className="mt-0.5 font-display text-2xl font-bold text-grounded-green" style={{ fontWeight: 700 }}>
                {formatEur(goal.balance)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-charcoal/45">Target</p>
              <p className="mt-0.5 font-display text-2xl font-bold text-charcoal/30" style={{ fontWeight: 700 }}>
                {formatEur(goal.targetAmount)}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-grounded-green/10">
            <div
              className="h-full rounded-full bg-grounded-green transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* % and remaining */}
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-grounded-green">{Math.round(pct)}% saved</p>
            {remaining > 0 && (
              <p className="text-xs text-charcoal/45">{formatEur(remaining)} to go</p>
            )}
            {remaining === 0 && (
              <p className="text-xs font-semibold text-grounded-green">Goal reached! 🎉</p>
            )}
          </div>
        </div>
      )}

      {/* No target set */}
      {goal.targetAmount === 0 && (
        <div className="mx-5 mt-6 rounded-2xl border border-grounded-green/10 bg-white p-5 shadow-card text-center">
          <p className="font-display text-2xl font-bold text-grounded-green" style={{ fontWeight: 700 }}>
            {formatEur(goal.balance)}
          </p>
          <p className="mt-1 text-xs text-charcoal/45">saved so far</p>
        </div>
      )}

      {/* Add money button (demo) */}
      <div className="mx-5 mt-4">
        <button
          type="button"
          onClick={() => depositToGoal(goalId, 100)}
          className="w-full rounded-xl bg-grounded-green py-4 text-base font-semibold text-white shadow-card transition active:scale-[0.99] hover:bg-grounded-green/90"
        >
          + Add €100
        </button>
      </div>

      <BottomNav />
    </main>
  );
}
