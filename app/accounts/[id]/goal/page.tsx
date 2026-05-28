'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import type { GoalIconKey } from '@/lib/types';
import { PARTNERSHIPS, ICON_TRANSITION } from '@/lib/types';

// Read back the partnership the user selected on the partnerships page
function useReturnedPartnership() {
  const searchParams = useSearchParams();
  return searchParams.get('partnershipId');
}

export default function SetGoalPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const editGoalId = searchParams.get('goalId'); // present when editing

  const { isInitialized, isAuthenticated, accounts, goals, addGoal, updateGoal } = useAppStore();

  const account = accounts.find((a) => a.id === id);
  const existingGoal = editGoalId ? goals.find((g) => g.id === editGoalId) : null;

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const returnedPartnershipId = useReturnedPartnership();
  const [partnershipId, setPartnershipId] = useState<string | null>(null);

  // Pre-fill when editing
  useEffect(() => {
    if (existingGoal) {
      setName(existingGoal.name);
      setAmount(existingGoal.targetAmount > 0 ? String(existingGoal.targetAmount) : '');
      setPurpose(existingGoal.purpose ?? '');
      setPartnershipId(existingGoal.partnershipId ?? null);
    }
  }, [existingGoal?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply partnership returned from the partnerships page + prefill suggestions
  useEffect(() => {
    if (!returnedPartnershipId) return;
    setPartnershipId(returnedPartnershipId);
    const p = PARTNERSHIPS.find(x => x.id === returnedPartnershipId);
    if (!p) return;
    // Only suggest into fields the user hasn't filled yet
    if (!name.trim())   setName(p.suggested.goalName);
    if (!amount.trim()) setAmount(String(p.suggested.amount));
    if (!purpose.trim()) setPurpose(p.suggested.purpose);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [returnedPartnershipId]);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) router.replace('/login');
  }, [isInitialized, isAuthenticated, router]);

  if (!isInitialized || !isAuthenticated || !account) return null;

  // Keyword-based categorisation — stands in for AI classification in the prototype
  function categorizeGoal(goalName: string): GoalIconKey {
    const n = goalName.toLowerCase();
    if (/solar|panel|insul|heat|wind|electric|energy|roof/.test(n))         return 'home';
    if (/e-bike|ebike|cargo.bike|bicycle|bike/.test(n))                     return 'bike';
    if (/car|vehicle|ev |electric.car|tesla/.test(n))                       return 'car';
    if (/garden|plant|veggie|vegetable|grow|farm|organic/.test(n))          return 'garden';
    if (/train|trip|travel|inter.?rail|journey|europe/.test(n))             return 'train';
    if (/holiday|vacation|ski|beach|resort|abroad/.test(n))                 return 'holiday';
    if (/health|gym|fitness|sport|doctor|medical|wellness/.test(n))         return 'health';
    if (/course|school|study|learn|education|uni|degree/.test(n))           return 'education';
    if (/phone|fairphone|laptop|repair|tool|device/.test(n))                return 'tools';
    if (/gift|birthday|present|wedding|anniversar/.test(n))                 return 'gift';
    if (/safety|security|insurance|emergency/.test(n))                      return 'safety';
    if (/pet|dog|cat|animal|vet/.test(n))                                   return 'pet';
    return 'other';
  }

  function handleSave() {
    if (!name.trim()) return;
    const resolvedIcon: GoalIconKey = existingGoal?.iconKey !== 'other' && existingGoal?.iconKey
      ? existingGoal.iconKey
      : categorizeGoal(name);
    const autoTransition = ICON_TRANSITION[resolvedIcon];
    if (existingGoal) {
      updateGoal(existingGoal.id, {
        name: name.trim(),
        targetAmount: parseFloat(amount) || 0,
        iconKey: resolvedIcon,
        purpose: purpose.trim() || undefined,
        transition: autoTransition,
        partnershipId: partnershipId ?? undefined,
      });
    } else {
      addGoal({
        name: name.trim(),
        targetAmount: parseFloat(amount) || 0,
        iconKey: resolvedIcon,
        balance: 0,
        parentAccountId: id,
        purpose: purpose.trim() || undefined,
        transition: autoTransition,
        partnershipId: partnershipId ?? undefined,
      });
    }
    router.push('/goals');
  }

  const isEditing = !!existingGoal;

  return (
    <main className="flex min-h-screen flex-col">
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
        <h1 className="font-display text-base font-bold text-grounded-green" style={{ fontWeight: 700 }}>
          {isEditing ? 'Edit goal' : 'Set savings goal'}
        </h1>
        <div className="w-9" />
      </div>

      {/* Form */}
      <div className="mt-6 flex flex-col gap-6 px-5 pb-36">
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

        {/* Partnerships */}
        <div>
          <p className="mb-3 text-sm font-semibold text-charcoal/70">Partnerships</p>
          {partnershipId ? (() => {
            const p = PARTNERSHIPS.find(x => x.id === partnershipId);
            if (!p) return null;
            return (
              <div className="flex items-center gap-3 rounded-2xl border border-grounded-green bg-grounded-green/5 px-4 py-3 shadow-card">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-grounded-green/8 text-xl">
                  {p.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-grounded-green">{p.name}</p>
                  <span className="mt-0.5 inline-block whitespace-nowrap rounded-full bg-grounded-green px-2 py-0.5 text-[10px] font-bold text-white">{p.discount}</span>
                </div>
                <button type="button" onClick={() => {
                  setPartnershipId(null);
                  setName('');
                  setAmount('');
                  setPurpose('');
                }} className="shrink-0 text-xs font-semibold text-charcoal/40 hover:text-charcoal/70">Remove</button>
              </div>
            );
          })() : (
            <button
              type="button"
              onClick={() => {
                const returnTo = `/accounts/${id}/goal${editGoalId ? `?goalId=${editGoalId}` : ''}`;
                router.push(`/partnerships?returnTo=${encodeURIComponent(returnTo)}`);
              }}
              className="flex w-full items-center justify-between rounded-2xl border border-grounded-green/15 bg-white px-4 py-4 text-left shadow-card transition hover:border-grounded-green/30 active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-grounded-green/8 text-lg">🤝</div>
                <div>
                  <p className="text-sm font-semibold text-charcoal">Explore partnerships</p>
                  <p className="text-xs text-charcoal/45">Save up to 20% with Triodos partners</p>
                  <p className="text-xs font-medium text-grounded-green/70">Be a part of the change</p>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-charcoal/30" />
              </svg>
            </button>
          )}
        </div>

      </div>

      {/* Sticky save button */}
      <div className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 bg-gradient-to-t from-birch-skin via-birch-skin/95 to-birch-skin/0 px-5 pb-8 pt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={!name.trim()}
          className="w-full rounded-xl bg-grounded-green py-4 text-base font-semibold text-white shadow-card transition active:scale-[0.99] disabled:opacity-40 hover:bg-grounded-green/90"
        >
          {isEditing ? 'Save changes' : 'Save goal'}
        </button>
      </div>
    </main>
  );
}
