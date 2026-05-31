'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { GOAL_ICONS, TRIODOS_TRANSITIONS } from '@/lib/types';
import type { GoalAccount, TriodosTransition } from '@/lib/types';

// ── Real-world Triodos impact ──────────────────────────────────────────────────
const TRIODOS_IMPACT: Record<TriodosTransition, { headline: string; stat: string; detail: string }> = {
  energy: {
    headline: 'Powering the energy transition',
    stat: '1,847 households',
    detail: 'gained renewable energy access through Triodos-financed solar and wind projects this year.',
  },
  resources: {
    headline: 'Closing the loop',
    stat: '€240 million',
    detail: 'invested in circular economy businesses that extend product life and eliminate waste across Europe.',
  },
  food: {
    headline: 'Rooting sustainable food',
    stat: '4,200 hectares',
    detail: 'of certified organic farmland supported by Triodos, cutting synthetic pesticide use by 60%.',
  },
  society: {
    headline: 'Building fairer communities',
    stat: '12,400 homes',
    detail: 'made affordable through Triodos social housing and community development financing.',
  },
  wellbeing: {
    headline: 'Nurturing wellbeing for all',
    stat: '89 organisations',
    detail: 'in health, arts and care supported by Triodos, making wellbeing accessible to more people.',
  },
};

