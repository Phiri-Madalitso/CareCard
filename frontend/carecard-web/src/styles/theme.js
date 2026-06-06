/** Felles designtokens — inspirert av rolig, tillitsvekkende helse-UI */

export const colors = {
  primary: '#207383',
  primaryDark: '#185A67',
  primaryHover: '#1A6574',
  primaryLight: '#C5E8EC',
  primaryMuted: '#B8DDE3',
  background: '#D4EEF1',
  surface: '#FFFFFF',
  surfaceSoft: '#F8FAFB',
  text: '#13171F',
  textMuted: '#5A6473',
  textSubtle: '#8B95A5',
  border: '#D5DDE3',
  borderLight: '#E8ECEF',
  link: '#185FA5',
  alertRedBg: '#FCEBEB',
  alertRedText: '#A32D2D',
  alertYellowBg: '#FAEEDA',
  alertYellowText: '#854F0B',
  successBg: '#E6F4EA',
};

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const layout = {
  maxWidth: 560,
  maxWidthWide: 720,
  navbarHeight: 72,
};

export const typography = {
  fontFamily: "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

export const shadows = {
  sm: '0 1px 3px rgba(19, 23, 31, 0.06)',
  card: '0 2px 12px rgba(19, 23, 31, 0.07)',
  elevated: '0 8px 32px rgba(19, 23, 31, 0.1)',
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const pageShell = {
  minHeight: '100vh',
  backgroundColor: colors.background,
  fontFamily: typography.fontFamily,
};

export const pageContent = {
  maxWidth: layout.maxWidth,
  margin: '0 auto',
  padding: `${spacing.lg}px ${spacing.lg}px ${spacing.xxl}px`,
  boxSizing: 'border-box',
};

export const pageContentWide = {
  ...pageContent,
  maxWidth: layout.maxWidthWide,
};

export const card = {
  backgroundColor: colors.surface,
  border: `1px solid ${colors.borderLight}`,
  borderRadius: radii.lg,
  boxShadow: shadows.card,
};

export const cardInteractive = {
  ...card,
  cursor: 'pointer',
  transition: 'box-shadow 0.2s ease, border-color 0.2s ease, transform 0.15s ease',
};

export const inputBase = {
  width: '100%',
  padding: '14px 16px 14px 44px',
  fontSize: 16,
  lineHeight: 1.5,
  border: `1px solid ${colors.border}`,
  borderRadius: radii.md,
  backgroundColor: colors.surface,
  color: colors.text,
  fontFamily: typography.fontFamily,
  boxSizing: 'border-box',
  outline: 'none',
};

export const btnPrimary = {
  padding: '16px 28px',
  fontSize: 16,
  fontWeight: 600,
  color: '#fff',
  backgroundColor: colors.primary,
  border: 'none',
  borderRadius: radii.md,
  fontFamily: typography.fontFamily,
  cursor: 'pointer',
  lineHeight: 1.4,
};

export const topBar = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: spacing.lg,
  paddingTop: spacing.sm,
};

export const sectionTitle = {
  fontSize: 22,
  fontWeight: 700,
  color: colors.text,
  margin: `0 0 ${spacing.md}px`,
  lineHeight: 1.3,
};
