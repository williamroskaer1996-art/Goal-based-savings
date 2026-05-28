'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import type { GoalIconKey } from '@/lib/types';
import { ICON_TRANSITION } from '@/lib/types';
import type { TriodosFund } from '@/lib/funds';
import { RISK_LABELS, RISK_COLORS, RISK_BG } from '@/lib/funds';

// ── Slider helpers ────────────────────────────────────────────────────────────
// The slider runs 0–100:
//   0..50  → 1..60 months  (up to 5 years — short-term)
//   50..100 → 60..360 months (5–30 years — long-term/investing)
// The 5-year threshold sits exactly at the slider midpoint.

function sliderToMonths(v: number): number {
  if (v <= 50) return Math.round(1 + (v / 50) * 59);
  return Math.round(60 + ((v - 50) / 50) * 300);
}

function monthsToSlider(m: number): number {
  if (m <= 60) return ((m - 1) / 59) * 50;
  return 50 + ((m - 60) / 300) * 50;
}

function formatMonths(m: number): string {
  if (m < 12) return m === 1 ? '1 month' : `${m} months`;
  const y = Math.floor(m / 12);
  const rem = m % 12;
  if (rem === 0) return y === 1 ? '1 year' : `${y} years`;
  return rem === 6 ? `${y}½ years` : `${y}y ${rem}m`;
}

const LONG_TERM_THRESHOLD = 60; // months = 5 years

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

