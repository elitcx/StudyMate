import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { spacing, radius, fontSize, fontWeight, getShadow } from '../../utils/theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  const features = [
    { icon: '📚', label: 'Materi Pelajaran', desc: 'Akses semua bahan belajar' },
    { icon: '✏️', label: 'Bank Soal', desc: 'Latihan soal per mata pelajaran' },
    { icon: '📅', label: 'Jadwal Ujian', desc: 'Pantau ujian yang akan datang' },
  ];

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.brand}>
          <View style={s.logoCircle}>
            <Text style={s.logoEmoji}>📚</Text>
          </View>
          <Text style={s.appName}>StudyMate</Text>
          <Text style={s.tagline}>Platform belajar cerdas untuk siswa</Text>
        </View>

        <View style={s.featuresRow}>
          {features.map((f) => (
            <View key={f.label} style={s.featureCard}>
              <Text style={s.featureIcon}>{f.icon}</Text>
              <Text style={s.featureLabel}>{f.label}</Text>
              <Text style={s.featureDesc}>{f.desc}</Text>
            </View>
          ))}
        </View>

        <View style={s.actions}>
          <TouchableOpacity
            style={s.primaryBtn}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.8}
          >
            <Text style={s.primaryBtnText}>Masuk</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.secondaryBtn}
            onPress={() => router.push('/(auth)/register')}
            activeOpacity={0.8}
          >
            <Text style={s.secondaryBtnText}>Daftar Akun Baru</Text>
          </TouchableOpacity>

          <Text style={s.hint}>
            Akun demo: student@studymate.com / student123
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (c, isDark) => {
  const shadow = getShadow(isDark);
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.bg,
    },
    scroll: {
      flexGrow: 1,
      paddingHorizontal: spacing.lg,
      justifyContent: 'center',
      paddingVertical: spacing.xxl,
    },
    brand: {
      alignItems: 'center',
      marginBottom: spacing.xxl,
    },
    logoCircle: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: c.accent + '18',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    logoEmoji: { fontSize: 44 },
    appName: {
      fontSize: fontSize.xxxl,
      fontWeight: fontWeight.black,
      color: c.text,
      letterSpacing: -0.5,
    },
    tagline: {
      fontSize: fontSize.sm,
      color: c.textMuted,
      marginTop: spacing.xs,
      textAlign: 'center',
    },
    featuresRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.xl,
    },
    featureCard: {
      flex: 1,
      backgroundColor: c.bgCard,
      borderRadius: radius.md,
      padding: spacing.md,
      alignItems: 'center',
      ...(isDark
        ? { borderWidth: 1, borderColor: c.border }
        : shadow.sm),
    },
    featureIcon: { fontSize: 24, marginBottom: spacing.xs },
    featureLabel: {
      color: c.text,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.bold,
      textAlign: 'center',
      marginBottom: 2,
    },
    featureDesc: {
      color: c.textFaint,
      fontSize: 10,
      textAlign: 'center',
    },
    actions: { gap: spacing.sm },
    primaryBtn: {
      backgroundColor: c.accent,
      borderRadius: radius.md,
      height: 52,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryBtnText: {
      color: '#ffffff',
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold,
    },
    secondaryBtn: {
      backgroundColor: 'transparent',
      borderRadius: radius.md,
      height: 52,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.border,
    },
    secondaryBtnText: {
      color: c.text,
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
    },
    hint: {
      color: c.textFaint,
      fontSize: fontSize.xs,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
  });
};
