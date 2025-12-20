import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
// import { spacing } from '../theme/spacing';

type Props = {
  value: string;
  options: string[];
  onChange: (nextValue: string) => void;
};

export function SegmentedControl({ value, options, onChange }: Props) {
  return (
    <View style={styles.container}>
      {options.map(option => {
        const isSelected = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[styles.item, isSelected ? styles.selectedItem : null]}
          >
            <Text
              style={[styles.text, isSelected ? styles.selectedText : null]}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  item: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedItem: { backgroundColor: colors.background },
  text: { color: colors.mutedText, fontWeight: '900', fontSize: 13 },
  selectedText: { color: colors.text },
});
