import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useData } from '../../src/contexts/DataContext';
import { colors, spacing, fontSize, fontWeight, radius } from '../../utils/theme';

export default function SuperAdminProfile() {
  const { user, allUsers, logout } = useAuth();
  const { subjects, materials, quizzes, scores } = useData();
  const router = useRouter();

  const confirmLogout = () => {
    Alert.alert('Keluar', 'Yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: () => { logout(); router.replace('/(auth)/welcome'); } },
    ]);
  };

  const systemStats = [
    { label: 'Total Pengguna', value: allUsers.length, icon: '👥', color: colors.superadmin },
    { label: 'Total Kelas', value: subjects.length, icon: '📚', color: colors.accent },
    { label: 'Total Materi', value: materials.length, icon: '📄', color: colors.admin },
    { label: 'Total Kuis', value: quizzes.length, icon: '✏️', color: colors.success },
    { label: 'Total Pengerjaan', value: scores.length, icon: '📊', color: colors.warning },
    { label: 'Total Soal', value: quizzes.reduce((a, q) => a + (q.questions?.length || 0), 0), icon: '❓', color: colors.student },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.avatarSection}>
          <View style={[styles.avatarWrap, { backgroundColor: colors.superadmin + '22', borderColor: colors.superadmin + '55' }]}>
            <Text style={styles.avatarEmoji}>{user?.avatar}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: colors.superadmin + '22', borderColor: colors.superadmin + '44' }]}>
            <Text style={[styles.roleText, { color: colors.superadmin }]}>⚡ Superadmin</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Statistik Sistem</Text>
        <View style={styles.statsGrid}>
          {systemStats.map((s) => (
            <View key={s.label} style={[styles.statBox, { borderTopColor: s.color, borderTopWidth: 3 }]}>
              <Text style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</Text>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Info Akun</Text>
        <View style={styles.infoCard}>
          <InfoRow label="Nama" value={user?.name} />
          <InfoRow label="Email" value={user?.email} />
          <InfoRow label="Peran" value="Superadmin" />
          <InfoRow label="ID Pengguna" value={`#${user?.id}`} isLast />
        </View>

        <Text style={styles.sectionTitle}>Navigasi Cepat</Text>
        {[
          { label: '👥 Kelola Pengguna', onPress: () => router.push('/(superadmin)/users'), color: colors.superadmin },
          { label: '📚 Kelola Konten', onPress: () => router.push('/(superadmin)/content'), color: colors.accent },
        ].map((a) => (
          <TouchableOpacity key={a.label} style={[styles.navBtn, { borderColor: a.color + '55' }]} onPress={a.onPress}>
            <Text style={[styles.navBtnText, { color: a.color }]}>{a.label}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout}>
          <Text style={styles.logoutText}>🚪  Keluar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoRow = ({ label, value, isLast }) => (
  <View style={[styles.infoRow, !isLast && styles.infoRowBorder]}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  avatarSection: { alignItems: 'center', marginBottom: spacing.xl },
  avatarWrap: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  avatarEmoji: { fontSize: 40 },
  name: { color: colors.white, fontSize: fontSize.xxl, fontWeight: fontWeight.bold },
  email: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: 2 },
  roleBadge: {
    marginTop: spacing.sm, borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: 4, borderWidth: 1,
  },
  roleText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  sectionTitle: { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: spacing.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  statBox: {
    width: '47%', backgroundColor: colors.bgCard,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, alignItems: 'center',
  },
  statValue: { fontSize: fontSize.xl, fontWeight: fontWeight.black },
  statLabel: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2, textAlign: 'center' },
  infoCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.xl, overflow: 'hidden',
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.md },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { color: colors.textMuted, fontSize: fontSize.sm },
  infoValue: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  navBtn: {
    borderRadius: radius.md, paddingVertical: spacing.md,
    alignItems: 'center', borderWidth: 1,
    backgroundColor: colors.bgCard, marginBottom: spacing.sm,
  },
  navBtnText: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  logoutBtn: {
    marginTop: spacing.md, backgroundColor: colors.danger + '22', borderRadius: radius.md,
    paddingVertical: spacing.md, alignItems: 'center',
    borderWidth: 1, borderColor: colors.danger + '55',
  },
  logoutText: { color: colors.danger, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
});
