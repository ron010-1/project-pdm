export const colors = {
  background: '#fcfbf8',
  surface: '#ffffff',
  border: '#e0e5eb',

  textPrimary: '#0b1c2c',
  textSecondary: '#5b646f',
  textInverse: '#fcfcfc',

  primary: '#0b60b2',
  primaryMuted: 'rgba(11, 96, 178, 0.1)',

  success: '#03a14a',
  successMuted: 'rgba(3, 161, 74, 0.15)',

  warning: '#efa831',
  warningMuted: 'rgba(239, 168, 49, 0.15)',

  danger: '#e94242',
  dangerBorder: '#ff383c',
  dangerBackground: '#fce9e9',

  statTileBackground: '#ecf3f8',
  inputBackground: '#eeeeee',
};

export type StatusVariant = 'ativo' | 'alerta' | 'finalizado' | 'realizada';

export const statusColors: Record<StatusVariant, { text: string; background: string }> = {
  ativo: { text: colors.primary, background: colors.primaryMuted },
  alerta: { text: colors.warning, background: colors.warningMuted },
  finalizado: { text: colors.textSecondary, background: '#f1f2f4' },
  realizada: { text: colors.success, background: colors.successMuted },
};
