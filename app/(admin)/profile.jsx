import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useData } from '../../src/contexts/DataContext';
import { colors, spacing, fontSize, fontWeight, radius } from '../../utils/theme';

export default function AdminProfile() {
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
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.avatarSection}>
          <View style={[styles.avatarWrap, { backgroundColor: colors.admin + '22', borderColor: colors.admin + '55' }]}>
            <Text style={styles.avatarEmoji}>{user?.avatar}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: colors.admin + '22', borderColor: colors.admin + '44' }]}>
            <Text style={[styles.roleText, { color: colors.admin }]}>👩‍🏫 Admin</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatBox label="Kelas Dibuat" value={subjects.length} icon="📚" color={colors.admin} />
          <StatBox label="Materi Dibuat" value={materials.length} icon="📄" color={colors.accent} />
          <StatBox label="Kuis Dibuat" value={quizzes.length} icon="✏️" color={colors.success} />
          <StatBox label="Total Pengerjaan" value={scores.length} icon="📊" color={colors.warning} />
        </View>

        <Text style={styles.sectionTitle}>Info Akun</Text>
        <View style={styles.infoCard}>
          <InfoRow label="Nama" value={user?.name} />
          <InfoRow label="Email" value={user?.email} />
          <InfoRow label="Peran" value="Admin" />
          <InfoRow label="ID Pengguna" value={`#${user?.id}`} isLast />
        </View>

        <Text style={styles.sectionTitle}>Aksi Cepat</Text>
        {[
          { label: '➕ Buat Kelas Baru', onPress: () => router.push('/(admin)/create-class'), color: colors.admin },
          { label: '✏️ Buat Kuis Baru', onPress: () => router.push('/(admin)/quizzes'), color: colors.accent },
        ].map((a) => (
          <TouchableOpacity key={a.label} style={[styles.actionBtn, { borderColor: a.color + '55' }]} onPress={a.onPress}>
            <Text style={[styles.actionBtnText, { color: a.color }]}>{a.label}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout}>
          <Text style={styles.logoutText}>🚪  Keluar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const StatBox = ({ label, value, icon, color }) => (
  <View style={[styles.statBox, { borderTopColor: color, borderTopWidth: 3 }]}>
    <Text style={{ fontSize: 20, marginBottom: 4 }}>{icon}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

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
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  statBox: {
    width: '47%', backgroundColor: colors.bgCard,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, alignItems: 'center',
  },
  statValue: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  statLabel: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2, textAlign: 'center' },
  sectionTitle: { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: spacing.md },
  infoCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.xl, overflow: 'hidden',
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.md },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { color: colors.textMuted, fontSize: fontSize.sm },
  infoValue: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  actionBtn: {
    borderRadius: radius.md, paddingVertical: spacing.md,
    alignItems: 'center', borderWidth: 1,
    backgroundColor: colors.bgCard, marginBottom: spacing.sm,
  },
  actionBtnText: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  logoutBtn: {
    marginTop: spacing.md, backgroundColor: colors.danger + '22', borderRadius: radius.md,
    paddingVertical: spacing.md, alignItems: 'center',
    borderWidth: 1, borderColor: colors.danger + '55',
  },
  logoutText: { color: colors.danger, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
});
