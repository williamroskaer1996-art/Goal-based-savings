'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import type { GoalIconKey } from '@/lib/types';
import { ICON_TRANSITION, TRIODOS_TRANSITIONS } from '@/lib/types';
import type { TriodosFund } from '@/lib/funds';

// ── Slider scale ──────────────────────────────────────────────────────────────
// Linear 1–30 years. Each year is an equal fraction of the track.
// Slider value IS the year (integer, step 1).
const SLIDER_MIN = 1;
const SLIDER_MAX = 30;

// Convert a year value to its exact % position on the track
function yearToPct(year: number): number {
  return (year - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN) * 100;
}

// Offset the bubble so it follows the thumb center (26 px thumb inside the track)
function thumbPct(year: number): number {
  const pct = yearToPct(year);
  return 3.7 + pct * 0.926; // maps 0%→3.7%, 100%→96.3%
}

const INVEST_THRESHOLD = 5; // years

// ── Goal name → icon ──────────────────────────────────────────────────────────
function categorizeGoal(n: string): GoalIconKey {
  const s = n.toLowerCase();
  if (/solar|panel|insul|heat|wind|electric|energy|roof/.test(s))     return 'home';
  if (/e-bike|ebike|cargo.bike|bicycle|bike/.test(s))                 return 'bike';
  if (/car|vehicle|ev |electric.car|tesla/.test(s))                   return 'car';
  if (/garden|plant|veggie|vegetable|grow|farm|organic/.test(s))      return 'garden';
  if (/train|trip|travel|inter.?rail|journey|europe/.test(s))         return 'train';
  if (/holiday|vacation|ski|beach|resort|abroad/.test(s))             return 'holiday';
  if (/health|gym|fitness|sport|doctor|medical|wellness/.test(s))     return 'health';
  if (/course|school|study|learn|education|uni|degree/.test(s))       return 'education';
  if (/phone|fairphone|laptop|repair|tool|device/.test(s))            return 'tools';
  if (/gift|birthday|present|wedding|anniversar/.test(s))             return 'gift';
  if (/safety|security|insurance|emergency/.test(s))                  return 'safety';
  if (/pet|dog|cat|animal|vet/.test(s))                               return 'pet';
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

  // ── Form state ───────────────────────────────────────────────────────────
  const [name,    setName]    = useState('');
  const [amount,  setAmount]  = useState('');
  const [purpose, setPurpose] = useState('');

  const [sliderYears, setSliderYears] = useState<number>(() =>
    existingGoal?.timeHorizonMonths
      ? Math.max(SLIDER_MIN, Math.min(SLIDER_MAX, Math.round(existingGoal.timeHorizonMonths / 12)))
      : 2,
  );

  // Explicit user choice — not auto-forced by slider
  const [goalTypeChoice, setGoalTypeChoice] = useState<'saving' | 'investing'>(() =>
    existingGoal?.goalType ?? 'saving',
  );

  // ── Recommendation state ─────────────────────────────────────────────────
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loadingRec,     setLoadingRec]     = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Derived ──────────────────────────────────────────────────────────────
  const timeHorizonMonths = sliderYears * 12;
  const isLongTerm        = sliderYears >= INVEST_THRESHOLD;

  // Transition theme from goal name
  const iconKey        = name.trim() ? categorizeGoal(name) : 'other';
  const transitionKey  = ICON_TRANSITION[iconKey];
  const transitionInfo = TRIODOS_TRANSITIONS[transitionKey];
  const showTransition = iconKey !== 'other' && name.trim().length > 1;

  // Fund recommendation shows when user picks investing + has a goal name
  const showFundRec = goalTypeChoice === 'investing' && !!name.trim();

  // Accent follows goal type choice
  const accentColor = goalTypeChoice === 'investing' ? '#8074FF' : '#004B32';

  // ── Pre-fill when editing ────────────────────────────────────────────────
  useEffect(() => {
    if (existingGoal) {
      setName(existingGoal.name);
      setAmount(existingGoal.targetAmount > 0 ? String(existingGoal.targetAmount) : '');
      setPurpose(existingGoal.purpose ?? '');
      setGoalTypeChoice(existingGoal.goalType);
      if (existingGoal.timeHorizonMonths) {
        setSliderYears(Math.max(SLIDER_MIN, Math.min(SLIDER_MAX, Math.round(existingGoal.timeHorizonMonths / 12))));
      }
    }
  }, [existingGoal?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isInitialized && !isAuthenticated) router.replace('/login');
  }, [isInitialized, isAuthenticated, router]);

  // ── AI fund recommendation — debounced ───────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!showFundRec) {
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
  }, [showFundRec, name, sliderYears]);

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
      goalType:         goalTypeChoice,
      timeHorizonMonths,
    };
    if (existingGoal) {
      updateGoal(existingGoal.id, patch);
    } else {
      addGoal({ ...patch, balance: 0, parentAccountId: id });
    }
    router.push('/goals');
  }

  const fillPct = yearToPct(sliderYears);
  const sliderTrackStyle: React.CSSProperties = {
    background: `linear-gradient(to right, ${accentColor} ${fillPct}%, #d6d0c8 ${fillPct}%)`,
    color: accentColor,
    transition: 'background 0.05s, color 0.4s',
  };

  const isEditing = !!existingGoal;
  if (!isInitialized || !isAuthenticated || !account) return null;

  return (
    <main className="flex min-h-dvh flex-col">
      {/* ── Header ── */}
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
        <p className="text-sm font-semibold text-charcoal/55">
          {isEditing ? 'Edit goal' : 'New goal'}
        </p>
        <div className="w-9" />
      </div>

      {/* ── Form ── */}
      <div className="mt-6 flex flex-col gap-6 px-5 pb-44">

        {/* ── Goal name ── */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-charcoal/65" htmlFor="goal-name">
            What is your goal?
          </label>
          <input
            id="goal-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="E.g. Solar panels"
            className="w-full rounded-xl border border-grounded-green/15 bg-white px-4 py-3.5 text-base text-charcoal placeholder:text-charcoal/30 focus:border-grounded-green/50 focus:outline-none focus:ring-2 focus:ring-grounded-green/10"
          />

          {/* Transition theme chip — fades in once goal name is recognised */}
          <div
            className="mt-2 overflow-hidden transition-all duration-300"
            style={{ maxHeight: showTransition ? '32px' : '0px', opacity: showTransition ? 1 : 0 }}
          >
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{ background: transitionInfo.bgColor, color: transitionInfo.color }}
            >
              {transitionInfo.emoji}&nbsp;{transitionInfo.label} transition
            </span>
          </div>
        </div>

        {/* ── Amount ── */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-charcoal/65" htmlFor="goal-amount">
            Target amount{' '}
            <span className="font-normal text-charcoal/35">(optional)</span>
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

        {/* ── Purpose ── */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-charcoal/65" htmlFor="goal-purpose">
            What is it for?{' '}
            <span className="font-normal text-charcoal/35">(optional)</span>
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

        {/* ── Time horizon slider ── */}
        <div>
          <label className="mb-3 block text-sm font-semibold text-charcoal/65">
            Time horizon
          </label>

          {/* Slider — pt makes room for the floating bubble above */}
          <div className="relative pt-9">
            {/* Floating year bubble above the thumb */}
            <div
              className="pointer-events-none absolute top-0 -translate-x-1/2 transition-[left] duration-75"
              style={{ left: `${thumbPct(sliderYears)}%` }}
            >
              <div
                className="rounded-lg px-2.5 py-1 text-xs font-bold shadow-sm"
                style={{
                  background:  'white',
                  color:       accentColor,
                  border:      `1.5px solid ${accentColor}30`,
                  transition:  'color 0.4s, border-color 0.4s',
                  whiteSpace:  'nowrap',
                }}
              >
                {sliderYears === 1 ? '1 year' : `${sliderYears} years`}
              </div>
              {/* Tiny arrow pointing down */}
              <div
                className="mx-auto mt-px h-1.5 w-1.5 rotate-45 rounded-sm"
                style={{ background: accentColor, opacity: 0.3, transition: 'background 0.4s' }}
              />
            </div>

            {/* Track — linear 1-30, each year an equal step */}
            <input
              type="range"
              min={SLIDER_MIN}
              max={SLIDER_MAX}
              step={1}
              value={sliderYears}
              onChange={(e) => setSliderYears(parseInt(e.target.value, 10))}
              className="time-slider"
              style={sliderTrackStyle}
              aria-label="Time horizon in years"
            />
          </div>

          {/* Tick marks at mathematically exact positions */}
          <div className="relative mt-1 h-1.5">
            {/* 5y  = (5-1)/(30-1)*100 = 13.79% */}
            <div className="absolute top-0 h-full w-px rounded-full bg-charcoal/20"
              style={{ left: `${yearToPct(5).toFixed(2)}%` }} />
            {/* 10y = (10-1)/(30-1)*100 = 31.03% */}
            <div className="absolute top-0 h-full w-px rounded-full bg-charcoal/12"
              style={{ left: `${yearToPct(10).toFixed(2)}%` }} />
            {/* 20y = (20-1)/(30-1)*100 = 65.52% */}
            <div className="absolute top-0 h-full w-px rounded-full bg-charcoal/12"
              style={{ left: `${yearToPct(20).toFixed(2)}%` }} />
          </div>

          {/* Scale labels at exact linear positions */}
          <div className="relative mt-0.5 h-4 select-none text-[10px] font-medium text-charcoal/35">
            <span className="absolute left-0">1y</span>
            <span
              className="absolute -translate-x-1/2 font-semibold"
              style={{ left: `${yearToPct(5).toFixed(2)}%`, color: `${accentColor}80`, transition: 'color 0.4s' }}
            >5y</span>
            <span className="absolute -translate-x-1/2"
              style={{ left: `${yearToPct(10).toFixed(2)}%` }}>10y</span>
            <span className="absolute -translate-x-1/2"
              style={{ left: `${yearToPct(20).toFixed(2)}%` }}>20y</span>
            <span className="absolute right-0">30y</span>
          </div>
        </div>

        {/* ── Goal type toggle ── */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-charcoal/65">
            Goal type
          </label>

          <div className="flex gap-1.5 rounded-xl border border-grounded-green/12 bg-white p-1">
            {/* Savings */}
            <button
              type="button"
              onClick={() => setGoalTypeChoice('saving')}
              className="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200"
              style={{
                background: goalTypeChoice === 'saving' ? '#004B32' : 'transparent',
                color:      goalTypeChoice === 'saving' ? 'white' : 'rgba(34,34,34,0.45)',
              }}
            >
              Savings
            </button>

            {/* Investment — relative so badge can be placed on it */}
            <div className="relative flex-1">
              <button
                type="button"
                onClick={() => setGoalTypeChoice('investing')}
                className="w-full rounded-lg py-2.5 text-sm font-semibold transition-all duration-200"
                style={{
                  background: goalTypeChoice === 'investing' ? '#8074FF' : 'transparent',
                  color:      goalTypeChoice === 'investing' ? 'white' : 'rgba(34,34,34,0.45)',
                }}
              >
                Investment
              </button>

              {/* "Suggested" badge — only when time > 5y and savings is still selected */}
              {isLongTerm && goalTypeChoice === 'saving' && (
                <span
                  className="pointer-events-none absolute -right-1 -top-2 rounded-full px-1.5 py-px text-[9px] font-bold text-white"
                  style={{ background: '#8074FF' }}
                >
                  Suggested
                </span>
              )}
            </div>
          </div>

          {/* Soft nudge when savings + long-term */}
          <div
            className="overflow-hidden transition-all duration-300"
            style={{
              maxHeight: goalTypeChoice === 'saving' && isLongTerm ? '28px' : '0px',
              opacity:   goalTypeChoice === 'saving' && isLongTerm ? 1 : 0,
            }}
          >
            <p className="mt-1.5 text-xs text-charcoal/40">
              Investment funds tend to grow more over {sliderYears}+ years.
            </p>
          </div>
        </div>

        {/* ── Fund recommendation (investing + name filled) ── */}
        <div
          className="overflow-hidden transition-all duration-500"
          style={{ maxHeight: showFundRec ? '320px' : '0px', opacity: showFundRec ? 1 : 0 }}
        >
          <div
            className="rounded-2xl p-4"
            style={{ border: '1.5px solid #8074FF28', background: '#8074FF08' }}
          >
            {/* No name yet */}
            {!name.trim() && (
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

      {/* ── Sticky CTA ── */}
      <div className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 bg-gradient-to-t from-birch-skin via-birch-skin/95 to-birch-skin/0 px-5 pb-8 pt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={!name.trim()}
          className="w-full rounded-xl py-4 text-base font-semibold text-white shadow-card transition active:scale-[0.99] disabled:opacity-40"
          style={{ backgroundColor: accentColor, transition: 'background-color 0.4s' }}
        >
          {isEditing ? 'Save changes' : goalTypeChoice === 'investing' ? 'Save investment goal' : 'Save goal'}
        </button>
      </div>
    </main>
  );
}
