import React, { useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet, Modal, Pressable,
} from 'react-native';
import { useTheme } from '../src/contexts/ThemeContext';
import { spacing, radius, fontSize, fontWeight, getShadow } from '../utils/theme';

// ── Button ────────────────────────────────────────────────────────────────────
export const Button = ({ onPress, label, loading = false, variant = 'primary', style, disabled, icon }) => {
  const { colors, isDark } = useTheme();

  const bg =
    variant === 'primary'   ? colors.accent
    : variant === 'danger'  ? colors.danger
    : variant === 'success' ? colors.success
    : variant === 'admin'   ? colors.admin
    : variant === 'ghost'   ? 'transparent'
    : colors.bgElevated;

  const textColor =
    ['primary', 'danger', 'success', 'admin'].includes(variant) ? colors.white
    : variant === 'ghost' ? colors.accent
    : colors.text;

  const borderStyle =
    variant === 'ghost'     ? { borderWidth: 1, borderColor: colors.accent }
    : variant === 'secondary' ? { borderWidth: 1, borderColor: colors.border }
    : {};

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        btnStyles.btn,
        { backgroundColor: bg, opacity: disabled ? 0.45 : 1 },
        borderStyle,
        isDark ? {} : getShadow(false).sm,
        style,
      ]}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={btnStyles.inner}>
          {icon && <Text style={btnStyles.icon}>{icon}</Text>}
          <Text style={[btnStyles.label, { color: textColor }]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const btnStyles = StyleSheet.create({
  btn: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  inner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: { fontSize: fontSize.md },
  label: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, letterSpacing: 0.2 },
});

// ── Input ─────────────────────────────────────────────────────────────────────
export const Input = ({ label, error, style, containerStyle, ...props }) => {
  const { colors } = useTheme();
  return (
    <View style={[{ marginBottom: spacing.md }, containerStyle]}>
      {label && (
        <Text style={{ color: colors.textMuted, fontSize: fontSize.sm, fontWeight: fontWeight.medium, marginBottom: spacing.xs }}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          {
            backgroundColor: colors.bgInput,
            borderWidth: 1,
            borderColor: error ? colors.danger : colors.border,
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
            paddingVertical: 14,
            color: colors.text,
            fontSize: fontSize.md,
          },
          style,
        ]}
        placeholderTextColor={colors.textFaint}
        selectionColor={colors.accent}
        {...props}
      />
      {error && <Text style={{ color: colors.danger, fontSize: fontSize.xs, marginTop: spacing.xs }}>{error}</Text>}
    </View>
  );
};

// ── Card ──────────────────────────────────────────────────────────────────────
export const Card = ({ children, style, onPress }) => {
  const { colors, isDark } = useTheme();
  const cardStyle = [
    {
      backgroundColor: colors.bgCard,
      borderRadius: radius.lg,
      padding: spacing.md,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
      ...getShadow(isDark).sm,
    },
    style,
  ];
  if (onPress) {
    return <TouchableOpacity onPress={onPress} style={cardStyle} activeOpacity={0.8}>{children}</TouchableOpacity>;
  }
  return <View style={cardStyle}>{children}</View>;
};

// ── Badge ─────────────────────────────────────────────────────────────────────
export const Badge = ({ label, color, size = 'md' }) => {
  const { colors: c } = useTheme();
  const col = color || c.accent;
  return (
    <View style={{
      borderRadius: radius.full,
      backgroundColor: col + '18',
      borderWidth: 1,
      borderColor: col + '44',
      paddingHorizontal: size === 'sm' ? spacing.xs + 2 : spacing.sm,
      paddingVertical: size === 'sm' ? 2 : 4,
      alignSelf: 'flex-start',
    }}>
      <Text style={{ color: col, fontSize: size === 'sm' ? 10 : fontSize.xs, fontWeight: fontWeight.semibold }}>
        {label}
      </Text>
    </View>
  );
};

