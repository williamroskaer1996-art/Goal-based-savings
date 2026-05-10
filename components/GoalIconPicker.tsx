import type { GoalIconKey } from '@/lib/types';
import { GOAL_ICONS } from '@/lib/types';

type Props = {
  selected: GoalIconKey | null;
  onSelect: (key: GoalIconKey) => void;
};

const ICON_KEYS = Object.keys(GOAL_ICONS) as GoalIconKey[];

export function GoalIconPicker({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {ICON_KEYS.map((key) => {
        const { label, emoji } = GOAL_ICONS[key];
        const isSelected = selected === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            aria-label={label}
            aria-pressed={isSelected}
            className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 text-center transition active:scale-95 ${
              isSelected
                ? 'border-grounded-green bg-grounded-green/5 shadow-sm'
                : 'border-grounded-green/10 bg-white shadow-card hover:border-grounded-green/30'
            }`}
          >
            <span className="text-2xl leading-none" aria-hidden>{emoji}</span>
            <span
              className={`text-[10px] font-medium leading-tight ${
                isSelected ? 'text-grounded-green' : 'text-charcoal/55'
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
