'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Account, GoalAccount } from './types';
import { INITIAL_ACCOUNTS, INITIAL_GOALS } from './mockData';

// Bump this string whenever INITIAL_GOALS changes — forces a reset in all browsers.
const DATA_VERSION = 'v6';

type AppStoreValue = {
  isInitialized: boolean;
  isAuthenticated: boolean;
  accounts: Account[];
  goals: GoalAccount[];
  login: () => void;
  logout: () => void;
  addGoal: (goal: Omit<GoalAccount, 'id'>) => void;
  updateGoal: (goalId: string, patch: Partial<Omit<GoalAccount, 'id'>>) => void;
  depositToGoal: (goalId: string, amount: number) => void;
  completeGoal: (goalId: string) => void;
  adjustBalance: (accountId: string, amount: number) => void;
};

const AppStoreContext = createContext<AppStoreValue | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [goals, setGoals] = useState<GoalAccount[]>([]);

  // Rehydrate from sessionStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    if (sessionStorage.getItem('triodos_auth') === '1') {
      setIsAuthenticated(true);
    }
    try {
      const savedAccounts = sessionStorage.getItem('triodos_accounts');
      if (savedAccounts) {
        // Always use INITIAL_ACCOUNTS as source of truth for static fields
        // (name, IBAN, type) — only restore the mutable balance from cache.
        const parsed = JSON.parse(savedAccounts) as Account[];
        const merged = INITIAL_ACCOUNTS.map(init => {
          const saved = parsed.find(a => a.id === init.id);
          return saved ? { ...init, balance: saved.balance } : init;
        });
        setAccounts(merged);
      }
      const savedGoals = sessionStorage.getItem('triodos_goals');
      const savedVersion = sessionStorage.getItem('triodos_data_version');
      if (savedGoals && savedVersion === DATA_VERSION) {
        setGoals(JSON.parse(savedGoals) as GoalAccount[]);
      } else {
        // First load or stale data — seed with current defaults
        setGoals(INITIAL_GOALS);
        sessionStorage.setItem('triodos_goals', JSON.stringify(INITIAL_GOALS));
        sessionStorage.setItem('triodos_data_version', DATA_VERSION);
      }
    } catch (e) {
      console.error('Failed to rehydrate store:', e);
    }
    setIsInitialized(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(() => {
    sessionStorage.setItem('triodos_auth', '1');
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('triodos_auth');
    setIsAuthenticated(false);
  }, []);

  const addGoal = useCallback((goal: Omit<GoalAccount, 'id'>) => {
    const newGoal: GoalAccount = {
      ...goal,
      id: `goal-${Date.now()}`,
    };
    setGoals((prev) => {
      const next = [...prev, newGoal];
      sessionStorage.setItem('triodos_goals', JSON.stringify(next));
      return next;
    });
  }, []);

  const updateGoal = useCallback((goalId: string, patch: Partial<Omit<GoalAccount, 'id'>>) => {
    setGoals((prev) => {
      const next = prev.map((g) => g.id === goalId ? { ...g, ...patch } : g);
      sessionStorage.setItem('triodos_goals', JSON.stringify(next));
      return next;
    });
  }, []);

  const depositToGoal = useCallback((goalId: string, amount: number) => {
    setGoals((prev) => {
      const next = prev.map((g) =>
        g.id === goalId ? { ...g, balance: g.balance + amount } : g,
      );
      sessionStorage.setItem('triodos_goals', JSON.stringify(next));
      return next;
    });
  }, []);

  const completeGoal = useCallback((goalId: string) => {
    setGoals((prev) => {
      const next = prev.map((g) =>
        g.id === goalId && !g.completedAt
          ? { ...g, completedAt: new Date().toISOString() }
          : g,
      );
      sessionStorage.setItem('triodos_goals', JSON.stringify(next));
      return next;
    });
  }, []);

  const adjustBalance = useCallback((accountId: string, amount: number) => {
    setAccounts((prev) => {
      const next = prev.map((a) =>
        a.id === accountId ? { ...a, balance: a.balance + amount } : a,
      );
      sessionStorage.setItem('triodos_accounts', JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ isInitialized, isAuthenticated, accounts, goals, login, logout, addGoal, updateGoal, depositToGoal, completeGoal, adjustBalance }),
    [isInitialized, isAuthenticated, accounts, goals, login, logout, addGoal, updateGoal, depositToGoal, completeGoal, adjustBalance],
  );

  return (
    <AppStoreContext.Provider value={value}>
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore(): AppStoreValue {
  const ctx = useContext(AppStoreContext);
  if (!ctx) {
    throw new Error('useAppStore must be used within an AppStoreProvider');
  }
  return ctx;
}
