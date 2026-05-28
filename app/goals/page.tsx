'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { GOAL_ICONS, TRIODOS_TRANSITIONS, PARTNERSHIPS } from '@/lib/types';
import type { GoalAccount, GoalIconKey, TriodosTransition } from '@/lib/types';
import { BottomNav } from '@/components/BottomNav';
import { TriodosLogo } from '@/components/TriodosLogo';

// ── Goal bottom sheet ─────────────────────────────────────────────────────────
function GoalSheet({
  goal, accounts, onDeposit, onSetMonthly, onEdit, onClose,
}: {
  goal: GoalAccount;
  accounts: { id: string; type: string; balance: number; ownerName: string }[];
  onDeposit: (amount: number, fromAccountId: string) => void;
  onSetMonthly: (amount: number | undefined) => void;
  onEdit: () => void;
  onClose: () => void;
}) {
  const icon        = GOAL_ICONS[goal.iconKey];
  const tr          = goal.transition ? TRIODOS_TRANSITIONS[goal.transition] : null;
  const pct         = goal.targetAmount > 0 ? Math.min(1, goal.balance / goal.targetAmount) : 0;
  const isCompleted = !!goal.completedAt;
  // Only show a voucher if this goal was explicitly set up through the partnerships feature
  const partnership = goal.partnershipId
    ? (PARTNERSHIPS.find(p => p.id === goal.partnershipId) ?? null)
    : null;

  const [tab,       setTab]       = useState<'once' | 'monthly'>('once');
  const [amount,    setAmount]    = useState('');
  const [fromId,    setFromId]    = useState(accounts[0]?.id ?? '');
  const [showShare,       setShowShare]       = useState(false);
  const [copied,          setCopied]          = useState(false);
  const [triodosMode,     setTriodosMode]     = useState(false);
  const [triodosName,     setTriodosName]     = useState('');
  const [triodosSent,     setTriodosSent]     = useState(false);
  const [monthlyAmount,   setMonthlyAmount]   = useState(
    goal.monthlyDeposit ? String(goal.monthlyDeposit) : ''
  );
  const [monthlySaved,    setMonthlySaved]    = useState(false);
  const QUICK         = [50, 100, 250];
  const MONTHLY_QUICK = [25, 50, 100];

  const fromAccount = accounts.find(a => a.id === fromId);
  const parsed = parseFloat(amount) || 0;
  const canDeposit = parsed > 0 && fromAccount && parsed <= fromAccount.balance;

  const shareText = goal.targetAmount > 0
    ? `I'm saving for ${goal.name} with Triodos Bank. So far I've saved €${goal.balance.toLocaleString('nl-NL')} of my €${goal.targetAmount.toLocaleString('nl-NL')} goal${goal.purpose ? `. ${goal.purpose}` : ''}. 💚`
    : `I'm saving for ${goal.name} with Triodos Bank. 💚`;

  async function handleShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: `My goal: ${goal.name}`, text: shareText });
        return;
      } catch { /* cancelled or not supported — fall through */ }
    }
    setShowShare(s => !s);
  }

  function handleCopy() {
    navigator.clipboard?.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }

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
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shrink-0"
            style={{ backgroundColor: (goal.transition ? TRANSITION_BG[goal.transition] : '#004B32') + '22' }}>
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
          <div className="flex items-center gap-2 shrink-0">
            {/* Share */}
            <button type="button" onClick={handleShare} aria-label="Share goal"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-grounded-green/20 text-grounded-green transition hover:bg-grounded-green/5 active:scale-95">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"
                  stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {/* Edit */}
            <button type="button" onClick={onEdit}
              className="flex items-center gap-1.5 rounded-full border border-grounded-green/20 px-3 py-1.5 text-xs font-semibold text-grounded-green transition hover:bg-grounded-green/5 active:scale-95">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Edit
            </button>
          </div>
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

        {/* Share panel — shown when native share is unavailable */}
        {showShare && (
          <div className="mb-5 rounded-2xl border border-charcoal/10 bg-grounded-green/[0.04] p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-charcoal">Share this goal</p>
              <button type="button" onClick={() => setShowShare(false)}
                className="text-charcoal/35 hover:text-charcoal/60 text-lg leading-none">×</button>
            </div>
            <p className="text-xs text-charcoal/50 mb-3 leading-relaxed">
              Let friends or family know what you&apos;re saving for.
            </p>
            {/* Message preview */}
            <div className="rounded-xl border border-charcoal/8 bg-white px-3.5 py-3 mb-3">
              <p className="text-xs leading-relaxed text-charcoal/60">{shareText}</p>
            </div>
            {/* Actions */}
            <div className="flex gap-2">
              <button type="button" onClick={handleCopy}
                className={`flex-1 rounded-xl border py-2.5 text-xs font-semibold transition active:scale-95 ${
                  copied
                    ? 'border-grounded-green bg-grounded-green text-white'
                    : 'border-grounded-green/20 text-grounded-green hover:bg-grounded-green/5'
                }`}>
                {copied ? '✓ Copied!' : 'Copy message'}
              </button>
              {/* WhatsApp deep link */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl border border-charcoal/10 bg-white transition hover:bg-charcoal/5 active:scale-95"
                aria-label="Share via WhatsApp"
              >
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="#25D366"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.857L0 24l6.335-1.51A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.016-1.375l-.36-.214-3.727.888.926-3.621-.235-.372A9.818 9.818 0 1112 21.818z" fill="#25D366"/>
                </svg>
              </a>
              {/* Share via Triodos */}
              <button
                type="button"
                onClick={() => { setTriodosMode(s => !s); setTriodosSent(false); setTriodosName(''); }}
                aria-label="Share via Triodos"
                className={`flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl border transition active:scale-95 ${
                  triodosMode
                    ? 'border-grounded-green bg-grounded-green/8'
                    : 'border-charcoal/10 bg-white hover:bg-charcoal/5'
                }`}
              >
                <img src="/triodos-mark.svg" alt="Triodos" width={18} height={18} />
              </button>
            </div>

            {/* In-app Triodos share panel */}
            {triodosMode && (
              <div className="mt-3 rounded-xl border border-grounded-green/15 bg-white px-3.5 py-3">
                {triodosSent ? (
                  <div className="flex items-center gap-2.5 py-0.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-grounded-green text-white text-xs">✓</div>
                    <div>
                      <p className="text-sm font-semibold text-grounded-green">Goal shared!</p>
                      <p className="text-xs text-charcoal/45">{triodosName} can now follow your progress.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="mb-2 text-xs font-semibold text-charcoal/60">Share within Triodos</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={triodosName}
                        onChange={e => setTriodosName(e.target.value)}
                        placeholder="Name or IBAN"
                        className="flex-1 rounded-lg border border-grounded-green/15 bg-grounded-green/[0.03] px-3 py-2 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-grounded-green/40 focus:outline-none"
                      />
                      <button
                        type="button"
                        disabled={!triodosName.trim()}
                        onClick={() => setTriodosSent(true)}
                        className="rounded-lg bg-grounded-green px-3 py-2 text-xs font-semibold text-white transition active:scale-95 disabled:opacity-35"
                      >
                        Send
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="mb-4 border-t border-grounded-green/8" />

        {isCompleted ? (
          /* ── Completed: show voucher instead of deposit form ── */
          <>
            {/* Celebration banner */}
            <div className="mb-4 flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ backgroundColor: '#DFFF5740', border: '1.5px solid #DFFF57' }}>
              <span className="text-xl">🎉</span>
              <div>
                <p className="text-sm font-bold text-grounded-green">Goal reached!</p>
                <p className="text-xs text-charcoal/55 mt-0.5">
                  {partnership
                    ? 'Your exclusive discount is ready to collect.'
                    : 'You’ve successfully saved for this goal.'}
                </p>
              </div>
            </div>

            {partnership ? (
              <>
                <p className="mb-2 text-sm font-semibold text-charcoal/70">Your reward</p>

                {/* Voucher card */}
                <div className="mb-4 overflow-hidden rounded-2xl border-2 border-dashed border-grounded-green/25 bg-white">
                  {/* Partner header */}
                  <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-grounded-green/6 text-2xl">
                      {partnership.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-charcoal">{partnership.name}</p>
                      <p className="text-xs text-charcoal/50">{partnership.tagline}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-grounded-green px-3 py-1.5 text-xs font-bold text-white">
                      {partnership.discount}
                    </span>
                  </div>

                  {/* Dashed ticket divider with notch circles */}
                  <div className="relative flex items-center">
                    <div className="-ml-3 h-5 w-5 shrink-0 rounded-full bg-[#F3EDE4]" />
                    <div className="flex-1 border-t border-dashed border-charcoal/15" />
                    <div className="-mr-3 h-5 w-5 shrink-0 rounded-full bg-[#F3EDE4]" />
                  </div>

                  {/* Description + Triodos verified */}
                  <div className="px-4 pt-3 pb-4">
                    <p className="text-xs leading-relaxed text-charcoal/55">{partnership.description}</p>
                    <div className="mt-2.5 flex items-center gap-1.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          stroke="#004B32" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-[10px] font-semibold text-grounded-green">Triodos verified partner</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full rounded-xl bg-grounded-green py-4 text-base font-semibold text-white shadow-card transition hover:bg-grounded-green/90 active:scale-[0.99]"
                >
                  Claim {partnership.discount} discount →
                </button>
              </>
            ) : (
              /* No partnership — simple completion message, no voucher */
              <div className="rounded-2xl border border-charcoal/10 bg-white px-4 py-4">
                <p className="text-sm leading-relaxed text-charcoal/60">
                  Well done! You&apos;ve reached your savings target. Ready to make it happen?
                </p>
              </div>
            )}
          </>
        ) : (
          /* ── Not completed: tab switcher + deposit / monthly forms ── */
          <>
            <p className="mb-3 text-sm font-semibold text-charcoal/70">Add money to this goal</p>

            {/* Tab row */}
            <div className="mb-4 flex rounded-xl border border-grounded-green/12 bg-grounded-green/[0.04] p-0.5">
              {(['once', 'monthly'] as const).map(t => (
                <button key={t} type="button"
                  onClick={() => { setTab(t); setMonthlySaved(false); }}
                  className={`flex-1 rounded-[10px] py-2 text-xs font-semibold transition ${
                    tab === t
                      ? 'bg-white shadow-sm text-grounded-green'
                      : 'text-charcoal/45'
                  }`}>
                  {t === 'once' ? 'One-time deposit' : 'Monthly deposit'}
                </button>
              ))}
            </div>

            {/* ── Shared layout: account picker + quick amounts + input ── */}
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
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-charcoal/40">{a.type}</p>
                      <p className="text-sm font-bold text-grounded-green">€ {a.balance.toLocaleString('nl-NL')}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick amounts */}
            <div className="mb-3 flex gap-2">
              {(tab === 'once' ? QUICK : MONTHLY_QUICK).map(q => {
                const val    = tab === 'once' ? amount : monthlyAmount;
                const setVal = tab === 'once' ? setAmount : setMonthlyAmount;
                return (
                  <button key={q} type="button"
                    onClick={() => setVal(String(q))}
                    className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold transition active:scale-95 ${
                      val === String(q)
                        ? 'border-grounded-green bg-grounded-green text-white'
                        : 'border-grounded-green/20 bg-white text-grounded-green hover:bg-grounded-green/5'
                    }`}>
                    € {q}
                  </button>
                );
              })}
            </div>

            {/* Custom amount input */}
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-charcoal/40">€</span>
              {tab === 'once' ? (
                <input type="number" inputMode="decimal" value={amount}
                  onChange={e => setAmount(e.target.value)} placeholder="Other amount" min="0"
                  className="w-full rounded-xl border border-grounded-green/15 bg-white py-3.5 pl-8 pr-4 text-base text-charcoal placeholder:text-charcoal/30 focus:border-grounded-green/50 focus:outline-none focus:ring-2 focus:ring-grounded-green/10" />
              ) : (
                <input type="number" inputMode="decimal" value={monthlyAmount}
                  onChange={e => setMonthlyAmount(e.target.value)} placeholder="Other amount" min="0"
                  className="w-full rounded-xl border border-grounded-green/15 bg-white py-3.5 pl-8 pr-4 text-base text-charcoal placeholder:text-charcoal/30 focus:border-grounded-green/50 focus:outline-none focus:ring-2 focus:ring-grounded-green/10" />
              )}
            </div>

            {tab === 'monthly' ? (
              <>
                <button type="button"
                  disabled={!(parseFloat(monthlyAmount) > 0)}
                  onClick={() => { onSetMonthly(parseFloat(monthlyAmount)); setMonthlySaved(true); }}
                  className="w-full rounded-xl bg-grounded-green py-4 text-base font-semibold text-white shadow-card transition active:scale-[0.99] disabled:opacity-35 hover:bg-grounded-green/90">
                  Set up monthly deposit
                </button>
                {/* Active status / confirmation — below button, unobtrusive */}
                {monthlySaved ? (
                  <p className="mt-3 text-center text-xs text-grounded-green font-medium">
                    ✓ € {parseFloat(monthlyAmount).toLocaleString('nl-NL')} will be added every month.
                  </p>
                ) : goal.monthlyDeposit ? (
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-charcoal/45">
                      Active: € {goal.monthlyDeposit.toLocaleString('nl-NL')} / month
                    </p>
                    <button type="button"
                      onClick={() => { onSetMonthly(undefined); setMonthlyAmount(''); }}
                      className="text-xs font-semibold text-charcoal/40 hover:text-charcoal/70 transition">
                      Cancel
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
            <>
            {/* Save button — one-time */}
            <button
              type="button"
              onClick={() => { if (canDeposit) { onDeposit(parsed, fromId); onClose(); } }}
              disabled={!canDeposit}
              className="w-full rounded-xl bg-grounded-green py-4 text-base font-semibold text-white shadow-card transition active:scale-[0.99] disabled:opacity-35 hover:bg-grounded-green/90"
            >
              Save to goal
            </button>
            </>
            )}
          </>
        )}
      </div>
    </>
  );
}

// ── Blob colour palette — keyed by Triodos transition ────────────────────────
// Each transition maps to a distinct brand colour so blobs of the same theme
// share a colour, making it immediately readable. Completed always stays yellow-green.
const TRANSITION_BG: Record<TriodosTransition, string> = {
  energy:    '#004B32',  // Grounded Green   — power, sustainability
  resources: '#FF6400',  // Sienna Spark      — earthy, circular economy
  food:      '#98D39A',  // Sage Green        — natural, growing
  society:   '#8074FF',  // Grounded Lupine   — community, connection
  wellbeing: '#C2CBFA',  // Light Lupine      — calm, care
};
// Morph animation durations — each index gets a distinct rhythm
const MORPH_DURATIONS = [16, 20, 14, 18]; // seconds

// ── Physics constants — calm, organic, floating ───────────────────────────────
const GRAVITY     = 0;       // no gravity — shapes float freely
const FRICTION    = 0.982;   // gentle deceleration each frame
const RESTITUTION = 0.16;    // very soft collisions — shapes nudge, not bounce
const NAV_H       = 92;

// ── Deformation constants — organic squish on contact ────────────────────────
const DEFORM_ZONE  = 50;    // px beyond contact surface that triggers deformation
const SQUISH       = 0.20;  // max flatten strength along contact normal
const BULGE        = 0.09;  // max bulge strength perpendicular to normal
const LERP_TOWARD  = 0.18;  // how quickly deformation builds (snappy on impact)
const LERP_AWAY    = 0.055; // how slowly shape recovers (lingering, organic spring-back)

type Physics = {
  x: number; y: number;
  vx: number; vy: number;
  radius: number;
  isDragging: boolean;
  tapStartX: number; tapStartY: number;
  lastVx: number; lastVy: number;
  // 2×2 symmetric deformation matrix, stored as deviation from identity
  // Visual transform = [[1+dm11, dm12], [dm12, 1+dm22]]
  dm11: number; dm12: number; dm22: number;
};

function getRadius(target: number, max: number) {
  const [MIN, MAX] = [56, 98];
  if (max <= 0) return MIN;
  return MIN + Math.sqrt(target / max) * (MAX - MIN);
}

// ── Blob bubble ───────────────────────────────────────────────────────────────
function Bubble({
  goal, radius, px, py, index, isBursting, isCompleted, isFlipped,
  dm11, dm12, dm22,
  onDown, onMove, onUp, onFlipTransition,
}: {
  goal: GoalAccount; radius: number; px: number; py: number;
  index: number; isBursting: boolean; isCompleted: boolean; isFlipped: boolean;
  dm11: number; dm12: number; dm22: number;
  onDown: (e: React.PointerEvent) => void;
  onMove: (e: React.PointerEvent) => void;
  onUp:   (e: React.PointerEvent) => void;
  onFlipTransition: () => void;
}) {
  const icon = GOAL_ICONS[goal.iconKey];
  const tr   = goal.transition ? TRIODOS_TRANSITIONS[goal.transition] : null;

  const bg = isCompleted
    ? '#DFFF57'
    : goal.transition ? TRANSITION_BG[goal.transition] : '#004B32';
  const fg = isCompleted ? '#004B32' : '#FFFFFF';

  const morphIdx = index % 4;
  const morphDur = MORPH_DURATIONS[morphIdx];
  const morphDel = -(index * 3.3);

  const d = radius * 2;

  // Fixed padding — based only on radius so the text container never resizes during
  // morphing or collision, preventing text reflow.  0.30 comfortably clears the most
  // inward-curving points of the blob-morph keyframes at any deformation level.
  const contentPad = radius * 0.30 + 5;

  // Shared morph animation style — used on both front shape and back face
  const morphStyle = {
    animationName: `blob-morph-${morphIdx}`,
    animationDuration: `${morphDur}s`,
    animationDelay: `${morphDel}s`,
    animationTimingFunction: 'ease-in-out' as const,
    animationIterationCount: 'infinite' as const,
  };

  return (
    <div
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
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
      {/* ── 3-D flip container ── */}
      <div style={{
        width: '100%', height: '100%',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.52s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isFlipped ? 'rotateY(180deg)' : 'none',
      }}>

        {/* ════ FRONT FACE ════ */}
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden' }}>
          {/* Shape: morphs + deforms */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundColor: bg,
            ...morphStyle,
            transform: `matrix(${(1 + dm11).toFixed(4)}, ${dm12.toFixed(4)}, ${dm12.toFixed(4)}, ${(1 + dm22).toFixed(4)}, 0, 0)`,
            transformOrigin: 'center center',
            boxShadow: '0 6px 22px rgba(0,0,0,0.13), 0 2px 5px rgba(0,0,0,0.07)',
          }} />

          {/* Burst overlay */}
          {isBursting && (
            <div className="blob-burst" style={{
              position: 'absolute', inset: 0,
              backgroundColor: bg,
              borderRadius: '55% 45% 50% 50% / 50% 55% 45% 50%',
              zIndex: 1,
            }} />
          )}

          {/* Content: centered, no deform — padding grows with deformation to keep 5px from border */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 4, padding: contentPad, pointerEvents: 'none',
            overflow: 'hidden',
          }}>
            <span style={{ fontSize: radius * 0.30, lineHeight: 1, flexShrink: 0 }}>{icon.emoji}</span>
            <p style={{ fontSize: Math.max(9, radius * 0.13), fontWeight: 700, color: fg, textAlign: 'center', lineHeight: 1.2, width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {goal.name}
            </p>
            {goal.targetAmount > 0 && radius > 62 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <p style={{ fontSize: Math.max(9, radius * 0.13), fontWeight: 600, color: fg }}>
                  € {goal.balance.toLocaleString('nl-NL')}
                </p>
                <p style={{ fontSize: Math.max(7, radius * 0.10), color: fg, opacity: 0.52 }}>
                  of € {goal.targetAmount.toLocaleString('nl-NL')}
                </p>
              </div>
            )}

            {/* Status pill — transition badge is tappable and triggers the flip */}
            {isCompleted ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,75,50,0.18)', borderRadius: 20, padding: '2px 8px', marginTop: 2 }}>
                <span style={{ fontSize: 9, color: fg }}>✓</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: fg }}>Completed</span>
              </div>
            ) : tr && radius > 70 ? (
              <div
                onPointerDown={e => e.stopPropagation()}
                onClick={onFlipTransition}
                style={{
                  display: 'flex', alignItems: 'center', gap: 3,
                  backgroundColor: 'rgba(255,255,255,0.22)',
                  borderRadius: 20, padding: '2px 7px', marginTop: 2,
                  cursor: 'pointer', pointerEvents: 'auto',
                }}
              >
                <span style={{ fontSize: 10 }}>{tr.emoji}</span>
                <span style={{ fontSize: 9, fontWeight: 600, color: fg }}>{tr.label}</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* ════ BACK FACE — transition info ════ */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          backgroundColor: tr?.bgColor ?? '#EEF5E8',
          ...morphStyle, // same organic shape as the front
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 6, padding: contentPad, overflow: 'hidden',
          boxShadow: '0 6px 22px rgba(0,0,0,0.13), 0 2px 5px rgba(0,0,0,0.07)',
        }}>
          <span style={{ fontSize: radius * 0.38, lineHeight: 1, flexShrink: 0 }}>{tr?.emoji ?? '🌿'}</span>
          <p style={{ fontSize: Math.max(11, radius * 0.155), fontWeight: 800, color: tr?.color ?? '#004B32', textAlign: 'center', lineHeight: 1.2, width: '100%' }}>
            {tr?.label ?? 'Other'} transition
          </p>
          {radius > 64 && (
            <p style={{ fontSize: Math.max(8, radius * 0.105), color: tr?.color ?? '#004B32', opacity: 0.75, textAlign: 'center', lineHeight: 1.45, width: '100%' }}>
              {tr?.description ?? ''}
            </p>
          )}
          <p style={{ fontSize: Math.max(7, radius * 0.09), color: tr?.color ?? '#004B32', opacity: 0.45, marginTop: 2 }}>
            tap to close
          </p>
        </div>

      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function GoalsPage() {
  const router = useRouter();
  const { isInitialized, isAuthenticated, accounts, goals, completeGoal, depositToGoal, adjustBalance, updateGoal } = useAppStore();

  const containerRef  = useRef<HTMLDivElement>(null);
  const physicsRef    = useRef<Physics[]>([]);
  const rafRef        = useRef<number>(0);
  const sizeRef       = useRef({ w: 0, h: 0 });
  const initedCount   = useRef(0);
  const impulseRef    = useRef(0); // frame counter for periodic gentle nudges

  const [mode,        setMode]        = useState<'saving' | 'investing'>('saving');
  const [positions,   setPositions]   = useState<{ x: number; y: number; dm11: number; dm12: number; dm22: number }[]>([]);
  const [burstIds,    setBurstIds]    = useState<Set<string>>(new Set());
  const [flippedIds,  setFlippedIds]  = useState<Set<string>>(new Set());
  const [msg,         setMsg]         = useState<string | null>(null);
  const [sheetGoal,   setSheetGoal]   = useState<GoalAccount | null>(null);

  // Stable ref so makeHandlers can read latest flippedIds without being recreated
  const flippedRef = useRef(flippedIds);
  flippedRef.current = flippedIds;

  const depositAccounts = accounts.filter(a => a.type === 'savings' || a.type === 'checking');

  const allGoals       = goals.filter((g) => g.targetAmount > 0 && g.goalType === mode);
  const activeGoals    = allGoals.filter((g) => !g.completedAt);
  const completedGoals = allGoals.filter((g) => !!g.completedAt);
  const maxAmount      = Math.max(...allGoals.map((g) => g.targetAmount), 1);

  // Reset physics when mode changes so blobs re-initialise for the new set
  useEffect(() => {
    physicsRef.current = [];
    initedCount.current = 0;
    setPositions([]);
    setBurstIds(new Set());
    setFlippedIds(new Set());
  }, [mode]);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) router.replace('/login');
  }, [isInitialized, isAuthenticated, router]);

  // ── Measure container ────────────────────────────────────────────────────
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
  useEffect(() => {
    if (allGoals.length === 0 || initedCount.current === allGoals.length) return;

    function tryInit() {
      const { w: W, h: H } = sizeRef.current;
      if (!W || !H) { setTimeout(tryInit, 50); return; }

      const existing = physicsRef.current;
      physicsRef.current = allGoals.map((goal, i) => {
        if (existing[i]) return existing[i];
        const r = getRadius(goal.targetAmount, maxAmount);
        // Spread across container in a loose grid
        const cols = Math.max(1, Math.ceil(Math.sqrt(allGoals.length)));
        const col  = i % cols;
        const row  = Math.floor(i / cols);
        const rows = Math.ceil(allGoals.length / cols);
        const x    = (W / (cols + 1)) * (col + 1) + (Math.random() - 0.5) * 30;
        const y    = ((H - NAV_H) / (rows + 1)) * (row + 1) + (Math.random() - 0.5) * 30;
        return {
          x:  Math.max(r * 1.34 + 6, Math.min(W - r * 1.34 - 6, x)),
          y:  Math.max(r * 1.34 + 6, Math.min(H - NAV_H - r * 1.34 - 6, y)),
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          radius: r,
          isDragging: false,
          tapStartX: 0, tapStartY: 0,
          lastVx: 0, lastVy: 0,
          dm11: 0, dm12: 0, dm22: 0,
        };
      });
      initedCount.current = allGoals.length;
      setPositions(physicsRef.current.map((p) => ({ x: p.x, y: p.y, dm11: p.dm11, dm12: p.dm12, dm22: p.dm22 })));
    }
    tryInit();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allGoals.length, mode]);

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

      // Every ~5 s give each blob a tiny random nudge to stay alive
      impulseRef.current++;
      if (impulseRef.current >= 300) {
        impulseRef.current = 0;
        for (const p of ps) {
          if (!p.isDragging) {
            p.vx += (Math.random() - 0.5) * 0.35;
            p.vy += (Math.random() - 0.5) * 0.35;
          }
        }
      }

      // rim is now computed per-blob below to account for deformation extending visual extent
      const minGap = 4; // minimum gap between blob surfaces

      // ── 1. Integrate velocities & apply friction ──────────────────────────
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        if (p.isDragging) continue;
        p.vx *= FRICTION;
        p.vy *= FRICTION;
        p.x  += p.vx;
        p.y  += p.vy;
      }

      // ── 2. Multi-pass position correction — runs until no overlaps remain ─
      //    Velocity impulse only on the first pass; pure position fix after that.
      // Per-blob wall rim helper — keeps visual extent (including max deformation) inside bounds
      const wallClamp = (iter: number) => {
        for (let i = 0; i < ps.length; i++) {
          const p = ps[i];
          // rim = max visual overhang at max deformation (≈34% of radius) + 6px buffer
          const rim = p.radius * 0.34 + 6;
          const bounce = iter === 0;
          if (p.x - p.radius - rim < 0)      { p.x = p.radius + rim;         if (bounce && !p.isDragging) p.vx =  Math.abs(p.vx) * RESTITUTION; }
          if (p.x + p.radius + rim > W)      { p.x = W - p.radius - rim;     if (bounce && !p.isDragging) p.vx = -Math.abs(p.vx) * RESTITUTION; }
          if (p.y - p.radius - rim < 0)      { p.y = p.radius + rim;          if (bounce && !p.isDragging) p.vy =  Math.abs(p.vy) * RESTITUTION; }
          if (p.y + p.radius + rim > bottom) { p.y = bottom - p.radius - rim; if (bounce && !p.isDragging) p.vy = -Math.abs(p.vy) * RESTITUTION; }
        }
      };

      const ITERATIONS = 6;
      for (let iter = 0; iter < ITERATIONS; iter++) {
        // Blob–blob separation first …
        for (let i = 0; i < ps.length; i++) {
          for (let j = i + 1; j < ps.length; j++) {
            const p   = ps[i], q = ps[j];
            const dx  = q.x - p.x, dy = q.y - p.y;
            const d   = Math.sqrt(dx * dx + dy * dy);
            const minD = p.radius + q.radius + minGap;
            if (d < minD && d > 0.001) {
              const nx = dx / d, ny = dy / d;
              const ov = (minD - d) * 0.5;
              // Push both apart equally
              if (!p.isDragging) { p.x -= nx * ov; p.y -= ny * ov; }
              if (!q.isDragging) { q.x += nx * ov; q.y += ny * ov; }
              // Velocity impulse on first pass only
              if (iter === 0) {
                const rv = (q.vx - p.vx) * nx + (q.vy - p.vy) * ny;
                if (rv < 0) {
                  const imp = rv * RESTITUTION;
                  if (!p.isDragging) { p.vx += imp * nx; p.vy += imp * ny; }
                  if (!q.isDragging) { q.vx -= imp * nx; q.vy -= imp * ny; }
                }
              }
            }
          }
        }
        // … then wall clamp, so collisions can never push a blob outside
        wallClamp(iter);
      }
      // Final unconditional hard clamp — guarantees no blob exits regardless of convergence
      wallClamp(ITERATIONS);

      // ── 3. Deformation: squish at contact, bulge perp, spring back ───────────
      //    Compute target deformation for each blob from all current nearby pairs,
      //    then lerp current deformation toward that target each frame.
      const t11 = new Float64Array(ps.length);
      const t12 = new Float64Array(ps.length);
      const t22 = new Float64Array(ps.length);

      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const p   = ps[i], q = ps[j];
          const dx  = q.x - p.x, dy = q.y - p.y;
          const d   = Math.sqrt(dx * dx + dy * dy);
          const touchDist = p.radius + q.radius;
          if (d >= touchDist + DEFORM_ZONE || d < 0.001) continue;

          // pressure 0 (far) → 1 (touching)
          const pressure = Math.min(1, (touchDist + DEFORM_ZONE - d) / DEFORM_ZONE);
          const nx = dx / d, ny = dy / d;
          const s  = pressure * SQUISH;
          const b  = pressure * BULGE;

          // Flatten along contact normal (nx,ny), bulge along tangent (-ny,nx).
          // The formula is symmetric for both blobs (squared terms cancel the sign flip).
          const dM11 = -s * nx * nx + b * ny * ny;
          const dM12 = -(s + b) * nx * ny;
          const dM22 = -s * ny * ny + b * nx * nx;

          // Accumulate — cap to prevent extreme distortion from many contacts
          t11[i] = Math.max(-0.30, Math.min(0.30, t11[i] + dM11));
          t12[i] = Math.max(-0.30, Math.min(0.30, t12[i] + dM12));
          t22[i] = Math.max(-0.30, Math.min(0.30, t22[i] + dM22));
          t11[j] = Math.max(-0.30, Math.min(0.30, t11[j] + dM11));
          t12[j] = Math.max(-0.30, Math.min(0.30, t12[j] + dM12));
          t22[j] = Math.max(-0.30, Math.min(0.30, t22[j] + dM22));
        }
      }

      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        // Contact present → snappy toward deformation; none → slow organic spring-back
        const hasContact = Math.abs(t11[i]) > 0.001 || Math.abs(t12[i]) > 0.001 || Math.abs(t22[i]) > 0.001;
        const lr = hasContact ? LERP_TOWARD : LERP_AWAY;
        p.dm11 += (t11[i] - p.dm11) * lr;
        p.dm12 += (t12[i] - p.dm12) * lr;
        p.dm22 += (t22[i] - p.dm22) * lr;
      }

      setPositions(ps.map((p) => ({ x: p.x, y: p.y, dm11: p.dm11, dm12: p.dm12, dm22: p.dm22 })));
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
      const rect = containerRef.current.getBoundingClientRect();
      const nx   = e.clientX - rect.left;
      const ny   = e.clientY - rect.top;
      p.lastVx = nx - p.x; p.lastVy = ny - p.y;
      p.x = nx; p.y = ny;
    },
    onUp: (e: React.PointerEvent) => {
      const p = physicsRef.current[i];
      if (!p?.isDragging) return;
      p.isDragging = false;
      p.vx = p.lastVx * 1.2;
      p.vy = p.lastVy * 1.2;
      const dx = e.clientX - p.tapStartX;
      const dy = e.clientY - p.tapStartY;
      if (Math.sqrt(dx * dx + dy * dy) < 10) {
        if (flippedRef.current.has(goal.id)) {
          // Tap on back face → flip back to front
          setFlippedIds(prev => { const s = new Set(prev); s.delete(goal.id); return s; });
        } else {
          // Tap on front face body → open goal sheet
          setSheetGoal(goal);
        }
      }
    },
    // Called by the transition badge (stopsPropagation so drag never starts)
    onFlipTransition: () => {
      setFlippedIds(prev => new Set(prev).add(goal.id));
    },
  }), []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Completion detection ─────────────────────────────────────────────────
  useEffect(() => {
    activeGoals.forEach((goal) => {
      if (goal.balance >= goal.targetAmount && !burstIds.has(goal.id)) {
        setBurstIds((prev) => new Set(prev).add(goal.id));
        const n = goal.name;
        setMsg(`Goal reached. Your ${n} ${n.toLowerCase().endsWith('s') ? 'are' : 'is'} ready to become reality.`);
        // Complete the goal right after the burst animation finishes (~650ms).
        // The overlay unmounts at the same time, revealing the yellow-green completed blob.
        setTimeout(() => {
          completeGoal(goal.id);
          setBurstIds((prev) => { const s = new Set(prev); s.delete(goal.id); return s; });
        }, 750);
        // Message lingers so the user can read it, then fades independently.
        setTimeout(() => { setMsg(null); }, 2800);
      }
    });
  }, [goals, burstIds, completeGoal, activeGoals]);

  if (!isInitialized || !isAuthenticated) return null;

  return (
    <main className="flex flex-col" style={{ height: '100dvh' }}>
      {/* Header */}
      <div className="flex shrink-0 flex-col px-5 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => router.push('/home')}
            className="flex items-center gap-1.5 text-sm font-medium text-charcoal/55 transition hover:text-charcoal/80">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Overview
          </button>
          <h1 className="font-display text-base font-bold text-grounded-green" style={{ fontWeight: 700 }}>Goals</h1>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => router.push('/wrapped')}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-base shadow-card transition active:scale-95"
              aria-label="Year in review">
              ✨
            </button>
            <button type="button"
              onClick={() => router.push(`/accounts/savings-1/goal${mode === 'investing' ? '?goalType=investing' : ''}`)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-grounded-green text-white shadow-card transition active:scale-95">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Saving / Investing slider toggle ── */}
        <div className="mt-3 flex justify-center">
          <div style={{
            position: 'relative',
            display: 'inline-flex',
            backgroundColor: 'rgba(0,75,50,0.07)',
            borderRadius: 24,
            padding: 3,
          }}>
            {/* Sliding pill background */}
            <div style={{
              position: 'absolute',
              top: 3, bottom: 3,
              left: 3,
              width: 'calc(50% - 3px)',
              backgroundColor: '#004B32',
              borderRadius: 20,
              transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: mode === 'investing' ? 'translateX(100%)' : 'translateX(0)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
            }} />
            {(['saving', 'investing'] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  padding: '6px 18px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  color: mode === m ? '#ffffff' : 'rgba(0,75,50,0.45)',
                  transition: 'color 0.22s ease',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  letterSpacing: '0.01em',
                  whiteSpace: 'nowrap',
                }}
              >
                {m === 'saving' ? 'Goal Saving' : 'Goal Investing'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blob space — clip-path works with preserve-3d children unlike overflow:hidden */}
      <div ref={containerRef} className="relative flex-1" style={{ touchAction: 'none', overflow: 'hidden', clipPath: 'inset(0)' }}>
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
              index={i}
              isBursting={burstIds.has(goal.id)}
              isCompleted={isCompleted}
              isFlipped={flippedIds.has(goal.id)}
              dm11={pos.dm11 ?? 0}
              dm12={pos.dm12 ?? 0}
              dm22={pos.dm22 ?? 0}
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

      {sheetGoal && (
        <GoalSheet
          goal={sheetGoal}
          accounts={depositAccounts}
          onDeposit={(amount, fromAccountId) => {
            depositToGoal(sheetGoal.id, amount);
            adjustBalance(fromAccountId, -amount);
          }}
          onSetMonthly={(amount) => {
            updateGoal(sheetGoal.id, { monthlyDeposit: amount });
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
