'use client';

import type { GoalIconKey } from '@/lib/types';

// ── Brand colour assignments per category ─────────────────────────────────────
export const ICON_BG: Record<GoalIconKey, string> = {
  home:      '#004B32',
  pet:       '#98D39A',
  travel:    '#8074FF',
  health:    '#C2CBFA',
  gift:      '#DFFF57',
  education: '#8074FF',
  bike:      '#98D39A',
  car:       '#004B32',
  holiday:   '#DFFF57',
  garden:    '#98D39A',
  tools:     '#F3EDE4',
  safety:    '#C2CBFA',
  train:     '#8074FF',
  other:     '#F3EDE4',
};

export const ICON_FG: Record<GoalIconKey, string> = {
  home:      '#DFFF57',
  pet:       '#004B32',
  travel:    '#FFFFFF',
  health:    '#8074FF',
  gift:      '#004B32',
  education: '#FFFFFF',
  bike:      '#004B32',
  car:       '#DFFF57',
  holiday:   '#004B32',
  garden:    '#004B32',
  tools:     '#004B32',
  safety:    '#8074FF',
  train:     '#FFFFFF',
  other:     '#004B32',
};

// ── SVG paths per icon (24 × 24 viewBox, stroke-based) ───────────────────────
function IconPaths({ k, color }: { k: GoalIconKey; color: string }) {
  const s = { stroke: color, fill: 'none', strokeWidth: 1.85, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  switch (k) {
    case 'home':
      return (
        <g {...s}>
          <path d="M3 11L12 3l9 8" />
          <path d="M5 11v9h14v-9" />
          <path d="M10 20v-5h4v5" />
          {/* small leaf detail on roof */}
          <path d="M15 7c1-2 3-1.5 2.5 0S15 8.5 15 7z" />
        </g>
      );

    case 'pet':
      // Paw — filled circles, no stroke
      return (
        <g fill={color} stroke="none">
          <ellipse cx="12" cy="16" rx="4.2" ry="3.2" />
          <circle cx="7"  cy="11" r="2.1" />
          <circle cx="12" cy="9.2" r="2.1" />
          <circle cx="17" cy="11" r="2.1" />
        </g>
      );

    case 'travel':
      return (
        <g {...s}>
          {/* Suitcase body */}
          <rect x="5" y="10" width="14" height="11" rx="2" />
          {/* Handle */}
          <path d="M9 10V8a3 3 0 016 0v2" />
          {/* Strap */}
          <line x1="5" y1="15.5" x2="19" y2="15.5" />
          {/* Lock */}
          <rect x="10.5" y="13.5" width="3" height="2.5" rx="0.8" />
        </g>
      );

    case 'health':
      return (
        <g {...s}>
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
          {/* Small leaf inside heart */}
          <path d="M12 11c0 0-1-2 0-3s2 0 2 2-2 1-2 1z" />
        </g>
      );

    case 'gift':
      return (
        <g {...s}>
          <rect x="3" y="11" width="18" height="10" rx="1.5" />
          <rect x="3" y="8"  width="18" height="3"  rx="1.5" />
          <line x1="12" y1="8" x2="12" y2="21" />
          {/* Bow loops */}
          <path d="M12 8c0 0-2.5-5-5-3s5 3 5 3z" />
          <path d="M12 8c0 0  2.5-5  5-3s-5 3-5 3z" />
        </g>
      );

    case 'education':
      return (
        <g {...s}>
          {/* Mortarboard brim */}
          <polygon points="12,3.5 22,8.5 12,13.5 2,8.5" />
          {/* Body below */}
          <path d="M7 11v5.5c0 2 2.2 3 5 3s5-1 5-3V11" />
          {/* Tassel */}
          <line x1="22" y1="8.5" x2="22" y2="13.5" />
          <path d="M20 14l2-0.5" />
        </g>
      );

    case 'bike':
      return (
        <g {...s}>
          <circle cx="6.5"  cy="16.5" r="3.8" />
          <circle cx="17.5" cy="16.5" r="3.8" />
          {/* Main frame */}
          <polyline points="6.5,16.5 11.5,7.5 17.5,16.5" />
          {/* Seat post + saddle */}
          <line x1="11.5" y1="7.5" x2="9.5" y2="5.5" />
          <line x1="8"    y1="5.5" x2="11"  y2="5.5" />
          {/* Handlebar */}
          <line x1="17.5" y1="16.5" x2="15.5" y2="7.5" />
          <line x1="14"   y1="7.5"  x2="17"   y2="7.5" />
        </g>
      );

    case 'car':
      return (
        <g {...s}>
          {/* Lower body */}
          <path d="M2 14h20v4a1 1 0 01-1 1H3a1 1 0 01-1-1v-4z" />
          {/* Cabin */}
          <path d="M5 14l2.5-5h9L19 14" />
          {/* Wheels */}
          <circle cx="7.5"  cy="19" r="2" />
          <circle cx="16.5" cy="19" r="2" />
          {/* EV indicator (small lightning) */}
          <path d="M11 10.5l-1 2h2l-1 2" strokeWidth={1.4} />
        </g>
      );

    case 'holiday':
      return (
        <g {...s}>
          <circle cx="12" cy="10" r="4" />
          <line x1="12" y1="2" x2="12" y2="4.5" />
          <line x1="12" y1="15.5" x2="12" y2="18" />
          <line x1="2.5"  y1="10" x2="5"   y2="10" />
          <line x1="19"   y1="10" x2="21.5" y2="10" />
          <line x1="5.22" y1="4.22"  x2="7.04" y2="6.04" />
          <line x1="16.96" y1="13.96" x2="18.78" y2="15.78" />
          <line x1="18.78" y1="4.22"  x2="16.96" y2="6.04" />
          <line x1="7.04"  y1="13.96" x2="5.22"  y2="15.78" />
          {/* Wave below */}
          <path d="M4 21c1.5-2 3-2 4.5 0s3 2 4.5 0 3-2 4.5 0 3 2 4.5 0" strokeWidth={1.6} />
        </g>
      );

    case 'garden':
      return (
        <g {...s}>
          <line x1="12" y1="21" x2="12" y2="10" />
          {/* Left leaf */}
          <path d="M12 17C9 14 5 14.5 5 17s5.5 3.5 7-.5" />
          {/* Right leaf */}
          <path d="M12 13C15 10 19 10.5 19 13s-5.5 3.5-7-.5" />
          {/* Soil */}
          <path d="M7.5 21h9" />
        </g>
      );

    case 'tools':
      return (
        <g {...s}>
          <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
        </g>
      );

    case 'safety':
      return (
        <g {...s}>
          <path d="M12 2L4 6v6c0 5.5 3.5 10 8 12 4.5-2 8-6.5 8-12V6l-8-4z" />
          {/* Leaf inside shield */}
          <path d="M12 10c-1 0-3 1.5-3 3.5s3 3.5 3 3.5 3-1.5 3-3.5-2-3.5-3-3.5z" />
          <line x1="12" y1="10" x2="12" y2="17" />
        </g>
      );

    case 'other':
      return (
        <g {...s}>
          {/* Four-pointed sparkle */}
          <path d="M12 2l1.8 8.2L22 12l-8.2 1.8L12 22l-1.8-8.2L2 12l8.2-1.8z" />
        </g>
      );

    default:
      return null;
  }
}

// ── GoalIconBadge — coloured background + icon (for pickers, lists, sheets) ──
export function GoalIconBadge({
  iconKey,
  size = 44,
  selected = false,
}: {
  iconKey: GoalIconKey;
  size?: number;
  selected?: boolean;
}) {
  const bg = ICON_BG[iconKey];
  const fg = ICON_FG[iconKey];
  const r  = size * 0.28;

  return (
    <div
      style={{
        width: size, height: size,
        borderRadius: r,
        backgroundColor: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: selected ? `0 0 0 2.5px ${bg}, 0 0 0 4.5px ${fg}` : 'none',
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24">
        <IconPaths k={iconKey} color={fg} />
      </svg>
    </div>
  );
}

// ── GoalIconRaw — just the SVG, no background (for inside bubbles) ────────────
export function GoalIconRaw({
  iconKey,
  size,
  color,
}: {
  iconKey: GoalIconKey;
  size: number;
  color: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <IconPaths k={iconKey} color={color} />
    </svg>
  );
}
