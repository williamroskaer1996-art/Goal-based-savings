'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import type { GoalIconKey } from '@/lib/types';
import { ICON_TRANSITION } from '@/lib/types';
import type { TriodosFund } from '@/lib/funds';

// ── Slider helpers ────────────────────────────────────────────────────────────
// Non-linear scale — 5 years sits at the visual midpoint (value 50):
//   0..50  → 1..5  years (short-term, fine precision)
//   50..100 → 5..30 years (long-term, coarser steps)

function sliderToYears(v: number): number {
  if (v <= 50) return Math.max(1, Math.round(1 + (v / 50) * 4));
  return Math.min(30, Math.round(5 + ((v - 50) / 50) * 25));
}

function yearsToSlider(y: number): number {
  if (y <= 5) return ((y - 1) / 4) * 50;
  return 50 + ((y - 5) / 25) * 50;
}

const LONG_TERM_YEARS = 5;

// ── Goal icon auto-categoriser ────────────────────────────────────────────────
function categorizeGoal(goalName: string): GoalIconKey {
  const n = goalName.toLowerCase();
  if (/solar|panel|insul|heat|wind|electric|energy|roof/.test(n))      return 'home';
  if (/e-bike|ebike|cargo.bike|bicycle|bike/.test(n))                  return 'bike';
  if (/car|vehicle|ev |electric.car|tesla/.test(n))                    return 'car';
  if (/garden|plant|veggie|vegetable|grow|farm|organic/.test(n))       return 'garden';
  if (/train|trip|travel|inter.?rail|journey|europe/.test(n))          return 'train';
  if (/holiday|vacation|ski|beach|resort|abroad/.test(n))              return 'holiday';
  if (/health|gym|fitness|sport|doctor|medical|wellness/.test(n))      return 'health';
  if (/course|school|study|learn|education|uni|degree/.test(n))        return 'education';
  if (/phone|fairphone|laptop|repair|tool|device/.test(n))             return 'tools';
  if (/gift|birthday|present|wedding|anniversar/.test(n))              return 'gift';
  if (/safety|security|insurance|emergency/.test(n))                   return 'safety';
  if (/pet|dog|cat|animal|vet/.test(n))                                return 'pet';
  return 'other';
}

