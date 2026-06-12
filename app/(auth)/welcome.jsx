import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { spacing, radius, fontSize, fontWeight } from '../../utils/theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.brand}>
          <Image source={require('../../assets/icon.png')} style={s.logoImage} />
          <Text style={s.appName}>StudyMate</Text>
          <Text style={s.tagline}>Platform belajar cerdas untuk siswa</Text>
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (c, isDark) => StyleSheet.create({
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
    marginBottom: spacing.xxl + spacing.lg,
  },
  logoImage: {
    width: 104,
    height: 104,
    borderRadius: 26,
    marginBottom: spacing.lg,
  },
  appName: {
    fontSize: 34,
    fontWeight: fontWeight.black,
    color: c.text,
    letterSpacing: -1,
    lineHeight: 40,
  },
  tagline: {
    fontSize: fontSize.md,
    color: c.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.1,
    paddingHorizontal: spacing.xl,
  },
  actions: { gap: 12 },
  primaryBtn: {
    backgroundColor: c.accent,
    borderRadius: radius.lg,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: c.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.4 : 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryBtnText: {
    color: c.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    backgroundColor: isDark ? c.bgCard : 'transparent',
    borderRadius: radius.lg,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: c.border,
  },
  secondaryBtnText: {
    color: c.textMuted,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.1,
  },
});
