export const colors = {
  // Core Brand Palette - Healthcare Trust & Precision
  brand: {
    primary: '#3B82F6', // Blue-500: Trust, Medical Standard
    primaryHover: '#2563EB', // Blue-600
    secondary: '#10B981', // Emerald-500: Success, Health
    accent: '#8B5CF6', // Violet-500: Intelligence, AI
    danger: '#EF4444', // Red-500: Critical Alerts
    warning: '#F59E0B', // Amber-500: Warnings
    info: '#06B6D4', // Cyan-500: Info
  },
  
  // Enterprise Dark Theme Backgrounds
  bg: {
    main: '#0F172A', // Slate-900: Deep, non-pure black for reduced eye strain
    surface: '#1E293B', // Slate-800: Cards, Panels
    surfaceHover: '#334155', // Slate-700: Interactive states
    elevated: '#475569', // Slate-600: Modals, Overlays
    overlay: 'rgba(15, 23, 42, 0.8)', // Backdrop blur base
  },
  
  // Text Hierarchy
  text: {
    primary: '#F8FAFC', // Slate-50: Main content
    secondary: '#94A3B8', // Slate-400: Labels, Metadata
    muted: '#64748B', // Slate-500: Disabled, Hints
    inverted: '#0F172A', // For light buttons/text on dark
  },
  
  // Borders & Dividers
  border: {
    default: '#334155', // Slate-700
    strong: '#475569', // Slate-600
    subtle: '#1E293B', // Slate-800
    focus: '#3B82F6', // Brand Primary
  },
  
  // Status Indicators (Semantic)
  status: {
    healthy: '#10B981',
    degraded: '#F59E0B',
    critical: '#EF4444',
    unknown: '#64748B',
    processing: '#3B82F6',
  },
  
  // Data Visualization Palette (Distinct, Colorblind Safe)
  chart: [
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#06B6D4', // Cyan
    '#EC4899', // Pink
    '#84CC16', // Lime
  ],
};

export type ColorPalette = typeof colors;