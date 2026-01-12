import { useWindowDimensions } from 'react-native';
import { spacing } from '../styles/theme';

interface ResponsiveSpacing {
  screenPadding: number;
}

export function useResponsiveSpacing(): ResponsiveSpacing {
  const { width } = useWindowDimensions();

  // Base: 375px (iPhone SE) -> 16px padding
  // Scale: add ~4% of width difference
  // Cap at 32px for tablets
  const baseWidth = 375;
  const additional = Math.max(0, (width - baseWidth) * 0.04);

  return {
    screenPadding: Math.min(spacing.md + additional, spacing.xl),
  };
}
