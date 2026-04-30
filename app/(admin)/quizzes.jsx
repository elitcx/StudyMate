import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, KeyboardAvoidingView, Platform, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '../../src/contexts/DataContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors, spacing, fontSize, fontWeight, radius } from '../../utils/theme';

export default function QuizzesScreen() {
  const { subjects, quizzes, addQuiz, deleteQuiz } = useData();
  const { user } = useAuth();
  const [view, setView] = useState('list'); // 'list' | 'create'

  // Create quiz form state
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDesc, setQuizDesc] = useState('');
  const [quizDuration, setQuizDuration] = useState('15');
  const [quizMarks, setQuizMarks] = useState('10');
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || '');
  const [questions, setQuestions] = useState([]);
  // Question form
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState(0);

  const resetCreate = () => {
    setQuizTitle(''); setQuizDesc(''); setQuizDuration('15'); setQuizMarks('10');
    setSelectedSubject(subjects[0]?.id || ''); setQuestions([]);
    setQText(''); setQOptions(['', '', '', '']); setQCorrect(0);
  };

  const addQuestion = () => {
    if (!qText.trim()) { Alert.alert('Teks soal kosong'); return; }
    const filledOpts = qOptions.filter((o) => o.trim());
    if (filledOpts.length < 2) { Alert.alert('Minimal 2 pilihan jawaban'); return; }
    setQuestions((prev) => [...prev, {
      id: String(Date.now()),
      text: qText.trim(),
      options: qOptions.map((o) => o.trim()).filter(Boolean),
      correct: qCorrect,
    }]);
    setQText(''); setQOptions(['', '', '', '']); setQCorrect(0);
  };

  const removeQuestion = (id) => setQuestions((prev) => prev.filter((q) => q.id !== id));

  const handleCreateQuiz = () => {
    if (!quizTitle.trim()) { Alert.alert('Judul kosong', 'Isi judul kuis.'); return; }
    if (!selectedSubject) { Alert.alert('Pilih kelas', 'Pilih kelas untuk kuis ini.'); return; }
    if (questions.length === 0) { Alert.alert('Belum ada soal', 'Tambahkan minimal 1 soal.'); return; }
    addQuiz({
      title: quizTitle.trim(),
      description: quizDesc.trim(),
      duration: parseInt(quizDuration) || 15,
      totalMarks: parseInt(quizMarks) || 10,
      subjectId: selectedSubject,
      questions,
    });
    Alert.alert('Kuis dibuat! 🎉', `"${quizTitle}" berhasil dibuat dengan ${questions.length} soal.`, [
      { text: 'OK', onPress: () => { resetCreate(); setView('list'); } },
    ]);
  };

  // ── LIST VIEW ───────────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Kelola Kuis</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setView('create')}>
            <Text style={styles.addBtnText}>+ Buat Kuis</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={quizzes}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>✏️</Text>
              <Text style={styles.emptyText}>Belum ada kuis. Buat kuis pertama!</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => setView('create')}>
                <Text style={styles.emptyBtnText}>+ Buat Kuis</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item: quiz }) => {
            const sub = subjects.find((s) => s.id === quiz.subjectId);
            return (
              <View style={styles.quizCard}>
                <View style={styles.quizCardTop}>
                  <View style={[styles.quizIcon, { backgroundColor: (sub?.color || colors.accent) + '22' }]}>
                    <Text style={{ fontSize: 20 }}>{sub?.icon || '📝'}</Text>
                  </View>
                  <View style={styles.quizInfo}>
                    <Text style={styles.quizTitle}>{quiz.title}</Text>
                    <Text style={styles.quizSubject}>{sub?.title || 'Kelas tidak ditemukan'}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert('Hapus Kuis', `Hapus "${quiz.title}"?`, [
                        { text: 'Batal', style: 'cancel' },
                        { text: 'Hapus', style: 'destructive', onPress: () => deleteQuiz(quiz.id) },
                      ])
                    }
                  >
                    <Text style={{ color: colors.danger, fontSize: 18 }}>🗑</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.quizMeta}>
                  <Text style={styles.metaItem}>❓ {quiz.questions?.length || 0} soal</Text>
                  <Text style={styles.metaItem}>⏱ {quiz.duration} menit</Text>
                  <Text style={styles.metaItem}>🏆 {quiz.totalMarks} poin</Text>
                </View>
              </View>
            );
          }}
        />
      </SafeAreaView>
    );
  }

  // ── CREATE VIEW ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.createHeader}>
            <TouchableOpacity onPress={() => { resetCreate(); setView('list'); }}>
              <Text style={styles.backText}>← Kembali</Text>
            </TouchableOpacity>
            <Text style={styles.createTitle}>Buat Kuis Baru</Text>
          </View>

          {/* Quiz info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Info Kuis</Text>
            <Text style={styles.label}>Judul *</Text>
            <TextInput style={styles.input} value={quizTitle} onChangeText={setQuizTitle}
              placeholder="Contoh: Ulangan Harian 1" placeholderTextColor={colors.textFaint} />
            <Text style={styles.label}>Deskripsi</Text>
            <TextInput style={[styles.input, styles.textarea]} value={quizDesc} onChangeText={setQuizDesc}
              placeholder="Deskripsi kuis..." placeholderTextColor={colors.textFaint}
              multiline numberOfLines={2} textAlignVertical="top" />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Durasi (menit)</Text>
                <TextInput style={styles.input} value={quizDuration} onChangeText={setQuizDuration}
                  keyboardType="numeric" placeholderTextColor={colors.textFaint} />
              </View>
              <View style={{ width: spacing.md }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Total Poin</Text>
                <TextInput style={styles.input} value={quizMarks} onChangeText={setQuizMarks}
                  keyboardType="numeric" placeholderTextColor={colors.textFaint} />
              </View>
            </View>
            <Text style={styles.label}>Kelas *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.subjectPills}>
                {subjects.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.subjectPill, selectedSubject === s.id && { borderColor: s.color, backgroundColor: s.color + '22' }]}
                    onPress={() => setSelectedSubject(s.id)}
                  >
                    <Text style={{ fontSize: 14 }}>{s.icon}</Text>
                    <Text style={[styles.subjectPillText, selectedSubject === s.id && { color: s.color }]}>{s.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Add question */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tambah Soal</Text>
            <Text style={styles.label}>Teks Soal *</Text>
            <TextInput style={[styles.input, styles.textarea]} value={qText} onChangeText={setQText}
              placeholder="Tulis pertanyaan di sini..." placeholderTextColor={colors.textFaint}
              multiline numberOfLines={3} textAlignVertical="top" />
            <Text style={styles.label}>Pilihan Jawaban</Text>
            {qOptions.map((opt, i) => (
              <View key={i} style={styles.optionInputRow}>
                <TouchableOpacity
                  style={[styles.optRadio, qCorrect === i && styles.optRadioSelected]}
                  onPress={() => setQCorrect(i)}
                >
                  {qCorrect === i && <View style={styles.optRadioInner} />}
                </TouchableOpacity>
                <TextInput
                  style={[styles.input, styles.optInput, qCorrect === i && { borderColor: colors.success + '88' }]}
                  value={opt}
                  onChangeText={(v) => {
                    const newOpts = [...qOptions];
                    newOpts[i] = v;
                    setQOptions(newOpts);
                  }}
                  placeholder={`Pilihan ${String.fromCharCode(65 + i)}`}
                  placeholderTextColor={colors.textFaint}
                />
                {qCorrect === i && <Text style={{ color: colors.success, fontSize: 14 }}>✓</Text>}
              </View>
            ))}
            <Text style={styles.correctHint}>Ketuk lingkaran untuk memilih jawaban benar (saat ini: {String.fromCharCode(65 + qCorrect)})</Text>
            <TouchableOpacity style={styles.addQBtn} onPress={addQuestion}>
              <Text style={styles.addQBtnText}>+ Tambahkan Soal</Text>
            </TouchableOpacity>
          </View>

          {/* Questions list */}
          {questions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Soal Ditambahkan ({questions.length})</Text>
              {questions.map((q, i) => (
                <View key={q.id} style={styles.qRow}>
                  <View style={styles.qNum}>
                    <Text style={styles.qNumText}>{i + 1}</Text>
                  </View>
                  <View style={styles.qInfo}>
                    <Text style={styles.qText} numberOfLines={2}>{q.text}</Text>
                    <Text style={styles.qAnswer}>Jawaban: {String.fromCharCode(65 + q.correct)}. {q.options[q.correct]}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeQuestion(q.id)}>
                    <Text style={{ color: colors.danger, fontSize: 16 }}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.createBtn} onPress={handleCreateQuiz}>
            <Text style={styles.createBtnText}>
              🚀 Buat Kuis ({questions.length} soal)
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.lg,
  },
  title: { color: colors.white, fontSize: fontSize.xxxl, fontWeight: fontWeight.black },
  addBtn: {
    backgroundColor: colors.admin + '22', borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2,
    borderWidth: 1, borderColor: colors.admin + '55',
  },
  addBtnText: { color: colors.admin, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  quizCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.md,
  },
  quizCardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  quizIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  quizInfo: { flex: 1 },
  quizTitle: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.bold },
  quizSubject: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  quizMeta: { flexDirection: 'row', gap: spacing.md },
  metaItem: { color: colors.textFaint, fontSize: fontSize.xs },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: colors.textMuted, fontSize: fontSize.md, textAlign: 'center' },
  emptyBtn: {
    backgroundColor: colors.admin + '22', borderRadius: radius.md,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.sm,
    borderWidth: 1, borderColor: colors.admin + '55',
  },
  emptyBtnText: { color: colors.admin, fontSize: fontSize.sm, fontWeight: fontWeight.bold },

  // Create view
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  createHeader: { marginBottom: spacing.xl },
  backText: { color: colors.textMuted, fontSize: fontSize.sm, marginBottom: spacing.sm },
  createTitle: { color: colors.white, fontSize: fontSize.xxxl, fontWeight: fontWeight.black },
  section: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.lg, marginBottom: spacing.lg,
  },
  sectionTitle: { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: spacing.sm },
  label: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: fontWeight.medium, marginBottom: spacing.xs, marginTop: spacing.md },
  input: {
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    color: colors.text, fontSize: fontSize.md,
  },
  textarea: { minHeight: 72 },
  row: { flexDirection: 'row' },
  subjectPills: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.xs },
  subjectPill: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2,
    backgroundColor: colors.bg,
  },
  subjectPillText: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  optionInputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  optRadio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  optRadioSelected: { borderColor: colors.success },
  optRadioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.success },
  optInput: { flex: 1, marginBottom: 0 },
  correctHint: { color: colors.textFaint, fontSize: fontSize.xs, marginTop: spacing.xs, marginBottom: spacing.md },
  addQBtn: {
    backgroundColor: colors.accent + '22', borderRadius: radius.md,
    paddingVertical: spacing.md, alignItems: 'center',
    borderWidth: 1, borderColor: colors.accent + '55',
  },
  addQBtnText: { color: colors.accent, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  qRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm,
    backgroundColor: colors.bg, borderRadius: radius.sm,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.sm, marginBottom: spacing.sm,
  },
  qNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.accent + '22', borderWidth: 1, borderColor: colors.accent + '55',
    alignItems: 'center', justifyContent: 'center',
  },
  qNumText: { color: colors.accent, fontSize: fontSize.xs, fontWeight: fontWeight.black },
  qInfo: { flex: 1 },
  qText: { color: colors.text, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  qAnswer: { color: colors.success, fontSize: fontSize.xs, marginTop: 2 },
  createBtn: {
    backgroundColor: colors.admin, borderRadius: radius.md,
    paddingVertical: spacing.md + 2, alignItems: 'center',
  },
  createBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.black },
});
