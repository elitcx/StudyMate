import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useData } from '../../../src/contexts/DataContext';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { spacing, radius, fontSize, fontWeight, getShadow, opacity } from '../../../utils/theme';


const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
function fmtDate(s) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d) ? s : `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
function daysUntil(s) {
  if (!s) return null;
  const t = new Date(); t.setHours(0,0,0,0);
  const d = new Date(s); d.setHours(0,0,0,0);
  return Math.ceil((d - t) / 86400000);
}

export default function TestsScreen() {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  const { user } = useAuth();
  const { subjects, quizzes, materials } = useData();
  const router = useRouter();
  const [filter, setFilter] = useState('upcoming');

  const mySubjectIds = user?.enrolledSubjects || [];
  const today = new Date().toISOString().split('T')[0];

  const myExams = quizzes.filter(
    (q) => mySubjectIds.includes(q.subjectId) && (q.type ?? 'practice') === 'exam'
  );

  const upcoming = myExams
    .filter((q) => !q.date || q.date >= today)
    .sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date.localeCompare(b.date);
    });

  const past = myExams
    .filter((q) => q.date && q.date < today)
    .sort((a, b) => b.date.localeCompare(a.date));

  const displayed = filter === 'upcoming' ? upcoming : past;

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Ujian</Text>

        {/* Filter pills */}
        <View style={s.filterRow}>
          {[
            { key: 'upcoming', label: `Mendatang (${upcoming.length})` },
            { key: 'past',     label: `Lewat (${past.length})` },
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
        key={isDark ? 'dark' : 'light'}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIcon}>{filter === 'upcoming' ? '📅' : '✅'}</Text>
            <Text style={s.emptyTitle}>
              {filter === 'upcoming'
                ? 'Tidak ada ujian mendatang'
                : 'Belum ada ujian yang lewat'}
            </Text>
          </View>
        }
        renderItem={({ item: exam }) => {
          const sub = subjects.find((su) => su.id === exam.subjectId);
          const days = daysUntil(exam.date);

          let urgencyColor = colors.success;
          let urgencyLabel = days !== null ? `${days} hari lagi` : null;
          if (days === null)            { urgencyColor = colors.textFaint; }
          if (days !== null && days < 0){ urgencyColor = colors.textFaint; urgencyLabel = 'Sudah lewat'; }
          if (days === 0)               { urgencyColor = colors.danger;  urgencyLabel = 'Hari ini!'; }
          if (days > 0 && days <= 3)    urgencyColor = colors.danger;
          if (days > 3 && days <= 7)    urgencyColor = colors.warning;

          const examMaterials = (exam.materialIds || [])
            .map((mid) => materials.find((m) => m.id === mid))
            .filter(Boolean);

          const cardStyle = isDark
            ? [s.card, { borderWidth: 1, borderColor: colors.border }]
            : [s.card, getShadow(isDark).sm];

          return (
            <TouchableOpacity
              style={cardStyle}
              onPress={() => router.push({
                pathname: '/(student)/test-materials',
                params: { testId: exam.id, subjectId: exam.subjectId },
              })}
              activeOpacity={0.8}
            >
              {/* Top row: icon + info + badge */}
              <View style={s.cardTop}>
                <View style={[s.iconBox, { backgroundColor: (sub?.color || colors.accent) + opacity.subtle }]}>
                  <Text style={{ fontSize: 24 }}>{sub?.icon || '📝'}</Text>
                </View>
                <View style={s.cardInfo}>
                  <Text style={s.cardTitle}>{exam.title}</Text>
                  <Text style={s.cardSub}>{sub?.title}</Text>
                </View>
                <View style={s.prepBadge}>
                  <Text style={s.prepText}>Lihat Persiapan →</Text>
                </View>
              </View>

              {/* Date row */}
              <View style={[s.dateRow, { backgroundColor: urgencyColor + '12', borderColor: urgencyColor + opacity.soft }]}>
                <Text style={s.dateIcon}>📅</Text>
                <Text style={[s.dateText, { color: urgencyColor }]}>
                  {fmtDate(exam.date) ?? 'Tanggal belum ditentukan'}
                  {urgencyLabel ? ` · ${urgencyLabel}` : ''}
                </Text>
              </View>

              {/* Description */}
              {exam.description ? (
                <Text style={s.cardDesc} numberOfLines={2}>{exam.description}</Text>
              ) : null}

              {/* Materials preparation chips */}
              {examMaterials.length > 0 && (
                <View style={s.materialsSection}>
                  <Text style={s.materialsTitle}>📚 Materi Persiapan:</Text>
                  <View style={s.materialsList}>
                    {examMaterials.map((mat) => {
                      const typeIcon =
                        mat.type === 'video' ? '🎬' : mat.type === 'pdf' ? '📄' : '📝';
                      return (
                        <View key={mat.id} style={s.materialChip}>
                          <Text style={s.materialChipIcon}>{typeIcon}</Text>
                          <Text style={s.materialChipText} numberOfLines={1}>{mat.title}</Text>
                        </View>
                      );
                    })}
                  </View>
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
      color: c.white,
      fontWeight: fontWeight.bold,
    },

    list: { padding: spacing.lg, paddingBottom: spacing.xxl },

    card: {
      backgroundColor: c.bgCard,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      gap: spacing.sm,
    },
    cardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
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

    prepBadge: {
      backgroundColor: c.accent + opacity.subtle,
      borderRadius: radius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderWidth: 1,
      borderColor: c.accent + opacity.muted,
    },
    prepText: { color: c.accent, fontSize: fontSize.xs, fontWeight: fontWeight.bold },

    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      borderRadius: radius.sm,
      borderWidth: 1,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs + 2,
    },
    dateIcon: { fontSize: 13 },
    dateText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

    cardDesc: { color: c.textMuted, fontSize: fontSize.sm },

    materialsSection: {
      paddingTop: spacing.xs,
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
      backgroundColor: c.accent + opacity.tint,
      borderRadius: radius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderWidth: 1,
      borderColor: c.accent + opacity.soft,
    },
    materialChipIcon: { fontSize: 12 },
    materialChipText: { color: c.accent, fontSize: fontSize.xs, maxWidth: 120 },

    empty: {
      alignItems: 'center',
      paddingVertical: spacing.xxl,
      gap: spacing.sm,
    },
    emptyIcon: { fontSize: 48 },
    emptyTitle: { color: c.textMuted, fontSize: fontSize.md, textAlign: 'center' },
  });
