import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { Button, Input } from '../../components/UI';
import { useTheme } from '../../src/contexts/ThemeContext';
import { spacing, radius, fontSize, fontWeight, getShadow, opacity } from '../../utils/theme';


const GRADES = [
  { value: 'X',   label: 'Kelas X',   sub: '(Grade 10)' },
  { value: 'XI',  label: 'Kelas XI',  sub: '(Grade 11)' },
  { value: 'XII', label: 'Kelas XII', sub: '(Grade 12)' },
];

export default function RegisterScreen() {
  const { register } = useAuth();
  const router = useRouter();
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [grade,    setGrade]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const { colors, isDark } = useTheme();
  const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirm) {
      Alert.alert('Field kosong', 'Harap isi semua field.'); return;
    }
    if (!grade) {
      Alert.alert('Pilih kelas', 'Harap pilih kelas (X/XI/XII) terlebih dahulu.'); return;
    }
    if (password !== confirm) {
      Alert.alert('Password tidak cocok', 'Konfirmasi password tidak sesuai.'); return;
    }
    if (password.length < 6) {
      Alert.alert('Password terlalu pendek', 'Password minimal 6 karakter.'); return;
    }
    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password, grade);
      router.replace('/(student)/home');
    } catch (err) {
      const msg =
        err.code === 'auth/email-already-in-use' ? 'Email sudah terdaftar.' :
        err.code === 'auth/invalid-email'         ? 'Format email tidak valid.' :
        err.code === 'auth/weak-password'         ? 'Password terlalu lemah.' :
        err.message || 'Registrasi gagal.';
      Alert.alert('Registrasi gagal', msg);
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
          <Text style={s.heading}>Buat akun</Text>
          <Text style={s.sub}>Bergabung dengan StudyMate</Text>

          <Input label="Nama Lengkap" value={name} onChangeText={setName}
            placeholder="Nama Lengkap" autoCapitalize="words" />
          <Input label="Email" value={email} onChangeText={setEmail}
            placeholder="kamu@email.com" keyboardType="email-address" autoCapitalize="none" />
          <Input label="Password" value={password} onChangeText={setPassword}
            placeholder="Min. 6 karakter" secureTextEntry />
          <Input label="Konfirmasi Password" value={confirm} onChangeText={setConfirm}
            placeholder="••••••••" secureTextEntry />

          <Text style={s.gradeLabel}>Kelas *</Text>
          <View style={s.gradeRow}>
            {GRADES.map((g) => (
              <TouchableOpacity
                key={g.value}
                style={[s.gradeBtn, grade === g.value && s.gradeBtnActive]}
                onPress={() => setGrade(g.value)}
              >
                <Text style={[s.gradeBtnLabel, grade === g.value && s.gradeBtnLabelActive]}>
                  {g.label}
                </Text>
                <Text style={[s.gradeBtnSub, grade === g.value && s.gradeBtnSubActive]}>
                  {g.sub}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button label="Buat Akun" onPress={handleRegister} loading={loading} style={s.btn} />

          <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={s.link}>
            <Text style={s.linkText}>
              Sudah punya akun? <Text style={s.linkAccent}>Masuk</Text>
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
    gradeLabel: {
      color: c.textMuted,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      marginTop: spacing.md,
      marginBottom: spacing.xs,
    },
    gradeRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    gradeBtn: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgElevated,
    },
    gradeBtnActive: {
      backgroundColor: c.accent + opacity.tint,
      borderColor: c.accent,
    },
    gradeBtnLabel: {
      color: c.textMuted,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.bold,
    },
    gradeBtnLabelActive: { color: c.accent },
    gradeBtnSub: {
      color: c.textFaint,
      fontSize: 10,
      marginTop: 2,
    },
    gradeBtnSubActive: { color: c.accent + 'aa' },
    btn: { marginTop: spacing.md },
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
