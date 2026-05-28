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

export type GoalAccount = {
  id: string;
  name: string;
  iconKey: GoalIconKey;
  targetAmount: number;
  balance: number;
  parentAccountId: string;
  purpose?: string;
  transition?: TriodosTransition;
  completedAt?: string;
  monthlyDeposit?: number;
  goalType: 'saving' | 'investing';
  timeHorizonMonths?: number;
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
  sublabel?: string;
  amount: number;
  date: string;
  type: 'credit' | 'debit';
  icon?: string;
};
