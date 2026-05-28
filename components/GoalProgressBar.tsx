import type { GoalAccount } from '@/lib/types';
import { GOAL_ICONS } from '@/lib/types';

type Props = {
  balance: number;
  goal: Pick<GoalAccount, 'name' | 'targetAmount' | 'iconKey'>;
};

function formatEur(n: number) {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(n);
}

export function GoalProgressBar({ balance, goal }: Props) {
  const pct = goal.targetAmount > 0
    ? Math.min(100, (balance / goal.targetAmount) * 100)
    : 0;
  const icon = GOAL_ICONS[goal.iconKey];

  return (
    <div className="rounded-2xl border border-grounded-green/10 bg-white p-4 shadow-card">
      {/* Goal name row */}
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg" aria-hidden>{icon.emoji}</span>
        <span className="font-display text-sm font-semibold text-grounded-green" style={{ fontWeight: 600 }}>
          {goal.name}
        </span>
      </div>

      {/* Balance vs target */}
      <div className="mb-2 flex items-end justify-between">
        <div>
          <p className="text-xs text-charcoal/50">Balance</p>
          <p className="font-display text-xl font-bold text-grounded-green" style={{ fontWeight: 700 }}>
            {formatEur(balance)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-charcoal/50">Target</p>
          <p className="text-base font-semibold text-charcoal/70">
            {formatEur(goal.targetAmount)}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-grounded-green/10">
        <div
          className="h-full rounded-full bg-grounded-green transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 text-right text-xs text-charcoal/45">
        {pct.toFixed(0)}% saved
      </p>
    </div>
  );
}
