export const typography = {
  fontFamily: {
    sans: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace', // For logs, IDs, metrics
  },
  
  fontSize: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    base: '1rem',    // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  lineHeight: {
    none: '1',
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.625',
  },
  
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  },
  
  // Semantic Type Scale
  display: {
    fontSize: '2.25rem',
    fontWeight: '700',
    lineHeight: '1.2',
    letterSpacing: '-0.025em',
  },
  heading: {
    fontSize: '1.5rem',
    fontWeight: '600',
    lineHeight: '1.3',
  },
  subheading: {
    fontSize: '1.125rem',
    fontWeight: '600',
    lineHeight: '1.4',
  },
  body: {
    fontSize: '1rem',
    fontWeight: '400',
    lineHeight: '1.5',
  },
  caption: {
    fontSize: '0.875rem',
    fontWeight: '500',
    lineHeight: '1.4',
  },
  code: {
    fontSize: '0.875rem',
    fontWeight: '400',
    fontFamily: 'mono',
  },
};

export type TypographyScale = typeof typography;