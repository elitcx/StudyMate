import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useData } from '../../src/contexts/DataContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { spacing, radius, fontSize, fontWeight, getShadow, opacity } from '../../utils/theme';


const StatBox = ({ s, label, value, icon, color }) => (
  <View style={[s.statBox, { borderTopColor: color, borderTopWidth: 3 }]}>
    <Text style={{ fontSize: 20, marginBottom: 4 }}>{icon}</Text>
    <Text style={[s.statValue, { color }]}>{value}</Text>
    <Text style={s.statLabel}>{label}</Text>
  </View>
);

const InfoRow = ({ s, label, value, isLast }) => (
  <View style={[s.infoRow, !isLast && s.infoRowBorder]}>
    <Text style={s.infoLabel}>{label}</Text>
    <Text style={s.infoValue}>{value}</Text>
  </View>
);

export default function AdminProfile() {
  const { colors, isDark, toggleTheme } = useTheme();
  const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  const { user, logout } = useAuth();
  const { subjects, materials, quizzes, scores } = useData();
  const router = useRouter();

  const confirmLogout = () => {
    Alert.alert('Keluar', 'Yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: () => { logout(); router.replace('/(auth)/welcome'); } },
    ]);
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.avatarSection}>
          <View style={[s.avatarWrap, { backgroundColor: colors.admin + opacity.subtle, borderColor: colors.admin + opacity.muted }]}>
            <Text style={s.avatarEmoji}>{user?.avatar}</Text>
          </View>
          <Text style={s.name}>{user?.name}</Text>
          <Text style={s.email}>{user?.email}</Text>
          <View style={[s.roleBadge, { backgroundColor: colors.admin + opacity.subtle, borderColor: colors.admin + opacity.soft }]}>
            <Text style={[s.roleText, { color: colors.admin }]}>👩‍🏫 Admin</Text>
          </View>
        </View>

        <View style={s.statsGrid}>
          <StatBox s={s} label="Kelas Dibuat" value={subjects.length} icon="📚" color={colors.admin} />
          <StatBox s={s} label="Materi Dibuat" value={materials.length} icon="📄" color={colors.accent} />
          <StatBox s={s} label="Kuis Dibuat" value={quizzes.length} icon="✏️" color={colors.success} />
          <StatBox s={s} label="Total Pengerjaan" value={scores.length} icon="📊" color={colors.warning} />
        </View>

        <Text style={s.sectionTitle}>Info Akun</Text>
        <View style={s.infoCard}>
          <InfoRow s={s} label="Nama" value={user?.name} />
          <InfoRow s={s} label="Email" value={user?.email} />
          <InfoRow s={s} label="Peran" value="Admin" />
          <InfoRow s={s} label="ID Pengguna" value={`#${user?.id}`} isLast />
        </View>

        <Text style={s.sectionTitle}>Aksi Cepat</Text>
        {[
          { label: '➕ Buat Kelas Baru', onPress: () => router.push('/(admin)/create-class'), color: colors.admin },
          { label: '✏️ Buat Kuis Baru', onPress: () => router.push('/(admin)/quizzes'), color: colors.accent },
        ].map((a) => (
          <TouchableOpacity key={a.label} style={[s.actionBtn, { borderColor: a.color + opacity.muted }]} onPress={a.onPress}>
            <Text style={[s.actionBtnText, { color: a.color }]}>{a.label}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={[s.actionBtn, { borderColor: colors.accent + opacity.muted }]} onPress={toggleTheme}>
          <Text style={[s.actionBtnText, { color: colors.accent }]}>{isDark ? '☀️ Mode Terang' : '🌙 Mode Gelap'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.logoutBtn} onPress={confirmLogout}>
          <Text style={s.logoutText}>🚪  Keluar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (c, isDark) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
    avatarSection: { alignItems: 'center', marginBottom: spacing.xl },
    avatarWrap: {
      width: 88, height: 88, borderRadius: 44,
      borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
    },
    avatarEmoji: { fontSize: 40 },
    name: { color: c.text, fontSize: fontSize.xxl, fontWeight: fontWeight.bold },
    email: { color: c.textMuted, fontSize: fontSize.sm, marginTop: 2 },
    roleBadge: {
      marginTop: spacing.sm, borderRadius: radius.full,
      paddingHorizontal: spacing.md, paddingVertical: 4, borderWidth: 1,
    },
    roleText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
    statBox: {
      width: '47%', backgroundColor: c.bgCard,
      borderRadius: radius.md, borderWidth: 1, borderColor: c.border,
      padding: spacing.md, alignItems: 'center',
    },
    statValue: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
    statLabel: { color: c.textMuted, fontSize: fontSize.xs, marginTop: 2, textAlign: 'center' },
    sectionTitle: { color: c.text, fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: spacing.md },
    infoCard: {
      backgroundColor: c.bgCard, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border,
      marginBottom: spacing.xl, overflow: 'hidden',
    },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.md },
    infoRowBorder: { borderBottomWidth: 1, borderBottomColor: c.border },
    infoLabel: { color: c.textMuted, fontSize: fontSize.sm },
    infoValue: { color: c.text, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
    actionBtn: {
      borderRadius: radius.md, paddingVertical: spacing.md,
      alignItems: 'center', borderWidth: 1,
      backgroundColor: c.bgCard, marginBottom: spacing.sm,
    },
    actionBtnText: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
    logoutBtn: {
      marginTop: spacing.md, backgroundColor: c.danger + opacity.subtle, borderRadius: radius.md,
      paddingVertical: spacing.md, alignItems: 'center',
      borderWidth: 1, borderColor: c.danger + opacity.muted,
    },
    logoutText: { color: c.danger, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  });
