import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../styles/theme';

interface SegmentedControlProps {
  tabs: string[];
  selectedIndex: number;
  onTabChange: (index: number) => void;
}

export default function SegmentedControl({
  tabs,
  selectedIndex,
  onTabChange,
}: SegmentedControlProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => {
        const isSelected = index === selectedIndex;
        return (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, isSelected && styles.tabSelected]}
            onPress={() => onTabChange(index)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, isSelected && styles.tabTextSelected]}>
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
  },
  tabSelected: {
    backgroundColor: colors.background,
  },
  tabText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  tabTextSelected: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
});
