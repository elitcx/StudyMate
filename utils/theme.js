export const lightColors = {
  bg:           '#f8fafc',
  bgCard:       '#ffffff',
  bgElevated:   '#f1f5f9',
  bgInput:      '#f8fafc',
  border:       '#e2e8f0',
  borderFocus:  '#93c5fd',
  accent:       '#0ea5e9',
  accentDark:   '#0284c7',
  accentLight:  '#e0f2fe',
  success:      '#16a34a',
  danger:       '#dc2626',
  warning:      '#d97706',
  white:        '#ffffff',
  text:         '#0f172a',
  textMuted:    '#64748b',
  textFaint:    '#94a3b8',
  admin:        '#7c3aed',
  superadmin:   '#ea580c',
  student:      '#0ea5e9',
};

export const darkColors = {
  bg:           '#0f172a',
  bgCard:       '#1e293b',
  bgElevated:   '#263347',
  bgInput:      '#1e293b',
  border:       '#334155',
  borderFocus:  '#38bdf8',
  accent:       '#38bdf8',
  accentDark:   '#0284c7',
  accentLight:  '#0c4a6e',
  success:      '#4ade80',
  danger:       '#f87171',
  warning:      '#fbbf24',
  white:        '#f8fafc',
  text:         '#e2e8f0',
  textMuted:    '#94a3b8',
  textFaint:    '#64748b',
  admin:        '#a78bfa',
  superadmin:   '#fb923c',
  student:      '#38bdf8',
};

// Backward-compat default export (dark)
export const colors = darkColors;

export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 999,
};

export const fontSize = {
  xs:   11,
  sm:   13,
  md:   15,
  lg:   17,
  xl:   20,
  xxl:  24,
  xxxl: 28,
};

export const fontWeight = {
  regular:  '400',
  medium:   '500',
  semibold: '600',
  bold:     '700',
  black:    '800',
};

export const getShadow = (isDark) => ({
  sm: {
    shadowColor: isDark ? '#000' : '#64748b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.25 : 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: isDark ? '#000' : '#64748b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: isDark ? 0.35 : 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
});

// Legacy export
export const shadow = getShadow(true);
