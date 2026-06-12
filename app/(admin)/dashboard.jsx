import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useData } from '../../src/contexts/DataContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { spacing, radius, fontSize, fontWeight, getShadow, opacity } from '../../utils/theme';


const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
function fmtDate(s) {
  if (!s) return 'Tanggal belum ditetapkan';
  const d = new Date(s);
  return isNaN(d) ? s : `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
function daysUntil(s) {
  if (!s) return null;
  const t = new Date(); t.setHours(0,0,0,0);
  const d = new Date(s); d.setHours(0,0,0,0);
  return Math.ceil((d - t) / 86400000);
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { subjects, quizzes, materials, deleteQuiz } = useData();
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [expandedSubject, setExpandedSubject] = useState(null);

  const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  const handleDeleteQuiz = (quiz) => {
    Alert.alert('Hapus Ujian', `Yakin hapus "${quiz.title}"?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => deleteQuiz(quiz.id) },
    ]);
  };

  // Group quizzes by subject
  const subjectsWithQuizzes = subjects.map((sub) => ({
    ...sub,
    exams: quizzes.filter((q) => q.subjectId === sub.id)
      .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0)),
  }));

  const totalExams = quizzes.length;
  const upcoming = quizzes.filter((q) => { const d = daysUntil(q.date); return d !== null && d >= 0; }).length;

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerText}>
          <Text style={s.greeting}>Dashboard Admin</Text>
          <Text style={s.name}>Halo, {user?.name?.split(' ')[0]} 👩‍🏫</Text>
        </View>
        <View style={[s.avatar, { backgroundColor: colors.admin + opacity.tint, borderColor: colors.admin + '40' }]}>
          <Text style={{ fontSize: 22 }}>{user?.avatar}</Text>
        </View>
      </View>

      {/* Quick stats */}
      <View style={s.statsRow}>
        <View style={[s.statBox, { borderTopColor: colors.admin }]}>
          <Text style={[s.statVal, { color: colors.admin }]}>{subjects.length}</Text>
          <Text style={s.statLbl}>Mata Pelajaran</Text>
        </View>
        <View style={[s.statBox, { borderTopColor: colors.accent }]}>
          <Text style={[s.statVal, { color: colors.accent }]}>{totalExams}</Text>
          <Text style={s.statLbl}>Total Ujian</Text>
        </View>
        <View style={[s.statBox, { borderTopColor: colors.warning }]}>
          <Text style={[s.statVal, { color: colors.warning }]}>{upcoming}</Text>
          <Text style={s.statLbl}>Akan Datang</Text>
        </View>
        <View style={[s.statBox, { borderTopColor: colors.success }]}>
          <Text style={[s.statVal, { color: colors.success }]}>{materials.length}</Text>
          <Text style={s.statLbl}>Materi</Text>
        </View>
      </View>

      {/* Section + add button */}
      <View style={s.sectionRow}>
        <Text style={s.sectionTitle}>Daftar Ujian per Mata Pelajaran</Text>
        <TouchableOpacity
          style={s.addBtn}
          onPress={() => router.push('/(admin)/create-class')}
        >
          <Text style={s.addBtnText}>+ Kelas</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={subjectsWithQuizzes}
        keyExtractor={(i) => i.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📭</Text>
            <Text style={s.emptyText}>Belum ada mata pelajaran. Buat kelas terlebih dahulu.</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/(admin)/create-class')}>
              <Text style={s.emptyBtnText}>+ Buat Kelas</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item: sub }) => {
          const isOpen = expandedSubject === sub.id;
          return (
            <View style={s.subjectBlock}>
              {/* Subject header */}
              <TouchableOpacity
                style={[s.subjectHeader, { borderLeftColor: sub.color }]}
                onPress={() => setExpandedSubject(isOpen ? null : sub.id)}
                activeOpacity={0.8}
              >
                <View style={[s.subIconBox, { backgroundColor: sub.color + opacity.subtle }]}>
                  <Text style={{ fontSize: 20 }}>{sub.icon}</Text>
                </View>
                <View style={s.subInfo}>
                  <View style={s.subTitleRow}>
                    <Text style={s.subTitle}>{sub.title}</Text>
                    {sub.grade ? (
                      <View style={[s.gradeBadge, { backgroundColor: sub.color + opacity.subtle, borderColor: sub.color + opacity.muted }]}>
                        <Text style={[s.gradeBadgeText, { color: sub.color }]}>{sub.grade}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={s.subMeta}>{sub.exams.length} ujian · {sub.materialsCount} materi</Text>
                </View>
                <TouchableOpacity
                  style={[s.addExamBtn, { backgroundColor: sub.color + opacity.tint, borderColor: sub.color + opacity.soft }]}
                  onPress={() => router.push({ pathname: '/(admin)/create-quiz', params: { subjectId: sub.id } })}
                >
                  <Text style={[s.addExamBtnText, { color: sub.color }]}>+ Ujian</Text>
                </TouchableOpacity>
                <Text style={s.chevron}>{isOpen ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {/* Expanded exam list */}
              {isOpen && (
                <View style={s.examList}>
                  {sub.exams.length === 0 ? (
                    <View style={s.examEmpty}>
                      <Text style={s.examEmptyText}>Belum ada ujian untuk mata pelajaran ini.</Text>
                      <TouchableOpacity
                        onPress={() => router.push({ pathname: '/(admin)/create-quiz', params: { subjectId: sub.id } })}
                      >
                        <Text style={[s.examEmptyLink, { color: sub.color }]}>+ Tambah ujian</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    sub.exams.map((exam) => {
                      const days = daysUntil(exam.date);
                      let urgencyColor = colors.success;
                      let urgencyLabel = days !== null ? `${days} hari lagi` : '';
                      if (days === null) urgencyLabel = '';
                      if (days < 0)  { urgencyColor = colors.textFaint; urgencyLabel = 'Sudah lewat'; }
                      if (days === 0){ urgencyColor = colors.danger; urgencyLabel = 'Hari ini!'; }
                      if (days > 0 && days <= 3) urgencyColor = colors.danger;
                      if (days > 3 && days <= 7) urgencyColor = colors.warning;

                      return (
                        <View key={exam.id} style={s.examRow}>
                          <View style={s.examInfo}>
                            <View style={s.examTitleRow}>
                              <Text style={s.examTitle}>{exam.title}</Text>
                              {urgencyLabel ? (
                                <View style={[s.urgencyBadge, { backgroundColor: urgencyColor + opacity.subtle, borderColor: urgencyColor + opacity.muted }]}>
                                  <Text style={[s.urgencyTxt, { color: urgencyColor }]}>{urgencyLabel}</Text>
                                </View>
                              ) : null}
                            </View>
                            <Text style={s.examDate}>📅 {fmtDate(exam.date)}</Text>
                            <Text style={s.examMeta}>
                              ❓ {exam.questions?.length || 0} soal  ·  ⏱ {exam.duration} menit  ·  🏆 {exam.totalMarks} poin
                            </Text>
                          </View>
                          <View style={s.examActions}>
                            <TouchableOpacity
                              style={s.editBtn}
                              onPress={() => router.push({ pathname: '/(admin)/add-material', params: { subjectId: sub.id } })}
                            >
                              <Text style={s.editBtnText}>+ Materi</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={s.deleteBtn}
                              onPress={() => handleDeleteQuiz(exam)}
                            >
                              <Text style={s.deleteBtnText}>🗑</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const makeStyles = (c, isDark) => {
  const shadow = getShadow(isDark);
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },

    // Header
    header: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md,
    },
    headerText: { flex: 1, marginRight: spacing.md },
    greeting: { color: c.textMuted, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
    name: { color: c.text, fontSize: fontSize.xl, fontWeight: fontWeight.black, marginTop: 2 },
    avatar: {
      width: 44, height: 44, borderRadius: 22,
      borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
    },

    // Stats
    statsRow: {
      flexDirection: 'row', gap: spacing.sm,
      paddingHorizontal: spacing.lg, marginBottom: spacing.lg,
    },
    statBox: {
      flex: 1,
      backgroundColor: c.bgCard,
      borderRadius: radius.md,
      borderTopWidth: 3,
      padding: spacing.sm,
      alignItems: 'center',
      ...(isDark
        ? { borderWidth: 1, borderColor: c.border }
        : shadow.sm),
    },
    statVal: { fontSize: fontSize.xl, fontWeight: fontWeight.black, lineHeight: 26 },
    statLbl: { color: c.textFaint, fontSize: 9, textAlign: 'center', marginTop: 2, fontWeight: fontWeight.medium },

    // Section row
    sectionRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: spacing.lg, marginBottom: spacing.sm,
    },
    sectionTitle: { color: c.text, fontSize: fontSize.md, fontWeight: fontWeight.bold },
    addBtn: {
      backgroundColor: c.admin + opacity.tint, borderRadius: radius.full,
      paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2,
      borderWidth: 1, borderColor: c.admin + opacity.muted,
    },
    addBtnText: { color: c.admin, fontSize: fontSize.sm, fontWeight: fontWeight.bold },

    // List
    list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },

    // Subject block
    subjectBlock: {
      backgroundColor: c.bgCard,
      borderRadius: radius.lg,
      marginBottom: spacing.md,
      overflow: 'hidden',
      ...(isDark
        ? { borderWidth: 1, borderColor: c.border }
        : shadow.sm),
    },
    subjectHeader: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
      padding: spacing.md,
      borderLeftWidth: 4,
    },
    subIconBox: {
      width: 44, height: 44, borderRadius: radius.sm,
      alignItems: 'center', justifyContent: 'center',
    },
    subInfo: { flex: 1 },
    subTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
    subTitle: { color: c.text, fontSize: fontSize.md, fontWeight: fontWeight.bold },
    subMeta: { color: c.textFaint, fontSize: fontSize.xs, marginTop: 2 },
    gradeBadge: {
      borderRadius: radius.full, borderWidth: 1,
      paddingHorizontal: spacing.xs + 2, paddingVertical: 2,
    },
    gradeBadgeText: { fontSize: 10, fontWeight: fontWeight.black },
    addExamBtn: {
      borderRadius: radius.full,
      paddingHorizontal: spacing.sm, paddingVertical: 4,
      borderWidth: 1,
    },
    addExamBtnText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
    chevron: { color: c.textMuted, fontSize: 12 },

    // Exam list
    examList: {
      borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border,
      paddingHorizontal: spacing.md, paddingBottom: spacing.md,
    },
    examEmpty: { padding: spacing.md, alignItems: 'center', gap: spacing.xs },
    examEmptyText: { color: c.textFaint, fontSize: fontSize.sm },
    examEmptyLink: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
    examRow: {
      flexDirection: 'row', alignItems: 'flex-start',
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border,
      gap: spacing.sm,
    },
    examInfo: { flex: 1 },
    examTitleRow: {
      flexDirection: 'row', alignItems: 'center',
      gap: spacing.sm, marginBottom: 4, flexWrap: 'wrap',
    },
    examTitle: { color: c.text, fontSize: fontSize.sm, fontWeight: fontWeight.bold, flex: 1 },
    urgencyBadge: { borderRadius: radius.full, borderWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: 2 },
    urgencyTxt: { fontSize: 10, fontWeight: fontWeight.bold },
    examDate: { color: c.textMuted, fontSize: fontSize.xs, marginBottom: 2 },
    examMeta: { color: c.textFaint, fontSize: fontSize.xs },
    examActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    editBtn: {
      backgroundColor: c.admin + opacity.tint, borderRadius: radius.sm,
      paddingHorizontal: spacing.sm, paddingVertical: 4,
      borderWidth: 1, borderColor: c.admin + '40',
    },
    editBtnText: { color: c.admin, fontSize: fontSize.xs, fontWeight: fontWeight.bold },
    deleteBtn: {
      backgroundColor: c.danger + opacity.tint, borderRadius: radius.sm,
      paddingHorizontal: spacing.sm, paddingVertical: 4,
      borderWidth: 1, borderColor: c.danger + '40',
    },
    deleteBtnText: { fontSize: 14 },

    // Empty state
    empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md },
    emptyIcon: { fontSize: 48 },
    emptyText: { color: c.textMuted, fontSize: fontSize.md, textAlign: 'center', lineHeight: 22 },
    emptyBtn: {
      backgroundColor: c.admin + opacity.tint, borderRadius: radius.md,
      paddingHorizontal: spacing.xl, paddingVertical: spacing.sm,
      borderWidth: 1, borderColor: c.admin + opacity.muted,
    },
    emptyBtnText: { color: c.admin, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  });
};
