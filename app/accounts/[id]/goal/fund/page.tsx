'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState, Suspense } from 'react';
import { TRIODOS_FUNDS } from '@/lib/funds';
import type { RiskLevel } from '@/lib/funds';

// ── Annual return rates (conservative, illustrative) ──────────────────────────
const ANNUAL_RATE: Record<RiskLevel, number> = {
  low:           0.03,
  medium:        0.05,
  'medium-high': 0.065,
  high:          0.06,
};
const SAVINGS_RATE = 0.01;

const MISSION_BULLETS: Record<string, string[]> = {
  Energy: [
    'Finances solar parks, wind farms and battery storage across Europe',
    'Enables communities and households to generate clean, renewable power',
    'Accelerates the shift away from fossil fuels at scale',
  ],
  Food: [
    'Supports organic farmers and regenerative agriculture across Europe',
    'Builds a food system that is fairer for farmers and better for the soil',
    'Reduces the environmental impact of how we grow and eat',
  ],
  Resources: [
    'Backs companies building circular, low-waste business models',
    'Finances sustainable transport and low-carbon mobility',
    'Supports innovation in material reuse, repair and recycling',
  ],
  Society: [
    'Empowers micro-entrepreneurs in underserved communities',
    'Funds education, healthcare and social inclusion initiatives',
    'Makes financial services accessible to those who need them most',
  ],
  Wellbeing: [
    'Invests in healthcare providers and preventive health organisations',
    'Supports mental health initiatives and community care',
    'Backs a more balanced, human-centred economy',
  ],
  Mixed: [
    'Diversified across sectors with rigorous ESG and impact screening',
    'Active ownership to drive companies toward measurable positive change',
    'Balances long-term financial returns with real-world outcomes',
  ],
};

function calcGrowth(monthlyPmt: number, annualRate: number, years: number) {
  const r = annualRate / 12;
  return Array.from({ length: years }, (_, i) => {
    const n  = (i + 1) * 12;
    const fv = r < 0.000001
      ? monthlyPmt * n
      : monthlyPmt * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const principal = monthlyPmt * n;
    return { year: i + 1, total: fv, principal, returns: Math.max(0, fv - principal) };
  });
}

function fmt(n: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  }).format(n);
}

