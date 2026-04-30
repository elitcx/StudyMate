import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useData } from '../../src/contexts/DataContext';
import { colors, spacing, fontSize, fontWeight, radius } from '../../utils/theme';

const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
function fmtDate(s) {
  if (!s) return '—';
  const d = new Date(s);
  return isNaN(d) ? s : `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function SuperAdminDashboard() {
  const { user, allUsers } = useAuth();
  const { subjects, materials, quizzes, scores } = useData();
  const router = useRouter();
  const [view, setView] = useState('overview'); // 'overview' | 'exams'

  const students    = allUsers.filter((u) => u.role === 'student');
  const admins      = allUsers.filter((u) => u.role === 'admin');
  const avgScore    = scores.length ? Math.round(scores.reduce((a, s) => a + s.percentage, 0) / scores.length) : 0;
  const passRate    = scores.length ? Math.round((scores.filter((s) => s.percentage >= 70).length / scores.length) * 100) : 0;

  // All exams sorted by date
  const allExams = [...quizzes].sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Dashboard Superadmin</Text>
          <Text style={styles.name}>Halo, {user?.name?.split(' ')[0]} ⚡</Text>
        </View>
        <View style={[styles.avatar, { backgroundColor: colors.superadmin + '22', borderColor: colors.superadmin + '55' }]}>
          <Text style={{ fontSize: 22 }}>{user?.avatar}</Text>
        </View>
      </View>

      {/* View toggle */}
      <View style={styles.toggleRow}>
        {[
          { key: 'overview', label: '📊 Ikhtisar' },
          { key: 'exams',    label: '📅 Semua Ujian' },
        ].map((v) => (
          <TouchableOpacity
            key={v.key}
            style={[styles.toggleBtn, view === v.key && styles.toggleBtnActive]}
            onPress={() => setView(v.key)}
          >
            <Text style={[styles.toggleTxt, view === v.key && styles.toggleTxtActive]}>{v.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {view === 'overview' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* User stats */}
          <Text style={styles.groupTitle}>👥 Pengguna</Text>
          <View style={styles.statsGrid}>
            <StatBox icon="👥" label="Total" value={allUsers.length} color={colors.superadmin} />
            <StatBox icon="🎓" label="Siswa" value={students.length} color={colors.student} />
            <StatBox icon="👩‍🏫" label="Admin" value={admins.length} color={colors.admin} />
          </View>

          {/* Content stats */}
          <Text style={styles.groupTitle}>📚 Konten</Text>
          <View style={styles.statsGrid}>
            <StatBox icon="📚" label="Kelas" value={subjects.length} color={colors.accent} />
            <StatBox icon="📄" label="Materi" value={materials.length} color={colors.admin} />
            <StatBox icon="📅" label="Ujian" value={quizzes.length} color={colors.warning} />
          </View>

          {/* Activity stats */}
          <Text style={styles.groupTitle}>📊 Aktivitas</Text>
          <View style={styles.statsGrid}>
            <StatBox icon="📝" label="Pengerjaan" value={scores.length} color={colors.success} />
            <StatBox icon="📊" label="Rata-rata" value={scores.length ? `${avgScore}%` : '—'} color={colors.warning} />
            <StatBox icon="✅" label="Pass Rate" value={scores.length ? `${passRate}%` : '—'} color={colors.success} />
          </View>

          {/* Quick nav */}
          <Text style={styles.groupTitle}>⚡ Kelola</Text>
          <View style={styles.navGrid}>
            {[
              { icon: '👥', label: 'Kelola Pengguna', sub: `${allUsers.length} akun`, color: colors.superadmin, onPress: () => router.push('/(superadmin)/users') },
              { icon: '📚', label: 'Kelola Konten', sub: `${subjects.length} kelas`, color: colors.accent, onPress: () => router.push('/(superadmin)/content') },
            ].map((n) => (
              <TouchableOpacity
                key={n.label}
                style={[styles.navCard, { borderTopColor: n.color, borderTopWidth: 3 }]}
                onPress={n.onPress}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 28 }}>{n.icon}</Text>
                <Text style={styles.navLabel}>{n.label}</Text>
                <Text style={styles.navSub}>{n.sub}</Text>
                <Text style={[styles.navArrow, { color: n.color }]}>→</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Recent activity */}
          {scores.length > 0 && (
            <>
              <Text style={styles.groupTitle}>🕐 Aktivitas Terbaru</Text>
              {scores.slice(-5).reverse().map((sc) => {
                const quiz = quizzes.find((q) => q.id === sc.quizId);
                const sub  = subjects.find((s) => s.id === sc.subjectId);
                const usr  = allUsers.find((u) => u.id === sc.userId);
                const pc   = sc.percentage >= 70 ? colors.success : sc.percentage >= 50 ? colors.warning : colors.danger;
                return (
                  <View key={sc.id} style={styles.actRow}>
                    <Text style={styles.actAvatar}>{usr?.avatar}</Text>
                    <View style={styles.actInfo}>
                      <Text style={styles.actUser}>{usr?.name}</Text>
                      <Text style={styles.actDetail}>{quiz?.title} · {sub?.title}</Text>
                    </View>
                    <View style={[styles.actBadge, { backgroundColor: pc + '22', borderColor: pc + '55' }]}>
                      <Text style={[styles.actScore, { color: pc }]}>{sc.percentage}%</Text>
                    </View>
                  </View>
                );
              })}
            </>
          )}
        </ScrollView>
      )}

      {view === 'exams' && (
        <FlatList
          data={allExams}
          keyExtractor={(q) => q.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.examList}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyText}>Belum ada ujian yang ditambahkan</Text>
            </View>
          }
          renderItem={({ item: exam }) => {
            const sub = subjects.find((s) => s.id === exam.subjectId);
            const examScores = scores.filter((sc) => sc.quizId === exam.id);
            const avgExam = examScores.length
              ? Math.round(examScores.reduce((a, s) => a + s.percentage, 0) / examScores.length)
              : null;
            return (
              <View style={[styles.examCard, { borderLeftColor: sub?.color || colors.accent, borderLeftWidth: 4 }]}>
                <View style={styles.examTop}>
                  <View style={[styles.examIconBox, { backgroundColor: (sub?.color || colors.accent) + '22' }]}>
                    <Text style={{ fontSize: 18 }}>{sub?.icon || '📝'}</Text>
                  </View>
                  <View style={styles.examInfo}>
                    <Text style={styles.examTitle}>{exam.title}</Text>
                    <Text style={[styles.examSubject, { color: sub?.color || colors.accent }]}>{sub?.title}</Text>
                  </View>
                  {avgExam !== null && (
                    <View style={[styles.avgBadge, { backgroundColor: (avgExam >= 70 ? colors.success : colors.warning) + '22' }]}>
                      <Text style={[styles.avgTxt, { color: avgExam >= 70 ? colors.success : colors.warning }]}>
                        ⌀ {avgExam}%
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.examMeta}>
                  <Text style={styles.examMetaItem}>📅 {fmtDate(exam.date)}</Text>
                  <Text style={styles.examMetaItem}>❓ {exam.questions?.length || 0} soal</Text>
                  <Text style={styles.examMetaItem}>⏱ {exam.duration} menit</Text>
                  <Text style={styles.examMetaItem}>👥 {examScores.length} pengerjaan</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const StatBox = ({ icon, label, value, color }) => (
  <View style={[styles.statBox, { borderTopColor: color, borderTopWidth: 3 }]}>
    <Text style={{ fontSize: 18, marginBottom: 4 }}>{icon}</Text>
    <Text style={[styles.statVal, { color }]}>{value}</Text>
    <Text style={styles.statLbl}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md,
  },
  greeting: { color: colors.textMuted, fontSize: fontSize.sm },
  name: { color: colors.white, fontSize: fontSize.xl, fontWeight: fontWeight.black },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },

  toggleRow: {
    flexDirection: 'row', gap: spacing.sm,
    paddingHorizontal: spacing.lg, marginBottom: spacing.sm,
  },
  toggleBtn: {
    flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.bgCard, alignItems: 'center',
  },
  toggleBtnActive: { backgroundColor: colors.superadmin + '22', borderColor: colors.superadmin },
  toggleTxt: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  toggleTxtActive: { color: colors.superadmin, fontWeight: fontWeight.bold },

  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  groupTitle: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.bold, marginTop: spacing.lg, marginBottom: spacing.sm },
  statsGrid: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xs },
  statBox: {
    flex: 1, backgroundColor: colors.bgCard, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: spacing.sm, alignItems: 'center',
  },
  statVal: { fontSize: fontSize.xl, fontWeight: fontWeight.black },
  statLbl: { color: colors.textFaint, fontSize: 10, textAlign: 'center', marginTop: 2 },

  navGrid: { flexDirection: 'row', gap: spacing.sm },
  navCard: {
    flex: 1, backgroundColor: colors.bgCard, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.xs,
  },
  navLabel: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  navSub: { color: colors.textFaint, fontSize: fontSize.xs },
  navArrow: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, marginTop: spacing.xs },

  actRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgCard, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.sm, marginBottom: spacing.sm, gap: spacing.sm,
  },
  actAvatar: { fontSize: 22 },
  actInfo: { flex: 1 },
  actUser: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  actDetail: { color: colors.textFaint, fontSize: fontSize.xs },
  actBadge: { borderRadius: radius.full, borderWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  actScore: { fontSize: fontSize.sm, fontWeight: fontWeight.black },

  examList: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  examCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.sm, gap: spacing.sm,
  },
  examTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  examIconBox: { width: 40, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  examInfo: { flex: 1 },
  examTitle: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  examSubject: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, marginTop: 2 },
  avgBadge: { borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  avgTxt: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  examMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  examMetaItem: { color: colors.textFaint, fontSize: fontSize.xs },

  empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyIcon: { fontSize: 40 },
  emptyText: { color: colors.textMuted, fontSize: fontSize.md, textAlign: 'center' },
});
