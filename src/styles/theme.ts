interface Colors {
  primary: string;
  primaryLight: string;
  secondary: string;
  background: string;
  surface: string;
  accent: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  info: string;
  danger: string;
  white: string;
}

interface Fonts {
  regular: string;
  medium: string;
  bold: string;
}

interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

interface BorderRadius {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

interface ShadowStyle {
  shadowColor: string;
  shadowOffset: {
    width: number;
    height: number;
  };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

interface Shadows {
  light: ShadowStyle;
  medium: ShadowStyle;
}

interface Theme {
  colors: Colors;
  fonts: Fonts;
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadows: Shadows;
}

export const theme: Theme = {
  colors: {
    primary: '#8b4513',
    primaryLight: '#a0522d',
    secondary: '#d2691e',
    background: '#faf8f6',
    surface: '#f7f5f3',
    accent: '#e8ddd4',
    text: '#2c3e50',
    textSecondary: '#5d4e37',
    border: '#d4c4a8',
    success: '#228b22',
    info: '#4682b4',
    danger: '#b22222',
    white: '#ffffff',
  },
  fonts: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 15,
    full: 50,
  },
  shadows: {
    light: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
  },
};