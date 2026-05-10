'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { GOAL_ICONS, TRIODOS_TRANSITIONS } from '@/lib/types';
import type { GoalAccount } from '@/lib/types';
import { BottomNav } from '@/components/BottomNav';

// ── Goal bottom sheet ─────────────────────────────────────────────────────────
function GoalSheet({
  goal, accounts, onDeposit, onEdit, onClose,
}: {
  goal: GoalAccount;
  accounts: { id: string; type: string; balance: number; ownerName: string }[];
  onDeposit: (amount: number, fromAccountId: string) => void;
  onEdit: () => void;
  onClose: () => void;
}) {
  const icon = GOAL_ICONS[goal.iconKey];
  const tr   = goal.transition ? TRIODOS_TRANSITIONS[goal.transition] : null;
  const pct  = goal.targetAmount > 0 ? Math.min(1, goal.balance / goal.targetAmount) : 0;

  const [amount, setAmount] = useState('');
  const [fromId, setFromId] = useState(accounts[0]?.id ?? '');
  const QUICK = [50, 100, 250];

  const fromAccount = accounts.find(a => a.id === fromId);
  const parsed = parseFloat(amount) || 0;
  const canDeposit = parsed > 0 && fromAccount && parsed <= fromAccount.balance;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-t-3xl bg-white px-5 pb-10 pt-4 shadow-2xl">
        {/* Drag handle */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-charcoal/15" />

        {/* Goal header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-grounded-green/8 text-2xl shrink-0">
            {icon.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-grounded-green truncate">{goal.name}</p>
            {tr && (
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs">{tr.emoji}</span>
                <span className="text-xs font-medium" style={{ color: tr.color }}>{tr.label} transition</span>
              </div>
            )}
          </div>
          <button type="button" onClick={onEdit}
            className="flex items-center gap-1.5 rounded-full border border-grounded-green/20 px-3 py-1.5 text-xs font-semibold text-grounded-green transition hover:bg-grounded-green/5 active:scale-95">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Edit
          </button>
        </div>

        {/* Progress bar */}
        {goal.targetAmount > 0 && (
          <div className="mb-5">
            <div className="flex justify-between text-xs text-charcoal/50 mb-1.5">
              <span>€ {goal.balance.toLocaleString('nl-NL')}</span>
              <span>€ {goal.targetAmount.toLocaleString('nl-NL')}</span>
            </div>
            <div className="h-2 rounded-full bg-grounded-green/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-grounded-green transition-all duration-500"
                style={{ width: `${pct * 100}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-charcoal/40 text-right">{Math.round(pct * 100)}% saved</p>
          </div>
        )}

        {/* Divider */}
        <div className="mb-4 border-t border-grounded-green/8" />

        {/* Add money section */}
        <p className="mb-3 text-sm font-semibold text-charcoal/70">Add money to this goal</p>

        {/* Source account picker */}
        {accounts.length > 1 && (
          <div className="mb-3">
            <p className="mb-1.5 text-xs text-charcoal/50">From account</p>
            <div className="flex gap-2">
              {accounts.map(a => (
                <button key={a.id} type="button"
                  onClick={() => setFromId(a.id)}
                  className={`flex-1 rounded-xl border px-3 py-2.5 text-left transition ${
                    fromId === a.id
                      ? 'border-grounded-green bg-grounded-green/5'
                      : 'border-charcoal/10 bg-white'
                  }`}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-charcoal/40">
                    {a.type}
                  </p>
                  <p className="text-sm font-bold text-grounded-green">
                    € {a.balance.toLocaleString('nl-NL')}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick amounts */}
        <div className="mb-3 flex gap-2">
          {QUICK.map(q => (
            <button key={q} type="button"
              onClick={() => setAmount(String(q))}
              className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold transition active:scale-95 ${
                amount === String(q)
                  ? 'border-grounded-green bg-grounded-green text-white'
                  : 'border-grounded-green/20 bg-white text-grounded-green hover:bg-grounded-green/5'
              }`}>
              € {q}
            </button>
          ))}
        </div>

        {/* Custom amount input */}
        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-charcoal/40">€</span>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={e => { setAmount(e.target.value); }}
            placeholder="Other amount"
            min="0"
            className="w-full rounded-xl border border-grounded-green/15 bg-white py-3.5 pl-8 pr-4 text-base text-charcoal placeholder:text-charcoal/30 focus:border-grounded-green/50 focus:outline-none focus:ring-2 focus:ring-grounded-green/10"
          />
        </div>

        {/* Save button */}
        <button
          type="button"
          onClick={() => { if (canDeposit) { onDeposit(parsed, fromId); onClose(); } }}
          disabled={!canDeposit}
          className="w-full rounded-xl bg-grounded-green py-4 text-base font-semibold text-white shadow-card transition active:scale-[0.99] disabled:opacity-35 hover:bg-grounded-green/90"
        >
          Save to goal
        </button>
      </div>
    </>
  );
}

