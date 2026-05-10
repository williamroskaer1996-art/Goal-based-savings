'use client';

type Props = {
  onPress?: () => void;
  onDismiss?: () => void;
};

export function PromoBanner({ onPress, onDismiss }: Props) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onPress}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-grounded-lupine/25 bg-grounded-lupine/10 px-4 py-3.5 text-left transition active:scale-[0.99] hover:bg-grounded-lupine/15"
      >
        <div className="flex-1 pr-4">
          <p className="text-sm font-semibold text-grounded-green">
            Open a Triodos goal savings account
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-charcoal/60">
            Set a target, track your progress, and invest with purpose.
          </p>
        </div>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          className="shrink-0 text-grounded-lupine"
        >
          <path
            d="M9 18l6-6-6-6"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {onDismiss && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDismiss(); }}
          aria-label="Dismiss"
          className="absolute right-2 top-2 rounded-full p-1 text-charcoal/30 hover:text-charcoal/60"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