// ── Types ─────────────────────────────────────────────────────────────────────
type Recommendation = { fund: TriodosFund; reason: string };

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SetGoalPage() {
  const router      = useRouter();
  const params      = useParams();
  const searchParams = useSearchParams();
  const id          = params.id as string;
  const editGoalId  = searchParams.get('goalId');

  const { isInitialized, isAuthenticated, accounts, goals, addGoal, updateGoal } = useAppStore();
  const account     = accounts.find((a) => a.id === id);
  const existingGoal = editGoalId ? goals.find((g) => g.id === editGoalId) : null;

  // ── Form state ───────────────────────────────────────────────────────────
  const [name,    setName]    = useState('');
  const [amount,  setAmount]  = useState('');
  const [purpose, setPurpose] = useState('');

  // Slider: default to 24 months (slider ≈ 19.5)
  const [sliderValue, setSliderValue] = useState<number>(() =>
    existingGoal?.timeHorizonMonths
      ? monthsToSlider(existingGoal.timeHorizonMonths)
      : monthsToSlider(24),
  );

  // ── Recommendation state ─────────────────────────────────────────────────
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loadingRec,     setLoadingRec]     = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Derived ──────────────────────────────────────────────────────────────
  const timeHorizonMonths = sliderToMonths(sliderValue);
  const isLongTerm                           = timeHorizonMonths >= LONG_TERM_THRESHOLD;
  const goalType: 'saving' | 'investing'    = isLongTerm ? 'investing' : 'saving';

  // ── Pre-fill when editing ────────────────────────────────────────────────
  useEffect(() => {
    if (existingGoal) {
      setName(existingGoal.name);
      setAmount(existingGoal.targetAmount > 0 ? String(existingGoal.targetAmount) : '');
      setPurpose(existingGoal.purpose ?? '');
      if (existingGoal.timeHorizonMonths) {
        setSliderValue(monthsToSlider(existingGoal.timeHorizonMonths));
      }
    }
  }, [existingGoal?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auth guard ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (isInitialized && !isAuthenticated) router.replace('/login');
  }, [isInitialized, isAuthenticated, router]);

  // ── AI fund recommendation — debounced ───────────────────────────────────
  useEffect(() => {
    // Clear previous timer
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!isLongTerm) {
      setRecommendation(null);
      setLoadingRec(false);
      return;
    }

    if (!name.trim()) {
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
            goalName:           name.trim(),
            purpose:            purpose.trim() || undefined,
            timeHorizonMonths,
            amount:             parseFloat(amount) || undefined,
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Recommendation = await res.json();
        setRecommendation(data);
      } catch (err) {
        console.error('[recommend-fund]', err);
        setRecommendation(null);
      } finally {
        setLoadingRec(false);
      }
    }, 750);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLongTerm, name, timeHorizonMonths]);

  // ── Save ─────────────────────────────────────────────────────────────────
  function handleSave() {
    if (!name.trim()) return;
    const resolvedIcon: GoalIconKey =
      existingGoal?.iconKey !== 'other' && existingGoal?.iconKey
        ? existingGoal.iconKey
        : categorizeGoal(name);
    const autoTransition = ICON_TRANSITION[resolvedIcon];

    const patch = {
      name:               name.trim(),
      targetAmount:       parseFloat(amount) || 0,
      iconKey:            resolvedIcon,
      purpose:            purpose.trim() || undefined,
      transition:         autoTransition,
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

  // ── Slider track fill ─────────────────────────────────────────────────────
  const sliderPct     = sliderValue; // 0-100 range maps directly
  const thumbColor    = isLongTerm ? '#8074FF' : '#004B32';
  const fillColor     = isLongTerm ? '#8074FF' : '#004B32';
  const trackStyle: React.CSSProperties = {
    background: `linear-gradient(to right, ${fillColor} ${sliderPct}%, #d6d0c8 ${sliderPct}%)`,
    color: thumbColor, // used by ::-webkit-slider-thumb border via currentColor
  };

  const isEditing = !!existingGoal;

  if (!isInitialized || !isAuthenticated || !account) return null;

  return (
    <main className="flex min-h-dvh flex-col">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
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
        <h1 className="font-display text-base font-bold text-grounded-green" style={{ fontWeight: 700 }}>
          {isEditing
            ? 'Edit goal'
            : isLongTerm
              ? 'Set investment goal'
              : 'Set savings goal'}
        </h1>
        <div className="w-9" />
      </div>

      {/* ── Form ───────────────────────────────────────────────────────────── */}
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
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-charcoal/40">
              €
            </span>
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

        {/* ── Time horizon slider ─────────────────────────────────────────── */}
        <div>
          <label className="mb-3 block text-sm font-semibold text-charcoal/70">
            When do you want to reach this goal?
          </label>

          {/* Time display + badge */}
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p
                className="font-display text-[32px] font-black leading-none transition-colors duration-400"
                style={{ color: thumbColor, fontWeight: 800 }}
              >
                {formatMonths(timeHorizonMonths)}
              </p>
              <p
                className="mt-1 text-[11px] font-semibold uppercase tracking-wider transition-colors duration-400"
                style={{ color: `${thumbColor}99` }}
              >
                {isLongTerm ? 'Long-term · Investment recommended' : 'Short-term · Savings goal'}
              </p>
            </div>

            <span
              className="mt-1 rounded-full px-3 py-1 text-xs font-bold transition-all duration-400"
              style={{
                backgroundColor: `${thumbColor}18`,
                color: thumbColor,
              }}
            >
              {isLongTerm ? 'Invest' : 'Save'}
            </span>
          </div>

          {/* Slider track + input */}
          <div className="relative px-0.5">
            <input
              type="range"
              min={0}
              max={100}
              step={0.5}
              value={sliderValue}
              onChange={(e) => setSliderValue(parseFloat(e.target.value))}
              className="time-slider"
              style={trackStyle}
              aria-label="Time horizon"
            />

            {/* 5-year threshold marker */}
            <div
              className="pointer-events-none absolute"
              style={{ left: 'calc(50% - 0.5px)', top: '50%', transform: 'translateY(-50%)' }}
            >
              <div className="h-4 w-px" style={{ backgroundColor: `${thumbColor}50` }} />
            </div>
          </div>

          {/* Scale labels */}
          <div className="relative mt-2.5 h-4 text-[10px] font-semibold text-charcoal/35">
            <span className="absolute left-0">1m</span>
            <span className="absolute" style={{ left: '9.3%' }}>1y</span>
            <span
              className="absolute -translate-x-1/2 font-bold transition-colors duration-400"
              style={{ left: '50%', color: `${thumbColor}80` }}
            >
              5y
            </span>
            <span className="absolute" style={{ left: '60%' }}>10y</span>
            <span className="absolute right-0">30y</span>
          </div>

          {/* Threshold explainer pill — only at 5y midpoint crossover */}
          <div
            className="mt-3 overflow-hidden transition-all duration-500"
            style={{
              maxHeight: isLongTerm ? '40px' : '0px',
              opacity:   isLongTerm ? 1 : 0,
            }}
          >
            <p className="text-xs text-charcoal/50">
              Goals longer than 5 years are better suited to an investment fund for higher long-term returns.
            </p>
          </div>
        </div>

        {/* ── AI fund recommendation (long-term only) ─────────────────────── */}
        <div
          className="overflow-hidden transition-all duration-500"
          style={{
            maxHeight: isLongTerm ? '500px' : '0px',
            opacity:   isLongTerm ? 1 : 0,
          }}
        >
          <div
            className="rounded-2xl p-4"
            style={{
              border:     '1.5px solid #8074FF33',
              background: '#8074FF0A',
            }}
          >
            {/* Card header */}
            <div className="mb-3 flex items-center gap-2">
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full text-sm"
                style={{ background: '#8074FF20' }}
              >
                💡
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: '#8074FFCC' }}>
                Recommended investment fund
              </p>
            </div>

            {/* Prompt to enter goal name */}
            {!name.trim() && !loadingRec && (
              <p className="text-sm italic text-charcoal/40">
                Enter a goal name above to receive a personalised fund recommendation.
              </p>
            )}

            {/* Loading skeleton */}
            {name.trim() && loadingRec && (
              <div className="space-y-2.5">
                <div className="h-5 w-44 animate-pulse rounded-lg" style={{ background: '#8074FF14' }} />
                <div className="h-3.5 w-full animate-pulse rounded-lg" style={{ background: '#8074FF10' }} />
                <div className="h-3.5 w-3/4 animate-pulse rounded-lg" style={{ background: '#8074FF10' }} />
                <div className="mt-4 h-3 w-32 animate-pulse rounded-lg" style={{ background: '#8074FF10' }} />
              </div>
            )}

            {/* Recommendation */}
            {recommendation && !loadingRec && (
              <div>
                {/* Fund name row */}
                <div className="mb-3 flex items-start gap-3">
                  <span className="mt-0.5 text-2xl leading-none">{recommendation.fund.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-bold leading-snug text-grounded-green" style={{ fontWeight: 700 }}>
                      {recommendation.fund.name}
                    </p>
                    {/* Metadata badges */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-charcoal/55"
                        style={{ background: '#00000009' }}>
                        {recommendation.fund.focus}
                      </span>
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{
                          background: RISK_BG[recommendation.fund.risk],
                          color:      RISK_COLORS[recommendation.fund.risk],
                        }}>
                        {RISK_LABELS[recommendation.fund.risk]} risk
                      </span>
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-charcoal/45"
                        style={{ background: '#00000009' }}>
                        {recommendation.fund.minHorizonYears}y+ horizon
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI reasoning */}
                <p className="text-sm leading-relaxed text-charcoal/60 italic">
                  &ldquo;{recommendation.reason}&rdquo;
                </p>

                {/* Confirmation note */}
                <div className="mt-3 flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M20 6 9 17l-5-5" stroke="#8074FF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-[11px] font-semibold" style={{ color: '#8074FFAA' }}>
                    Saved as a long-term investment goal
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── Sticky save button ─────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 bg-gradient-to-t from-birch-skin via-birch-skin/95 to-birch-skin/0 px-5 pb-8 pt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={!name.trim()}
          className="w-full rounded-xl py-4 text-base font-semibold text-white shadow-card transition active:scale-[0.99] disabled:opacity-40"
          style={{ backgroundColor: thumbColor }}
        >
          {isEditing
            ? 'Save changes'
            : isLongTerm
              ? 'Save investment goal'
              : 'Save goal'}
        </button>
      </div>
    </main>
  );
}
