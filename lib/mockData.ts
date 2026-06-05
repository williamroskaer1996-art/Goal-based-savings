import type { Account, GoalAccount, Transaction } from './types';

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'savings-1',
    ownerName: 'William Roskær',
    iban: 'NL20 TRIO 2301 2295 21',
    balance: 54000,
    type: 'savings',
  },
  {
    id: 'checking-1',
    ownerName: 'William Roskær',
    iban: 'NL10 TRIO 7210 0235 21',
    balance: 3100,
    type: 'checking',
  },
];

export const INITIAL_GOALS: GoalAccount[] = [
  // ── Savings goals ────────────────────────────────────────────────────────────
  {
    id: 'goal-demo-solar',
    name: 'Solar panels',
    iconKey: 'home',
    targetAmount: 8000,
    balance: 3200,
    parentAccountId: 'savings-1',
    purpose: 'Become energy independent at home',
    transition: 'energy',
    goalType: 'saving',
    timeHorizonMonths: 36,
  },
  {
    id: 'goal-demo-japan',
    name: 'Japan trip',
    iconKey: 'holiday',
    targetAmount: 4500,
    balance: 1800,
    parentAccountId: 'savings-1',
    purpose: 'Family holiday in Japan 2026',
    transition: 'wellbeing',
    goalType: 'saving',
    timeHorizonMonths: 24,
  },
  {
    id: 'goal-demo-bike',
    name: 'Electric cargo bike',
    iconKey: 'bike',
    targetAmount: 2800,
    balance: 950,
    parentAccountId: 'savings-1',
    purpose: 'Replace the car for school runs and groceries',
    transition: 'resources',
    goalType: 'saving',
    timeHorizonMonths: 12,
  },
  // ── Investment goals ─────────────────────────────────────────────────────────
  {
    id: 'goal-demo-retirement',
    name: 'Retirement fund',
    iconKey: 'safety',
    targetAmount: 150000,
    balance: 12500,
    parentAccountId: 'savings-1',
    purpose: 'Financial independence by 65',
    transition: 'society',
    goalType: 'investing',
    timeHorizonMonths: 240,
  },
  {
    id: 'goal-demo-education',
    name: "Children's education",
    iconKey: 'education',
    targetAmount: 50000,
    balance: 8000,
    parentAccountId: 'savings-1',
    purpose: 'Give our kids the best possible start',
    transition: 'wellbeing',
    goalType: 'investing',
    timeHorizonMonths: 180,
  },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1',  label: 'Albert Heijn',       sublabel: 'Groceries',         amount: -43.80,  date: 'Today',     type: 'debit',  icon: '🛒' },
  { id: 't2',  label: 'Salary — Triodos',   sublabel: 'Monthly income',    amount: 5400.00, date: 'Today',     type: 'credit', icon: '💼' },
  { id: 't3',  label: 'NS Reizen',          sublabel: 'Public transport',  amount: -21.50,  date: 'Yesterday', type: 'debit',  icon: '🚆' },
  { id: 't4',  label: 'Thuisbezorgd',       sublabel: 'Food delivery',     amount: -18.95,  date: 'Yesterday', type: 'debit',  icon: '🍕' },
  { id: 't5',  label: 'Vattenfall',         sublabel: 'Energy bill',       amount: -94.00,  date: '6 May',     type: 'debit',  icon: '⚡' },
  { id: 't6',  label: 'S. de Vries',        sublabel: 'Transfer received', amount: 150.00,  date: '6 May',     type: 'credit', icon: '↙' },
  { id: 't7',  label: 'Picnic',             sublabel: 'Groceries',         amount: -37.20,  date: '5 May',     type: 'debit',  icon: '🛒' },
  { id: 't8',  label: 'Spotify',            sublabel: 'Subscription',      amount: -10.99,  date: '4 May',     type: 'debit',  icon: '🎵' },
  { id: 't9',  label: 'Gemeente Amsterdam', sublabel: 'Municipal tax',     amount: -56.00,  date: '3 May',     type: 'debit',  icon: '🏛️' },
  { id: 't10', label: 'Freelance payment',  sublabel: 'Invoice #2024-011', amount: 480.00,  date: '2 May',     type: 'credit', icon: '📄' },
];