// ── Physics constants ─────────────────────────────────────────────────────────
const GRAVITY     = 0.20;
const FRICTION    = 0.992;   // per frame @ 60fps — keeps energy for ~8s
const RESTITUTION = 0.70;    // 70% velocity retained on wall bounce
const STROKE      = 6;
const NAV_H       = 92;      // floating nav: bottom-3 (12px) + nav height (~64px) + ring stroke

type Physics = {
  x: number; y: number;
  vx: number; vy: number;
  radius: number;
  isDragging: boolean;
  tapStartX: number; tapStartY: number;
  lastVx: number; lastVy: number;
};

function getRadius(target: number, max: number) {
  const [MIN, MAX] = [56, 98];
  if (max <= 0) return MIN;
  return MIN + Math.sqrt(target / max) * (MAX - MIN);
}

// ── Progress ring ─────────────────────────────────────────────────────────────
function Ring({ r, pct, color, trackColor = 'rgba(0,75,50,0.10)' }: { r: number; pct: number; color: string; trackColor?: string }) {
  const cr   = r - STROKE / 2 - 1;
  const circ = 2 * Math.PI * cr;
  const d    = r * 2;
  return (
    <svg width={d} height={d} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <circle cx={r} cy={r} r={cr} fill="none" stroke={trackColor} strokeWidth={STROKE} />
      <circle cx={r} cy={r} r={cr} fill="none" stroke={color} strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - Math.min(1, pct))}
        transform={`rotate(-90 ${r} ${r})`} />
    </svg>
  );
}

