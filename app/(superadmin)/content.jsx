import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '../../src/contexts/DataContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { spacing, radius, fontSize, fontWeight, getShadow, opacity } from '../../utils/theme';


export default function ContentScreen() {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  const { subjects, materials, quizzes, scores, deleteSubject, deleteMaterial, deleteQuiz } = useData();
  const [tab, setTab] = useState('subjects');

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
    <View style={s.itemCard}>
      <View style={[s.iconBox, { backgroundColor: sub.color + opacity.subtle }]}>
        <Text style={{ fontSize: 22 }}>{sub.icon}</Text>
      </View>
      <View style={s.itemInfo}>
        <Text style={s.itemTitle}>{sub.title}</Text>
        <Text style={s.itemMeta}>{sub.materialsCount} materi · {sub.quizzesCount} kuis</Text>
        <Text style={s.itemDesc} numberOfLines={1}>{sub.description}</Text>
      </View>
      <TouchableOpacity onPress={() => confirmDelete('Kelas', sub, () => deleteSubject(sub.id))}>
        <Text style={{ color: colors.danger, fontSize: 18 }}>🗑</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMaterial = ({ item: mat }) => {
    const sub = subjects.find((su) => su.id === mat.subjectId);
    return (
      <View style={s.itemCard}>
        <View style={[s.iconBox, { backgroundColor: (mat.type === 'video' ? colors.admin : colors.danger) + opacity.subtle }]}>
          <Text style={{ fontSize: 20 }}>{mat.type === 'video' ? '🎬' : '📄'}</Text>
        </View>
        <View style={s.itemInfo}>
          <Text style={s.itemTitle}>{mat.title}</Text>
          <Text style={s.itemMeta}>{sub?.title} · {mat.type.toUpperCase()} · {mat.author}</Text>
        </View>
        <TouchableOpacity onPress={() => confirmDelete('Materi', mat, () => deleteMaterial(mat.id))}>
          <Text style={{ color: colors.danger, fontSize: 18 }}>🗑</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderQuiz = ({ item: quiz }) => {
    const sub = subjects.find((su) => su.id === quiz.subjectId);
    return (
      <View style={s.itemCard}>
        <View style={[s.iconBox, { backgroundColor: colors.accent + opacity.subtle }]}>
          <Text style={{ fontSize: 20 }}>✏️</Text>
        </View>
        <View style={s.itemInfo}>
          <Text style={s.itemTitle}>{quiz.title}</Text>
          <Text style={s.itemMeta}>{sub?.title} · {quiz.questions?.length || 0} soal · {quiz.duration} menit</Text>
        </View>
        <TouchableOpacity onPress={() => confirmDelete('Kuis', quiz, () => deleteQuiz(quiz.id))}>
          <Text style={{ color: colors.danger, fontSize: 18 }}>🗑</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderScore = ({ item: sc }) => {
    const quiz = quizzes.find((q) => q.id === sc.quizId);
    const sub = subjects.find((su) => su.id === sc.subjectId);
    const pctColor = sc.percentage >= 70 ? colors.success : sc.percentage >= 50 ? colors.warning : colors.danger;
    return (
      <View style={s.itemCard}>
        <View style={[s.iconBox, { backgroundColor: pctColor + opacity.subtle }]}>
          <Text style={{ fontSize: 20 }}>📊</Text>
        </View>
        <View style={s.itemInfo}>
          <Text style={s.itemTitle}>{quiz?.title || 'Kuis'}</Text>
          <Text style={s.itemMeta}>
            {sub?.title} · User #{sc.userId} · {sc.completedAt}
          </Text>
        </View>
        <View style={[s.scoreBadge, { backgroundColor: pctColor + opacity.subtle, borderColor: pctColor + opacity.muted }]}>
          <Text style={[s.scoreText, { color: pctColor }]}>{sc.percentage}%</Text>
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
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>Kelola Konten</Text>
        <Text style={s.subtitle}>Lihat & hapus semua konten sistem</Text>
      </View>

      <View style={s.tabsRow}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[s.tabBtn, tab === t.key && s.tabBtnActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={{ fontSize: 14 }}>{t.icon}</Text>
            <Text style={[s.tabLabel, tab === t.key && s.tabLabelActive]}>
              {t.label}
            </Text>
            <View style={[s.tabCount, tab === t.key && s.tabCountActive]}>
              <Text style={[s.tabCountText, tab === t.key && s.tabCountTextActive]}>{t.count}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📭</Text>
            <Text style={s.emptyText}>Tidak ada data</Text>
          </View>
        }
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

const makeStyles = (c, isDark) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
    title: { color: c.text, fontSize: fontSize.xxxl, fontWeight: fontWeight.black },
    subtitle: { color: c.textMuted, fontSize: fontSize.sm, marginTop: 2 },
    tabsRow: {
      flexDirection: 'row', gap: spacing.xs,
      paddingHorizontal: spacing.lg, paddingBottom: spacing.sm,
    },
    tabBtn: {
      flex: 1, alignItems: 'center', paddingVertical: spacing.sm,
      borderRadius: radius.md, borderWidth: 1, borderColor: c.border,
      backgroundColor: c.bgCard, gap: 2,
    },
    tabBtnActive: { backgroundColor: c.superadmin + opacity.subtle, borderColor: c.superadmin },
    tabLabel: { color: c.textMuted, fontSize: 10, fontWeight: fontWeight.medium },
    tabLabelActive: { color: c.superadmin, fontWeight: fontWeight.bold },
    tabCount: {
      backgroundColor: c.border, borderRadius: radius.full,
      paddingHorizontal: 6, paddingVertical: 1,
    },
    tabCountActive: { backgroundColor: c.superadmin + '33' },
    tabCountText: { color: c.textMuted, fontSize: 10, fontWeight: fontWeight.bold },
    tabCountTextActive: { color: c.superadmin },
    list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
    itemCard: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: c.bgCard, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border,
      padding: spacing.md, marginBottom: spacing.sm, gap: spacing.md,
    },
    iconBox: { width: 44, height: 44, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
    itemInfo: { flex: 1 },
    itemTitle: { color: c.text, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
    itemMeta: { color: c.textMuted, fontSize: fontSize.xs, marginTop: 1 },
    itemDesc: { color: c.textFaint, fontSize: fontSize.xs, marginTop: 1 },
    scoreBadge: {
      borderRadius: radius.full, borderWidth: 1,
      paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
    },
    scoreText: { fontSize: fontSize.sm, fontWeight: fontWeight.black },
    empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
    emptyIcon: { fontSize: 40 },
    emptyText: { color: c.textMuted, fontSize: fontSize.md },
  });
