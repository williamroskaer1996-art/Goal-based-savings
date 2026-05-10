import type { Account } from './types';

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'savings-1',
    ownerName: 'Sophia de Vries',
    iban: 'NL20 TRIO 2301 2295 21',
    balance: 8200,
    type: 'savings',
  },
  {
    id: 'checking-1',
    ownerName: 'Sophia de Vries',
    iban: 'NL10 TRIO 7210 0235 21',
    balance: 3100,
    type: 'checking',
  },
];
