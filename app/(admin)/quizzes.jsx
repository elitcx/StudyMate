import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, KeyboardAvoidingView, Platform, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useData } from '../../src/contexts/DataContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { spacing, radius, fontSize, fontWeight } from '../../utils/theme';

export default function QuizzesScreen() {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  const { subjects, quizzes, addQuiz, deleteQuiz } = useData();
  const { user } = useAuth();
  const router = useRouter();
  const [view, setView] = useState('list');

  const [quizType, setQuizType] = useState('practice');
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDesc, setQuizDesc] = useState('');
  const [quizDuration, setQuizDuration] = useState('15');
  const [quizMarks, setQuizMarks] = useState('10');
  const [quizDate, setQuizDate] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || '');
  const [questions, setQuestions] = useState([]);
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState(0);

  const resetCreate = () => {
    setQuizType('practice');
    setQuizTitle(''); setQuizDesc(''); setQuizDuration('15'); setQuizMarks('10');
    setQuizDate('');
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
    if (!quizTitle.trim()) { Alert.alert('Judul kosong', `Isi judul ${quizType === 'exam' ? 'ujian' : 'kuis'}.`); return; }
    if (!selectedSubject) { Alert.alert('Pilih kelas', 'Pilih kelas untuk kuis ini.'); return; }
    if (quizType === 'exam' && !quizDate.trim()) { Alert.alert('Tanggal wajib', 'Isi tanggal ujian.'); return; }
    if (quizType === 'practice' && questions.length === 0) { Alert.alert('Belum ada soal', 'Tambahkan minimal 1 soal.'); return; }
    addQuiz({
      type: quizType,
      title: quizTitle.trim(),
      description: quizDesc.trim(),
      duration: parseInt(quizDuration) || 15,
      totalMarks: parseInt(quizMarks) || 10,
      date: quizDate.trim() || null,
      subjectId: selectedSubject,
      questions,
    });
    Alert.alert(
      quizType === 'exam' ? 'Ujian dibuat! 🎉' : 'Kuis dibuat! 🎉',
      `"${quizTitle}" berhasil dibuat.`,
      [{ text: 'OK', onPress: () => { resetCreate(); setView('list'); } }]
    );
  };

  if (view === 'list') {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <Text style={s.title}>Kelola Kuis</Text>
          <TouchableOpacity style={s.addBtn} onPress={() => setView('create')}>
            <Text style={s.addBtnText}>+ Buat Kuis</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={quizzes}
          keyExtractor={(i) => i.id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyIcon}>✏️</Text>
              <Text style={s.emptyText}>Belum ada kuis. Buat kuis pertama!</Text>
              <TouchableOpacity style={s.emptyBtn} onPress={() => setView('create')}>
                <Text style={s.emptyBtnText}>+ Buat Kuis</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item: quiz }) => {
            const sub = subjects.find((su) => su.id === quiz.subjectId);
            const isExam = (quiz.type ?? 'practice') === 'exam';
            const typeColor = isExam ? colors.warning : colors.accent;
            return (
              <View style={s.quizCard}>
                <View style={s.quizCardTop}>
                  <View style={[s.quizIcon, { backgroundColor: (sub?.color || colors.accent) + '22' }]}>
                    <Text style={{ fontSize: 20 }}>{sub?.icon || '📝'}</Text>
                  </View>
                  <View style={s.quizInfo}>
                    <View style={s.quizTitleRow}>
                      <Text style={s.quizTitle} numberOfLines={1}>{quiz.title}</Text>
                      <View style={[s.typeBadge, { backgroundColor: typeColor + '22', borderColor: typeColor + '55' }]}>
                        <Text style={[s.typeBadgeText, { color: typeColor }]}>
                          {isExam ? '📅 Ujian' : '✏️ Kuis'}
                        </Text>
                      </View>
                    </View>
                    <Text style={s.quizSubject}>{sub?.title || 'Kelas tidak ditemukan'}</Text>
                  </View>
                  <TouchableOpacity
                    style={s.iconBtn}
                    onPress={() => router.push({ pathname: '/(admin)/edit-quiz', params: { quizId: quiz.id } })}
                  >
                    <Text style={{ color: colors.accent, fontSize: 16 }}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.iconBtn}
                    onPress={() =>
                      Alert.alert('Hapus?', `Hapus "${quiz.title}"?`, [
                        { text: 'Batal', style: 'cancel' },
                        { text: 'Hapus', style: 'destructive', onPress: () => deleteQuiz(quiz.id) },
                      ])
                    }
                  >
                    <Text style={{ color: colors.danger, fontSize: 16 }}>🗑</Text>
                  </TouchableOpacity>
                </View>
                <View style={s.quizMeta}>
                  <Text style={s.metaItem}>❓ {quiz.questions?.length || 0} soal</Text>
                  <Text style={s.metaItem}>⏱ {quiz.duration} menit</Text>
                  <Text style={s.metaItem}>🏆 {quiz.totalMarks} poin</Text>
                  {isExam && quiz.date && <Text style={s.metaItem}>📅 {quiz.date}</Text>}
                </View>
              </View>
            );
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <View style={s.createHeader}>
            <TouchableOpacity onPress={() => { resetCreate(); setView('list'); }}>
              <Text style={s.backText}>← Kembali</Text>
            </TouchableOpacity>
            <Text style={s.createTitle}>
              {quizType === 'exam' ? 'Buat Ujian Baru' : 'Buat Kuis Baru'}
            </Text>
          </View>

          <View style={s.typeToggleWrap}>
            {[
              { key: 'practice', label: '✏️ Latihan Soal', hint: 'Kuis yang bisa dikerjakan siswa di aplikasi' },
              { key: 'exam',     label: '📅 Ujian Nyata',  hint: 'Info ujian di sekolah — tanggal wajib diisi' },
            ].map((t) => (
              <TouchableOpacity
                key={t.key}
                style={[s.typeToggleBtn, quizType === t.key && s.typeToggleBtnActive]}
                onPress={() => setQuizType(t.key)}
              >
                <Text style={[s.typeToggleBtnText, quizType === t.key && s.typeToggleBtnTextActive]}>
                  {t.label}
                </Text>
                <Text style={s.typeToggleHint}>{t.hint}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.section}>
            <Text style={s.sectionTitle}>Info {quizType === 'exam' ? 'Ujian' : 'Kuis'}</Text>
            <Text style={s.label}>Judul *</Text>
            <TextInput style={s.input} value={quizTitle} onChangeText={setQuizTitle}
              placeholder="Contoh: Ulangan Harian 1" placeholderTextColor={colors.textFaint} />
            <Text style={s.label}>Deskripsi</Text>
            <TextInput style={[s.input, s.textarea]} value={quizDesc} onChangeText={setQuizDesc}
              placeholder="Deskripsi kuis..." placeholderTextColor={colors.textFaint}
              multiline numberOfLines={2} textAlignVertical="top" />
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>Durasi (menit)</Text>
                <TextInput style={s.input} value={quizDuration} onChangeText={setQuizDuration}
                  keyboardType="numeric" placeholderTextColor={colors.textFaint} />
              </View>
              <View style={{ width: spacing.md }} />
              <View style={{ flex: 1 }}>
                <Text style={s.label}>Total Poin</Text>
                <TextInput style={s.input} value={quizMarks} onChangeText={setQuizMarks}
                  keyboardType="numeric" placeholderTextColor={colors.textFaint} />
              </View>
            </View>
            {quizType === 'exam' && (
              <>
                <Text style={s.label}>Tanggal Ujian * <Text style={{ color: colors.danger }}>(wajib)</Text></Text>
                <TextInput style={s.input} value={quizDate} onChangeText={setQuizDate}
                  placeholder="YYYY-MM-DD, contoh: 2026-06-15" placeholderTextColor={colors.textFaint} />
              </>
            )}
            <Text style={s.label}>Kelas *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={s.subjectPills}>
                {subjects.map((su) => (
                  <TouchableOpacity
                    key={su.id}
                    style={[s.subjectPill, selectedSubject === su.id && { borderColor: su.color, backgroundColor: su.color + '22' }]}
                    onPress={() => setSelectedSubject(su.id)}
                  >
                    <Text style={{ fontSize: 14 }}>{su.icon}</Text>
                    <Text style={[s.subjectPillText, selectedSubject === su.id && { color: su.color }]}>{su.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={s.section}>
            <Text style={s.sectionTitle}>
              {quizType === 'exam' ? 'Contoh Soal Persiapan (Opsional)' : 'Tambah Soal'}
            </Text>
            <Text style={s.label}>Teks Soal *</Text>
            <TextInput style={[s.input, s.textarea]} value={qText} onChangeText={setQText}
              placeholder="Tulis pertanyaan di sini..." placeholderTextColor={colors.textFaint}
              multiline numberOfLines={3} textAlignVertical="top" />
            <Text style={s.label}>Pilihan Jawaban</Text>
            {qOptions.map((opt, i) => (
              <View key={i} style={s.optionInputRow}>
                <TouchableOpacity
                  style={[s.optRadio, qCorrect === i && s.optRadioSelected]}
                  onPress={() => setQCorrect(i)}
                >
                  {qCorrect === i && <View style={s.optRadioInner} />}
                </TouchableOpacity>
                <TextInput
                  style={[s.input, s.optInput, qCorrect === i && { borderColor: colors.success + '88' }]}
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
            <Text style={s.correctHint}>Ketuk lingkaran untuk memilih jawaban benar (saat ini: {String.fromCharCode(65 + qCorrect)})</Text>
            <TouchableOpacity style={s.addQBtn} onPress={addQuestion}>
              <Text style={s.addQBtnText}>+ Tambahkan Soal</Text>
            </TouchableOpacity>
          </View>

          {questions.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Soal Ditambahkan ({questions.length})</Text>
              {questions.map((q, i) => (
                <View key={q.id} style={s.qRow}>
                  <View style={s.qNum}>
                    <Text style={s.qNumText}>{i + 1}</Text>
                  </View>
                  <View style={s.qInfo}>
                    <Text style={s.qText} numberOfLines={2}>{q.text}</Text>
                    <Text style={s.qAnswer}>Jawaban: {String.fromCharCode(65 + q.correct)}. {q.options[q.correct]}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeQuestion(q.id)}>
                    <Text style={{ color: colors.danger, fontSize: 16 }}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={s.createBtn} onPress={handleCreateQuiz}>
            <Text style={s.createBtnText}>
              {quizType === 'exam'
                ? '🚀 Simpan Ujian'
                : `🚀 Buat Kuis (${questions.length} soal)`}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (c, isDark) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    header: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      padding: spacing.lg,
    },
    title: { color: c.text, fontSize: fontSize.xxxl, fontWeight: fontWeight.black },
    addBtn: {
      backgroundColor: c.admin + '22', borderRadius: radius.full,
      paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2,
      borderWidth: 1, borderColor: c.admin + '55',
    },
    addBtnText: { color: c.admin, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
    list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
    quizCard: {
      backgroundColor: c.bgCard, borderRadius: radius.lg,
      borderWidth: 1, borderColor: c.border,
      padding: spacing.md, marginBottom: spacing.md,
    },
    quizCardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
    quizIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
    quizInfo: { flex: 1 },
    quizTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
    quizTitle: { color: c.text, fontSize: fontSize.md, fontWeight: fontWeight.bold, flexShrink: 1 },
    typeBadge: { borderRadius: radius.full, borderWidth: 1, paddingHorizontal: spacing.xs + 2, paddingVertical: 2 },
    typeBadgeText: { fontSize: 10, fontWeight: fontWeight.bold },
    iconBtn: { padding: spacing.xs },
    quizSubject: { color: c.textMuted, fontSize: fontSize.xs, marginTop: 2 },
    quizMeta: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
    metaItem: { color: c.textFaint, fontSize: fontSize.xs },
    empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md },
    emptyIcon: { fontSize: 48 },
    emptyText: { color: c.textMuted, fontSize: fontSize.md, textAlign: 'center' },
    emptyBtn: {
      backgroundColor: c.admin + '22', borderRadius: radius.md,
      paddingHorizontal: spacing.xl, paddingVertical: spacing.sm,
      borderWidth: 1, borderColor: c.admin + '55',
    },
    emptyBtnText: { color: c.admin, fontSize: fontSize.sm, fontWeight: fontWeight.bold },

    scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
    createHeader: { marginBottom: spacing.md },
    backText: { color: c.textMuted, fontSize: fontSize.sm, marginBottom: spacing.sm },
    createTitle: { color: c.text, fontSize: fontSize.xxxl, fontWeight: fontWeight.black },
    typeToggleWrap: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
    typeToggleBtn: {
      flex: 1, borderRadius: radius.md, borderWidth: 1, borderColor: c.border,
      backgroundColor: c.bgCard, padding: spacing.md,
    },
    typeToggleBtnActive: { borderColor: c.admin, backgroundColor: c.admin + '18' },
    typeToggleBtnText: { color: c.textMuted, fontSize: fontSize.sm, fontWeight: fontWeight.bold, marginBottom: 2 },
    typeToggleBtnTextActive: { color: c.admin },
    typeToggleHint: { color: c.textFaint, fontSize: 10, lineHeight: 14 },
    section: {
      backgroundColor: c.bgCard, borderRadius: radius.lg,
      borderWidth: 1, borderColor: c.border,
      padding: spacing.lg, marginBottom: spacing.lg,
    },
    sectionTitle: { color: c.text, fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: spacing.sm },
    label: { color: c.textMuted, fontSize: fontSize.sm, fontWeight: fontWeight.medium, marginBottom: spacing.xs, marginTop: spacing.md },
    input: {
      backgroundColor: c.bg, borderWidth: 1, borderColor: c.border,
      borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md,
      color: c.text, fontSize: fontSize.md,
    },
    textarea: { minHeight: 72 },
    row: { flexDirection: 'row' },
    subjectPills: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.xs },
    subjectPill: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
      borderRadius: radius.full, borderWidth: 1, borderColor: c.border,
      paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2,
      backgroundColor: c.bg,
    },
    subjectPillText: { color: c.textMuted, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
    optionInputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
    optRadio: {
      width: 22, height: 22, borderRadius: 11,
      borderWidth: 2, borderColor: c.border,
      alignItems: 'center', justifyContent: 'center',
    },
    optRadioSelected: { borderColor: c.success },
    optRadioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: c.success },
    optInput: { flex: 1, marginBottom: 0 },
    correctHint: { color: c.textFaint, fontSize: fontSize.xs, marginTop: spacing.xs, marginBottom: spacing.md },
    addQBtn: {
      backgroundColor: c.accent + '22', borderRadius: radius.md,
      paddingVertical: spacing.md, alignItems: 'center',
      borderWidth: 1, borderColor: c.accent + '55',
    },
    addQBtnText: { color: c.accent, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
    qRow: {
      flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm,
      backgroundColor: c.bg, borderRadius: radius.sm,
      borderWidth: 1, borderColor: c.border,
      padding: spacing.sm, marginBottom: spacing.sm,
    },
    qNum: {
      width: 28, height: 28, borderRadius: 14,
      backgroundColor: c.accent + '22', borderWidth: 1, borderColor: c.accent + '55',
      alignItems: 'center', justifyContent: 'center',
    },
    qNumText: { color: c.accent, fontSize: fontSize.xs, fontWeight: fontWeight.black },
    qInfo: { flex: 1 },
    qText: { color: c.text, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
    qAnswer: { color: c.success, fontSize: fontSize.xs, marginTop: 2 },
    createBtn: {
      backgroundColor: c.admin, borderRadius: radius.md,
      paddingVertical: spacing.md + 2, alignItems: 'center',
    },
    createBtnText: { color: c.white, fontSize: fontSize.md, fontWeight: fontWeight.black },
  });
