import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useData } from '../../src/contexts/DataContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { spacing, radius, fontSize, fontWeight } from '../../utils/theme';

const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
function fmtDate(s) {
  if (!s) return '—';
  const d = new Date(s);
  return isNaN(d) ? s : `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

const StatBox = ({ s, icon, label, value, color }) => (
  <View style={[s.statBox, { borderTopColor: color, borderTopWidth: 3 }]}>
    <Text style={{ fontSize: 18, marginBottom: 4 }}>{icon}</Text>
    <Text style={[s.statVal, { color }]}>{value}</Text>
    <Text style={s.statLbl}>{label}</Text>
  </View>
);

export default function SuperAdminDashboard() {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  const { user, allUsers } = useAuth();
  const { subjects, materials, quizzes, scores } = useData();
  const router = useRouter();
  const [view, setView] = useState('overview');

  const students    = allUsers.filter((u) => u.role === 'student');
  const admins      = allUsers.filter((u) => u.role === 'admin');
  const avgScore    = scores.length ? Math.round(scores.reduce((a, sc) => a + sc.percentage, 0) / scores.length) : 0;
  const passRate    = scores.length ? Math.round((scores.filter((sc) => sc.percentage >= 70).length / scores.length) * 100) : 0;

  const allExams = [...quizzes].sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Dashboard Superadmin</Text>
          <Text style={s.name}>Halo, {user?.name?.split(' ')[0]} ⚡</Text>
        </View>
        <View style={[s.avatar, { backgroundColor: colors.superadmin + '22', borderColor: colors.superadmin + '55' }]}>
          <Text style={{ fontSize: 22 }}>{user?.avatar}</Text>
        </View>
      </View>

      <View style={s.toggleRow}>
        {[
          { key: 'overview', label: '📊 Ikhtisar' },
          { key: 'exams',    label: '📅 Semua Ujian' },
        ].map((v) => (
          <TouchableOpacity
            key={v.key}
            style={[s.toggleBtn, view === v.key && s.toggleBtnActive]}
            onPress={() => setView(v.key)}
          >
            <Text style={[s.toggleTxt, view === v.key && s.toggleTxtActive]}>{v.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {view === 'overview' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          <Text style={s.groupTitle}>👥 Pengguna</Text>
          <View style={s.statsGrid}>
            <StatBox s={s} icon="👥" label="Total" value={allUsers.length} color={colors.superadmin} />
            <StatBox s={s} icon="🎓" label="Siswa" value={students.length} color={colors.student} />
            <StatBox s={s} icon="👩‍🏫" label="Admin" value={admins.length} color={colors.admin} />
          </View>

          <Text style={s.groupTitle}>📚 Konten</Text>
          <View style={s.statsGrid}>
            <StatBox s={s} icon="📚" label="Kelas" value={subjects.length} color={colors.accent} />
            <StatBox s={s} icon="📄" label="Materi" value={materials.length} color={colors.admin} />
            <StatBox s={s} icon="📅" label="Ujian" value={quizzes.length} color={colors.warning} />
          </View>

          <Text style={s.groupTitle}>📊 Aktivitas</Text>
          <View style={s.statsGrid}>
            <StatBox s={s} icon="📝" label="Pengerjaan" value={scores.length} color={colors.success} />
            <StatBox s={s} icon="📊" label="Rata-rata" value={scores.length ? `${avgScore}%` : '—'} color={colors.warning} />
            <StatBox s={s} icon="✅" label="Pass Rate" value={scores.length ? `${passRate}%` : '—'} color={colors.success} />
          </View>

          <Text style={s.groupTitle}>⚡ Kelola</Text>
          <View style={s.navGrid}>
            {[
              { icon: '👥', label: 'Kelola Pengguna', sub: `${allUsers.length} akun`, color: colors.superadmin, onPress: () => router.push('/(superadmin)/users') },
              { icon: '📚', label: 'Kelola Konten', sub: `${subjects.length} kelas`, color: colors.accent, onPress: () => router.push('/(superadmin)/content') },
            ].map((n) => (
              <TouchableOpacity
                key={n.label}
                style={[s.navCard, { borderTopColor: n.color, borderTopWidth: 3 }]}
                onPress={n.onPress}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 28 }}>{n.icon}</Text>
                <Text style={s.navLabel}>{n.label}</Text>
                <Text style={s.navSub}>{n.sub}</Text>
                <Text style={[s.navArrow, { color: n.color }]}>→</Text>
              </TouchableOpacity>
            ))}
          </View>

          {scores.length > 0 && (
            <>
              <Text style={s.groupTitle}>🕐 Aktivitas Terbaru</Text>
              {scores.slice(-5).reverse().map((sc) => {
                const quiz = quizzes.find((q) => q.id === sc.quizId);
                const sub  = subjects.find((su) => su.id === sc.subjectId);
                const usr  = allUsers.find((u) => u.id === sc.userId);
                const pc   = sc.percentage >= 70 ? colors.success : sc.percentage >= 50 ? colors.warning : colors.danger;
                return (
                  <View key={sc.id} style={s.actRow}>
                    <Text style={s.actAvatar}>{usr?.avatar}</Text>
                    <View style={s.actInfo}>
                      <Text style={s.actUser}>{usr?.name}</Text>
                      <Text style={s.actDetail}>{quiz?.title} · {sub?.title}</Text>
                    </View>
                    <View style={[s.actBadge, { backgroundColor: pc + '22', borderColor: pc + '55' }]}>
                      <Text style={[s.actScore, { color: pc }]}>{sc.percentage}%</Text>
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
          contentContainerStyle={s.examList}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyIcon}>📅</Text>
              <Text style={s.emptyText}>Belum ada ujian yang ditambahkan</Text>
            </View>
          }
          renderItem={({ item: exam }) => {
            const sub = subjects.find((su) => su.id === exam.subjectId);
            const examScores = scores.filter((sc) => sc.quizId === exam.id);
            const avgExam = examScores.length
              ? Math.round(examScores.reduce((a, sc) => a + sc.percentage, 0) / examScores.length)
              : null;
            return (
              <View style={[s.examCard, { borderLeftColor: sub?.color || colors.accent, borderLeftWidth: 4 }]}>
                <View style={s.examTop}>
                  <View style={[s.examIconBox, { backgroundColor: (sub?.color || colors.accent) + '22' }]}>
                    <Text style={{ fontSize: 18 }}>{sub?.icon || '📝'}</Text>
                  </View>
                  <View style={s.examInfo}>
                    <Text style={s.examTitle}>{exam.title}</Text>
                    <Text style={[s.examSubject, { color: sub?.color || colors.accent }]}>{sub?.title}</Text>
                  </View>
                  {avgExam !== null && (
                    <View style={[s.avgBadge, { backgroundColor: (avgExam >= 70 ? colors.success : colors.warning) + '22' }]}>
                      <Text style={[s.avgTxt, { color: avgExam >= 70 ? colors.success : colors.warning }]}>
                        ⌀ {avgExam}%
                      </Text>
                    </View>
                  )}
                </View>
                <View style={s.examMeta}>
                  <Text style={s.examMetaItem}>📅 {fmtDate(exam.date)}</Text>
                  <Text style={s.examMetaItem}>❓ {exam.questions?.length || 0} soal</Text>
                  <Text style={s.examMetaItem}>⏱ {exam.duration} menit</Text>
                  <Text style={s.examMetaItem}>👥 {examScores.length} pengerjaan</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const makeStyles = (c, isDark) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    header: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md,
    },
    greeting: { color: c.textMuted, fontSize: fontSize.sm },
    name: { color: c.text, fontSize: fontSize.xl, fontWeight: fontWeight.black },
    avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },

    toggleRow: {
      flexDirection: 'row', gap: spacing.sm,
      paddingHorizontal: spacing.lg, marginBottom: spacing.sm,
    },
    toggleBtn: {
      flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border,
      backgroundColor: c.bgCard, alignItems: 'center',
    },
    toggleBtnActive: { backgroundColor: c.superadmin + '22', borderColor: c.superadmin },
    toggleTxt: { color: c.textMuted, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
    toggleTxtActive: { color: c.superadmin, fontWeight: fontWeight.bold },

    scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
    groupTitle: { color: c.text, fontSize: fontSize.md, fontWeight: fontWeight.bold, marginTop: spacing.lg, marginBottom: spacing.sm },
    statsGrid: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xs },
    statBox: {
      flex: 1, backgroundColor: c.bgCard, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border, padding: spacing.sm, alignItems: 'center',
    },
    statVal: { fontSize: fontSize.xl, fontWeight: fontWeight.black },
    statLbl: { color: c.textFaint, fontSize: 10, textAlign: 'center', marginTop: 2 },

    navGrid: { flexDirection: 'row', gap: spacing.sm },
    navCard: {
      flex: 1, backgroundColor: c.bgCard, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border, padding: spacing.md, gap: spacing.xs,
    },
    navLabel: { color: c.text, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
    navSub: { color: c.textFaint, fontSize: fontSize.xs },
    navArrow: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, marginTop: spacing.xs },

    actRow: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: c.bgCard, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border,
      padding: spacing.sm, marginBottom: spacing.sm, gap: spacing.sm,
    },
    actAvatar: { fontSize: 22 },
    actInfo: { flex: 1 },
    actUser: { color: c.text, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
    actDetail: { color: c.textFaint, fontSize: fontSize.xs },
    actBadge: { borderRadius: radius.full, borderWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: 2 },
    actScore: { fontSize: fontSize.sm, fontWeight: fontWeight.black },

    examList: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
    examCard: {
      backgroundColor: c.bgCard, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border,
      padding: spacing.md, marginBottom: spacing.sm, gap: spacing.sm,
    },
    examTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    examIconBox: { width: 40, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
    examInfo: { flex: 1 },
    examTitle: { color: c.text, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
    examSubject: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, marginTop: 2 },
    avgBadge: { borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3 },
    avgTxt: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
    examMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
    examMetaItem: { color: c.textFaint, fontSize: fontSize.xs },

    empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
    emptyIcon: { fontSize: 40 },
    emptyText: { color: c.textMuted, fontSize: fontSize.md, textAlign: 'center' },
  });
