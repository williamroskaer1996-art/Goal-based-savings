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

function truncateIban(iban: string) {
  const parts = iban.split(' ');
  if (parts.length <= 2) return iban;
  return `${parts[0]} ${parts[1]} ... ${parts[parts.length - 1]}`;
}

export function AccountCard({ account, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-grounded-green/10 bg-white p-4 text-left shadow-card transition active:scale-[0.99] hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal/40">
            {TYPE_LABEL[account.type]}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-charcoal/80">{account.ownerName}</p>
          <p className="mt-0.5 text-xs text-charcoal/40">{truncateIban(account.iban)}</p>
        </div>
        <p className="font-display text-lg font-bold text-grounded-green" style={{ fontWeight: 700 }}>
          {formatEur(account.balance)}
        </p>
      </div>
    </button>
  );
}
