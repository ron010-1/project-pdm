export const fontSizes = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 16,
  lg: 20,
  xl: 24,
};

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const typography = {
  h1: { fontSize: fontSizes.xl, fontWeight: fontWeights.bold },
  h2: { fontSize: fontSizes.lg, fontWeight: fontWeights.bold },
  h3: { fontSize: fontSizes.base, fontWeight: fontWeights.semibold },
  body: { fontSize: fontSizes.base, fontWeight: fontWeights.regular },
  bodyMedium: { fontSize: fontSizes.base, fontWeight: fontWeights.medium },
  label: { fontSize: fontSizes.sm, fontWeight: fontWeights.regular },
  caption: { fontSize: fontSizes.xs, fontWeight: fontWeights.regular },
};
