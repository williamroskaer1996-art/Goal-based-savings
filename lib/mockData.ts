import type { Account, GoalAccount, Transaction } from './types';

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'savings-1',
    ownerName: 'William Roskær',
    iban: 'NL20 TRIO 2301 2295 21',
    balance: 8200,
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

export const INITIAL_GOALS: GoalAccount[] = [];

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
