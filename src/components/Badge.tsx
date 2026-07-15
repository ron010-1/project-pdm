import { StyleSheet, Text, View } from 'react-native';
import { fontSizes, fontWeights, radii, spacing, statusColors, StatusVariant } from '../theme';

export function Badge({ label, variant }: { label: string; variant: StatusVariant }) {
  const { text, background } = statusColors[variant];

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    borderRadius: radii.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    letterSpacing: 0.3,
  },
});
