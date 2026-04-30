import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useData } from '../../src/contexts/DataContext';
import { colors, spacing, fontSize, fontWeight, radius } from '../../utils/theme';

const GRADE_COLORS = { X: '#38bdf8', XI: '#a78bfa', XII: '#4ade80' };

export default function AdminClassesScreen() {
  const { subjects, materials, quizzes, deleteSubject, deleteMaterial, deleteQuiz } = useData();
  const router = useRouter();
  const [expanded, setExpanded] = useState(null);

  const handleDeleteSubject = (sub) => {
    Alert.alert(
      'Hapus Kelas',
      `Yakin hapus "${sub.title}"? Semua materi dan kuis di kelas ini juga akan dihapus.`,
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: () => { deleteSubject(sub.id); setExpanded(null); } },
      ]
    );
  };

  const handleDeleteMaterial = (mat) => {
    Alert.alert('Hapus Materi', `Yakin hapus "${mat.title}"?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => deleteMaterial(mat.id) },
    ]);
  };

  const handleDeleteQuiz = (quiz) => {
    Alert.alert('Hapus Kuis', `Yakin hapus "${quiz.title}"?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => deleteQuiz(quiz.id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Kelola Kelas</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/(admin)/create-class')}
        >
          <Text style={styles.addBtnText}>+ Tambah</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={subjects}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>Belum ada kelas. Buat kelas pertama!</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.push('/(admin)/create-class')}
            >
              <Text style={styles.emptyBtnText}>+ Buat Kelas</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item: sub }) => {
          const subMaterials = materials.filter((m) => m.subjectId === sub.id);
          const subQuizzes = quizzes.filter((q) => q.subjectId === sub.id);
          const isOpen = expanded === sub.id;

          return (
            <View style={styles.subjectCard}>
              {/* Subject header */}
              <TouchableOpacity
                style={styles.subjectHeader}
                onPress={() => setExpanded(isOpen ? null : sub.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.subjectIcon, { backgroundColor: sub.color + '22' }]}>
                  <Text style={{ fontSize: 22 }}>{sub.icon}</Text>
                </View>
                <View style={styles.subjectInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
                    <Text style={styles.subjectTitle}>{sub.title}</Text>
                    {sub.grade && (
                      <View style={[styles.gradeBadge, { backgroundColor: (GRADE_COLORS[sub.grade] || colors.accent) + '22', borderColor: (GRADE_COLORS[sub.grade] || colors.accent) + '55' }]}>
                        <Text style={[styles.gradeBadgeText, { color: GRADE_COLORS[sub.grade] || colors.accent }]}>
                          {sub.grade}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.subjectMeta}>{subMaterials.length} materi · {subQuizzes.length} kuis</Text>
                </View>
                <View style={styles.subjectActions}>
                  <TouchableOpacity
                    style={styles.deleteIconBtn}
                    onPress={() => handleDeleteSubject(sub)}
                  >
                    <Text style={{ color: colors.danger, fontSize: 16 }}>🗑</Text>
                  </TouchableOpacity>
                  <Text style={styles.chevron}>{isOpen ? '▲' : '▼'}</Text>
                </View>
              </TouchableOpacity>

              {/* Expanded content */}
              {isOpen && (
                <View style={styles.expandedContent}>
                  {/* Materials */}
                  <View style={styles.expandedSection}>
                    <View style={styles.expandedSectionHeader}>
                      <Text style={styles.expandedSectionTitle}>📄 Materi ({subMaterials.length})</Text>
                      <TouchableOpacity
                        onPress={() => router.push({ pathname: '/(admin)/add-material', params: { subjectId: sub.id } })}
                      >
                        <Text style={styles.addLink}>+ Tambah</Text>
                      </TouchableOpacity>
                    </View>
                    {subMaterials.length === 0 ? (
                      <Text style={styles.emptyInline}>Belum ada materi</Text>
                    ) : (
                      subMaterials.map((mat) => (
                        <View key={mat.id} style={styles.itemRow}>
                          <Text style={{ fontSize: 14, marginRight: spacing.sm }}>
                            {mat.type === 'video' ? '🎬' : '📄'}
                          </Text>
                          <View style={styles.itemInfo}>
                            <Text style={styles.itemTitle}>{mat.title}</Text>
                            <Text style={styles.itemMeta}>{mat.type.toUpperCase()} · {mat.author}</Text>
                          </View>
                          <TouchableOpacity onPress={() => handleDeleteMaterial(mat)}>
                            <Text style={{ color: colors.danger, fontSize: 14 }}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      ))
                    )}
                  </View>

                  {/* Quizzes */}
                  <View style={styles.expandedSection}>
                    <View style={styles.expandedSectionHeader}>
                      <Text style={styles.expandedSectionTitle}>✏️ Kuis ({subQuizzes.length})</Text>
                      <TouchableOpacity
                        onPress={() => router.push({ pathname: '/(admin)/create-quiz', params: { subjectId: sub.id } })}
                      >
                        <Text style={styles.addLink}>+ Tambah</Text>
                      </TouchableOpacity>
                    </View>
                    {subQuizzes.length === 0 ? (
                      <Text style={styles.emptyInline}>Belum ada kuis</Text>
                    ) : (
                      subQuizzes.map((quiz) => (
                        <View key={quiz.id} style={styles.itemRow}>
                          <Text style={{ fontSize: 14, marginRight: spacing.sm }}>📝</Text>
                          <View style={styles.itemInfo}>
                            <Text style={styles.itemTitle}>{quiz.title}</Text>
                            <Text style={styles.itemMeta}>{quiz.questions?.length || 0} soal · {quiz.duration} menit</Text>
                          </View>
                          <TouchableOpacity onPress={() => handleDeleteQuiz(quiz)}>
                            <Text style={{ color: colors.danger, fontSize: 14 }}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      ))
                    )}
                  </View>
                </View>
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.lg, paddingBottom: spacing.md,
  },
  title: { color: colors.white, fontSize: fontSize.xxxl, fontWeight: fontWeight.black },
  addBtn: {
    backgroundColor: colors.admin + '22', borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2,
    borderWidth: 1, borderColor: colors.admin + '55',
  },
  addBtnText: { color: colors.admin, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  subjectCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md, overflow: 'hidden',
  },
  subjectHeader: {
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.md, gap: spacing.md,
  },
  subjectIcon: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  subjectInfo: { flex: 1 },
  subjectTitle: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.bold },
  subjectMeta: { color: colors.textFaint, fontSize: fontSize.xs, marginTop: 2 },
  gradeBadge: {
    borderRadius: radius.full, borderWidth: 1,
    paddingHorizontal: spacing.xs + 2, paddingVertical: 2,
  },
  gradeBadgeText: { fontSize: 10, fontWeight: fontWeight.black },
  subjectActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  deleteIconBtn: { padding: 4 },
  chevron: { color: colors.textMuted, fontSize: 12 },
  expandedContent: {
    borderTopWidth: 1, borderTopColor: colors.border,
    paddingHorizontal: spacing.md, paddingBottom: spacing.md,
  },
  expandedSection: { marginTop: spacing.md },
  expandedSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  expandedSectionTitle: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  addLink: { color: colors.admin, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  emptyInline: { color: colors.textFaint, fontSize: fontSize.xs, fontStyle: 'italic', paddingLeft: spacing.sm },
  itemRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bg, borderRadius: radius.sm,
    padding: spacing.sm, marginBottom: 6,
    borderWidth: 1, borderColor: colors.border + '88',
  },
  itemInfo: { flex: 1 },
  itemTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  itemMeta: { color: colors.textFaint, fontSize: 11, marginTop: 1 },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: colors.textMuted, fontSize: fontSize.md, textAlign: 'center' },
  emptyBtn: {
    backgroundColor: colors.admin + '22', borderRadius: radius.md,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.sm,
    borderWidth: 1, borderColor: colors.admin + '55',
  },
  emptyBtnText: { color: colors.admin, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
});
