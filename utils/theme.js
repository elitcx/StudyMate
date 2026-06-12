export const lightColors = {
  bg:           '#f4faf6',
  bgCard:       '#ffffff',
  bgElevated:   '#edf7f1',
  bgSubtle:     '#f0f9f4',
  bgInput:      '#f8f9fd',
  border:       '#dde8e2',
  borderFocus:  '#6ee7b7',
  accent:       '#059669',
  accentDark:   '#047857',
  accentLight:  '#d1fae5',
  success:      '#16a34a',
  successLight: '#dcfce7',
  danger:       '#e11d48',
  dangerLight:  '#ffe4e6',
  warning:      '#d97706',
  warningLight: '#fef3c7',
  white:        '#ffffff',
  text:         '#0f172a',
  textMuted:    '#475569',
  textFaint:    '#64748b',
  admin:        '#7c3aed',
  adminLight:   '#f3e8ff',
  superadmin:   '#ea580c',
  student:      '#059669',
};

export const darkColors = {
  bg:           '#0c1a14',
  bgCard:       '#121f18',
  bgElevated:   '#192b21',
  bgSubtle:     '#0f1a13',
  bgInput:      '#121f18',
  border:       '#1f3529',
  borderFocus:  '#6ee7b7',
  accent:       '#34d399',
  accentDark:   '#10b981',
  accentLight:  '#022c22',
  success:      '#86efac',
  successLight: '#14532d',
  danger:       '#fb7185',
  dangerLight:  '#2d0a14',
  warning:      '#fbbf24',
  warningLight: '#2d1a00',
  white:        '#f1f5f9',
  text:         '#e4ede8',
  textMuted:    '#8fa89a',
  textFaint:    '#64748b',
  admin:        '#c084fc',
  adminLight:   '#1e0b36',
  superadmin:   '#fb923c',
  student:      '#34d399',
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
  xxxl: 64,
};

export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 999,
};

export const fontSize = {
  xs:      11,
  sm:      13,
  md:      15,
  lg:      17,
  xl:      20,
  xxl:     24,
  xxxl:    28,
  display: 34,
};

export const fontWeight = {
  regular:  '400',
  medium:   '500',
  semibold: '600',
  bold:     '700',
  black:    '800',
};

export const lineHeight = {
  tight:   1.2,
  normal:  1.5,
  relaxed: 1.65,
};

// Hex opacity suffixes for appending to color strings
export const opacity = {
  tint:   '14',  // ~8%  — icon box backgrounds
  subtle: '26',  // ~15% — badge fills
  soft:   '3d',  // ~24% — hover/active fills
  muted:  '66',  // ~40% — badge borders, disabled states
};

export const getShadow = (isDark) => ({
  sm: {
    shadowColor: isDark ? '#000' : '#1f3529',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.25 : 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: isDark ? '#000' : '#1f3529',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: isDark ? 0.35 : 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
});

export const gradeColor = (percentage, c) =>
  percentage >= 85 ? c.success
  : percentage >= 70 ? c.accent
  : percentage >= 50 ? c.warning
  : c.danger;

// Legacy export
export const shadow = getShadow(true);
