import React, { useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet, Modal, Pressable,
} from 'react-native';
import { useTheme } from '../src/contexts/ThemeContext';
import { spacing, radius, fontSize, fontWeight, getShadow, opacity } from '../utils/theme';

// ── Button ────────────────────────────────────────────────────────────────────
export const Button = ({ onPress, label, loading = false, variant = 'primary', size = 'md', style, disabled, icon }) => {
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
    variant === 'ghost'       ? { borderWidth: 1, borderColor: colors.accent }
    : variant === 'secondary' ? { borderWidth: 1, borderColor: colors.border }
    : {};

  const glowShadow = variant === 'primary' && isDark ? {
    shadowColor: bg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  } : isDark ? {} : getShadow(false).sm;

  const height = size === 'sm' ? 36 : size === 'lg' ? 56 : 48;
  const paddingH = size === 'sm' ? spacing.md : spacing.lg;
  const textSize = size === 'sm' ? fontSize.sm : fontSize.md;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        btnStyles.btn,
        { backgroundColor: bg, opacity: disabled ? 0.45 : 1, height, paddingHorizontal: paddingH },
        borderStyle,
        glowShadow,
        style,
      ]}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={btnStyles.inner}>
          {icon && (
            typeof icon === 'string'
              ? <Text style={btnStyles.icon}>{icon}</Text>
              : <View>{icon}</View>
          )}
          <Text style={[btnStyles.label, { color: textColor, fontSize: textSize }]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const btnStyles = StyleSheet.create({
  btn: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: { fontSize: fontSize.md },
  label: { fontWeight: fontWeight.semibold, letterSpacing: 0.3 },
});

// ── Input ─────────────────────────────────────────────────────────────────────
export const Input = ({ label, error, style, containerStyle, leftIcon, ...props }) => {
  const { colors } = useTheme();
  return (
    <View style={[{ marginBottom: spacing.md }, containerStyle]}>
      {label && (
        <Text style={{ color: colors.textMuted, fontSize: fontSize.sm, fontWeight: fontWeight.medium, marginBottom: spacing.xs }}>
          {label}
        </Text>
      )}
      <View style={{ position: 'relative' }}>
        {leftIcon && (
          <View style={{ position: 'absolute', left: spacing.md, top: 0, bottom: 0, justifyContent: 'center', zIndex: 1 }}>
            {leftIcon}
          </View>
        )}
        <TextInput
          style={[
            {
              backgroundColor: colors.bgInput,
              borderWidth: 1,
              borderColor: error ? colors.danger : colors.border,
              borderRadius: radius.md,
              paddingHorizontal: leftIcon ? spacing.xl + spacing.md : spacing.md,
              paddingVertical: 14,
              color: colors.text,
              fontSize: fontSize.md,
              lineHeight: fontSize.md * 1.4,
              includeFontPadding: false,
            },
            style,
          ]}
          placeholderTextColor={colors.textFaint}
          selectionColor={colors.accent}
          {...props}
        />
      </View>
      {error && <Text style={{ color: colors.danger, fontSize: fontSize.xs, marginTop: spacing.xs }}>{error}</Text>}
    </View>
  );
};

// ── Card ──────────────────────────────────────────────────────────────────────
export const Card = ({ children, style, onPress, accent, accentColor }) => {
  const { colors, isDark } = useTheme();
  const cardStyle = [
    {
      backgroundColor: colors.bgCard,
      borderRadius: radius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: isDark ? colors.border : colors.border + '80',
      ...getShadow(isDark).sm,
      ...(accent && { borderTopWidth: 3, borderTopColor: accentColor || colors.accent }),
    },
    style,
  ];
  if (onPress) {
    return <TouchableOpacity onPress={onPress} style={cardStyle} activeOpacity={0.8}>{children}</TouchableOpacity>;
  }
  return <View style={cardStyle}>{children}</View>;
};

// ── Badge ─────────────────────────────────────────────────────────────────────
export const Badge = ({ label, color, size = 'md', variant }) => {
  const { colors: c } = useTheme();
  const col =
    variant === 'success' ? c.success
    : variant === 'danger'  ? c.danger
    : variant === 'warning' ? c.warning
    : variant === 'info'    ? c.accent
    : color || c.accent;

  return (
    <View style={{
      borderRadius: radius.full,
      backgroundColor: col + opacity.subtle,
      borderWidth: 1,
      borderColor: col + opacity.muted,
      paddingHorizontal: size === 'sm' ? spacing.xs + 2 : spacing.sm,
      paddingVertical: size === 'sm' ? 2 : 4,
      alignSelf: 'flex-start',
    }}>
      <Text style={{ color: col, fontSize: size === 'sm' ? fontSize.xs : fontSize.sm, fontWeight: fontWeight.semibold, letterSpacing: 0.3 }}>
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
      <Text style={{ color: colors.text, fontSize: fontSize.lg, fontWeight: fontWeight.bold, letterSpacing: -0.3 }}>{title}</Text>
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
  const iconEl = typeof icon === 'string'
    ? <Text style={{ fontSize: 44, marginBottom: spacing.sm }}>{icon}</Text>
    : <View style={{ marginBottom: spacing.md }}>{icon}</View>;

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl, gap: spacing.sm }}>
      {iconEl}
      <Text style={{ color: colors.text, fontSize: fontSize.lg, fontWeight: fontWeight.bold, textAlign: 'center', lineHeight: 26 }}>{title}</Text>
      {subtitle && <Text style={{ color: colors.textMuted, fontSize: fontSize.md, textAlign: 'center', lineHeight: 22 }}>{subtitle}</Text>}
      {action && (
        <TouchableOpacity
          onPress={onAction}
          style={{ marginTop: spacing.md, backgroundColor: colors.accent + opacity.subtle, borderRadius: radius.full, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.accent + opacity.muted }}
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
export const StatCard = ({ label, value, icon, color, accent = false, size = 'md' }) => {
  const { colors, isDark } = useTheme();
  const col = color || colors.accent;
  const valueSize = size === 'sm' ? fontSize.lg : fontSize.xl;
  const labelSize = size === 'sm' ? fontSize.xs : fontSize.xs;

  return (
    <Card accent={accent} accentColor={col} style={{ alignItems: 'center', flex: 1 }}>
      {icon && (
        typeof icon === 'string'
          ? <Text style={{ fontSize: 20, marginBottom: 4 }}>{icon}</Text>
          : <View style={{ marginBottom: 4 }}>{icon}</View>
      )}
      <Text style={{ color: col, fontSize: valueSize, fontWeight: fontWeight.black }}>{value}</Text>
      <Text style={{ color: colors.textMuted, fontSize: labelSize, marginTop: 2, textAlign: 'center', lineHeight: 15 }}>{label}</Text>
    </Card>
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
