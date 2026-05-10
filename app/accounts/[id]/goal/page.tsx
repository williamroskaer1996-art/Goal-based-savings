'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { GoalIconPicker } from '@/components/GoalIconPicker';
import { TransitionPicker } from '@/components/TransitionPicker';
import { useAppStore } from '@/lib/store';
import type { GoalIconKey, TriodosTransition } from '@/lib/types';
import { PARTNERSHIPS } from '@/lib/types';

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
  const [icon, setIcon] = useState<GoalIconKey | null>(null);
  const [transition, setTransition] = useState<TriodosTransition | null>(null);
  const returnedPartnershipId = useReturnedPartnership();
  const [partnershipId, setPartnershipId] = useState<string | null>(null);

  // Pre-fill when editing
  useEffect(() => {
    if (existingGoal) {
      setName(existingGoal.name);
      setAmount(existingGoal.targetAmount > 0 ? String(existingGoal.targetAmount) : '');
      setPurpose(existingGoal.purpose ?? '');
      setIcon(existingGoal.iconKey);
      setTransition(existingGoal.transition ?? null);
      setPartnershipId(existingGoal.partnershipId ?? null);
    }
  }, [existingGoal?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply partnership returned from the partnerships page
  useEffect(() => {
    if (returnedPartnershipId) setPartnershipId(returnedPartnershipId);
  }, [returnedPartnershipId]);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) router.replace('/login');
  }, [isInitialized, isAuthenticated, router]);

  if (!isInitialized || !isAuthenticated || !account) return null;

  function handleSave() {
    if (!name.trim()) return;
    if (existingGoal) {
      updateGoal(existingGoal.id, {
        name: name.trim(),
        targetAmount: parseFloat(amount) || 0,
        iconKey: icon ?? existingGoal.iconKey,
        purpose: purpose.trim() || undefined,
        transition: transition ?? undefined,
        partnershipId: partnershipId ?? undefined,
      });
    } else {
      addGoal({
        name: name.trim(),
        targetAmount: parseFloat(amount) || 0,
        iconKey: icon ?? 'other',
        balance: 0,
        parentAccountId: id,
        purpose: purpose.trim() || undefined,
        transition: transition ?? undefined,
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

        {/* Icon picker */}
        <div>
          <p className="mb-3 text-sm font-semibold text-charcoal/70">
            Choose an icon
          </p>
          <GoalIconPicker selected={icon} onSelect={setIcon} />
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
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-grounded-green">{p.name}</p>
                    <span className="rounded-full bg-grounded-green px-2 py-0.5 text-[10px] font-bold text-white">{p.discount}</span>
                  </div>
                  <p className="text-xs text-charcoal/50">{p.tagline}</p>
                </div>
                <button type="button" onClick={() => setPartnershipId(null)}
                  className="text-xs font-semibold text-charcoal/40 hover:text-charcoal/70">Remove</button>
              </div>
            );
          })() : (
            <button
              type="button"
              onClick={() => {
                const returnTo = `/accounts/${id}/goal${editGoalId ? `?goalId=${editGoalId}` : ''}`;
                router.push(`/partnerships?returnTo=${encodeURIComponent(returnTo)}${icon ? `&icon=${icon}` : ''}`);
              }}
              className="flex w-full items-center justify-between rounded-2xl border border-grounded-green/15 bg-white px-4 py-4 text-left shadow-card transition hover:border-grounded-green/30 active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-grounded-green/8 text-lg">🤝</div>
                <div>
                  <p className="text-sm font-semibold text-charcoal">Explore partnerships</p>
                  <p className="text-xs text-charcoal/45">Save up to 20% with Triodos partners</p>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-charcoal/30" />
              </svg>
            </button>
          )}
        </div>

        {/* Transition picker */}
        <div>
          <p className="mb-1 text-sm font-semibold text-charcoal/70">
            Connect to a Triodos transition{' '}
            <span className="font-normal text-charcoal/40">(optional)</span>
          </p>
          <p className="mb-3 text-xs text-charcoal/45">
            Which of the five societal transitions does your goal support?
          </p>
          <TransitionPicker selected={transition} onSelect={setTransition} />
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
