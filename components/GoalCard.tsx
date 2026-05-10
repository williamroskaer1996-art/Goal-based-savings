import type { GoalAccount } from '@/lib/types';
import { GOAL_ICONS } from '@/lib/types';

type Props = {
  goal: GoalAccount;
  onClick?: () => void;
};

function formatEur(n: number) {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function GoalCard({ goal, onClick }: Props) {
  const icon = GOAL_ICONS[goal.iconKey];
  const pct =
    goal.targetAmount > 0
      ? Math.min(100, (goal.balance / goal.targetAmount) * 100)
      : 0;
  const remaining = Math.max(0, goal.targetAmount - goal.balance);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-grounded-green/10 bg-white p-4 text-left shadow-card transition active:scale-[0.99] hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Icon bubble */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-grounded-lupine/10 text-xl">
            {icon.emoji}
          </div>
          <div>
            <p className="text-sm font-semibold text-charcoal/80">{goal.name}</p>
            {goal.targetAmount > 0 && (
              <p className="mt-0.5 text-xs text-charcoal/45">
                {remaining > 0
                  ? `${formatEur(remaining)} to go`
                  : 'Goal reached!'}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="font-display text-base font-bold text-grounded-green" style={{ fontWeight: 700 }}>
            {formatEur(goal.balance)}
          </p>
          {goal.targetAmount > 0 && (
            <p className="mt-0.5 text-xs text-charcoal/40">of {formatEur(goal.targetAmount)}</p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {goal.targetAmount > 0 && (
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-grounded-green/10">
            <div
              className="h-full rounded-full bg-grounded-green transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1 text-right text-[11px] text-charcoal/40">{Math.round(pct)}%</p>
        </div>
      )}
    </button>
  );
}
