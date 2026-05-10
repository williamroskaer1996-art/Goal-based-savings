'use client';

import { TRIODOS_TRANSITIONS } from '@/lib/types';
import type { TriodosTransition } from '@/lib/types';

type Props = {
  selected: TriodosTransition | null;
  onSelect: (t: TriodosTransition | null) => void;
};

const TRANSITIONS = Object.entries(TRIODOS_TRANSITIONS) as [TriodosTransition, typeof TRIODOS_TRANSITIONS[TriodosTransition]][];

export function TransitionPicker({ selected, onSelect }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {TRANSITIONS.map(([key, info]) => {
        const isSelected = selected === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(isSelected ? null : key)}
            style={{
              borderColor: isSelected ? info.color : 'transparent',
              backgroundColor: isSelected ? info.bgColor : 'white',
            }}
            className="flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left shadow-card transition active:scale-[0.98]"
          >
            <span className="text-xl">{info.emoji}</span>
            <div className="flex-1">
              <p
                className="text-sm font-semibold"
                style={{ color: isSelected ? info.color : '#222222' }}
              >
                {info.label} transition
              </p>
              {isSelected && (
                <p className="mt-0.5 text-xs leading-relaxed text-charcoal/55">
                  {info.description}
                </p>
              )}
            </div>
            <div
              className="h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center"
              style={{ borderColor: isSelected ? info.color : '#ccc' }}
            >
              {isSelected && (
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: info.color }}
                />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
