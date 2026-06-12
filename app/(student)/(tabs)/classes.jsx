import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useData } from '../../../src/contexts/DataContext';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { spacing, radius, fontSize, fontWeight, getShadow, opacity } from '../../../utils/theme';


const GRADE_COLORS = { X: '#38bdf8', XI: '#a78bfa', XII: '#4ade80' };

export default function ClassesScreen() {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  const { user, enrollInSubject, unenrollFromSubject } = useAuth();
  const { subjects, getSubjectQuizzes, getUserScores } = useData();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'enrolled'

  const mySubjectIds = user?.enrolledSubjects || [];
  const myScores = getUserScores(user?.id || '');
  const myGrade = user?.grade || null;

  // Only show subjects for the student's grade (or subjects with no grade set)
  const gradeFiltered = myGrade
    ? subjects.filter((sub) => !sub.grade || sub.grade === myGrade)
    : subjects;

  const baseList = filter === 'enrolled'
    ? gradeFiltered.filter((sub) => mySubjectIds.includes(sub.id))
    : gradeFiltered;

  const filtered = baseList.filter((sub) =>
    sub.title.toLowerCase().includes(search.toLowerCase()) ||
    sub.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleEnroll = (sub) => {
    const isEnrolled = mySubjectIds.includes(sub.id);
    if (isEnrolled) {
      Alert.alert(
        'Keluar dari Kelas',
        `Yakin ingin keluar dari kelas "${sub.title}"?`,
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Keluar', style: 'destructive', onPress: () => unenrollFromSubject(user.id, sub.id) },
        ]
      );
    } else {
      enrollInSubject(user.id, sub.id);
      Alert.alert('Berhasil! 🎉', `Kamu sekarang terdaftar di kelas "${sub.title}".`);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        {/* Title row */}
        <View style={s.titleRow}>
          <Text style={s.title}>Kelas</Text>
          {myGrade && (
            <View style={[s.myGradeBadge, {
              backgroundColor: (GRADE_COLORS[myGrade] || colors.accent) + opacity.subtle,
              borderColor: (GRADE_COLORS[myGrade] || colors.accent) + opacity.muted,
            }]}>
              <Text style={[s.myGradeBadgeText, { color: GRADE_COLORS[myGrade] || colors.accent }]}>
                Kelas {myGrade}
              </Text>
            </View>
          )}
        </View>

        {/* No-grade warning */}
        {!myGrade && (
          <View style={s.gradeWarning}>
            <Text style={s.gradeWarningText}>
              ⚠️ Kelasmu belum diatur. Tampil semua kelas. Hubungi admin untuk mengatur kelas.
            </Text>
          </View>
        )}

        {/* Filter pills */}
        <View style={s.filterRow}>
          {[
            { key: 'all', label: `Semua (${gradeFiltered.length})` },
            { key: 'enrolled', label: `Kelas Saya (${mySubjectIds.length})` },
          ].map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[s.filterBtn, filter === f.key && s.filterBtnActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[s.filterText, filter === f.key && s.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search bar */}
        <View style={s.searchBox}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Cari kelas..."
            placeholderTextColor={colors.textFaint}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={s.searchClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📭</Text>
            <Text style={s.emptyText}>
              {filter === 'enrolled'
                ? 'Belum terdaftar di kelas apapun.\nCari kelas di tab "Semua".'
                : 'Tidak ada kelas ditemukan.'}
            </Text>
          </View>
        }
        renderItem={({ item: sub }) => {
          const isEnrolled = mySubjectIds.includes(sub.id);
          const subQuizzes = getSubjectQuizzes(sub.id);
          const completedCount = subQuizzes.filter((q) =>
            myScores.some((sc) => sc.quizId === q.id)
          ).length;

          return (
            <TouchableOpacity
              style={[
                s.card,
                isEnrolled && { borderLeftColor: sub.color, borderLeftWidth: 4 },
              ]}
              onPress={() => router.push(`/(student)/subject/${sub.id}`)}
              activeOpacity={0.8}
            >
              {/* Icon + info */}
              <View style={s.cardTop}>
                <View style={[s.iconBox, { backgroundColor: sub.color + opacity.tint }]}>
                  <Text style={s.iconEmoji}>{sub.icon}</Text>
                </View>
                <View style={s.cardInfo}>
                  <View style={s.cardTitleRow}>
                    <Text style={s.cardTitle}>{sub.title}</Text>
                    {sub.grade && (
                      <View style={[s.gradeBadge, {
                        backgroundColor: (GRADE_COLORS[sub.grade] || colors.accent) + opacity.subtle,
                        borderColor: (GRADE_COLORS[sub.grade] || colors.accent) + opacity.muted,
                      }]}>
                        <Text style={[s.gradeBadgeText, { color: GRADE_COLORS[sub.grade] || colors.accent }]}>
                          {sub.grade}
                        </Text>
                      </View>
                    )}
                    {isEnrolled && (
                      <View style={s.enrolledBadge}>
                        <Text style={s.enrolledText}>✓ Terdaftar</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.cardDesc} numberOfLines={2}>{sub.description}</Text>
                </View>
              </View>

              {/* Progress bar for enrolled */}
              {isEnrolled && subQuizzes.length > 0 && (
                <View style={s.progressWrap}>
                  <View style={s.progressTrack}>
                    <View style={[
                      s.progressFill,
                      { width: `${(completedCount / subQuizzes.length) * 100}%`, backgroundColor: sub.color },
                    ]} />
                  </View>
                  <Text style={[s.progressLabel, { color: sub.color }]}>
                    {Math.round((completedCount / subQuizzes.length) * 100)}%
                  </Text>
                </View>
              )}

              {/* Action row */}
              <View style={s.cardActions}>
                <TouchableOpacity
                  style={s.viewBtn}
                  onPress={() => router.push(`/(student)/subject/${sub.id}`)}
                >
                  <Text style={s.viewBtnText}>Lihat Detail →</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    s.enrollBtn,
                    isEnrolled
                      ? { backgroundColor: colors.danger + '15', borderColor: colors.danger + opacity.muted }
                      : { backgroundColor: sub.color + opacity.subtle, borderColor: sub.color + opacity.muted },
                  ]}
                  onPress={() => handleEnroll(sub)}
                >
                  <Text style={[s.enrollBtnText, { color: isEnrolled ? colors.danger : sub.color }]}>
                    {isEnrolled ? '− Keluar' : '+ Daftar'}
                  </Text>
                </TouchableOpacity>
              </View>
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

    header: { padding: spacing.lg, paddingBottom: spacing.md },
    titleRow: {
      flexDirection: 'row', alignItems: 'center',
      gap: spacing.sm, marginBottom: spacing.sm,
    },
    title: { color: c.text, fontSize: fontSize.xxxl, fontWeight: fontWeight.black },
    myGradeBadge: {
      borderRadius: radius.full, borderWidth: 1,
      paddingHorizontal: spacing.sm, paddingVertical: 3,
    },
    myGradeBadgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.black },

    gradeWarning: {
      backgroundColor: c.warning + '15',
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.warning + opacity.soft,
      padding: spacing.sm,
      marginBottom: spacing.sm,
    },
    gradeWarningText: { color: c.warning, fontSize: fontSize.xs, lineHeight: 16 },

    filterRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
    filterBtn: {
      paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2,
      borderRadius: radius.full, borderWidth: 1,
      borderColor: c.border, backgroundColor: c.bgCard,
    },
    filterBtnActive: { backgroundColor: c.accent, borderColor: c.accent },
    filterText: { color: c.textMuted, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
    filterTextActive: { color: c.white, fontWeight: fontWeight.bold },

    searchBox: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: c.bgCard,
      borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border,
      paddingHorizontal: spacing.md, gap: spacing.sm,
    },
    searchIcon: { fontSize: 14 },
    searchInput: {
      flex: 1, color: c.text,
      fontSize: fontSize.md, paddingVertical: spacing.md,
    },
    searchClear: { color: c.textMuted, fontSize: 16 },

    list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },

    card: {
      backgroundColor: c.bgCard,
      borderRadius: radius.lg,
      ...(isDark
        ? { borderWidth: 1, borderColor: c.border }
        : { ...shadow.sm }),
      padding: spacing.md,
      marginBottom: spacing.md,
      gap: spacing.md,
    },
    cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
    iconBox: {
      width: 52, height: 52, borderRadius: radius.md,
      alignItems: 'center', justifyContent: 'center',
    },
    iconEmoji: { fontSize: 28 },
    cardInfo: { flex: 1 },
    cardTitleRow: {
      flexDirection: 'row', alignItems: 'center',
      gap: spacing.sm, marginBottom: spacing.xs, flexWrap: 'wrap',
    },
    cardTitle: { color: c.text, fontSize: fontSize.md, fontWeight: fontWeight.bold },
    gradeBadge: {
      borderRadius: radius.full, borderWidth: 1,
      paddingHorizontal: spacing.xs + 2, paddingVertical: 2,
    },
    gradeBadgeText: { fontSize: 10, fontWeight: fontWeight.black },
    enrolledBadge: {
      backgroundColor: c.success + opacity.subtle, borderRadius: radius.full,
      paddingHorizontal: spacing.sm, paddingVertical: 2,
      borderWidth: 1, borderColor: c.success + opacity.muted,
    },
    enrolledText: { color: c.success, fontSize: 10, fontWeight: fontWeight.bold },
    cardDesc: { color: c.textMuted, fontSize: fontSize.sm },

    progressWrap: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
      paddingTop: spacing.xs, borderTopWidth: 1, borderTopColor: c.border,
    },
    progressTrack: {
      flex: 1, height: 4, backgroundColor: c.border, borderRadius: 2, overflow: 'hidden',
    },
    progressFill: { height: 4, borderRadius: 2 },
    progressLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, minWidth: 32, textAlign: 'right' },

    cardActions: { flexDirection: 'row', gap: spacing.sm },
    viewBtn: {
      flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md,
      backgroundColor: c.bgElevated, borderWidth: 1, borderColor: c.border,
      alignItems: 'center',
    },
    viewBtnText: { color: c.textMuted, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
    enrollBtn: {
      paddingVertical: spacing.sm, paddingHorizontal: spacing.lg,
      borderRadius: radius.md, borderWidth: 1, alignItems: 'center',
    },
    enrollBtnText: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },

    empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
    emptyIcon: { fontSize: 40 },
    emptyText: { color: c.textMuted, fontSize: fontSize.md, textAlign: 'center', lineHeight: 22 },
  });
};
