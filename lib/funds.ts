// ── Triodos Investment Fund catalogue (17 funds) ─────────────────────────────

export type RiskLevel = 'low' | 'medium' | 'medium-high' | 'high';

export type TriodosFund = {
  id: string;
  name: string;
  emoji: string;
  focus: string;
  risk: RiskLevel;
  /** Minimum recommended investment horizon in years */
  minHorizonYears: number;
  description: string;
  /** Keywords used for fallback matching */
  tags: string[];
};

export const TRIODOS_FUNDS: TriodosFund[] = [
  {
    id: 'renewables-europe',
    name: 'Triodos Renewables Europe Fund',
    emoji: '⚡',
    focus: 'Energy',
    risk: 'high',
    minHorizonYears: 7,
    description: 'Invests in wind, solar and hydro energy projects across Europe, financing the shift to clean power infrastructure.',
    tags: ['solar', 'wind', 'energy', 'renewable', 'electric', 'panels', 'roof', 'insulation', 'power'],
  },
  {
    id: 'energy-transition',
    name: 'Triodos Energy Transition Europe Fund',
    emoji: '🔋',
    focus: 'Energy',
    risk: 'high',
    minHorizonYears: 10,
    description: 'Direct investments in European energy transition infrastructure — solar parks, wind farms, battery storage and smart grids.',
    tags: ['battery', 'grid', 'infrastructure', 'solar', 'wind', 'energy', 'storage'],
  },
  {
    id: 'pioneer-impact',
    name: 'Triodos Pioneer Impact Fund',
    emoji: '🚀',
    focus: 'Resources',
    risk: 'high',
    minHorizonYears: 7,
    description: 'Backs innovative companies at the frontier of social and environmental change — early-stage impact leaders pioneering new solutions.',
    tags: ['innovation', 'tech', 'startup', 'impact', 'circular', 'economy', 'fairphone', 'device'],
  },
  {
    id: 'organic-growth',
    name: 'Triodos Organic Growth Fund',
    emoji: '🌾',
    focus: 'Food',
    risk: 'high',
    minHorizonYears: 7,
    description: 'Finances organic food producers, sustainable agriculture and the transition to regenerative food systems across Europe.',
    tags: ['food', 'organic', 'farm', 'garden', 'agriculture', 'plant', 'grow', 'vegetable', 'veggie'],
  },
  {
    id: 'food-transition',
    name: 'Triodos Food Transition Europe Fund',
    emoji: '🥦',
    focus: 'Food',
    risk: 'high',
    minHorizonYears: 7,
    description: 'Targets the transformation of European food systems — from farm to fork — toward sustainability, health and low environmental impact.',
    tags: ['food', 'veggie', 'vegetable', 'organic', 'farm', 'garden', 'transition', 'europe', 'sustainable food'],
  },
  {
    id: 'microfinance',
    name: 'Triodos Microfinance Fund',
    emoji: '🤝',
    focus: 'Society',
    risk: 'medium',
    minHorizonYears: 5,
    description: 'Provides financial services to underserved communities in emerging markets, empowering micro-entrepreneurs to build better lives.',
    tags: ['community', 'social', 'fairness', 'education', 'developing', 'poverty', 'empower'],
  },
  {
    id: 'future-generations',
    name: 'Triodos Future Generations Fund',
    emoji: '🌱',
    focus: 'Wellbeing',
    risk: 'high',
    minHorizonYears: 10,
    description: 'Long-term investments in a world fit for future generations — spanning health, education and sustainable economic development.',
    tags: ['future', 'children', 'education', 'health', 'wellbeing', 'long-term', 'legacy'],
  },
  {
    id: 'climate-nature',
    name: 'Triodos Climate & Nature Fund',
    emoji: '🌿',
    focus: 'Resources',
    risk: 'high',
    minHorizonYears: 10,
    description: 'Invests in solutions to the dual crises of climate change and nature loss — biodiversity, forests, sustainable land use and restoration.',
    tags: ['climate', 'nature', 'biodiversity', 'forest', 'environment', 'green', 'planet'],
  },
  {
    id: 'global-equities',
    name: 'Triodos Global Equities Impact Fund',
    emoji: '🌍',
    focus: 'Mixed',
    risk: 'high',
    minHorizonYears: 7,
    description: 'Globally diversified equity fund investing in listed companies with a proven positive impact on people and planet across all sectors.',
    tags: ['global', 'stocks', 'diversified', 'growth', 'equities', 'worldwide'],
  },
  {
    id: 'sustainable-equity',
    name: 'Triodos Sustainable Equity Fund',
    emoji: '📊',
    focus: 'Mixed',
    risk: 'high',
    minHorizonYears: 7,
    description: 'Listed equities in companies committed to sustainability across all sectors, with rigorous ESG screening and active stewardship.',
    tags: ['equity', 'stocks', 'sustainable', 'growth', 'esg', 'shares'],
  },
  {
    id: 'impact-equity',
    name: 'Triodos Impact Equity Fund',
    emoji: '💡',
    focus: 'Mixed',
    risk: 'high',
    minHorizonYears: 7,
    description: 'Concentrates on listed companies with a clear and measurable positive impact strategy, going beyond ESG integration to genuine change.',
    tags: ['impact', 'equity', 'growth', 'measurable', 'change', 'positive'],
  },
  {
    id: 'impact-mixed',
    name: 'Triodos Impact Mixed Fund',
    emoji: '⚖️',
    focus: 'Mixed',
    risk: 'medium',
    minHorizonYears: 5,
    description: 'A balanced blend of impact bonds and equities, suitable for investors seeking moderate risk with meaningful real-world outcomes.',
    tags: ['balanced', 'mixed', 'moderate', 'diversified', 'bond', 'equity'],
  },
  {
    id: 'sustainable-mixed',
    name: 'Triodos Sustainable Mixed Fund',
    emoji: '🔀',
    focus: 'Mixed',
    risk: 'medium',
    minHorizonYears: 5,
    description: 'Blends sustainable bonds and equities in a dynamic allocation, designed to balance long-term growth with downside stability.',
    tags: ['mixed', 'balanced', 'sustainable', 'moderate', 'blend'],
  },
  {
    id: 'impact-bond',
    name: 'Triodos Impact Bond Fund',
    emoji: '📈',
    focus: 'Mixed',
    risk: 'low',
    minHorizonYears: 5,
    description: 'Invests in green and social bonds issued by governments, institutions and companies with a genuine and verifiable impact mission.',
    tags: ['bonds', 'stable', 'income', 'conservative', 'low-risk', 'fixed'],
  },
  {
    id: 'sustainable-bond',
    name: 'Triodos Sustainable Bond Fund',
    emoji: '🔒',
    focus: 'Mixed',
    risk: 'low',
    minHorizonYears: 5,
    description: 'A portfolio of sustainable bonds across sectors and geographies, focused on capital preservation with steady socially responsible returns.',
    tags: ['bonds', 'sustainable', 'conservative', 'income', 'capital', 'preserve'],
  },
  {
    id: 'euro-bond',
    name: 'Triodos Euro Bond Impact Fund',
    emoji: '🏛️',
    focus: 'Society',
    risk: 'low',
    minHorizonYears: 5,
    description: 'Focuses on euro-denominated bonds with strong ESG credentials, offering reliable returns with measurable social and environmental impact.',
    tags: ['euro', 'bonds', 'europe', 'stable', 'income', 'steady'],
  },
  {
    id: 'sterling-bond',
    name: 'Triodos Sterling Bond Impact Fund',
    emoji: '🇬🇧',
    focus: 'Mixed',
    risk: 'low',
    minHorizonYears: 5,
    description: 'GBP-denominated impact bonds, investing in organisations and projects that create measurable positive outcomes for people and planet.',
    tags: ['sterling', 'uk', 'bonds', 'stable', 'gbp', 'british'],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

export const RISK_LABELS: Record<RiskLevel, string> = {
  low:          'Low',
  medium:       'Medium',
  'medium-high': 'Medium-high',
  high:         'High',
};

export const RISK_COLORS: Record<RiskLevel, string> = {
  low:           '#5A7A35',
  medium:        '#B08A00',
  'medium-high': '#C06420',
  high:          '#B83030',
};

export const RISK_BG: Record<RiskLevel, string> = {
  low:           '#EEF5E8',
  medium:        '#FDF7E3',
  'medium-high': '#FBF0E6',
  high:          '#FBEAEA',
};

/** Keyword-based fallback when no API key is configured */
export function recommendFundByKeyword(
  goalName: string,
  purpose: string,
  timeHorizonMonths: number,
): TriodosFund {
  const text = `${goalName} ${purpose}`.toLowerCase();
  const minYears = timeHorizonMonths / 12;

  // Filter to funds whose minimum horizon fits
  const eligible = TRIODOS_FUNDS.filter(f => f.minHorizonYears <= minYears * 1.1);

  let best = eligible[0] ?? TRIODOS_FUNDS[11]; // impact-mixed as safe default
  let bestScore = -1;

  for (const fund of eligible) {
    let score = 0;
    for (const tag of fund.tags) {
      if (text.includes(tag)) score++;
    }
    if (score > bestScore) { bestScore = score; best = fund; }
  }

  // If no keyword matched, fall back to risk-appropriate defaults
  if (bestScore === 0) {
    if (minYears >= 10) best = eligible.find(f => f.id === 'future-generations') ?? best;
    else if (minYears >= 7) best = eligible.find(f => f.id === 'global-equities') ?? best;
    else best = eligible.find(f => f.id === 'impact-mixed') ?? best;
  }

  return best;
}