// ── Bar chart — birch-skin canvas, lupine bars ────────────────────────────────
function GrowthChart({
  data,
  selectedIdx,
}: {
  data: { year: number; total: number; principal: number; returns: number }[];
  selectedIdx: number;
}) {
  const CHART_W = 310;
  const CHART_H = 130;
  const LUPINE  = '#8074FF';
  const count   = data.length;
  const slotW   = CHART_W / count;
  const barW    = Math.min(slotW * 0.68, 32);
  const maxVal  = Math.max(...data.map(d => d.total));

  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H + 20}`}
      className="w-full"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {data.map((d, i) => {
          const totalH     = Math.max(2, (d.total / maxVal) * CHART_H);
          const principalH = (d.principal / maxVal) * CHART_H;
          const splitPct   = totalH > 0 ? ((principalH / totalH) * 100).toFixed(1) : '100';
          const active     = i === selectedIdx;
          return (
            <linearGradient key={i} id={`bg${i}`} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%"             stopColor={LUPINE} stopOpacity={active ? 0.18 : 0.08} />
              <stop offset={`${splitPct}%`} stopColor={LUPINE} stopOpacity={active ? 0.18 : 0.08} />
              <stop offset={`${splitPct}%`} stopColor={LUPINE} stopOpacity={active ? 1.00 : 0.28} />
              <stop offset="100%"           stopColor={LUPINE} stopOpacity={active ? 1.00 : 0.28} />
            </linearGradient>
          );
        })}
      </defs>

      {data.map((d, i) => {
        const totalH = Math.max(2, (d.total / maxVal) * CHART_H);
        const x      = i * slotW + (slotW - barW) / 2;
        const active = i === selectedIdx;

        return (
          <g key={d.year}>
            <rect
              x={x}
              y={CHART_H - totalH}
              width={barW}
              height={totalH}
              rx={3}
              fill={`url(#bg${i})`}
            />
            <text
              x={x + barW / 2}
              y={CHART_H + 14}
              textAnchor="middle"
              fontSize="9"
              fontWeight={active ? 700 : 400}
              fill={active ? LUPINE : 'rgba(34,34,34,0.28)'}
              fontFamily="inherit"
            >
              {d.year}y
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Inner page ────────────────────────────────────────────────────────────────
function FundProjectionContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const fundId   = searchParams.get('fundId')   ?? '';
  const goalName = searchParams.get('goalName') ?? 'your goal';
  const years    = Math.max(1, parseInt(searchParams.get('years') ?? '10', 10));
  const amount   = parseFloat(searchParams.get('amount') ?? '0') || 0;

  const fund       = TRIODOS_FUNDS.find(f => f.id === fundId) ?? TRIODOS_FUNDS[0];
  const annualRate = ANNUAL_RATE[fund.risk];
  const hasAmt     = amount > 0;
  const monthlyPmt = hasAmt ? amount / (years * 12) : 100;

  const investData  = useMemo(() => calcGrowth(monthlyPmt, annualRate, years),  [monthlyPmt, annualRate, years]);
  const savingsData = useMemo(() => calcGrowth(monthlyPmt, SAVINGS_RATE, years), [monthlyPmt, years]);

  const finalInvest  = investData[investData.length - 1];
  const finalSavings = savingsData[savingsData.length - 1];
  const extraReturn  = finalInvest.total - finalSavings.total;

  const step      = years > 15 ? 2 : 1;
  const chartData = investData.filter((_, i) => (i + 1) % step === 0);
  if (chartData[chartData.length - 1]?.year !== years) {
    chartData.push(investData[investData.length - 1]);
  }

  // Slider — defaults to last bar (full horizon)
  const [selectedIdx, setSelectedIdx] = useState(chartData.length - 1);
  const selectedPoint = chartData[Math.min(selectedIdx, chartData.length - 1)];

  const missionBullets = MISSION_BULLETS[fund.focus] ?? MISSION_BULLETS['Mixed'];
  const LUPINE = '#8074FF';

  return (
    <main className="flex min-h-dvh flex-col">

      {/* ── Header ── */}
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
        <p className="text-sm font-semibold text-charcoal/55">Fund projection</p>
        <div className="w-9" />
      </div>

      {/* ── Scrollable content ── */}
      <div className="mt-5 flex flex-col gap-4 px-5 pb-36">

        {/* ── Hero stat ── */}
        <div className="flex flex-col items-center py-6">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-charcoal/35">
            Projected value
          </p>
          <p
            className="font-display mt-2 text-[52px] font-bold leading-none text-charcoal"
            style={{ fontWeight: 700 }}
          >
            {fmt(selectedPoint.total)}
          </p>
          <p className="mt-2 text-sm text-charcoal/45">
            after {selectedPoint.year} {selectedPoint.year === 1 ? 'year' : 'years'} · {(annualRate * 100).toFixed(0)}% annual growth
          </p>

          {/* Contributed → Returns pill row */}
          <div className="mt-5 flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-card">
              <span className="h-2 w-2 rounded-sm" style={{ background: `${LUPINE}28` }} />
              <span className="text-[11px] font-medium text-charcoal/50">
                Contributed&nbsp;{fmt(selectedPoint.principal)}
              </span>
            </div>
            <span className="text-charcoal/25">+</span>
            <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-card">
              <span className="h-2 w-2 rounded-sm" style={{ background: LUPINE }} />
              <span className="text-[11px] font-medium" style={{ color: LUPINE }}>
                Returns&nbsp;{fmt(selectedPoint.returns)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Chart card ── */}
        <div className="rounded-2xl bg-white px-4 pb-4 pt-5 shadow-card">
          <p className="mb-1 text-xs font-semibold text-charcoal/40">Growth over time</p>
          <GrowthChart data={chartData} selectedIdx={selectedIdx} />

          {/* Slider */}
          <div className="mt-2 px-1">
            <input
              type="range"
              min={0}
              max={chartData.length - 1}
              step={1}
              value={selectedIdx}
              onChange={(e) => setSelectedIdx(parseInt(e.target.value, 10))}
              className="time-slider"
              style={{
                background: `linear-gradient(to right, ${LUPINE} ${(selectedIdx / Math.max(chartData.length - 1, 1)) * 100}%, #d6d0c8 ${(selectedIdx / Math.max(chartData.length - 1, 1)) * 100}%)`,
                color: LUPINE,
              }}
              aria-label="Select year"
            />
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm" style={{ background: `${LUPINE}22` }} />
              <span className="text-[10px] text-charcoal/35">Contributed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm" style={{ background: LUPINE }} />
              <span className="text-[10px] text-charcoal/35">Returns</span>
            </div>
          </div>
        </div>

        {/* ── Savings comparison card ── */}
        <div className="rounded-2xl bg-white px-4 py-4 shadow-card">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-charcoal/35">
            Compared to a savings account
          </p>
          <div className="flex items-stretch gap-2.5">
            {/* Savings */}
            <div className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-4"
              style={{ background: 'rgba(0,0,0,0.03)' }}>
              <p className="text-[10px] text-charcoal/40">Savings account</p>
              <p className="text-xl font-bold text-charcoal/45">{fmt(finalSavings.total)}</p>
              <p className="text-[9px] text-charcoal/28">~1% p.a.</p>
            </div>

            {/* Delta */}
            <div className="flex flex-col items-center justify-center gap-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M5 12h14M13 6l6 6-6 6" stroke={LUPINE} strokeWidth={2.2}
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-[10px] font-bold" style={{ color: LUPINE }}>
                +{fmt(extraReturn)}
              </p>
            </div>

            {/* Fund */}
            <div className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-4"
              style={{ background: `${LUPINE}0E`, border: `1px solid ${LUPINE}20` }}>
              <p className="text-[10px]" style={{ color: LUPINE }}>This fund</p>
              <p className="text-xl font-bold" style={{ color: LUPINE }}>{fmt(finalInvest.total)}</p>
              <p className="text-[9px]" style={{ color: `${LUPINE}80` }}>~{(annualRate * 100).toFixed(0)}% p.a.</p>
            </div>
          </div>

          <p className="mt-3 text-center text-[10px] leading-relaxed text-charcoal/35">
            {hasAmt
              ? `${fmt(monthlyPmt)}/month toward "${goalName}"`
              : 'Based on €100/month · adjust when you set your goal'}
          </p>
        </div>

        {/* ── Impact card ── */}
        <div className="rounded-2xl bg-white px-4 py-4 shadow-card">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-charcoal/35">
            Your impact
          </p>
          <div className="space-y-3">
            {missionBullets.map((b) => (
              <div key={b} className="flex items-start gap-2.5">
                <span
                  className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                  style={{ background: LUPINE }}
                >
                  ✓
                </span>
                <p className="text-sm leading-snug text-charcoal/65">{b}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Learn more link ── */}
        <button
          type="button"
          className="flex w-full items-center justify-center gap-1.5 py-1 text-sm font-medium transition active:opacity-60"
          style={{ color: LUPINE }}
        >
          Learn more about {fund.name}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Disclaimer */}
        <p className="px-1 text-center text-[10px] leading-relaxed text-charcoal/25">
          For illustrative purposes only. Based on a {(annualRate * 100).toFixed(0)}% annualised
          return. Investing involves risk. Past performance is not a guarantee of future results.
        </p>
      </div>

      {/* ── Sticky CTA ── */}
      <div className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 bg-gradient-to-t from-birch-skin via-birch-skin/95 to-birch-skin/0 px-5 pb-8 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-full rounded-xl py-4 text-base font-semibold text-white shadow-card transition active:scale-[0.99]"
          style={{ background: LUPINE }}
        >
          Back to goal
        </button>
      </div>
    </main>
  );
}

export default function FundProjectionPage() {
  return (
    <Suspense fallback={null}>
      <FundProjectionContent />
    </Suspense>
  );
}
