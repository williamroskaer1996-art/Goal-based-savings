export type GoalIconKey =
  | 'home'
  | 'pet'
  | 'travel'
  | 'health'
  | 'gift'
  | 'education'
  | 'bike'
  | 'car'
  | 'holiday'
  | 'garden'
  | 'tools'
  | 'safety'
  | 'train'
  | 'other';

export const GOAL_ICONS: Record<GoalIconKey, { label: string; emoji: string }> = {
  home:      { label: 'Home',      emoji: '🏠' },
  pet:       { label: 'Pet',       emoji: '🐾' },
  travel:    { label: 'Travel',    emoji: '🧳' },
  health:    { label: 'Health',    emoji: '❤️' },
  gift:      { label: 'Gift',      emoji: '🎁' },
  education: { label: 'Education', emoji: '🎓' },
  bike:      { label: 'Bike',      emoji: '🚲' },
  car:       { label: 'Car',       emoji: '🚗' },
  holiday:   { label: 'Holiday',   emoji: '✈️' },
  garden:    { label: 'Garden',    emoji: '🌿' },
  tools:     { label: 'Tools',     emoji: '🔧' },
  safety:    { label: 'Safety',    emoji: '🛡️' },
  train:     { label: 'Train',     emoji: '🚆' },
  other:     { label: 'Other',     emoji: '⭐' },
};

export type TriodosTransition = 'food' | 'resources' | 'energy' | 'society' | 'wellbeing';

export type TransitionInfo = {
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
};

export const TRIODOS_TRANSITIONS: Record<TriodosTransition, TransitionInfo> = {
  food: {
    label: 'Food',
    emoji: '🌾',
    color: '#5A7A35',
    bgColor: '#EEF5E8',
    description: 'This goal supports the transition to sustainable food systems that nourish people and the planet.',
  },
  resources: {
    label: 'Resources',
    emoji: '♻️',
    color: '#B06820',
    bgColor: '#FBF0E6',
    description: 'This goal contributes to a circular economy where materials are used responsibly and waste is minimised.',
  },
  energy: {
    label: 'Energy',
    emoji: '⚡',
    color: '#B08A00',
    bgColor: '#FDF7E3',
    description: 'This goal supports the shift toward renewable energy and greater household energy independence.',
  },
  society: {
    label: 'Society',
    emoji: '🤝',
    color: '#3A6F95',
    bgColor: '#E8F2FA',
    description: 'This goal strengthens community connections, equity, and access to essential services for all.',
  },
  wellbeing: {
    label: 'Wellbeing',
    emoji: '🌿',
    color: '#6B5FD4',
    bgColor: '#F0EEFF',
    description: 'This goal supports personal wellbeing, helping you invest in rest, health, and quality of life.',
  },
};

// ── Auto-transition mapping ───────────────────────────────────────────────────
// Each goal icon is automatically assigned to one of the five Triodos transitions.
export const ICON_TRANSITION: Record<GoalIconKey, TriodosTransition> = {
  home:      'energy',    // home improvements, insulation, solar
  tools:     'energy',    // repairs, energy-efficient upgrades
  car:       'energy',    // electric vehicles
  bike:      'resources', // sustainable mobility, circular economy
  travel:    'resources', // conscious travel choices
  garden:    'food',      // growing food, nature connection
  pet:       'wellbeing', // care and companionship
  health:    'wellbeing', // personal health and vitality
  holiday:   'wellbeing', // rest and renewal
  education: 'society',   // learning, access to knowledge
  gift:      'society',   // generosity and connection
  safety:    'society',   // security, community care
  train:     'resources', // low-carbon travel, circular mobility
  other:     'society',   // default
};

// ── Partnerships ──────────────────────────────────────────────────────────────
export type Partnership = {
  id: string;
  name: string;
  tagline: string;
  discount: string;
  description: string;
  emoji: string;
  categories: GoalIconKey[];
  transition: TriodosTransition;
  suggested: {
    goalName: string;
    amount: number;
    purpose: string;
  };
};

export const PARTNERSHIPS: Partnership[] = [
  {
    id: 'solarnl',
    name: 'SolarCity NL',
    tagline: 'Solar panels & installation',
    discount: '8% off',
    description: 'Get 8% off a full solar panel installation when you reach your savings goal. Triodos verified sustainable supplier.',
    emoji: '☀️',
    categories: ['home', 'garden', 'tools'],
    transition: 'energy',
    suggested: {
      goalName: 'Solar panels',
      amount: 8000,
      purpose: 'Become energy independent at home',
    },
  },
  {
    id: 'babbel',
    name: 'Babbel',
    tagline: 'Online language courses',
    discount: '20% off',
    description: '20% off any Babbel subscription — English, Spanish, German and 12 more languages. Learn at your own pace.',
    emoji: '🗣️',
    categories: ['education', 'travel', 'holiday'],
    transition: 'society',
    suggested: {
      goalName: 'Language course',
      amount: 150,
      purpose: 'Learn a new language and connect with more people',
    },
  },
  {
    id: 'gazelle',
    name: 'Gazelle E-bikes',
    tagline: 'Dutch electric bikes',
    discount: '10% off + free helmet',
    description: '10% off your Gazelle e-bike and a free helmet (€89 value). Use your goal savings directly in-store.',
    emoji: '⚡',
    categories: ['bike', 'travel'],
    transition: 'resources',
    suggested: {
      goalName: 'Gazelle e-bike',
      amount: 2500,
      purpose: 'Get around sustainably without a car',
    },
  },
  {
    id: 'fairphone',
    name: 'Fairphone',
    tagline: 'Ethical & repairable smartphones',
    discount: '15% off',
    description: '15% off any Fairphone smartphone. Built to last, easy to repair, and made with fair materials — the sustainable choice in tech.',
    emoji: '📱',
    categories: ['tools', 'other', 'education'],
    transition: 'resources',
    suggested: {
      goalName: 'Fairphone',
      amount: 600,
      purpose: 'Replace my phone with a sustainable, repairable alternative',
    },
  },
  {
    id: 'patagonia',
    name: 'Patagonia',
    tagline: 'Sustainable outdoor clothing',
    discount: '20% off',
    description: '20% off Patagonia winter jackets and outerwear. Made to last, repaired for free, and 1% of revenue goes to environmental causes.',
    emoji: '🧥',
    categories: ['holiday', 'travel', 'health', 'other'],
    transition: 'wellbeing',
    suggested: {
      goalName: 'Winter jacket',
      amount: 350,
      purpose: 'Invest in quality outerwear that lasts for years',
    },
  },
];

export type GoalAccount = {
  id: string;
  name: string;
  iconKey: GoalIconKey;
  targetAmount: number;
  balance: number;
  parentAccountId: string;
  purpose?: string;
  transition?: TriodosTransition;
  partnershipId?: string;
  completedAt?: string;
  monthlyDeposit?: number;
  /** 'saving' (default) or 'investing' */
  goalType?: 'saving' | 'investing';
};

export type Account = {
  id: string;
  ownerName: string;
  iban: string;
  balance: number;
  type: 'savings' | 'checking' | 'investment';
};

export type Transaction = {
  id: string;
  label: string;
  amount: number;
  date: string;
  type: 'credit' | 'debit';
};
