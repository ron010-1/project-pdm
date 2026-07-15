import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSizes, fontWeights, radii, spacing } from '../theme';

type BarChartItem = {
  label: string;
  value: number;
  color?: string;
};

export function BarChart({ data }: { data: BarChartItem[] }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <View style={styles.container}>
      {data.map((item) => (
        <View key={item.label} style={styles.row}>
          <Text style={styles.label}>{item.label}</Text>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                {
                  width: `${Math.max((item.value / max) * 100, 4)}%`,
                  backgroundColor: item.color ?? colors.primary,
                },
              ]}
            />
          </View>
          <Text style={styles.value}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  label: {
    width: 72,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  track: {
    flex: 1,
    height: 10,
    borderRadius: radii.full,
    backgroundColor: colors.statTileBackground,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radii.full,
  },
  value: {
    width: 28,
    textAlign: 'right',
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
});