// ── Count-up hook ──────────────────────────────────────────────────────────────
function useCountUp(target: number, delay = 350) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    setValue(0);
    const t = setTimeout(() => {
      const dur = 1200;
      const start = Date.now();
      const tick = () => {
        const p = Math.min((Date.now() - start) / dur, 1);
        setValue(Math.round((1 - Math.pow(1 - p, 3)) * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(t);
  }, [target, delay]);
  return value;
}

// ── Slide type union ──────────────────────────────────────────────────────────
type Slide =
  | { type: 'welcome';     ownerName: string }
  | { type: 'goals-count'; goals: GoalAccount[]; totalTarget: number }
  | { type: 'saved';       totalSaved: number; totalTarget: number }
  | { type: 'completed';   goals: GoalAccount[] }
  | { type: 'transition';  transition: TriodosTransition; goals: GoalAccount[] }
  | { type: 'outro';       completedCount: number; totalSaved: number };

const SHADOW = '0 2px 12px rgba(0,0,0,0.55)';
const SHADOW_LG = '0 4px 24px rgba(0,0,0,0.6)';

// ── Slide components ──────────────────────────────────────────────────────────

function SlideWelcome({ ownerName }: { ownerName: string }) {
  return (
    <div className="relative flex h-full flex-col justify-between px-8 pb-16 pt-24">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%]"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.62) 0%, transparent 100%)' }} />

      <p className="relative text-xs font-bold uppercase tracking-[0.18em] text-white/70"
        style={{ textShadow: SHADOW }}>Triodos Bank</p>

      <div className="relative">
        <p className="mb-3 text-xl font-semibold" style={{ color: '#DFFF57', textShadow: SHADOW }}>
          2026 in review
        </p>
        <h1 className="font-display text-[52px] font-black leading-[1.05] text-white"
          style={{ textShadow: SHADOW_LG }}>
          Your Goals,<br />Your World.
        </h1>
        <p className="mt-5 text-base leading-relaxed text-white/80"
          style={{ textShadow: SHADOW }}>
          A year of purposeful saving and real-world change.
        </p>
      </div>

      <p className="relative text-sm font-semibold text-white/50" style={{ textShadow: SHADOW }}>
        {ownerName} · tap to begin →
      </p>
    </div>
  );
}

function SlideGoalsCount({ goals, totalTarget }: { goals: GoalAccount[]; totalTarget: number }) {
  const count = useCountUp(goals.length, 400);
  return (
    <div className="relative flex h-full flex-col justify-between px-8 pb-16 pt-24">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[65%]"
        style={{ background: 'linear-gradient(to top, rgba(80,50,180,0.75) 0%, transparent 100%)' }} />

      <p className="relative text-xs font-bold uppercase tracking-[0.18em] text-white/70"
        style={{ textShadow: SHADOW }}>This year</p>

      <div className="relative">
        <p className="font-display text-[80px] font-black leading-none text-white"
          style={{ textShadow: SHADOW_LG }}>{count}</p>
        <p className="mt-1 text-[28px] font-bold text-white" style={{ textShadow: SHADOW }}>
          {goals.length === 1 ? 'goal set' : 'goals set'}
        </p>
        <p className="mt-2 text-base text-white/70" style={{ textShadow: SHADOW }}>
          Total target:{' '}
          <span className="font-semibold text-white">€{totalTarget.toLocaleString('nl-NL')}</span>
        </p>
      </div>

      <div className="relative flex flex-wrap gap-2">
        {goals.map(g => {
          const icon = GOAL_ICONS[g.iconKey];
          return (
            <div key={g.id} className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{ background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(10px)' }}>
              <span className="text-base">{icon.emoji}</span>
              <span className="text-sm font-semibold text-white">{g.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SlideSaved({ totalSaved, totalTarget }: { totalSaved: number; totalTarget: number }) {
  const amount = useCountUp(totalSaved, 300);
  const pct    = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;
  return (
    <div className="relative flex h-full flex-col justify-between px-8 pb-16 pt-24">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[65%]"
        style={{ background: 'linear-gradient(to top, rgba(0,55,35,0.75) 0%, transparent 100%)' }} />

      <p className="relative text-xs font-bold uppercase tracking-[0.18em] text-white/70"
        style={{ textShadow: SHADOW }}>Total saved</p>

      <div className="relative">
        <p className="mb-1 text-lg font-semibold text-white/70" style={{ textShadow: SHADOW }}>You put away</p>
        <p className="font-display text-[48px] font-black leading-none"
          style={{ color: '#DFFF57', textShadow: SHADOW_LG }}>
          €{amount.toLocaleString('nl-NL')}
        </p>
        <p className="mt-3 text-base text-white/70" style={{ textShadow: SHADOW }}>
          That&apos;s <span className="font-bold text-white">{pct}%</span> of your total savings targets.
        </p>
        <div className="mt-6 h-3 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.18)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: '#DFFF57',
              transition: 'width 1.4s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
}

function SlideCompleted({ goals }: { goals: GoalAccount[] }) {
  const count = useCountUp(goals.length, 400);
  return (
    <div className="relative flex h-full flex-col justify-between px-8 pb-16 pt-24">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[65%]"
        style={{ background: 'linear-gradient(to top, rgba(0,55,35,0.75) 0%, transparent 100%)' }} />

      <p className="relative text-xs font-bold uppercase tracking-[0.18em] text-white/70"
        style={{ textShadow: SHADOW }}>Achievement unlocked</p>

      <div className="relative">
        <p className="font-display text-[80px] font-black leading-none text-white"
          style={{ textShadow: SHADOW_LG }}>{count}</p>
        <p className="mt-1 text-[28px] font-bold text-white" style={{ textShadow: SHADOW }}>
          {goals.length === 1 ? 'goal reached' : 'goals reached'}
        </p>
        <p className="mt-2 text-base text-white/70" style={{ textShadow: SHADOW }}>
          Your savings turned into reality.
        </p>
      </div>

      <div className="relative flex flex-col gap-2.5">
        {goals.map(g => {
          const icon = GOAL_ICONS[g.iconKey];
          return (
            <div key={g.id} className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(10px)' }}>
              <span className="text-xl">{icon.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate text-white">{g.name}</p>
                <p className="text-xs text-white/55">€{g.balance.toLocaleString('nl-NL')} saved</p>
              </div>
              <span className="text-sm font-bold" style={{ color: '#DFFF57' }}>✓</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SlideTransition({ transition, goals }: { transition: TriodosTransition; goals: GoalAccount[] }) {
  const tr     = TRIODOS_TRANSITIONS[transition];
  const impact = TRIODOS_IMPACT[transition];

  return (
    <div className="relative flex h-full flex-col justify-between px-8 pb-16 pt-24">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%]"
        style={{ background: `linear-gradient(to top, ${tr.color}cc 0%, transparent 100%)` }} />

      <p className="relative text-xs font-bold uppercase tracking-[0.18em] text-white/70"
        style={{ textShadow: SHADOW }}>{tr.label} transition</p>

      <div className="relative">
        <span className="text-[52px] leading-none">{tr.emoji}</span>
        <h2 className="mt-4 text-2xl font-black leading-snug text-white"
          style={{ textShadow: SHADOW_LG }}>{tr.label}</h2>
        <div className="my-5 h-px bg-white/25" />
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white"
          style={{ textShadow: SHADOW_LG }}>Your goals in this theme</p>
        <div className="flex flex-wrap gap-2">
          {goals.map(g => {
            const icon = GOAL_ICONS[g.iconKey];
            return (
              <div key={g.id} className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                style={{ background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(10px)' }}>
                <span className="text-sm">{icon.emoji}</span>
                <span className="text-sm font-semibold text-white">{g.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative rounded-2xl p-4"
        style={{ background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(12px)' }}>
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white/55">
          Triodos in 2026
        </p>
        <p className="font-display text-[28px] font-black leading-tight text-white"
          style={{ textShadow: SHADOW }}>{impact.stat}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-white/75">{impact.detail}</p>
      </div>
    </div>
  );
}

function SlideOutro({
  completedCount, totalSaved, onClose,
}: { completedCount: number; totalSaved: number; onClose: () => void }) {
  return (
    <div className="relative flex h-full flex-col justify-between px-8 pb-16 pt-24">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%]"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)' }} />

      <p className="relative text-xs font-bold uppercase tracking-[0.18em] text-white/60"
        style={{ textShadow: SHADOW }}>That&apos;s a wrap</p>

      <div className="relative">
        <span className="text-[52px] leading-none">🌱</span>
        <h2 className="font-display mt-5 text-[42px] font-black leading-[1.08] text-white"
          style={{ textShadow: SHADOW_LG }}>
          Here&apos;s to an even bigger 2027.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-white/70" style={{ textShadow: SHADOW }}>
          {completedCount > 0
            ? `You completed ${completedCount} ${completedCount === 1 ? 'goal' : 'goals'} and saved €${totalSaved.toLocaleString('nl-NL')}. `
            : `You saved €${totalSaved.toLocaleString('nl-NL')} this year. `}
          Every euro you save with Triodos actively contributes to a fairer, greener world.
        </p>
      </div>

      <button
        type="button"
        onClick={e => { e.stopPropagation(); onClose(); }}
        className="relative w-full rounded-xl py-4 text-base font-bold transition active:scale-[0.99]"
        style={{ background: '#DFFF57', color: '#004B32', pointerEvents: 'auto' }}
      >
        Back to my goals
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function WrappedPage() {
  const router = useRouter();
  const { isInitialized, isAuthenticated, accounts, goals } = useAppStore();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) router.replace('/login');
  }, [isInitialized, isAuthenticated, router]);

  const ownerName      = accounts[0]?.ownerName ?? 'You';
  const allGoals       = goals.filter(g => g.targetAmount > 0);
  const completedGoals = allGoals.filter(g => !!g.completedAt);
  const totalSaved     = allGoals.reduce((s, g) => s + g.balance, 0);
  const totalTarget    = allGoals.reduce((s, g) => s + g.targetAmount, 0);

  const byTransition = useMemo(() => {
    const map: Partial<Record<TriodosTransition, GoalAccount[]>> = {};
    for (const g of allGoals) {
      if (g.transition) (map[g.transition] ??= []).push(g);
    }
    return (Object.entries(map) as [TriodosTransition, GoalAccount[]][])
      .sort((a, b) => b[1].length - a[1].length);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goals]);

  const slides = useMemo((): Slide[] => {
    const list: Slide[] = [{ type: 'welcome', ownerName }];
    if (allGoals.length > 0) {
      list.push({ type: 'goals-count', goals: allGoals, totalTarget });
      if (totalSaved > 0) list.push({ type: 'saved', totalSaved, totalTarget });
    }
    if (completedGoals.length > 0) list.push({ type: 'completed', goals: completedGoals });
    for (const [transition, tGoals] of byTransition) {
      list.push({ type: 'transition', transition, goals: tGoals });
    }
    list.push({ type: 'outro', completedCount: completedGoals.length, totalSaved });
    return list;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goals]);

  const total = slides.length;
  const goNext = useCallback(() => setCurrent(c => (c < total - 1 ? c + 1 : c)), [total]);
  const goBack = useCallback(() => setCurrent(c => (c > 0 ? c - 1 : c)), []);

  function handleTap(e: React.MouseEvent<HTMLElement>) {
    const x = e.clientX / e.currentTarget.getBoundingClientRect().width;
    if (x < 0.28) goBack(); else goNext();
  }

  if (!isInitialized || !isAuthenticated) return null;

  const slide = slides[current];

  return (
    <main
      onClick={handleTap}
      className="fixed inset-0 overflow-hidden"
      style={{ zIndex: 50, cursor: 'pointer', touchAction: 'manipulation' }}
    >
      {/* Full-bleed photo — no overlay, fills edge to edge */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/wrapped-bg.jpg`}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: 'center 15%' }}
        aria-hidden
      />

      {/* Slide content */}
      <div key={current} className="wrapped-enter absolute inset-0">
        {slide.type === 'welcome'      && <SlideWelcome {...slide} />}
        {slide.type === 'goals-count'  && <SlideGoalsCount {...slide} />}
        {slide.type === 'saved'        && <SlideSaved {...slide} />}
        {slide.type === 'completed'    && <SlideCompleted {...slide} />}
        {slide.type === 'transition'   && <SlideTransition {...slide} />}
        {slide.type === 'outro'        && <SlideOutro {...slide} onClose={() => router.back()} />}
      </div>

      {/* Progress bar */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 flex gap-1 px-5 pt-14">
        {slides.map((_, i) => (
          <div
            key={i}
            className="h-[3px] flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= current ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.28)' }}
          />
        ))}
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={e => { e.stopPropagation(); router.back(); }}
        aria-label="Close"
        className="absolute right-5 flex h-8 w-8 items-center justify-center rounded-full transition active:scale-90"
        style={{ top: '72px', background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(6px)', zIndex: 10, pointerEvents: 'auto' }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M18 6 6 18M6 6l12 12" stroke="white" strokeWidth={2.4} strokeLinecap="round" />
        </svg>
      </button>
    </main>
  );
}
