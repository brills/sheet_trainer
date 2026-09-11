/**
 * Semantic Theme Tokens & Design System
 * Decouples styling and presentation from business logic and domain theory.
 */

export const THEME_COLORS = {
  // Base backgrounds
  canvas: '#f7f4ee',
  card: '#fcfbfa',
  panel: '#eee9df',
  panelElevated: '#e4ddcf',
  backdrop: 'rgba(43, 38, 32, 0.45)',

  // Borders
  borderSubtle: '#ddd6c8',
  borderStrong: '#c8bfaa',

  // Typography
  textPrimary: '#38332d',
  textMuted: '#6b6358',
  textDim: '#8a8275',

  // Accents (Amber / Conservatory)
  accent: '#8c531b',
  accentTint: '#f5ede1',
  accentBorder: '#d4bda8',

  // State colors (Botanical Olive & Laurel)
  success: '#485c3b',
  successTint: '#edf2ea',
  successBorder: '#c2d3ba',

  error: '#9c382e',
  errorTint: '#fbeeed',
  errorBorder: '#e2bdb8',

  // Stave & Notation
  staveLine: '#635b50',
  notehead: '#38332d'
} as const;

/**
 * Standard semantic Tailwind class combinations for common UI elements.
 */
export const THEME_CLASSES = {
  // Page container
  pageContainer: 'min-h-screen bg-theme-canvas text-theme-primary flex flex-col font-sans selection:bg-theme-accent-tint selection:text-theme-primary',

  // Cards and Panels
  card: 'bg-theme-card border border-theme-border rounded-2xl shadow-sm',
  panel: 'bg-theme-panel border border-theme-border rounded-2xl',
  modalBackdrop: 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-theme-backdrop backdrop-blur-sm animate-in fade-in',
  modalCard: 'relative w-full rounded-3xl bg-theme-canvas border border-theme-border shadow-2xl overflow-hidden',

  // Buttons
  buttonDefault: 'bg-theme-card border border-theme-border text-theme-primary hover:bg-theme-accent-tint hover:border-theme-accent-border hover:text-theme-accent transition-all cursor-pointer',
  buttonActive: 'bg-theme-accent-tint text-theme-accent border border-theme-accent-border font-bold shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]',
  buttonSubtle: 'bg-theme-panel border border-theme-border text-theme-muted hover:text-theme-primary hover:bg-theme-panelElevated transition-all cursor-pointer',

  // Keypad & HUD key chips
  keyChipDefault: 'bg-theme-card border border-theme-border text-theme-primary',
  keyChipActive: 'bg-theme-accent-tint text-theme-accent border border-theme-accent-border font-bold shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]',

  // Status Badges
  badgeSuccess: 'bg-theme-success-tint text-theme-success border border-theme-success-border font-semibold',
  badgeActive: 'bg-theme-accent-tint text-theme-accent border border-theme-accent-border font-semibold',
  badgeMuted: 'bg-theme-panel border border-theme-border text-theme-muted',
  badgeError: 'bg-theme-error-tint text-theme-error border border-theme-error-border font-semibold',

  // Typography helpers
  serifHeading: 'font-serif font-bold text-theme-primary',
  mutedSubtext: 'text-xs text-theme-muted font-sans',
  monoLabel: 'font-mono text-xs text-theme-dim'
} as const;
