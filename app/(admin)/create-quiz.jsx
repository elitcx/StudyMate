import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useData } from '../../src/contexts/DataContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { spacing, radius, fontSize, fontWeight, getShadow, opacity } from '../../utils/theme';


export default function CreateQuizScreen() {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  const { subjectId } = useLocalSearchParams();
  const { subjects, materials, addQuiz } = useData();
  const router = useRouter();

  const subject = subjects.find((su) => su.id === subjectId);
  const subjectMaterials = materials.filter((m) => m.subjectId === subjectId);

  const [quizType, setQuizType] = useState('practice'); // 'exam' | 'practice'
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDesc, setQuizDesc] = useState('');
  const [duration, setDuration] = useState('15');
  const [totalMarks, setTotalMarks] = useState('10');
  const [testDate, setTestDate] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState([]);

  const toggleMaterial = (materialId) => {
    setSelectedMaterials((prev) =>
      prev.includes(materialId)
        ? prev.filter((id) => id !== materialId)
        : [...prev, materialId]
    );
  };

  const [questions, setQuestions] = useState([]);
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
    if (!quizTitle.trim()) { Alert.alert('Judul kosong', `Isi judul ${quizType === 'exam' ? 'ujian' : 'kuis'}.`); return; }
    if (!subjectId) { Alert.alert('Error', 'Kelas tidak valid.'); return; }
    if (quizType === 'exam' && !testDate.trim()) { Alert.alert('Tanggal wajib', 'Isi tanggal ujian untuk entri ujian nyata.'); return; }
    if (quizType === 'practice' && questions.length === 0) { Alert.alert('Belum ada soal', 'Tambahkan minimal 1 soal terlebih dahulu.'); return; }

    addQuiz({
      type: quizType,
      subjectId,
      title: quizTitle.trim(),
      description: quizDesc.trim(),
      duration: parseInt(duration) || 15,
      totalMarks: parseInt(totalMarks) || 10,
      date: testDate.trim() || null,
      questions,
      materialIds: selectedMaterials,
    });

    const typeLabel = quizType === 'exam' ? 'Ujian' : 'Kuis';
    const detail = quizType === 'exam'
      ? `Dijadwalkan pada ${testDate}`
      : `${questions.length} soal`;
    Alert.alert(
      `${typeLabel} dibuat! 🎉`,
      `"${quizTitle}" berhasil dibuat. ${detail}${subject ? ` · ${subject.title}` : ''}.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={s.back} onPress={() => router.back()}>
            <Text style={s.backText}>← Kembali</Text>
          </TouchableOpacity>
          <Text style={s.pageTitle}>{quizType === 'exam' ? 'Tambah Ujian' : 'Buat Kuis Baru'}</Text>
          {subject && (
            <View style={[s.subjectBadge, { backgroundColor: subject.color + opacity.subtle, borderColor: subject.color + opacity.muted }]}>
              <Text style={{ fontSize: 14 }}>{subject.icon}</Text>
              <Text style={[s.subjectBadgeText, { color: subject.color }]}>{subject.title}</Text>
            </View>
          )}

          {/* Type toggle */}
          <View style={s.typeToggleWrap}>
            <Text style={s.typeToggleLabel}>Jenis:</Text>
            <View style={s.typeToggle}>
              {[
                { key: 'exam',     label: '📅 Ujian Nyata' },
                { key: 'practice', label: '✏️ Latihan Soal' },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[s.typeBtn, quizType === opt.key && s.typeBtnActive]}
                  onPress={() => setQuizType(opt.key)}
                >
                  <Text style={[s.typeBtnText, quizType === opt.key && s.typeBtnTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={s.typeHint}>
              {quizType === 'exam'
                ? 'Ujian nyata di sekolah — siswa melihat info & materi persiapan'
                : 'Latihan soal yang dapat dikerjakan siswa di dalam aplikasi'}
            </Text>
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>{quizType === 'exam' ? '📅 Info Ujian' : '📋 Info Kuis'}</Text>

            <Text style={s.label}>{quizType === 'exam' ? 'Judul Ujian *' : 'Judul Kuis *'}</Text>
            <TextInput style={s.input} value={quizTitle} onChangeText={setQuizTitle}
              placeholder={quizType === 'exam' ? 'Contoh: Ujian Tengah Semester Bab 3-5' : 'Contoh: Ulangan Harian Bab 1'}
              placeholderTextColor={colors.textFaint} />

            <Text style={s.label}>Deskripsi</Text>
            <TextInput style={[s.input, s.textarea]} value={quizDesc} onChangeText={setQuizDesc}
              placeholder="Deskripsi singkat kuis ini..." placeholderTextColor={colors.textFaint}
              multiline numberOfLines={3} textAlignVertical="top" />

            <View style={s.row}>
              <View style={s.halfField}>
                <Text style={s.label}>Durasi (menit)</Text>
                <TextInput style={s.input} value={duration} onChangeText={setDuration}
                  keyboardType="numeric" placeholderTextColor={colors.textFaint} />
              </View>
              <View style={{ width: spacing.md }} />
              <View style={s.halfField}>
                <Text style={s.label}>Total Poin</Text>
                <TextInput style={s.input} value={totalMarks} onChangeText={setTotalMarks}
                  keyboardType="numeric" placeholderTextColor={colors.textFaint} />
              </View>
            </View>
            <Text style={s.label}>Tanggal Ujian{quizType === 'exam' ? ' *' : ''}</Text>
            <TextInput style={s.input} value={testDate} onChangeText={setTestDate}
              placeholder="YYYY-MM-DD  (contoh: 2026-05-20)"
              placeholderTextColor={colors.textFaint} />
          </View>

          {subjectMaterials.length > 0 && (
            <View style={s.card}>
              <Text style={s.cardTitle}>📚 Materi Ujian</Text>
              <Text style={s.cardSubtitle}>Pilih materi yang perlu dipelajari sebelum ujian ini</Text>

              {subjectMaterials.map((mat) => {
                const isSelected = selectedMaterials.includes(mat.id);
                const typeIcon = mat.type === 'video' ? '🎬' : mat.type === 'pdf' ? '📄' : '📝';
                return (
                  <TouchableOpacity
                    key={mat.id}
                    style={[s.materialItem, isSelected && s.materialItemSelected]}
                    onPress={() => toggleMaterial(mat.id)}
                  >
                    <View style={[s.checkbox, isSelected && s.checkboxSelected]}>
                      {isSelected && <Text style={s.checkmark}>✓</Text>}
                    </View>
                    <Text style={s.materialIcon}>{typeIcon}</Text>
                    <View style={s.materialInfo}>
                      <Text style={[s.materialTitle, isSelected && s.materialTitleSelected]}>
                        {mat.title}
                      </Text>
                      <Text style={s.materialMeta}>{mat.type} · {mat.author}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {selectedMaterials.length > 0 && (
                <View style={s.selectedInfo}>
                  <Text style={s.selectedText}>{selectedMaterials.length} materi dipilih</Text>
                </View>
              )}
            </View>
          )}

          <View style={s.card}>
            <Text style={s.cardTitle}>
              ➕ Tambah Soal{quizType === 'exam' ? ' (Opsional — Contoh Soal Persiapan)' : ''}
            </Text>
            <Text style={s.cardSubtitle}>Soal ke-{questions.length + 1}</Text>

            <Text style={s.label}>Pertanyaan *</Text>
            <TextInput
              style={[s.input, s.textarea]}
              value={qText} onChangeText={setQText}
              placeholder="Tulis teks pertanyaan di sini..."
              placeholderTextColor={colors.textFaint}
              multiline numberOfLines={3} textAlignVertical="top"
            />

            <Text style={s.label}>Pilihan Jawaban</Text>
            <Text style={s.hint}>Ketuk ⭕ untuk menandai jawaban yang benar</Text>

            {qOptions.map((opt, i) => (
              <View key={i} style={s.optRow}>
                <TouchableOpacity
                  style={[s.radio, qCorrect === i && s.radioActive]}
                  onPress={() => setQCorrect(i)}
                >
                  {qCorrect === i && <View style={s.radioInner} />}
                </TouchableOpacity>
                <TextInput
                  style={[
                    s.input,
                    s.optInput,
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

            <TouchableOpacity style={s.addQBtn} onPress={addQuestion} activeOpacity={0.8}>
              <Text style={s.addQBtnText}>+ Tambahkan Soal ke Daftar</Text>
            </TouchableOpacity>
          </View>

          {questions.length > 0 && (
            <View style={s.card}>
              <View style={s.cardTitleRow}>
                <Text style={s.cardTitle}>📝 Daftar Soal ({questions.length})</Text>
                <View style={[s.countBadge, { backgroundColor: colors.success + opacity.subtle, borderColor: colors.success + opacity.muted }]}>
                  <Text style={[s.countText, { color: colors.success }]}>{questions.length} soal</Text>
                </View>
              </View>

              {questions.map((q, i) => (
                <View key={q.id} style={s.qCard}>
                  <View style={s.qHeader}>
                    <View style={s.qNumBadge}>
                      <Text style={s.qNumText}>{i + 1}</Text>
                    </View>
                    <Text style={s.qText} numberOfLines={2}>{q.text}</Text>
                    <View style={s.qActions}>
                      <TouchableOpacity onPress={() => moveQuestion(q.id, -1)} style={s.moveBtn}>
                        <Text style={s.moveBtnText}>↑</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => moveQuestion(q.id, 1)} style={s.moveBtn}>
                        <Text style={s.moveBtnText}>↓</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => removeQuestion(q.id)}>
                        <Text style={{ color: colors.danger, fontSize: 16 }}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={s.qOptions}>
                    {q.options.map((opt, oi) => (
                      <View key={oi} style={[
                        s.qOption,
                        oi === q.correct && { backgroundColor: colors.success + opacity.subtle, borderColor: colors.success + opacity.muted },
                      ]}>
                        <Text style={s.qOptionLetter}>{String.fromCharCode(65 + oi)}.</Text>
                        <Text style={[s.qOptionText, oi === q.correct && { color: colors.success }]}>
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

          <TouchableOpacity style={s.createBtn} onPress={handleCreate} activeOpacity={0.8}>
            <Text style={s.createBtnText}>
              {quizType === 'exam'
                ? `🚀  Simpan Ujian${questions.length > 0 ? ` (${questions.length} soal persiapan)` : ''}`
                : `🚀  Simpan Kuis (${questions.length} soal)`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.cancelBtn} onPress={() => router.back()}>
            <Text style={s.cancelText}>Batal</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (c, isDark) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
    back: { marginBottom: spacing.md },
    backText: { color: c.textMuted, fontSize: fontSize.sm },
    pageTitle: { color: c.text, fontSize: fontSize.xxxl, fontWeight: fontWeight.black, marginBottom: spacing.md },
    subjectBadge: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
      alignSelf: 'flex-start', borderRadius: radius.full,
      paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2,
      borderWidth: 1, marginBottom: spacing.xl,
    },
    subjectBadgeText: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
    typeToggleWrap: {
      marginBottom: spacing.lg,
    },
    typeToggleLabel: {
      color: c.textMuted,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      marginBottom: spacing.xs,
    },
    typeToggle: {
      flexDirection: 'row',
      backgroundColor: c.bgCard,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border,
      overflow: 'hidden',
    },
    typeBtn: {
      flex: 1,
      paddingVertical: spacing.sm,
      alignItems: 'center',
    },
    typeBtnActive: {
      backgroundColor: c.admin,
    },
    typeBtnText: {
      color: c.textMuted,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
    },
    typeBtnTextActive: {
      color: c.white,
      fontWeight: fontWeight.bold,
    },
    typeHint: {
      color: c.textFaint,
      fontSize: fontSize.xs,
      marginTop: spacing.xs,
    },
    card: {
      backgroundColor: c.bgCard, borderRadius: radius.lg,
      borderWidth: 1, borderColor: c.border,
      padding: spacing.lg, marginBottom: spacing.lg,
    },
    cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
    cardTitle: { color: c.text, fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: spacing.xs },
    cardSubtitle: { color: c.textMuted, fontSize: fontSize.sm, marginBottom: spacing.sm },
    label: {
      color: c.textMuted, fontSize: fontSize.sm,
      fontWeight: fontWeight.medium, marginBottom: spacing.xs, marginTop: spacing.md,
    },
    hint: { color: c.textFaint, fontSize: fontSize.xs, marginBottom: spacing.sm },
    input: {
      backgroundColor: c.bg, borderWidth: 1, borderColor: c.border,
      borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md,
      color: c.text, fontSize: fontSize.md,
    },
    textarea: { minHeight: 80, textAlignVertical: 'top' },
    row: { flexDirection: 'row' },
    halfField: { flex: 1 },
    optRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
    radio: {
      width: 24, height: 24, borderRadius: 12,
      borderWidth: 2, borderColor: c.border,
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: c.bg,
    },
    radioActive: { borderColor: c.success },
    radioInner: { width: 11, height: 11, borderRadius: 6, backgroundColor: c.success },
    optInput: { flex: 1, marginBottom: 0 },
    addQBtn: {
      marginTop: spacing.md, backgroundColor: c.accent + opacity.subtle,
      borderRadius: radius.md, paddingVertical: spacing.md,
      alignItems: 'center', borderWidth: 1, borderColor: c.accent + opacity.muted,
    },
    addQBtnText: { color: c.accent, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
    countBadge: {
      borderRadius: radius.full, borderWidth: 1,
      paddingHorizontal: spacing.sm, paddingVertical: 2,
    },
    countText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
    qCard: {
      backgroundColor: c.bg, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border,
      padding: spacing.md, marginBottom: spacing.sm,
    },
    qHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
    qNumBadge: {
      width: 28, height: 28, borderRadius: 14,
      backgroundColor: c.accent + opacity.subtle, borderWidth: 1, borderColor: c.accent + opacity.muted,
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    qNumText: { color: c.accent, fontSize: fontSize.xs, fontWeight: fontWeight.black },
    qText: { flex: 1, color: c.text, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
    qActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    moveBtn: {
      width: 24, height: 24, borderRadius: radius.sm,
      backgroundColor: c.bgCard, borderWidth: 1, borderColor: c.border,
      alignItems: 'center', justifyContent: 'center',
    },
    moveBtnText: { color: c.textMuted, fontSize: 12, fontWeight: fontWeight.bold },
    qOptions: { gap: spacing.xs },
    qOption: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
      backgroundColor: c.bgCard, borderRadius: radius.sm,
      borderWidth: 1, borderColor: 'transparent',
      paddingHorizontal: spacing.sm, paddingVertical: spacing.xs + 2,
    },
    qOptionLetter: { color: c.textFaint, fontSize: fontSize.xs, fontWeight: fontWeight.bold, width: 18 },
    qOptionText: { flex: 1, color: c.textMuted, fontSize: fontSize.sm },
    createBtn: {
      backgroundColor: c.admin, borderRadius: radius.md,
      paddingVertical: spacing.md + 2, alignItems: 'center', marginBottom: spacing.sm,
    },
    createBtnText: { color: c.white, fontSize: fontSize.md, fontWeight: fontWeight.black },
    cancelBtn: {
      borderRadius: radius.md, paddingVertical: spacing.md,
      alignItems: 'center', borderWidth: 1, borderColor: c.border,
    },
    cancelText: { color: c.textMuted, fontSize: fontSize.md },
    materialItem: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.md,
      backgroundColor: c.bg, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border,
      padding: spacing.md, marginBottom: spacing.sm,
    },
    materialItemSelected: {
      borderColor: c.accent + '88', backgroundColor: c.accent + '15',
    },
    checkbox: {
      width: 22, height: 22, borderRadius: radius.sm,
      borderWidth: 2, borderColor: c.border,
      alignItems: 'center', justifyContent: 'center',
    },
    checkboxSelected: {
      backgroundColor: c.accent, borderColor: c.accent,
    },
    checkmark: { color: c.white, fontSize: 12, fontWeight: fontWeight.bold },
    materialIcon: { fontSize: 20 },
    materialInfo: { flex: 1 },
    materialTitle: { color: c.text, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
    materialTitleSelected: { color: c.accent },
    materialMeta: { color: c.textFaint, fontSize: fontSize.xs, marginTop: 2 },
    selectedInfo: {
      marginTop: spacing.sm, paddingTop: spacing.sm,
      borderTopWidth: 1, borderTopColor: c.border,
    },
    selectedText: { color: c.accent, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  });
