import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useData } from '../../src/contexts/DataContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { spacing, radius, fontSize, fontWeight, getShadow } from '../../utils/theme';

export default function BankSoalScreen() {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  const { user } = useAuth();
  const { subjects, quizzes, getUserScores } = useData();
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'done' | 'pending'

  const myScores = getUserScores(user?.id || '');
  const completedIds = new Set(myScores.map((sc) => sc.quizId));

  // Grade filtering — keep 100% intact
  const myGrade = user?.grade || null;
  const gradeSubjects = myGrade
    ? subjects.filter((sub) => !sub.grade || sub.grade === myGrade)
    : subjects;
  const gradeSubjectIds = new Set(gradeSubjects.map((sub) => sub.id));
  const gradeQuizzes = quizzes.filter((q) => gradeSubjectIds.has(q.subjectId));

  const filtered = useMemo(() => {
    return gradeQuizzes.filter((q) => {
      const matchSubject = selectedSubject === 'all' || q.subjectId === selectedSubject;
      const matchSearch =
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        (q.description || '').toLowerCase().includes(search.toLowerCase());
      const isDone = completedIds.has(q.id);
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'done' && isDone) ||
        (statusFilter === 'pending' && !isDone);
      return matchSubject && matchSearch && matchStatus;
    });
  }, [gradeQuizzes, selectedSubject, search, statusFilter, completedIds]);

  const doneCount = gradeQuizzes.filter((q) => completedIds.has(q.id)).length;
  const pendingCount = gradeQuizzes.length - doneCount;

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Bank Soal</Text>
        <Text style={s.subtitle}>
          {gradeQuizzes.length} kuis · {doneCount} selesai · {pendingCount} belum
        </Text>
      </View>

      {/* Search bar */}
      <View style={s.searchWrap}>
        <View style={s.searchBox}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Cari nama atau deskripsi kuis..."
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

      {/* Status filter pills */}
      <View style={s.statusRow}>
        {[
          { key: 'all', label: `Semua (${gradeQuizzes.length})` },
          { key: 'pending', label: `Belum (${pendingCount})` },
          { key: 'done', label: `Selesai (${doneCount})` },
        ].map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[s.statusBtn, statusFilter === f.key && s.statusBtnActive]}
            onPress={() => setStatusFilter(f.key)}
          >
            <Text style={[s.statusText, statusFilter === f.key && s.statusTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Subject chips (horizontal scroll) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.chips}
      >
        <TouchableOpacity
          style={[s.chip, selectedSubject === 'all' && s.chipActive]}
          onPress={() => setSelectedSubject('all')}
        >
          <Text style={[s.chipText, selectedSubject === 'all' && s.chipTextActive]}>
            Semua
          </Text>
        </TouchableOpacity>
        {gradeSubjects.map((sub) => {
          const isSelected = selectedSubject === sub.id;
          return (
            <TouchableOpacity
              key={sub.id}
              style={[
                s.chip,
                isSelected && { backgroundColor: sub.color + '33', borderColor: sub.color },
              ]}
              onPress={() => setSelectedSubject(sub.id)}
            >
              <Text style={s.chipEmoji}>{sub.icon}</Text>
              <Text
                style={[
                  s.chipText,
                  isSelected && { color: sub.color, fontWeight: fontWeight.bold },
                ]}
                numberOfLines={1}
              >
                {sub.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Fixed-height result count — always rendered, prevents layout shift */}
      <View style={s.resultCountWrap}>
        {(search || selectedSubject !== 'all' || statusFilter !== 'all') ? (
          <Text style={s.resultCount}>
            {filtered.length} hasil{search ? ` untuk "${search}"` : ''}
          </Text>
        ) : null}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🔍</Text>
            <Text style={s.emptyText}>Tidak ada kuis ditemukan</Text>
            <TouchableOpacity
              style={s.clearBtn}
              onPress={() => {
                setSearch('');
                setSelectedSubject('all');
                setStatusFilter('all');
              }}
            >
              <Text style={s.clearBtnText}>Reset Filter</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item: quiz }) => {
          const sub = subjects.find((su) => su.id === quiz.subjectId);
          const score = myScores.find((sc) => sc.quizId === quiz.id);
          const isDone = completedIds.has(quiz.id);
          const pctColor = score
            ? score.percentage >= 70
              ? colors.success
              : score.percentage >= 50
              ? colors.warning
              : colors.danger
            : colors.accent;

          const cardStyle = isDark
            ? [s.card, { borderWidth: 1, borderColor: colors.border }]
            : [s.card, getShadow(isDark).sm];

          return (
            <TouchableOpacity
              style={cardStyle}
              onPress={() => router.push(`/(student)/quiz/${quiz.id}`)}
              activeOpacity={0.8}
            >
              {/* Card header: icon + subject tag + status badge */}
              <View style={s.cardHeader}>
                <View
                  style={[
                    s.iconBox,
                    { backgroundColor: (sub?.color || colors.accent) + '22' },
                  ]}
                >
                  <Text style={{ fontSize: 22 }}>{sub?.icon || '📝'}</Text>
                </View>
                <View style={s.cardMeta}>
                  <Text style={s.subjectTag}>{sub?.title || '—'}</Text>
                  {isDone ? (
                    <View
                      style={[
                        s.badge,
                        { backgroundColor: pctColor + '22', borderColor: pctColor + '55' },
                      ]}
                    >
                      <Text style={[s.badgeText, { color: pctColor }]}>
                        ✓ {score?.percentage}%
                      </Text>
                    </View>
                  ) : (
                    <View style={s.newBadge}>
                      <Text style={s.newBadgeText}>Belum dikerjakan</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Quiz title + description */}
              <Text style={s.quizTitle}>{quiz.title}</Text>
              {quiz.description ? (
                <Text style={s.quizDesc} numberOfLines={2}>
                  {quiz.description}
                </Text>
              ) : null}

              {/* Footer meta + start/retry button */}
              <View style={s.quizFooter}>
                <View style={s.footerItem}>
                  <Text style={s.footerIcon}>❓</Text>
                  <Text style={s.footerText}>{quiz.questions?.length || 0} soal</Text>
                </View>
                <View style={s.footerItem}>
                  <Text style={s.footerIcon}>⏱</Text>
                  <Text style={s.footerText}>{quiz.duration} menit</Text>
                </View>
                <View style={s.footerItem}>
                  <Text style={s.footerIcon}>🏆</Text>
                  <Text style={s.footerText}>{quiz.totalMarks} poin</Text>
                </View>
                <View
                  style={[
                    s.startBtn,
                    isDone && {
                      backgroundColor: colors.success + '22',
                      borderColor: colors.success + '55',
                    },
                  ]}
                >
                  <Text style={[s.startBtnText, isDone && { color: colors.success }]}>
                    {isDone ? '🔄 Ulangi' : 'Mulai →'}
                  </Text>
                </View>
              </View>

              {/* Score bar for completed */}
              {isDone && score && (
                <View style={s.scoreBar}>
                  <View style={s.scoreTrack}>
                    <View
                      style={[
                        s.scoreFill,
                        { width: `${score.percentage}%`, backgroundColor: pctColor },
                      ]}
                    />
                  </View>
                  <Text style={[s.scoreBarLabel, { color: pctColor }]}>
                    {score.score}/{score.total} benar
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

const makeStyles = (c, isDark) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },

    // Header
    header: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xs,
    },
    title: {
      color: c.text,
      fontSize: fontSize.xxxl,
      fontWeight: fontWeight.black,
    },
    subtitle: { color: c.textMuted, fontSize: fontSize.sm, marginTop: 2 },

    // Search
    searchWrap: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.xs,
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.bgCard,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
    },
    searchIcon: { fontSize: 14 },
    searchInput: {
      flex: 1,
      color: c.text,
      fontSize: fontSize.md,
      paddingVertical: spacing.md,
    },
    searchClear: { color: c.textMuted, fontSize: 16 },

    // Status filter pills
    statusRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
    },
    statusBtn: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 2,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgCard,
    },
    statusBtnActive: {
      backgroundColor: c.accent + '22',
      borderColor: c.accent,
    },
    statusText: { color: c.textMuted, fontSize: fontSize.xs, fontWeight: fontWeight.medium },
    statusTextActive: { color: c.accent, fontWeight: fontWeight.bold },

    // Subject chips
    chips: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
      gap: spacing.sm,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: spacing.md,
      height: 34,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgCard,
    },
    chipActive: { backgroundColor: c.accent + '22', borderColor: c.accent },
    chipText: {
      color: c.textMuted,
      fontSize: 13,
      fontWeight: fontWeight.medium,
      lineHeight: 18,
      includeFontPadding: false,
    },
    chipTextActive: { color: c.accent, fontWeight: fontWeight.bold },
    chipEmoji: {
      fontSize: 13,
      lineHeight: 18,
      includeFontPadding: false,
    },

    // Result count
    resultCountWrap: {
      height: 28,
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
    },
    resultCount: { color: c.textFaint, fontSize: fontSize.xs },

    // List
    list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },

    // Card
    card: {
      backgroundColor: c.bgCard,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    iconBox: {
      width: 40,
      height: 40,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardMeta: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    subjectTag: { color: c.textMuted, fontSize: fontSize.xs, fontWeight: fontWeight.medium },
    badge: {
      borderRadius: radius.full,
      borderWidth: 1,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    badgeText: { fontSize: 10, fontWeight: fontWeight.bold },
    newBadge: {
      backgroundColor: c.accent + '11',
      borderRadius: radius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderWidth: 1,
      borderColor: c.accent + '33',
    },
    newBadgeText: { color: c.accent, fontSize: 10 },

    // Quiz body
    quizTitle: {
      color: c.text,
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold,
      marginBottom: spacing.xs,
    },
    quizDesc: { color: c.textMuted, fontSize: fontSize.sm, marginBottom: spacing.md },

    // Footer
    quizFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginTop: spacing.xs,
    },
    footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    footerIcon: { fontSize: 12 },
    footerText: { color: c.textFaint, fontSize: fontSize.xs },
    startBtn: {
      marginLeft: 'auto',
      backgroundColor: c.accent + '22',
      borderRadius: radius.full,
      paddingHorizontal: spacing.md,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: c.accent + '55',
    },
    startBtnText: { color: c.accent, fontSize: fontSize.xs, fontWeight: fontWeight.bold },

    // Score bar
    scoreBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    scoreTrack: {
      flex: 1,
      height: 4,
      backgroundColor: c.border,
      borderRadius: 2,
      overflow: 'hidden',
    },
    scoreFill: { height: 4, borderRadius: 2 },
    scoreBarLabel: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.bold,
      minWidth: 64,
      textAlign: 'right',
    },

    // Empty state
    empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md },
    emptyIcon: { fontSize: 40 },
    emptyText: { color: c.textMuted, fontSize: fontSize.md, textAlign: 'center' },
    clearBtn: {
      backgroundColor: c.accent + '22',
      borderRadius: radius.full,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderWidth: 1,
      borderColor: c.accent + '55',
    },
    clearBtnText: { color: c.accent, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  });
