import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '../../src/contexts/DataContext';
import { colors, spacing, fontSize, fontWeight, radius } from '../../utils/theme';

export default function ContentScreen() {
  const { subjects, materials, quizzes, scores, deleteSubject, deleteMaterial, deleteQuiz } = useData();
  const [tab, setTab] = useState('subjects'); // 'subjects' | 'materials' | 'quizzes' | 'scores'

  const tabs = [
    { key: 'subjects', label: 'Kelas', count: subjects.length, icon: '📚' },
    { key: 'materials', label: 'Materi', count: materials.length, icon: '📄' },
    { key: 'quizzes', label: 'Kuis', count: quizzes.length, icon: '✏️' },
    { key: 'scores', label: 'Nilai', count: scores.length, icon: '📊' },
  ];

  const confirmDelete = (type, item, onConfirm) => {
    Alert.alert(`Hapus ${type}`, `Yakin hapus "${item.title || item.id}"?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: onConfirm },
    ]);
  };

  const renderSubject = ({ item: sub }) => (
    <View style={styles.itemCard}>
      <View style={[styles.iconBox, { backgroundColor: sub.color + '22' }]}>
        <Text style={{ fontSize: 22 }}>{sub.icon}</Text>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle}>{sub.title}</Text>
        <Text style={styles.itemMeta}>{sub.materialsCount} materi · {sub.quizzesCount} kuis</Text>
        <Text style={styles.itemDesc} numberOfLines={1}>{sub.description}</Text>
      </View>
      <TouchableOpacity onPress={() => confirmDelete('Kelas', sub, () => deleteSubject(sub.id))}>
        <Text style={{ color: colors.danger, fontSize: 18 }}>🗑</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMaterial = ({ item: mat }) => {
    const sub = subjects.find((s) => s.id === mat.subjectId);
    return (
      <View style={styles.itemCard}>
        <View style={[styles.iconBox, { backgroundColor: (mat.type === 'video' ? colors.admin : colors.danger) + '22' }]}>
          <Text style={{ fontSize: 20 }}>{mat.type === 'video' ? '🎬' : '📄'}</Text>
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle}>{mat.title}</Text>
          <Text style={styles.itemMeta}>{sub?.title} · {mat.type.toUpperCase()} · {mat.author}</Text>
        </View>
        <TouchableOpacity onPress={() => confirmDelete('Materi', mat, () => deleteMaterial(mat.id))}>
          <Text style={{ color: colors.danger, fontSize: 18 }}>🗑</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderQuiz = ({ item: quiz }) => {
    const sub = subjects.find((s) => s.id === quiz.subjectId);
    return (
      <View style={styles.itemCard}>
        <View style={[styles.iconBox, { backgroundColor: colors.accent + '22' }]}>
          <Text style={{ fontSize: 20 }}>✏️</Text>
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle}>{quiz.title}</Text>
          <Text style={styles.itemMeta}>{sub?.title} · {quiz.questions?.length || 0} soal · {quiz.duration} menit</Text>
        </View>
        <TouchableOpacity onPress={() => confirmDelete('Kuis', quiz, () => deleteQuiz(quiz.id))}>
          <Text style={{ color: colors.danger, fontSize: 18 }}>🗑</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderScore = ({ item: sc }) => {
    const quiz = quizzes.find((q) => q.id === sc.quizId);
    const sub = subjects.find((s) => s.id === sc.subjectId);
    const pctColor = sc.percentage >= 70 ? colors.success : sc.percentage >= 50 ? colors.warning : colors.danger;
    return (
      <View style={styles.itemCard}>
        <View style={[styles.iconBox, { backgroundColor: pctColor + '22' }]}>
          <Text style={{ fontSize: 20 }}>📊</Text>
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle}>{quiz?.title || 'Kuis'}</Text>
          <Text style={styles.itemMeta}>
            {sub?.title} · User #{sc.userId} · {sc.completedAt}
          </Text>
        </View>
        <View style={[styles.scoreBadge, { backgroundColor: pctColor + '22', borderColor: pctColor + '55' }]}>
          <Text style={[styles.scoreText, { color: pctColor }]}>{sc.percentage}%</Text>
        </View>
      </View>
    );
  };

  const data = tab === 'subjects' ? subjects
    : tab === 'materials' ? materials
    : tab === 'quizzes' ? quizzes
    : scores;

  const renderItem = tab === 'subjects' ? renderSubject
    : tab === 'materials' ? renderMaterial
    : tab === 'quizzes' ? renderQuiz
    : renderScore;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Kelola Konten</Text>
        <Text style={styles.subtitle}>Lihat & hapus semua konten sistem</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={{ fontSize: 14 }}>{t.icon}</Text>
            <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>
              {t.label}
            </Text>
            <View style={[styles.tabCount, tab === t.key && styles.tabCountActive]}>
              <Text style={[styles.tabCountText, tab === t.key && styles.tabCountTextActive]}>{t.count}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>Tidak ada data</Text>
          </View>
        }
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  title: { color: colors.white, fontSize: fontSize.xxxl, fontWeight: fontWeight.black },
  subtitle: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: 2 },
  tabsRow: {
    flexDirection: 'row', gap: spacing.xs,
    paddingHorizontal: spacing.lg, paddingBottom: spacing.sm,
  },
  tabBtn: {
    flex: 1, alignItems: 'center', paddingVertical: spacing.sm,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.bgCard, gap: 2,
  },
  tabBtnActive: { backgroundColor: colors.superadmin + '22', borderColor: colors.superadmin },
  tabLabel: { color: colors.textMuted, fontSize: 10, fontWeight: fontWeight.medium },
  tabLabelActive: { color: colors.superadmin, fontWeight: fontWeight.bold },
  tabCount: {
    backgroundColor: colors.border, borderRadius: radius.full,
    paddingHorizontal: 6, paddingVertical: 1,
  },
  tabCountActive: { backgroundColor: colors.superadmin + '33' },
  tabCountText: { color: colors.textMuted, fontSize: 10, fontWeight: fontWeight.bold },
  tabCountTextActive: { color: colors.superadmin },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  itemCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgCard, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.sm, gap: spacing.md,
  },
  iconBox: { width: 44, height: 44, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1 },
  itemTitle: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  itemMeta: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 1 },
  itemDesc: { color: colors.textFaint, fontSize: fontSize.xs, marginTop: 1 },
  scoreBadge: {
    borderRadius: radius.full, borderWidth: 1,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
  },
  scoreText: { fontSize: fontSize.sm, fontWeight: fontWeight.black },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyIcon: { fontSize: 40 },
  emptyText: { color: colors.textMuted, fontSize: fontSize.md },
});
