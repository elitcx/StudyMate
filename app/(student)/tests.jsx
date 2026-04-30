import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useData } from '../../src/contexts/DataContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { spacing, radius, fontSize, fontWeight, getShadow } from '../../utils/theme';

export default function TestsScreen() {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  const { user } = useAuth();
  const { subjects, quizzes, materials, getUserScores } = useData();
  const router = useRouter();
  const [filter, setFilter] = useState('pending'); // 'pending' | 'done'

  const mySubjectIds = user?.enrolledSubjects || [];
  const myScores = getUserScores(user?.id || '');
  const completedIds = new Set(myScores.map((sc) => sc.quizId));

  const myQuizzes = quizzes.filter((q) => mySubjectIds.includes(q.subjectId));
  const pending = myQuizzes.filter((q) => !completedIds.has(q.id));
  const done = myQuizzes.filter((q) => completedIds.has(q.id));
  const displayed = filter === 'pending' ? pending : done;

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Ujian & Kuis</Text>

        {/* Stat boxes */}
        <View style={s.statsRow}>
          <View style={s.statBox}>
            <Text style={[s.statValue, { color: colors.accent }]}>{pending.length}</Text>
            <Text style={s.statLabel}>Belum dikerjakan</Text>
          </View>
          <View style={s.statBox}>
            <Text style={[s.statValue, { color: colors.success }]}>{done.length}</Text>
            <Text style={s.statLabel}>Sudah selesai</Text>
          </View>
        </View>

        {/* Filter pills */}
        <View style={s.filterRow}>
          {[
            { key: 'pending', label: `Belum (${pending.length})` },
            { key: 'done', label: `Selesai (${done.length})` },
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
      </View>

      <FlatList
        data={displayed}
        keyExtractor={(i) => i.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIcon}>{filter === 'pending' ? '🎉' : '📝'}</Text>
            <Text style={s.emptyTitle}>
              {filter === 'pending'
                ? 'Semua kuis sudah selesai!'
                : 'Belum ada kuis yang diselesaikan'}
            </Text>
          </View>
        }
        renderItem={({ item: quiz }) => {
          const sub = subjects.find((s) => s.id === quiz.subjectId);
          const score = myScores.find((sc) => sc.quizId === quiz.id);
          const pctColor = score
            ? score.percentage >= 70
              ? colors.success
              : score.percentage >= 50
              ? colors.warning
              : colors.danger
            : colors.accent;

          const quizMaterials = (quiz.materialIds || [])
            .map((mid) => materials.find((m) => m.id === mid))
            .filter(Boolean);

          const cardStyle = isDark
            ? [s.card, { borderWidth: 1, borderColor: colors.border }]
            : [s.card, getShadow(isDark).sm];

          return (
            <TouchableOpacity
              style={cardStyle}
              onPress={() => filter === 'pending' && router.push(`/(student)/quiz/${quiz.id}`)}
              activeOpacity={filter === 'pending' ? 0.8 : 1}
            >
              {/* Top row: icon + info + badge */}
              <View style={s.cardTop}>
                <View
                  style={[
                    s.iconBox,
                    { backgroundColor: (sub?.color || colors.accent) + '22' },
                  ]}
                >
                  <Text style={{ fontSize: 24 }}>{sub?.icon || '📝'}</Text>
                </View>
                <View style={s.cardInfo}>
                  <Text style={s.cardTitle}>{quiz.title}</Text>
                  <Text style={s.cardSub}>{sub?.title}</Text>
                </View>
                {score ? (
                  <View
                    style={[
                      s.scoreBadge,
                      { backgroundColor: pctColor + '22', borderColor: pctColor + '55' },
                    ]}
                  >
                    <Text style={[s.scoreText, { color: pctColor }]}>
                      {score.percentage}%
                    </Text>
                  </View>
                ) : (
                  <View style={s.pendingBadge}>
                    <Text style={s.pendingText}>Mulai →</Text>
                  </View>
                )}
              </View>

              {/* Meta row */}
              <View style={s.cardMeta}>
                <Text style={s.metaItem}>⏱ {quiz.duration} menit</Text>
                <Text style={s.metaDot}>·</Text>
                <Text style={s.metaItem}>❓ {quiz.questions?.length || 0} soal</Text>
                <Text style={s.metaDot}>·</Text>
                <Text style={s.metaItem}>🏆 {quiz.totalMarks} poin</Text>
              </View>

              {/* Description */}
              {quiz.description ? (
                <Text style={s.cardDesc} numberOfLines={2}>
                  {quiz.description}
                </Text>
              ) : null}

              {/* Materials preparation chips */}
              {quizMaterials.length > 0 && (
                <View style={s.materialsSection}>
                  <Text style={s.materialsTitle}>📚 Materi Persiapan:</Text>
                  <View style={s.materialsList}>
                    {quizMaterials.map((mat) => {
                      const typeIcon =
                        mat.type === 'video'
                          ? '🎬'
                          : mat.type === 'pdf'
                          ? '📄'
                          : '📝';
                      return (
                        <View key={mat.id} style={s.materialChip}>
                          <Text style={s.materialChipIcon}>{typeIcon}</Text>
                          <Text style={s.materialChipText} numberOfLines={1}>
                            {mat.title}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Score detail for completed */}
              {score && (
                <View style={s.scoreDetail}>
                  <Text style={s.scoreDetailText}>
                    Nilai: {score.score}/{score.total} · Selesai: {score.completedAt}
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
      backgroundColor: c.bgCard,
      padding: spacing.lg,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    title: {
      color: c.text,
      fontSize: fontSize.xxxl,
      fontWeight: fontWeight.black,
      marginBottom: spacing.md,
    },

    // Stats
    statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
    statBox: {
      flex: 1,
      backgroundColor: c.bgElevated,
      borderRadius: radius.md,
      padding: spacing.md,
      alignItems: 'center',
    },
    statValue: {
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.black,
    },
    statLabel: {
      color: c.textMuted,
      fontSize: fontSize.xs,
      marginTop: 2,
      textAlign: 'center',
    },

    // Filter pills
    filterRow: { flexDirection: 'row', gap: spacing.sm },
    filterBtn: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 2,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgElevated,
    },
    filterBtnActive: {
      backgroundColor: c.accent,
      borderColor: c.accent,
    },
    filterText: {
      color: c.textMuted,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
    },
    filterTextActive: {
      color: '#ffffff',
      fontWeight: fontWeight.bold,
    },

    // List
    list: { padding: spacing.lg, paddingBottom: spacing.xxl },

    // Card
    card: {
      backgroundColor: c.bgCard,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    cardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginBottom: spacing.sm,
    },
    iconBox: {
      width: 48,
      height: 48,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardInfo: { flex: 1 },
    cardTitle: {
      color: c.text,
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold,
    },
    cardSub: { color: c.textMuted, fontSize: fontSize.xs, marginTop: 2 },

    // Badges
    scoreBadge: {
      borderRadius: radius.full,
      borderWidth: 1,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    scoreText: { fontSize: fontSize.sm, fontWeight: fontWeight.black },
    pendingBadge: {
      backgroundColor: c.accent + '22',
      borderRadius: radius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderWidth: 1,
      borderColor: c.accent + '55',
    },
    pendingText: { color: c.accent, fontSize: fontSize.xs, fontWeight: fontWeight.bold },

    // Meta row
    cardMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.xs,
    },
    metaItem: { color: c.textFaint, fontSize: fontSize.xs },
    metaDot: { color: c.textFaint },

    // Description
    cardDesc: { color: c.textMuted, fontSize: fontSize.sm },

    // Materials
    materialsSection: {
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    materialsTitle: {
      color: c.textMuted,
      fontSize: fontSize.xs,
      marginBottom: spacing.xs,
    },
    materialsList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
    materialChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: c.accent + '18',
      borderRadius: radius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderWidth: 1,
      borderColor: c.accent + '44',
    },
    materialChipIcon: { fontSize: 12 },
    materialChipText: { color: c.accent, fontSize: fontSize.xs, maxWidth: 120 },

    // Score detail
    scoreDetail: {
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    scoreDetailText: { color: c.textFaint, fontSize: fontSize.xs },

    // Empty state
    empty: {
      alignItems: 'center',
      paddingVertical: spacing.xxl,
      gap: spacing.sm,
    },
    emptyIcon: { fontSize: 48 },
    emptyTitle: { color: c.textMuted, fontSize: fontSize.md, textAlign: 'center' },
  });
