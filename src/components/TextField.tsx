import { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSizes, fontWeights, radii, spacing } from '../theme';
import ErrorIcon from '../../assets/error_icon.svg';

type TextFieldProps = TextInputProps & {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  secure?: boolean;
  error?: string;
};

export function TextField({ label, icon, secure, error, style, multiline, ...inputProps }: TextFieldProps) {
  const [hidden, setHidden] = useState(!!secure);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, multiline && styles.inputRowMultiline, !!error && styles.inputRowError]}>
        {icon && <Ionicons name={icon} size={18} color={colors.textSecondary} style={styles.icon} />}
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline, style]}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={hidden}
          multiline={multiline}
          {...inputProps}
        />
        {secure && (
          <Pressable onPress={() => setHidden((prev) => !prev)} hitSlop={8}>
            <Ionicons name={hidden ? 'eye-off' : 'eye'} size={18} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>
      {!!error && (
        <View style={styles.errorContainer}>
          <ErrorIcon width={11} height={11} style={styles.errorIcon} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: colors.inputStroke,
  },
  inputRowMultiline: {
    height: 'auto',
    minHeight: 80,
    alignItems: 'flex-start',
  },
  inputRowError: {
    borderWidth: 1,
    borderColor: colors.dangerBorder,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSizes.base,
    color: colors.textPrimary,
  },
  inputMultiline: {
    textAlignVertical: 'top',
    paddingVertical: 0,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  errorIcon: {
    marginRight: spacing.xs,
    alignSelf: 'center',
  },
  errorText: {
    fontSize: fontSizes.sm,
    color: colors.danger,
  },
});