type Recommendation = { fund: TriodosFund; reason: string };

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SetGoalPage() {
  const router       = useRouter();
  const params       = useParams();
  const searchParams = useSearchParams();
  const id           = params.id as string;
  const editGoalId   = searchParams.get('goalId');

  const { isInitialized, isAuthenticated, accounts, goals, addGoal, updateGoal } = useAppStore();
  const account      = accounts.find((a) => a.id === id);
  const existingGoal = editGoalId ? goals.find((g) => g.id === editGoalId) : null;

  const [name,        setName]        = useState('');
  const [amount,      setAmount]      = useState('');
  const [purpose,     setPurpose]     = useState('');
  const [sliderValue, setSliderValue] = useState<number>(() =>
    existingGoal?.timeHorizonMonths
      ? yearsToSlider(Math.max(1, Math.round(existingGoal.timeHorizonMonths / 12)))
      : yearsToSlider(2),
  );

  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loadingRec,     setLoadingRec]     = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Derived ──────────────────────────────────────────────────────────────
  const sliderYears                      = sliderToYears(sliderValue);
  const timeHorizonMonths                = sliderYears * 12;
  const isLongTerm                       = sliderYears >= LONG_TERM_YEARS;
  const goalType: 'saving' | 'investing' = isLongTerm ? 'investing' : 'saving';
  const accentColor                      = isLongTerm ? '#8074FF' : '#004B32';

  // ── Pre-fill when editing ────────────────────────────────────────────────
  useEffect(() => {
    if (existingGoal) {
      setName(existingGoal.name);
      setAmount(existingGoal.targetAmount > 0 ? String(existingGoal.targetAmount) : '');
      setPurpose(existingGoal.purpose ?? '');
      if (existingGoal.timeHorizonMonths) {
        setSliderValue(yearsToSlider(Math.max(1, Math.round(existingGoal.timeHorizonMonths / 12))));
      }
    }
  }, [existingGoal?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isInitialized && !isAuthenticated) router.replace('/login');
  }, [isInitialized, isAuthenticated, router]);

  // ── AI recommendation — debounced ────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!isLongTerm || !name.trim()) {
      setRecommendation(null);
      setLoadingRec(false);
      return;
    }

    setLoadingRec(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/recommend-fund', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            goalName:         name.trim(),
            purpose:          purpose.trim() || undefined,
            timeHorizonMonths,
            amount:           parseFloat(amount) || undefined,
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setRecommendation(await res.json());
      } catch (err) {
        console.error('[recommend-fund]', err);
        setRecommendation(null);
      } finally {
        setLoadingRec(false);
      }
    }, 750);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLongTerm, name, sliderYears]);

  // ── Save ─────────────────────────────────────────────────────────────────
  function handleSave() {
    if (!name.trim()) return;
    const resolvedIcon: GoalIconKey =
      existingGoal?.iconKey !== 'other' && existingGoal?.iconKey
        ? existingGoal.iconKey
        : categorizeGoal(name);
    const patch = {
      name:             name.trim(),
      targetAmount:     parseFloat(amount) || 0,
      iconKey:          resolvedIcon,
      purpose:          purpose.trim() || undefined,
      transition:       ICON_TRANSITION[resolvedIcon],
      goalType,
      timeHorizonMonths,
    };
    if (existingGoal) {
      updateGoal(existingGoal.id, patch);
    } else {
      addGoal({ ...patch, balance: 0, parentAccountId: id });
    }
    router.push('/goals');
  }

  const sliderPct   = sliderValue; // 0-100 maps directly to %
  const trackStyle: React.CSSProperties = {
    background: `linear-gradient(to right, ${accentColor} ${sliderPct}%, #d6d0c8 ${sliderPct}%)`,
    color: accentColor,
  };

  const isEditing = !!existingGoal;
  if (!isInitialized || !isAuthenticated || !account) return null;

  return (
    <main className="flex min-h-dvh flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Close"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-card transition hover:bg-grounded-green/5 active:scale-95"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" />
          </svg>
        </button>
        <h1 className="font-display text-base font-bold" style={{ color: accentColor, fontWeight: 700, transition: 'color 0.4s' }}>
          {isEditing ? 'Edit goal' : isLongTerm ? 'Set investment goal' : 'Set savings goal'}
        </h1>
        <div className="w-9" />
      </div>

      {/* Form */}
      <div className="mt-6 flex flex-col gap-6 px-5 pb-44">

        {/* Goal name */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-charcoal/70" htmlFor="goal-name">
            What is your savings goal?
          </label>
          <input
            id="goal-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="E.g. Solar panels"
            className="w-full rounded-xl border border-grounded-green/15 bg-white px-4 py-3.5 text-base text-charcoal placeholder:text-charcoal/30 focus:border-grounded-green/50 focus:outline-none focus:ring-2 focus:ring-grounded-green/10"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-charcoal/70" htmlFor="goal-amount">
            How much do you want to save?{' '}
            <span className="font-normal text-charcoal/40">(optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-charcoal/40">€</span>
            <input
              id="goal-amount"
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full rounded-xl border border-grounded-green/15 bg-white py-3.5 pl-8 pr-4 text-base text-charcoal placeholder:text-charcoal/30 focus:border-grounded-green/50 focus:outline-none focus:ring-2 focus:ring-grounded-green/10"
            />
          </div>
        </div>

        {/* Purpose */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-charcoal/70" htmlFor="goal-purpose">
            What is it for?{' '}
            <span className="font-normal text-charcoal/40">(optional)</span>
          </label>
          <input
            id="goal-purpose"
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="E.g. Become energy independent at home"
            className="w-full rounded-xl border border-grounded-green/15 bg-white px-4 py-3.5 text-base text-charcoal placeholder:text-charcoal/30 focus:border-grounded-green/50 focus:outline-none focus:ring-2 focus:ring-grounded-green/10"
          />
        </div>

        {/* Time horizon */}
        <div>
          <label className="mb-3 block text-sm font-semibold text-charcoal/70">
            When do you want to reach this goal?
          </label>

          {/* Year display */}
          <p
            className="font-display mb-4 text-[36px] font-black leading-none"
            style={{ color: accentColor, fontWeight: 800, transition: 'color 0.4s' }}
          >
            {sliderYears === 1 ? '1 year' : `${sliderYears} years`}
          </p>

          {/* Slider */}
          <input
            type="range"
            min={0}
            max={100}
            step={0.5}
            value={sliderValue}
            onChange={(e) => setSliderValue(parseFloat(e.target.value))}
            className="time-slider"
            style={trackStyle}
            aria-label="Time horizon in years"
          />

          {/* Scale labels — 1y at 0%, 5y at 50%, 10y at 60%, 30y at 100% */}
          <div className="relative mt-2 h-4 text-[10px] font-semibold text-charcoal/35">
            <span className="absolute left-0">1y</span>
            <span
              className="absolute -translate-x-1/2"
              style={{ left: '50%', color: `${accentColor}70`, transition: 'color 0.4s' }}
            >
              5y
            </span>
            <span className="absolute" style={{ left: 'calc(60% - 8px)' }}>10y</span>
            <span className="absolute right-0">30y</span>
          </div>
        </div>

        {/* Fund recommendation — slides in for long-term goals */}
        <div
          className="overflow-hidden transition-all duration-500"
          style={{ maxHeight: isLongTerm ? '400px' : '0px', opacity: isLongTerm ? 1 : 0 }}
        >
          <div
            className="rounded-2xl p-4"
            style={{ border: '1.5px solid #8074FF28', background: '#8074FF08' }}
          >
            {/* No goal name yet */}
            {!name.trim() && !loadingRec && (
              <p className="text-sm text-charcoal/40">
                Enter a goal name to get a fund recommendation.
              </p>
            )}

            {/* Loading */}
            {name.trim() && loadingRec && (
              <div className="space-y-2.5">
                <div className="h-5 w-48 animate-pulse rounded-lg" style={{ background: '#8074FF14' }} />
                <div className="mt-3 h-3.5 w-full animate-pulse rounded-lg" style={{ background: '#8074FF0E' }} />
                <div className="h-3.5 w-2/3 animate-pulse rounded-lg" style={{ background: '#8074FF0E' }} />
              </div>
            )}

            {/* Result */}
            {recommendation && !loadingRec && (
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-2xl leading-none">{recommendation.fund.emoji}</span>
                <div className="min-w-0">
                  <p className="font-display font-bold leading-snug text-grounded-green" style={{ fontWeight: 700 }}>
                    {recommendation.fund.name}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal/55">
                    {recommendation.reason}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 bg-gradient-to-t from-birch-skin via-birch-skin/95 to-birch-skin/0 px-5 pb-8 pt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={!name.trim()}
          className="w-full rounded-xl py-4 text-base font-semibold text-white shadow-card transition active:scale-[0.99] disabled:opacity-40"
          style={{ backgroundColor: accentColor, transition: 'background-color 0.4s' }}
        >
          {isEditing ? 'Save changes' : isLongTerm ? 'Save investment goal' : 'Save goal'}
        </button>
      </div>
    </main>
  );
}
