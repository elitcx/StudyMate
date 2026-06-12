import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { Button, Input } from '../../components/UI';
import { useTheme } from '../../src/contexts/ThemeContext';
import { spacing, radius, fontSize, fontWeight, getShadow } from '../../utils/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const router    = useRouter();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  const { colors, isDark } = useTheme();
  const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Field kosong', 'Harap isi email dan password.');
      return;
    }
    setLoading(true);
    try {
      const user = await login(email.trim().toLowerCase(), password);
      if (user.role === 'superadmin')   router.replace('/(superadmin)/dashboard');
      else if (user.role === 'admin')   router.replace('/(admin)/dashboard');
      else                              router.replace('/(student)/home');
    } catch (err) {
      const msg =
        err.code === 'auth/user-not-found'    ? 'Email tidak terdaftar.' :
        err.code === 'auth/wrong-password'    ? 'Password salah.' :
        err.code === 'auth/invalid-email'     ? 'Format email tidak valid.' :
        err.code === 'auth/too-many-requests' ? 'Terlalu banyak percobaan. Coba lagi nanti.' :
        err.message || 'Login gagal.';
      Alert.alert('Login gagal', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={s.back} onPress={() => router.back()}>
          <Text style={s.backText}>← Kembali</Text>
        </TouchableOpacity>

        <View style={s.brand}>
          <Image source={require('../../assets/icon.png')} style={s.logoImage} />
          <Text style={s.appName}>StudyMate</Text>
        </View>

        <View style={s.form}>
          <Text style={s.heading}>Selamat datang</Text>
          <Text style={s.sub}>Masuk untuk melanjutkan</Text>

          <Input label="Email" value={email} onChangeText={setEmail}
            placeholder="kamu@email.com" keyboardType="email-address" autoCapitalize="none" />
          <Input label="Password" value={password} onChangeText={setPassword}
            placeholder="••••••••" secureTextEntry />

          <Button label="Masuk" onPress={handleLogin} loading={loading} style={s.btn} />

          <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={s.link}>
            <Text style={s.linkText}>
              Belum punya akun? <Text style={s.linkAccent}>Daftar</Text>
            </Text>
          </TouchableOpacity>
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
      paddingVertical: spacing.xl,
    },
    back: { marginBottom: spacing.lg },
    backText: {
      color: c.textMuted,
      fontSize: fontSize.sm,
    },
    brand: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    logoImage: { width: 64, height: 64, borderRadius: 14, marginBottom: spacing.sm },
    appName: {
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.black,
      color: c.text,
    },
    form: {
      backgroundColor: c.bgCard,
      borderRadius: radius.lg,
      padding: spacing.lg,
      ...(isDark
        ? { borderWidth: 1, borderColor: c.border }
        : shadow.sm),
    },
    heading: {
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.bold,
      color: c.text,
      marginBottom: spacing.xs,
    },
    sub: {
      fontSize: fontSize.sm,
      color: c.textMuted,
      marginBottom: spacing.lg,
    },
    btn: { marginTop: spacing.sm },
    link: {
      marginTop: spacing.lg,
      alignItems: 'center',
    },
    linkText: {
      color: c.textMuted,
      fontSize: fontSize.sm,
    },
    linkAccent: {
      color: c.accent,
      fontWeight: fontWeight.semibold,
    },
  });
};
