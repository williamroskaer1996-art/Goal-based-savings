import type { Account } from '@/lib/types';

type Props = {
  account: Account;
  onClick?: () => void;
};

const TYPE_LABEL: Record<Account['type'], string> = {
  savings: 'Savings',
  checking: 'Checking',
  investment: 'Investment',
};

function formatEur(n: number) {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(n);
}

function lastFour(iban: string) {
  const parts = iban.trim().split(' ');
  return `··· ${parts[parts.length - 1]}`;
}

export function AccountCardCompact({ account, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col justify-between rounded-2xl border border-grounded-green/10 bg-white p-4 text-left shadow-card transition active:scale-[0.98] hover:shadow-md"
    >
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal/40">
          {TYPE_LABEL[account.type]}
        </p>
        <p className="mt-0.5 text-xs text-charcoal/35">{lastFour(account.iban)}</p>
      </div>
      <p className="mt-4 font-display text-base font-bold leading-tight text-grounded-green" style={{ fontWeight: 700 }}>
        {formatEur(account.balance)}
      </p>
    </button>
  );
}
