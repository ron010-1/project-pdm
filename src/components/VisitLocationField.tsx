import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSizes, radii, spacing } from '../theme';
import { VisitLocationModal, VisitaLocation } from './VisitLocationModal';

type Props = {
  value: VisitaLocation | null;
  onChange: (location: VisitaLocation) => void;
  error?: string | null;
};

export function VisitLocationField({ value, onChange, error }: Props) {
  const [pickerVisible, setPickerVisible] = require('react').useState(false);

  return (
    <>
      <View style={[styles.card, error && styles.cardError]}>
        <View style={styles.info}>
          <Text style={styles.title}>Localização da visita</Text>
          <Text style={value ? styles.address : styles.subtitle} numberOfLines={2}>
            {value
              ? value.endereco ?? `${value.latitude.toFixed(5)}, ${value.longitude.toFixed(5)}`
              : 'Obrigatória'}
          </Text>
        </View>
        <Pressable style={styles.button} onPress={() => setPickerVisible(true)}>
          <Ionicons name="location-outline" size={16} color={colors.textPrimary} />
          <Text style={styles.buttonText}>{value ? 'Editar' : 'Obter'}</Text>
        </Pressable>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <VisitLocationModal
        visible={pickerVisible}
        initialLocation={value}
        onClose={() => setPickerVisible(false)}
        onSave={(location) => {
          onChange(location);
          setPickerVisible(false);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardError: {
    borderColor: colors.dangerBorder,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  address: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  buttonText: {
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
  },
  errorText: {
    fontSize: fontSizes.sm,
    color: colors.danger,
    marginTop: -spacing.md,
    marginBottom: spacing.lg,
  },
});