// ── Section header ────────────────────────────────────────────────────────────
export const SectionHeader = ({ title, action, onAction }) => {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
      <Text style={{ color: colors.text, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={{ color: colors.accent, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ── Empty state ───────────────────────────────────────────────────────────────
export const EmptyState = ({ icon = '📭', title, subtitle, action, onAction }) => {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl, gap: spacing.sm }}>
      <Text style={{ fontSize: 44, marginBottom: spacing.sm }}>{icon}</Text>
      <Text style={{ color: colors.textMuted, fontSize: fontSize.lg, fontWeight: fontWeight.semibold, textAlign: 'center' }}>{title}</Text>
      {subtitle && <Text style={{ color: colors.textFaint, fontSize: fontSize.sm, textAlign: 'center', paddingHorizontal: spacing.xl }}>{subtitle}</Text>}
      {action && (
        <TouchableOpacity
          onPress={onAction}
          style={{ marginTop: spacing.md, backgroundColor: colors.accent + '18', borderRadius: radius.full, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.accent + '44' }}
        >
          <Text style={{ color: colors.accent, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ── Loader ────────────────────────────────────────────────────────────────────
export const Loader = ({ overlay = false }) => {
  const { colors } = useTheme();
  return (
    <View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }, overlay && { ...StyleSheet.absoluteFillObject, backgroundColor: colors.bg + 'cc', zIndex: 100 }]}>
      <ActivityIndicator color={colors.accent} size="large" />
    </View>
  );
};

// ── Divider ───────────────────────────────────────────────────────────────────
export const Divider = ({ style, label }) => {
  const { colors } = useTheme();
  if (label) {
    return (
      <View style={[{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: spacing.md }, style]}>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        <Text style={{ color: colors.textFaint, fontSize: fontSize.xs }}>{label}</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      </View>
    );
  }
  return <View style={[{ height: 1, backgroundColor: colors.border, marginVertical: spacing.md }, style]} />;
};

// ── Stat card ─────────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, icon, color, accent = false }) => {
  const { colors, isDark } = useTheme();
  const col = color || colors.accent;
  return (
    <View style={[
      { backgroundColor: colors.bgCard, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', flex: 1 },
      isDark ? { borderWidth: 1, borderColor: colors.border } : getShadow(false).sm,
      accent && { borderTopWidth: 3, borderTopColor: col },
    ]}>
      {icon && <Text style={{ fontSize: 20, marginBottom: 4 }}>{icon}</Text>}
      <Text style={{ color: col, fontSize: fontSize.xl, fontWeight: fontWeight.black }}>{value}</Text>
      <Text style={{ color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2, textAlign: 'center' }}>{label}</Text>
    </View>
  );
};

// ── Info row ──────────────────────────────────────────────────────────────────
export const InfoRow = ({ label, value, isLast }) => {
  const { colors } = useTheme();
  return (
    <View style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md }, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
      <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>{label}</Text>
      <Text style={{ color: colors.text, fontSize: fontSize.sm, fontWeight: fontWeight.medium }}>{value}</Text>
    </View>
  );
};

// ── Confirm modal ─────────────────────────────────────────────────────────────
export const ConfirmModal = ({ visible, title, message, onConfirm, onCancel, danger = false }) => {
  const { colors } = useTheme();
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: spacing.xl }} onPress={onCancel}>
        <Pressable style={{ backgroundColor: colors.bgCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' }}>
          <Text style={{ color: colors.text, fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: spacing.sm }}>{title}</Text>
          {message && <Text style={{ color: colors.textMuted, fontSize: fontSize.md, marginBottom: spacing.xl, lineHeight: 22 }}>{message}</Text>}
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <TouchableOpacity style={{ flex: 1, paddingVertical: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }} onPress={onCancel}>
              <Text style={{ color: colors.textMuted, fontSize: fontSize.md, fontWeight: fontWeight.semibold }}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1, paddingVertical: spacing.md, borderRadius: radius.md, backgroundColor: danger ? colors.danger : colors.accent, alignItems: 'center' }} onPress={onConfirm}>
              <Text style={{ color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>{danger ? 'Hapus' : 'Konfirmasi'}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
