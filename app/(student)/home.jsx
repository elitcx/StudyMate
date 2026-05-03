import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useData } from '../../src/contexts/DataContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { spacing, radius, fontSize, fontWeight, getShadow } from '../../utils/theme';

const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
function formatDate(s) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d) ? null : `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
function daysUntil(s) {
  if (!s) return null;
  const t = new Date(); t.setHours(0,0,0,0);
  const d = new Date(s); d.setHours(0,0,0,0);
  return Math.ceil((d - t) / 86400000);
}

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  const { user } = useAuth();
  const { subjects, quizzes, materials, getUserScores } = useData();
  const router = useRouter();

  const mySubjectIds = user?.enrolledSubjects || [];
  const mySubjects = subjects.filter((sub) => mySubjectIds.includes(sub.id));
  const myScores   = getUserScores(user?.id || '');

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Selamat pagi' : h < 17 ? 'Selamat siang' : 'Selamat malam';
  };

  const myGrade = user?.grade || null;
  const gradeFilteredSubjects = myGrade
    ? subjects.filter((sub) => !sub.grade || sub.grade === myGrade)
    : subjects;

  const allSubjects = mySubjects.length > 0 ? mySubjects : gradeFilteredSubjects;

  return (
    <SafeAreaView style={s.safe}>
      {/* Fixed header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>{greeting()},</Text>
          <Text style={s.name}>{user?.name?.split(' ')[0]} 👋</Text>
        </View>
        <TouchableOpacity
          style={s.avatarBtn}
          onPress={() => router.push('/(student)/profile')}
        >
          <Text style={s.avatarText}>{user?.avatar}</Text>
        </TouchableOpacity>
      </View>

      {/* Section label */}
      <View style={s.sectionRow}>
        <Text style={s.sectionTitle}>
          {mySubjects.length > 0 ? 'Mata Pelajaran Saya' : 'Semua Mata Pelajaran'}
        </Text>
        <TouchableOpacity onPress={() => router.push('/(student)/classes')}>
          <Text style={s.seeAll}>Lihat semua →</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={allSubjects}
        keyExtractor={(i) => i.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          <TouchableOpacity style={s.emptyCard} onPress={() => router.push('/(student)/classes')}>
            <Text style={s.emptyIcon}>📚</Text>
            <Text style={s.emptyTitle}>Belum ada mata pelajaran</Text>
            <Text style={s.emptySub}>Ketuk untuk mencari dan mendaftar kelas</Text>
            <View style={s.emptyBtn}>
              <Text style={s.emptyBtnText}>Cari Kelas</Text>
            </View>
          </TouchableOpacity>
        }
        renderItem={({ item: sub }) => {
          const subQuizzes = quizzes.filter((q) => q.subjectId === sub.id);
          const subMats    = materials.filter((m) => m.subjectId === sub.id);
          const completed  = subQuizzes.filter((q) => myScores.some((sc) => sc.quizId === q.id)).length;

          // Next upcoming exam (type='exam' only — practice quizzes don't show here)
          const upcoming = subQuizzes
            .filter((q) => q.date && (q.type ?? 'practice') === 'exam')
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .find((q) => daysUntil(q.date) >= 0);

          const days = upcoming ? daysUntil(upcoming.date) : null;
          let urgencyColor = colors.success;
          if (days !== null) {
            if (days === 0)    urgencyColor = colors.danger;
            else if (days <= 3) urgencyColor = colors.danger;
            else if (days <= 7) urgencyColor = colors.warning;
          }

          return (
            <TouchableOpacity
              style={[s.subjectCard, { borderLeftColor: sub.color, borderLeftWidth: 4 }]}
              onPress={() => router.push(`/(student)/subject/${sub.id}`)}
              activeOpacity={0.8}
            >
              {/* Top */}
              <View style={s.cardTop}>
                <View style={[s.iconBox, { backgroundColor: sub.color + '18' }]}>
                  <Text style={s.iconText}>{sub.icon}</Text>
                </View>
                <View style={s.cardInfo}>
                  <Text style={s.cardTitle}>{sub.title}</Text>
                  <Text style={s.cardDesc} numberOfLines={1}>{sub.description}</Text>
                </View>
                <Text style={s.chevron}>›</Text>
              </View>

              {/* Stats row */}
              <View style={s.statsRow}>
                <View style={s.stat}>
                  <Text style={s.statVal}>{subMats.length}</Text>
                  <Text style={s.statLbl}>Materi</Text>
                </View>
                <View style={s.statDiv} />
                <View style={s.stat}>
                  <Text style={s.statVal}>{subQuizzes.length}</Text>
                  <Text style={s.statLbl}>Ujian</Text>
                </View>
                <View style={s.statDiv} />
                <View style={s.stat}>
                  <Text style={s.statVal}>{completed}</Text>
                  <Text style={s.statLbl}>Selesai</Text>
                </View>
              </View>

              {/* Progress bar */}
              {subQuizzes.length > 0 && (
                <View style={s.progressRow}>
                  <View style={s.progressTrack}>
                    <View style={[s.progressFill, {
                      width: `${(completed / subQuizzes.length) * 100}%`,
                      backgroundColor: sub.color,
                    }]} />
                  </View>
                  <Text style={[s.progressPct, { color: sub.color }]}>
                    {Math.round((completed / subQuizzes.length) * 100)}%
                  </Text>
                </View>
              )}

              {/* Upcoming test badge */}
              {upcoming && (
                <View style={[s.upcomingBadge, { backgroundColor: urgencyColor + '18', borderColor: urgencyColor + '55' }]}>
                  <Text style={[s.upcomingText, { color: urgencyColor }]}>
                    📅 Ujian: {upcoming.title} · {days === 0 ? 'Hari ini' : `${days} hari lagi`} ({formatDate(upcoming.date)})
                  </Text>
                </View>
              )}
            </TouchableOpacity>
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

    header: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md,
    },
    greeting: { color: c.textMuted, fontSize: fontSize.sm },
    name: { color: c.text, fontSize: fontSize.xxl, fontWeight: fontWeight.black },
    avatarBtn: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: c.accent + '18',
      alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { fontSize: 22 },

    sectionRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: spacing.lg, paddingBottom: spacing.sm,
    },
    sectionTitle: { color: c.text, fontSize: fontSize.md, fontWeight: fontWeight.bold },
    seeAll: { color: c.accent, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

    list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },

    subjectCard: {
      backgroundColor: c.bgCard,
      borderRadius: radius.lg,
      ...(isDark
        ? { borderWidth: 1, borderColor: c.border }
        : { ...shadow.sm }),
      padding: spacing.md,
      marginBottom: spacing.md,
      gap: spacing.sm,
    },
    cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    iconBox: {
      width: 52, height: 52, borderRadius: radius.md,
      alignItems: 'center', justifyContent: 'center',
    },
    iconText: { fontSize: 26 },
    cardInfo: { flex: 1 },
    cardTitle: { color: c.text, fontSize: fontSize.md, fontWeight: fontWeight.bold, marginBottom: 2 },
    cardDesc: { color: c.textMuted, fontSize: fontSize.xs },
    chevron: { color: c.textMuted, fontSize: 24 },

    statsRow: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: c.bgElevated, borderRadius: radius.md, padding: spacing.sm,
    },
    stat: { flex: 1, alignItems: 'center' },
    statVal: { color: c.text, fontSize: fontSize.md, fontWeight: fontWeight.black },
    statLbl: { color: c.textFaint, fontSize: 10, marginTop: 1 },
    statDiv: { width: 1, height: 24, backgroundColor: c.border },

    progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    progressTrack: { flex: 1, height: 4, backgroundColor: c.border, borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: 4, borderRadius: 2 },
    progressPct: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, minWidth: 32, textAlign: 'right' },

    upcomingBadge: {
      borderRadius: radius.sm, borderWidth: 1,
      paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
    },
    upcomingText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },

    emptyCard: {
      backgroundColor: c.bgCard,
      borderRadius: radius.lg,
      ...(isDark
        ? { borderWidth: 1, borderColor: c.border }
        : { ...shadow.sm }),
      padding: spacing.xxl,
      alignItems: 'center',
      gap: spacing.sm,
    },
    emptyIcon: { fontSize: 48 },
    emptyTitle: { color: c.text, fontSize: fontSize.lg, fontWeight: fontWeight.bold },
    emptySub: { color: c.textMuted, fontSize: fontSize.sm, textAlign: 'center' },
    emptyBtn: {
      marginTop: spacing.sm,
      backgroundColor: c.accent,
      borderRadius: radius.md,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.sm,
    },
    emptyBtnText: { color: c.white, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  });
};
