/**
 * Premium design system — clean, minimal, iOS-first
 */

export const colors = {
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#E8E8ED',
  borderLight: '#F0F0F5',

  text: '#1C1C1E',
  textSecondary: '#636366',
  textTertiary: '#8E8E93',

  primary: '#0A7EA4',
  primaryLight: '#E8F4F8',
  onPrimary: '#FFFFFF',

  success: '#34C759',
  warning: '#FF9F0A',
  error: '#FF3B30',

  accent: '#5E5CE6',
  accentLight: '#F2F1FC',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const typography = {
  largeTitle: { fontSize: 34, fontWeight: '700' as const },
  title1: { fontSize: 28, fontWeight: '700' as const },
  title2: { fontSize: 22, fontWeight: '700' as const },
  title3: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 17, fontWeight: '400' as const },
  bodyBold: { fontSize: 17, fontWeight: '600' as const },
  callout: { fontSize: 16, fontWeight: '400' as const },
  subhead: { fontSize: 15, fontWeight: '400' as const },
  footnote: { fontSize: 13, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
} as const;