// ── Bubble (positions driven by px/py props → reliable re-render each frame) ──
function Bubble({
  goal, radius, px, py, isFlipped, isBursting, isCompleted, onFlip, onDown, onMove, onUp,
}: {
  goal: GoalAccount; radius: number; px: number; py: number;
  isFlipped: boolean; isBursting: boolean; isCompleted: boolean;
  onFlip: () => void;
  onDown: (e: React.PointerEvent) => void;
  onMove: (e: React.PointerEvent) => void;
  onUp:   (e: React.PointerEvent) => void;
}) {
  const icon  = GOAL_ICONS[goal.iconKey];
  const pct   = goal.targetAmount > 0 ? goal.balance / goal.targetAmount : 0;
  const tr    = goal.transition ? TRIODOS_TRANSITIONS[goal.transition] : null;
  const d     = radius * 2;
  const inset = STROKE + 2;

  const ringColor  = isCompleted ? '#DFFF57' : (tr?.color ?? '#004B32');
  const ringPct    = isCompleted ? 1 : pct;
  const trackColor = isCompleted ? 'rgba(223,255,87,0.30)' : 'rgba(0,75,50,0.10)';
  const fillBg     = 'white';
  const shadow     = '0 6px 24px rgba(0,0,0,0.11), 0 2px 6px rgba(0,0,0,0.07)';

  return (
    <div
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      className={isBursting ? 'bubble-burst' : ''}
      style={{
        position: 'absolute',
        left: px - radius,
        top:  py - radius,
        width: d, height: d,
        cursor: 'grab',
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      <Ring r={radius} pct={ringPct} color={ringColor} trackColor={trackColor} />

      <div style={{ position: 'absolute', inset, perspective: 900 }}>
        <div className={`flip-card${isFlipped ? ' flipped' : ''}`}>

          {/* Front */}
          <div className="flip-face" style={{
            background: fillBg,
            boxShadow: shadow,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 3, padding: 10,
          }}>
            <span style={{ fontSize: radius * 0.38, lineHeight: 1 }}>{icon.emoji}</span>
            <p style={{
              fontSize: Math.max(9, radius * 0.13), fontWeight: 700,
              color: '#004B32', textAlign: 'center', lineHeight: 1.2, maxWidth: '85%',
            }}>{goal.name}</p>
            {goal.targetAmount > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <p style={{ fontSize: Math.max(9, radius * 0.13), fontWeight: 600, color: '#004B32' }}>
                  € {goal.balance.toLocaleString('nl-NL')}
                </p>
                <p style={{ fontSize: Math.max(7, radius * 0.10), color: 'rgba(34,34,34,0.40)' }}>
                  of € {goal.targetAmount.toLocaleString('nl-NL')}
                </p>
              </div>
            )}
            {isCompleted ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 3,
                backgroundColor: 'rgba(223,255,87,0.35)', borderRadius: 20,
                padding: '2px 8px', marginTop: 2,
              }}>
                <span style={{ fontSize: 9 }}>✓</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: '#004B32' }}>Completed</span>
              </div>
            ) : tr ? (
              <button type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onFlip(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 3,
                  backgroundColor: tr.bgColor, borderRadius: 20,
                  padding: '2px 7px', marginTop: 2, border: 'none', cursor: 'pointer',
                }}>
                <span style={{ fontSize: 10 }}>{tr.emoji}</span>
                <span style={{ fontSize: 9, fontWeight: 600, color: tr.color }}>{tr.label}</span>
              </button>
            ) : null}
          </div>

          {/* Back */}
          <div className="flip-face flip-face-back" style={{
            background: tr?.bgColor ?? '#F0EEFF',
            boxShadow: '0 6px 24px rgba(0,0,0,0.10)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 6, padding: 14,
          }}>
            <button type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onFlip(); }}
              style={{ display: 'contents', cursor: 'pointer', border: 'none', background: 'none' }}>
              <span style={{ fontSize: radius * 0.30 }}>{tr?.emoji ?? '🌿'}</span>
              <p style={{ fontSize: Math.max(9, radius * 0.115), fontWeight: 700, color: tr?.color ?? '#6B5FD4', textAlign: 'center', lineHeight: 1.2 }}>
                {tr?.label} transition
              </p>
              <p style={{ fontSize: Math.max(8, radius * 0.10), color: 'rgba(34,34,34,0.60)', textAlign: 'center', lineHeight: 1.4 }}>
                {tr?.description}
              </p>
              <p style={{ fontSize: 8, color: 'rgba(34,34,34,0.30)', marginTop: 2 }}>tap to flip back</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function GoalsPage() {
  const router = useRouter();
  const { isInitialized, isAuthenticated, accounts, goals, completeGoal, depositToGoal, deposit } = useAppStore();

  const containerRef  = useRef<HTMLDivElement>(null);
  const physicsRef    = useRef<Physics[]>([]);
  const rafRef        = useRef<number>(0);
  const sizeRef       = useRef({ w: 0, h: 0 });
  const initedCount   = useRef(0);

  // Positions in state → RAF calls setPositions each frame → triggers re-render
  const [positions, setPositions] = useState<{ x: number; y: number }[]>([]);
  const [flippedId,   setFlippedId]   = useState<string | null>(null);
  const [burstIds,    setBurstIds]    = useState<Set<string>>(new Set());
  const [msg,         setMsg]         = useState<string | null>(null);
  const [sheetGoal,   setSheetGoal]   = useState<GoalAccount | null>(null);

  // Accounts eligible for deposits (savings + checking)
  const depositAccounts = accounts.filter(a => a.type === 'savings' || a.type === 'checking');

  const allGoals       = goals.filter((g) => g.targetAmount > 0);
  const activeGoals    = allGoals.filter((g) => !g.completedAt);
  const completedGoals = allGoals.filter((g) => !!g.completedAt);
  const maxAmount      = Math.max(...allGoals.map((g) => g.targetAmount), 1);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) router.replace('/login');
  }, [isInitialized, isAuthenticated, router]);

  // ── Measure container ────────────────────────────────────────────────────
  // Deps include isInitialized: the component returns null until the store
  // hydrates, so containerRef.current is null on first mount. We re-run this
  // effect once isInitialized flips true and the container div exists in the DOM.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => { sizeRef.current = { w: el.clientWidth, h: el.clientHeight }; };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isInitialized, isAuthenticated]);

  // ── Init / extend physics whenever goal count changes ────────────────────
  // Preserves existing bubbles' positions; only creates new physics objects
  // for goals that don't have one yet (prevents corner-stuck bug when goals
  // are added after the initial render).
  useEffect(() => {
    if (allGoals.length === 0 || initedCount.current === allGoals.length) return;

    function tryInit() {
      const { w: W, h: H } = sizeRef.current;
      if (!W || !H) { setTimeout(tryInit, 50); return; }

      const existing = physicsRef.current;
      physicsRef.current = allGoals.map((goal, i) => {
        if (existing[i]) return existing[i]; // keep live physics for existing bubbles
        const r    = getRadius(goal.targetAmount, maxAmount);
        const cols = Math.min(allGoals.length, 2);
        const col  = i % cols;
        const row  = Math.floor(i / cols);
        const x    = (W / cols) * (col + 0.5) + (Math.random() - 0.5) * 16;
        const y    = r + 20 + row * (r * 2.4);
        return {
          x:  Math.max(r, Math.min(W - r, x)),
          y:  Math.max(r, Math.min(H - NAV_H - r, y)),
          vx: (Math.random() - 0.5) * 3,
          vy: 5 + Math.random() * 5,
          radius: r,
          isDragging: false,
          tapStartX: 0, tapStartY: 0,
          lastVx: 0, lastVy: 0,
        };
      });
      initedCount.current = allGoals.length;
      setPositions(physicsRef.current.map((p) => ({ x: p.x, y: p.y })));
    }
    tryInit();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allGoals.length]);

  // ── Physics RAF loop ─────────────────────────────────────────────────────
  useEffect(() => {
    function tick() {
      const ps          = physicsRef.current;
      const { w: W, h: H } = sizeRef.current;

      if (!W || !H || ps.length === 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const bottom = H - NAV_H;

      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        if (p.isDragging) continue;

        p.vy += GRAVITY;
        p.vx *= FRICTION;
        p.vy *= FRICTION;
        p.x  += p.vx;
        p.y  += p.vy;

        const rim = STROKE / 2 + 1; // visual edge of ring extends beyond radius
        if (p.x - p.radius - rim < 0)      { p.x = p.radius + rim;         p.vx =  Math.abs(p.vx) * RESTITUTION; }
        if (p.x + p.radius + rim > W)      { p.x = W - p.radius - rim;     p.vx = -Math.abs(p.vx) * RESTITUTION; }
        if (p.y - p.radius - rim < 0)      { p.y = p.radius + rim;          p.vy =  Math.abs(p.vy) * RESTITUTION; }
        if (p.y + p.radius + rim > bottom) { p.y = bottom - p.radius - rim; p.vy = -Math.abs(p.vy) * RESTITUTION; }

        // Bubble–bubble collisions
        for (let j = i + 1; j < ps.length; j++) {
          const q  = ps[j];
          const dx = q.x - p.x, dy = q.y - p.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          const minD = p.radius + q.radius + 4;
          if (d < minD && d > 0) {
            const nx = dx / d, ny = dy / d;
            const ov = (minD - d) * 0.5;
            p.x -= nx * ov; p.y -= ny * ov;
            q.x += nx * ov; q.y += ny * ov;
            const rv = (q.vx - p.vx) * nx + (q.vy - p.vy) * ny;
            if (rv < 0) {
              const imp = rv * RESTITUTION;
              p.vx += imp * nx; p.vy += imp * ny;
              q.vx -= imp * nx; q.vy -= imp * ny;
            }
          }
        }
      }

      // Push snapshot into state → triggers re-render with new positions
      setPositions(ps.map((p) => ({ x: p.x, y: p.y })));
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // ── Pointer handlers ─────────────────────────────────────────────────────
  const makeHandlers = useCallback((i: number, goal: GoalAccount) => ({
    onDown: (e: React.PointerEvent) => {
      e.preventDefault();
      const p = physicsRef.current[i];
      if (!p) return;
      p.isDragging = true;
      p.tapStartX  = e.clientX; p.tapStartY = e.clientY;
      p.lastVx = 0; p.lastVy = 0;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    onMove: (e: React.PointerEvent) => {
      const p = physicsRef.current[i];
      if (!p?.isDragging || !containerRef.current) return;
      const rect  = containerRef.current.getBoundingClientRect();
      const nx    = e.clientX - rect.left;
      const ny    = e.clientY - rect.top;
      p.lastVx = nx - p.x; p.lastVy = ny - p.y;
      p.x = nx; p.y = ny;
    },
    onUp: (e: React.PointerEvent) => {
      const p = physicsRef.current[i];
      if (!p?.isDragging) return;
      p.isDragging = false;
      p.vx = p.lastVx * 1.8;
      p.vy = p.lastVy * 1.8;
      const dx = e.clientX - p.tapStartX;
      const dy = e.clientY - p.tapStartY;
      // Tap (not drag) → open bottom sheet
      if (Math.sqrt(dx * dx + dy * dy) < 10) {
        setSheetGoal(goal);
      }
    },
  }), []);

  // ── Completion detection ─────────────────────────────────────────────────
  useEffect(() => {
    activeGoals.forEach((goal) => {
      if (goal.balance >= goal.targetAmount && !burstIds.has(goal.id)) {
        setBurstIds((prev) => new Set(prev).add(goal.id));
        const n = goal.name;
        setMsg(`Goal reached. Your ${n} ${n.toLowerCase().endsWith('s') ? 'are' : 'is'} ready to become reality.`);
        setTimeout(() => { completeGoal(goal.id); setMsg(null); }, 2800);
      }
    });
  }, [goals, burstIds, completeGoal, activeGoals]);

  if (!isInitialized || !isAuthenticated) return null;

  return (
    <main className="flex flex-col" style={{ height: '100dvh' }}>
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between px-5 pt-6 pb-3">
        <button type="button" onClick={() => router.push('/home')}
          className="flex items-center gap-1.5 text-sm font-medium text-charcoal/55 transition hover:text-charcoal/80">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Overview
        </button>
        <h1 className="font-display text-base font-bold text-grounded-green" style={{ fontWeight: 700 }}>Goals</h1>
        <button type="button" onClick={() => router.push('/accounts/savings-1/goal')}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-grounded-green text-white shadow-card transition active:scale-95">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Bubble space */}
      <div ref={containerRef} className="relative flex-1 overflow-hidden" style={{ touchAction: 'none' }}>
        {activeGoals.length === 0 && completedGoals.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="text-5xl">🎯</span>
            <p className="text-sm font-medium text-charcoal/45">No active goals yet. Tap + to set your first goal.</p>
          </div>
        )}

        {allGoals.map((goal, i) => {
          const isCompleted = !!goal.completedAt;
          const r           = getRadius(goal.targetAmount, maxAmount);
          const pos         = positions[i] ?? { x: r + 10, y: r + 30 };
          const handlers    = makeHandlers(i, goal);
          return (
            <Bubble
              key={goal.id}
              goal={goal}
              radius={r}
              px={pos.x}
              py={pos.y}
              isFlipped={flippedId === goal.id}
              isBursting={burstIds.has(goal.id)}
              isCompleted={isCompleted}
              onFlip={() => setFlippedId((prev) => prev === goal.id ? null : goal.id)}
              {...handlers}
            />
          );
        })}

        {msg && (
          <div className="goal-complete-msg pointer-events-none absolute inset-x-0 top-1/3 px-8 text-center">
            <div className="inline-block rounded-2xl bg-grounded-green px-6 py-4 shadow-card">
              <p className="text-sm font-semibold text-white">🎉 {msg}</p>
            </div>
          </div>
        )}
      </div>

      <BottomNav />

      {/* Goal bottom sheet */}
      {sheetGoal && (
        <GoalSheet
          goal={sheetGoal}
          accounts={depositAccounts}
          onDeposit={(amount, fromAccountId) => {
            depositToGoal(sheetGoal.id, amount);
            deposit(fromAccountId, -amount);
          }}
          onEdit={() => {
            setSheetGoal(null);
            router.push(`/accounts/${sheetGoal.parentAccountId}/goal?goalId=${sheetGoal.id}`);
          }}
          onClose={() => setSheetGoal(null)}
        />
      )}
    </main>
  );
}
