import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useData } from '../../src/contexts/DataContext';
import { colors, spacing, fontSize, fontWeight, radius } from '../../utils/theme';

export default function CreateQuizScreen() {
  const { subjectId } = useLocalSearchParams();
  const { subjects, materials, addQuiz } = useData();
  const router = useRouter();

  const subject = subjects.find((s) => s.id === subjectId);
  const subjectMaterials = materials.filter((m) => m.subjectId === subjectId);

  // Quiz metadata
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDesc, setQuizDesc] = useState('');
  const [duration, setDuration] = useState('15');
  const [totalMarks, setTotalMarks] = useState('10');
  const [testDate, setTestDate] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState([]);

  // Toggle material selection
  const toggleMaterial = (materialId) => {
    setSelectedMaterials((prev) =>
      prev.includes(materialId)
        ? prev.filter((id) => id !== materialId)
        : [...prev, materialId]
    );
  };

  // Questions state
  const [questions, setQuestions] = useState([]);

  // Current question being built
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState(0);

  const addQuestion = () => {
    if (!qText.trim()) {
      Alert.alert('Soal kosong', 'Tulis teks pertanyaan terlebih dahulu.');
      return;
    }
    const filled = qOptions.filter((o) => o.trim());
    if (filled.length < 2) {
      Alert.alert('Pilihan kurang', 'Isi minimal 2 pilihan jawaban.');
      return;
    }
    if (!qOptions[qCorrect]?.trim()) {
      Alert.alert('Jawaban benar kosong', 'Pilihan yang ditandai benar tidak boleh kosong.');
      return;
    }
    const allOptions = qOptions.map((o) => o.trim()).filter(Boolean);
    // Recalculate correct index after filtering empty options
    const correctText = qOptions[qCorrect]?.trim();
    const newCorrect = allOptions.indexOf(correctText);

    setQuestions((prev) => [
      ...prev,
      { id: String(Date.now()), text: qText.trim(), options: allOptions, correct: newCorrect >= 0 ? newCorrect : 0 },
    ]);
    setQText('');
    setQOptions(['', '', '', '']);
    setQCorrect(0);
  };

  const removeQuestion = (id) => setQuestions((prev) => prev.filter((q) => q.id !== id));

  const moveQuestion = (id, dir) => {
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q.id === id);
      if ((dir === -1 && idx === 0) || (dir === 1 && idx === prev.length - 1)) return prev;
      const arr = [...prev];
      [arr[idx], arr[idx + dir]] = [arr[idx + dir], arr[idx]];
      return arr;
    });
  };

  const handleCreate = () => {
    if (!quizTitle.trim()) { Alert.alert('Judul kosong', 'Isi judul kuis.'); return; }
    if (!subjectId) { Alert.alert('Error', 'Kelas tidak valid.'); return; }
    if (questions.length === 0) { Alert.alert('Belum ada soal', 'Tambahkan minimal 1 soal terlebih dahulu.'); return; }

    addQuiz({
      subjectId,
      title: quizTitle.trim(),
      description: quizDesc.trim(),
      duration: parseInt(duration) || 15,
      totalMarks: parseInt(totalMarks) || 10,
      date: testDate.trim() || null,
      questions,
      materialIds: selectedMaterials,
    });

    Alert.alert(
      'Kuis dibuat! 🎉',
      `"${quizTitle}" berhasil dibuat dengan ${questions.length} soal${subject ? ` untuk kelas ${subject.title}` : ''}.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backText}>← Kembali</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Buat Kuis Baru</Text>
          {subject && (
            <View style={[styles.subjectBadge, { backgroundColor: subject.color + '22', borderColor: subject.color + '55' }]}>
              <Text style={{ fontSize: 14 }}>{subject.icon}</Text>
              <Text style={[styles.subjectBadgeText, { color: subject.color }]}>{subject.title}</Text>
            </View>
          )}

          {/* ── Quiz Info ──────────────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📋 Info Kuis</Text>

            <Text style={styles.label}>Judul Kuis *</Text>
            <TextInput style={styles.input} value={quizTitle} onChangeText={setQuizTitle}
              placeholder="Contoh: Ulangan Harian Bab 1" placeholderTextColor={colors.textFaint} />

            <Text style={styles.label}>Deskripsi</Text>
            <TextInput style={[styles.input, styles.textarea]} value={quizDesc} onChangeText={setQuizDesc}
              placeholder="Deskripsi singkat kuis ini..." placeholderTextColor={colors.textFaint}
              multiline numberOfLines={3} textAlignVertical="top" />

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>Durasi (menit)</Text>
                <TextInput style={styles.input} value={duration} onChangeText={setDuration}
                  keyboardType="numeric" placeholderTextColor={colors.textFaint} />
              </View>
              <View style={{ width: spacing.md }} />
              <View style={styles.halfField}>
                <Text style={styles.label}>Total Poin</Text>
                <TextInput style={styles.input} value={totalMarks} onChangeText={setTotalMarks}
                  keyboardType="numeric" placeholderTextColor={colors.textFaint} />
              </View>
            </View>
            <Text style={styles.label}>Tanggal Ujian</Text>
            <TextInput style={styles.input} value={testDate} onChangeText={setTestDate}
              placeholder="YYYY-MM-DD  (contoh: 2026-05-20)"
              placeholderTextColor={colors.textFaint} />
          </View>

          {/* ── Materials Selection ────────────────────────── */}
          {subjectMaterials.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📚 Materi Ujian</Text>
              <Text style={styles.cardSubtitle}>Pilih materi yang perlu dipelajari sebelum ujian ini</Text>

              {subjectMaterials.map((mat) => {
                const isSelected = selectedMaterials.includes(mat.id);
                const typeIcon = mat.type === 'video' ? '🎬' : mat.type === 'pdf' ? '📄' : '📝';
                return (
                  <TouchableOpacity
                    key={mat.id}
                    style={[styles.materialItem, isSelected && styles.materialItemSelected]}
                    onPress={() => toggleMaterial(mat.id)}
                  >
                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                      {isSelected && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.materialIcon}>{typeIcon}</Text>
                    <View style={styles.materialInfo}>
                      <Text style={[styles.materialTitle, isSelected && styles.materialTitleSelected]}>
                        {mat.title}
                      </Text>
                      <Text style={styles.materialMeta}>{mat.type} · {mat.author}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {selectedMaterials.length > 0 && (
                <View style={styles.selectedInfo}>
                  <Text style={styles.selectedText}>{selectedMaterials.length} materi dipilih</Text>
                </View>
              )}
            </View>
          )}

          {/* ── Add Question ───────────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>➕ Tambah Soal</Text>
            <Text style={styles.cardSubtitle}>Soal ke-{questions.length + 1}</Text>

            <Text style={styles.label}>Pertanyaan *</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={qText} onChangeText={setQText}
              placeholder="Tulis teks pertanyaan di sini..."
              placeholderTextColor={colors.textFaint}
              multiline numberOfLines={3} textAlignVertical="top"
            />

            <Text style={styles.label}>Pilihan Jawaban</Text>
            <Text style={styles.hint}>Ketuk ⭕ untuk menandai jawaban yang benar</Text>

            {qOptions.map((opt, i) => (
              <View key={i} style={styles.optRow}>
                <TouchableOpacity
                  style={[styles.radio, qCorrect === i && styles.radioActive]}
                  onPress={() => setQCorrect(i)}
                >
                  {qCorrect === i && <View style={styles.radioInner} />}
                </TouchableOpacity>
                <TextInput
                  style={[
                    styles.input,
                    styles.optInput,
                    qCorrect === i && { borderColor: colors.success + '88', backgroundColor: colors.success + '0a' },
                  ]}
                  value={opt}
                  onChangeText={(v) => {
                    const next = [...qOptions];
                    next[i] = v;
                    setQOptions(next);
                  }}
                  placeholder={`Pilihan ${String.fromCharCode(65 + i)}${qCorrect === i ? ' (benar)' : ''}`}
                  placeholderTextColor={colors.textFaint}
                />
              </View>
            ))}

            <TouchableOpacity style={styles.addQBtn} onPress={addQuestion} activeOpacity={0.8}>
              <Text style={styles.addQBtnText}>+ Tambahkan Soal ke Daftar</Text>
            </TouchableOpacity>
          </View>

          {/* ── Questions List ─────────────────────────────── */}
          {questions.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>📝 Daftar Soal ({questions.length})</Text>
                <View style={[styles.countBadge, { backgroundColor: colors.success + '22', borderColor: colors.success + '55' }]}>
                  <Text style={[styles.countText, { color: colors.success }]}>{questions.length} soal</Text>
                </View>
              </View>

              {questions.map((q, i) => (
                <View key={q.id} style={styles.qCard}>
                  <View style={styles.qHeader}>
                    <View style={styles.qNumBadge}>
                      <Text style={styles.qNumText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.qText} numberOfLines={2}>{q.text}</Text>
                    <View style={styles.qActions}>
                      <TouchableOpacity onPress={() => moveQuestion(q.id, -1)} style={styles.moveBtn}>
                        <Text style={styles.moveBtnText}>↑</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => moveQuestion(q.id, 1)} style={styles.moveBtn}>
                        <Text style={styles.moveBtnText}>↓</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => removeQuestion(q.id)}>
                        <Text style={{ color: colors.danger, fontSize: 16 }}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.qOptions}>
                    {q.options.map((opt, oi) => (
                      <View key={oi} style={[
                        styles.qOption,
                        oi === q.correct && { backgroundColor: colors.success + '22', borderColor: colors.success + '55' },
                      ]}>
                        <Text style={styles.qOptionLetter}>{String.fromCharCode(65 + oi)}.</Text>
                        <Text style={[styles.qOptionText, oi === q.correct && { color: colors.success }]}>
                          {opt}
                        </Text>
                        {oi === q.correct && <Text style={{ color: colors.success, fontSize: 12 }}>✓</Text>}
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ── Submit ─────────────────────────────────────── */}
          <TouchableOpacity style={styles.createBtn} onPress={handleCreate} activeOpacity={0.8}>
            <Text style={styles.createBtnText}>
              🚀  Simpan Kuis ({questions.length} soal)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
            <Text style={styles.cancelText}>Batal</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  back: { marginBottom: spacing.md },
  backText: { color: colors.textMuted, fontSize: fontSize.sm },
  pageTitle: { color: colors.white, fontSize: fontSize.xxxl, fontWeight: fontWeight.black, marginBottom: spacing.md },
  subjectBadge: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    alignSelf: 'flex-start', borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2,
    borderWidth: 1, marginBottom: spacing.xl,
  },
  subjectBadgeText: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  card: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.lg, marginBottom: spacing.lg,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  cardTitle: { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: spacing.xs },
  cardSubtitle: { color: colors.textMuted, fontSize: fontSize.sm, marginBottom: spacing.sm },
  label: {
    color: colors.textMuted, fontSize: fontSize.sm,
    fontWeight: fontWeight.medium, marginBottom: spacing.xs, marginTop: spacing.md,
  },
  hint: { color: colors.textFaint, fontSize: fontSize.xs, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    color: colors.text, fontSize: fontSize.md,
  },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  halfField: { flex: 1 },
  optRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  radio: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  radioActive: { borderColor: colors.success },
  radioInner: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.success },
  optInput: { flex: 1, marginBottom: 0 },
  addQBtn: {
    marginTop: spacing.md, backgroundColor: colors.accent + '22',
    borderRadius: radius.md, paddingVertical: spacing.md,
    alignItems: 'center', borderWidth: 1, borderColor: colors.accent + '55',
  },
  addQBtnText: { color: colors.accent, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  countBadge: {
    borderRadius: radius.full, borderWidth: 1,
    paddingHorizontal: spacing.sm, paddingVertical: 2,
  },
  countText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  qCard: {
    backgroundColor: colors.bg, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  qHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
  qNumBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.accent + '22', borderWidth: 1, borderColor: colors.accent + '55',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  qNumText: { color: colors.accent, fontSize: fontSize.xs, fontWeight: fontWeight.black },
  qText: { flex: 1, color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  qActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  moveBtn: {
    width: 24, height: 24, borderRadius: radius.sm,
    backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  moveBtnText: { color: colors.textMuted, fontSize: 12, fontWeight: fontWeight.bold },
  qOptions: { gap: spacing.xs },
  qOption: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.bgCard, borderRadius: radius.sm,
    borderWidth: 1, borderColor: 'transparent',
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs + 2,
  },
  qOptionLetter: { color: colors.textFaint, fontSize: fontSize.xs, fontWeight: fontWeight.bold, width: 18 },
  qOptionText: { flex: 1, color: colors.textMuted, fontSize: fontSize.sm },
  createBtn: {
    backgroundColor: colors.admin, borderRadius: radius.md,
    paddingVertical: spacing.md + 2, alignItems: 'center', marginBottom: spacing.sm,
  },
  createBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.black },
  cancelBtn: {
    borderRadius: radius.md, paddingVertical: spacing.md,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  cancelText: { color: colors.textMuted, fontSize: fontSize.md },
  // Material selection styles
  materialItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.bg, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  materialItemSelected: {
    borderColor: colors.accent + '88', backgroundColor: colors.accent + '15',
  },
  checkbox: {
    width: 22, height: 22, borderRadius: radius.sm,
    borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.accent, borderColor: colors.accent,
  },
  checkmark: { color: colors.white, fontSize: 12, fontWeight: fontWeight.bold },
  materialIcon: { fontSize: 20 },
  materialInfo: { flex: 1 },
  materialTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  materialTitleSelected: { color: colors.accent },
  materialMeta: { color: colors.textFaint, fontSize: fontSize.xs, marginTop: 2 },
  selectedInfo: {
    marginTop: spacing.sm, paddingTop: spacing.sm,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  selectedText: { color: colors.accent, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
});
