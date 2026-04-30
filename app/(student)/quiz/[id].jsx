import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useData } from '../../../src/contexts/DataContext';
import { colors, spacing, fontSize, fontWeight, radius } from '../../../utils/theme';

export default function QuizScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { quizzes, subjects, submitScore, getQuizScore } = useData();
  const router = useRouter();

  const quiz = quizzes.find((q) => q.id === id);
  const subject = quiz ? subjects.find((s) => s.id === quiz.subjectId) : null;
  const existingScore = quiz ? getQuizScore(user?.id, quiz.id) : null;

  const [phase, setPhase] = useState(existingScore ? 'result' : 'intro'); // 'intro' | 'quiz' | 'result'
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quiz ? quiz.duration * 60 : 0);
  const [submitted, setSubmitted] = useState(existingScore || null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (phase === 'quiz') {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const timerColor = timeLeft < 60 ? colors.danger : timeLeft < 180 ? colors.warning : colors.success;

  const handleAnswer = (questionIdx, optionIdx) => {
    setAnswers((prev) => ({ ...prev, [questionIdx]: optionIdx }));
  };

  const handleSubmit = (auto = false) => {
    clearInterval(timerRef.current);
    const questions = quiz.questions || [];
    if (!auto && Object.keys(answers).length < questions.length) {
      Alert.alert(
        'Soal belum semua dijawab',
        `Kamu baru menjawab ${Object.keys(answers).length} dari ${questions.length} soal. Lanjutkan submit?`,
        [
          { text: 'Kembali', style: 'cancel', onPress: () => { if (phase === 'quiz') startTimer(); } },
          { text: 'Submit', onPress: () => doSubmit(questions) },
        ]
      );
      return;
    }
    doSubmit(questions);
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const doSubmit = (questions) => {
    let score = 0;
    const answersArr = questions.map((q, i) => {
      const chosen = answers[i] ?? -1;
      if (chosen === q.correct) score++;
      return chosen;
    });
    const result = submitScore(user.id, quiz.id, quiz.subjectId, score, questions.length, answersArr);
    setSubmitted(result);
    setPhase('result');
  };

  if (!quiz) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.notFoundText}>Kuis tidak ditemukan</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>← Kembali</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const questions = quiz.questions || [];

  // ── INTRO ───────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backText}>← Kembali</Text>
          </TouchableOpacity>

          <View style={styles.introHero}>
            <Text style={{ fontSize: 48, marginBottom: spacing.md }}>{subject?.icon || '📝'}</Text>
            <Text style={styles.introTitle}>{quiz.title}</Text>
            <Text style={styles.introSub}>{subject?.title}</Text>
            {quiz.description && <Text style={styles.introDesc}>{quiz.description}</Text>}
          </View>

          <View style={styles.infoGrid}>
            <InfoBox icon="❓" label="Soal" value={`${questions.length} pertanyaan`} />
            <InfoBox icon="⏱" label="Durasi" value={`${quiz.duration} menit`} />
            <InfoBox icon="🏆" label="Total Poin" value={`${quiz.totalMarks} poin`} />
            <InfoBox icon="✅" label="Passing" value="70%" />
          </View>

          <View style={styles.rulesCard}>
            <Text style={styles.rulesTitle}>📋 Peraturan Kuis</Text>
            {[
              'Pilih satu jawaban untuk setiap soal',
              'Kuis akan otomatis dikumpul jika waktu habis',
              'Jawaban tidak bisa diubah setelah dikumpul',
              'Kamu bisa mengerjakan ulang kuis ini kapan saja',
            ].map((rule, i) => (
              <View key={i} style={styles.ruleRow}>
                <Text style={styles.ruleDot}>•</Text>
                <Text style={styles.ruleText}>{rule}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => { setPhase('quiz'); }}
            activeOpacity={0.8}
          >
            <Text style={styles.startBtnText}>Mulai Kuis →</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── RESULT ──────────────────────────────────────────────────────────────────
  if (phase === 'result' && submitted) {
    const pct = submitted.percentage;
    const passed = pct >= 70;
    const pctColor = pct >= 70 ? colors.success : pct >= 50 ? colors.warning : colors.danger;

    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.resultHero}>
            <Text style={{ fontSize: 64 }}>{passed ? '🎉' : '📚'}</Text>
            <Text style={styles.resultTitle}>{passed ? 'Hebat!' : 'Terus Berlatih!'}</Text>
            <View style={[styles.scoreCircle, { borderColor: pctColor }]}>
              <Text style={[styles.scoreCircleValue, { color: pctColor }]}>{pct}%</Text>
              <Text style={styles.scoreCircleLabel}>Nilai Akhir</Text>
            </View>
            <Text style={styles.scoreDetail}>
              {submitted.score} benar dari {submitted.total} soal
            </Text>
          </View>

          {/* Per-question review */}
          <Text style={styles.reviewTitle}>Pembahasan Jawaban</Text>
          {questions.map((q, i) => {
            const chosen = submitted.answers[i];
            const isCorrect = chosen === q.correct;
            return (
              <View key={q.id} style={[styles.reviewCard, { borderLeftColor: isCorrect ? colors.success : colors.danger, borderLeftWidth: 4 }]}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewQNum}>Soal {i + 1}</Text>
                  <Text style={{ fontSize: 16 }}>{isCorrect ? '✅' : '❌'}</Text>
                </View>
                <Text style={styles.reviewQText}>{q.text}</Text>
                {q.options.map((opt, oi) => {
                  const isChosen = oi === chosen;
                  const isCorrectOpt = oi === q.correct;
                  let optStyle = styles.optNeutral;
                  let optTextStyle = styles.optTextNeutral;
                  if (isCorrectOpt) { optStyle = styles.optCorrect; optTextStyle = styles.optTextCorrect; }
                  else if (isChosen && !isCorrectOpt) { optStyle = styles.optWrong; optTextStyle = styles.optTextWrong; }

                  return (
                    <View key={oi} style={[styles.reviewOpt, optStyle]}>
                      <Text style={[styles.reviewOptText, optTextStyle]}>
                        {String.fromCharCode(65 + oi)}. {opt}
                      </Text>
                      {isCorrectOpt && <Text style={{ color: colors.success, fontSize: 14 }}>✓</Text>}
                      {isChosen && !isCorrectOpt && <Text style={{ color: colors.danger, fontSize: 14 }}>✗</Text>}
                    </View>
                  );
                })}
              </View>
            );
          })}

          <View style={styles.resultActions}>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => {
                setAnswers({});
                setCurrent(0);
                setTimeLeft(quiz.duration * 60);
                setSubmitted(null);
                setPhase('intro');
              }}
            >
              <Text style={styles.retryBtnText}>🔄 Ulangi Kuis</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
              <Text style={styles.doneBtnText}>← Kembali</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── QUIZ ────────────────────────────────────────────────────────────────────
  const q = questions[current];
  const totalAnswered = Object.keys(answers).length;
  const progress = questions.length > 0 ? (current + 1) / questions.length : 0;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Timer bar */}
      <View style={styles.timerBar}>
        <View style={styles.timerLeft}>
          <Text style={styles.quizName} numberOfLines={1}>{quiz.title}</Text>
          <Text style={styles.progress}>{current + 1} / {questions.length}</Text>
        </View>
        <View style={[styles.timerPill, { borderColor: timerColor + '88' }]}>
          <Text style={[styles.timerText, { color: timerColor }]}>⏱ {formatTime(timeLeft)}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarWrap}>
        <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: timerColor }]} />
      </View>

      <ScrollView contentContainerStyle={styles.quizScroll} showsVerticalScrollIndicator={false}>
        {/* Question dots */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dotsWrap}>
          {questions.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => setCurrent(i)}>
              <View style={[
                styles.dot,
                i === current && styles.dotActive,
                answers[i] !== undefined && i !== current && styles.dotAnswered,
              ]}>
                <Text style={[styles.dotText, i === current && styles.dotTextActive]}>{i + 1}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Question */}
        <View style={styles.questionCard}>
          <Text style={styles.questionLabel}>Pertanyaan {current + 1}</Text>
          <Text style={styles.questionText}>{q?.text}</Text>
        </View>

        {/* Options */}
        {q?.options?.map((opt, oi) => {
          const isSelected = answers[current] === oi;
          return (
            <TouchableOpacity
              key={oi}
              style={[styles.optionBtn, isSelected && styles.optionBtnSelected]}
              onPress={() => handleAnswer(current, oi)}
              activeOpacity={0.8}
            >
              <View style={[styles.optLetter, isSelected && styles.optLetterSelected]}>
                <Text style={[styles.optLetterText, isSelected && styles.optLetterTextSelected]}>
                  {String.fromCharCode(65 + oi)}
                </Text>
              </View>
              <Text style={[styles.optText, isSelected && styles.optTextSelected]}>{opt}</Text>
              {isSelected && <Text style={{ color: colors.accent, fontSize: 16 }}>●</Text>}
            </TouchableOpacity>
          );
        })}

        {/* Navigation */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, current === 0 && styles.navBtnDisabled]}
            onPress={() => current > 0 && setCurrent(current - 1)}
            disabled={current === 0}
          >
            <Text style={styles.navBtnText}>← Sebelumnya</Text>
          </TouchableOpacity>

          {current < questions.length - 1 ? (
            <TouchableOpacity style={styles.navBtnNext} onPress={() => setCurrent(current + 1)}>
              <Text style={styles.navBtnNextText}>Berikutnya →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.submitBtn} onPress={() => handleSubmit(false)}>
              <Text style={styles.submitBtnText}>
                Kumpulkan ({totalAnswered}/{questions.length})
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoBox = ({ icon, label, value }) => (
  <View style={styles.infoBox}>
    <Text style={{ fontSize: 24, marginBottom: 4 }}>{icon}</Text>
    <Text style={styles.infoBoxValue}>{value}</Text>
    <Text style={styles.infoBoxLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  notFoundText: { color: colors.textMuted, fontSize: fontSize.lg },
  backLink: { color: colors.accent, fontSize: fontSize.md },
  back: { marginBottom: spacing.md },
  backText: { color: colors.textMuted, fontSize: fontSize.sm },

  // Intro
  introHero: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.xl, alignItems: 'center', marginBottom: spacing.lg,
  },
  introTitle: { color: colors.white, fontSize: fontSize.xxl, fontWeight: fontWeight.black, textAlign: 'center' },
  introSub: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.xs },
  introDesc: { color: colors.textMuted, fontSize: fontSize.sm, textAlign: 'center', marginTop: spacing.md, lineHeight: 22 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  infoBox: {
    width: '47%', backgroundColor: colors.bgCard,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, alignItems: 'center',
  },
  infoBoxValue: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.bold },
  infoBoxLabel: { color: colors.textFaint, fontSize: fontSize.xs, marginTop: 2 },
  rulesCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.xl, gap: spacing.sm,
  },
  rulesTitle: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.bold, marginBottom: spacing.xs },
  ruleRow: { flexDirection: 'row', gap: spacing.sm },
  ruleDot: { color: colors.accent },
  ruleText: { color: colors.textMuted, fontSize: fontSize.sm, flex: 1, lineHeight: 20 },
  startBtn: {
    backgroundColor: colors.accent, borderRadius: radius.md,
    paddingVertical: spacing.md + 2, alignItems: 'center',
  },
  startBtnText: { color: colors.bg, fontSize: fontSize.md, fontWeight: fontWeight.black },

  // Quiz
  timerBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.bgCard, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  timerLeft: { flex: 1 },
  quizName: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  progress: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  timerPill: {
    borderRadius: radius.full, borderWidth: 1,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
  },
  timerText: { fontSize: fontSize.md, fontWeight: fontWeight.black },
  progressBarWrap: { height: 3, backgroundColor: colors.border },
  progressBarFill: { height: 3 },
  quizScroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  dotsWrap: { marginBottom: spacing.lg },
  dot: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.xs,
  },
  dotActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  dotAnswered: { backgroundColor: colors.success + '33', borderColor: colors.success + '88' },
  dotText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  dotTextActive: { color: colors.bg },
  questionCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.lg, marginBottom: spacing.lg,
  },
  questionLabel: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: fontWeight.bold, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 1 },
  questionText: { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.semibold, lineHeight: 26 },
  optionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.bgCard, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  optionBtnSelected: { borderColor: colors.accent, backgroundColor: colors.accent + '11' },
  optLetter: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  optLetterSelected: { backgroundColor: colors.accent },
  optLetterText: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  optLetterTextSelected: { color: colors.bg },
  optText: { flex: 1, color: colors.text, fontSize: fontSize.md },
  optTextSelected: { color: colors.white, fontWeight: fontWeight.semibold },
  navRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  navBtn: {
    flex: 1, paddingVertical: spacing.md,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center',
  },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  navBtnNext: {
    flex: 1, paddingVertical: spacing.md,
    borderRadius: radius.md, backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.accent + '55', alignItems: 'center',
  },
  navBtnNextText: { color: colors.accent, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  submitBtn: {
    flex: 1, paddingVertical: spacing.md,
    borderRadius: radius.md, backgroundColor: colors.success,
    alignItems: 'center',
  },
  submitBtnText: { color: colors.bg, fontSize: fontSize.sm, fontWeight: fontWeight.black },

  // Result
  resultHero: {
    alignItems: 'center', padding: spacing.xl,
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xl,
  },
  resultTitle: { color: colors.white, fontSize: fontSize.xxl, fontWeight: fontWeight.black, marginBottom: spacing.lg },
  scoreCircle: {
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 4, alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
  },
  scoreCircleValue: { fontSize: fontSize.xxxl, fontWeight: fontWeight.black },
  scoreCircleLabel: { color: colors.textMuted, fontSize: fontSize.xs },
  scoreDetail: { color: colors.textMuted, fontSize: fontSize.md },
  reviewTitle: { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: spacing.md },
  reviewCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.md,
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  reviewQNum: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase' },
  reviewQText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.md },
  reviewOpt: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.sm, borderRadius: radius.sm, marginBottom: spacing.xs,
    borderWidth: 1, borderColor: 'transparent',
  },
  optNeutral: { backgroundColor: colors.bg },
  optCorrect: { backgroundColor: colors.success + '22', borderColor: colors.success + '55' },
  optWrong: { backgroundColor: colors.danger + '22', borderColor: colors.danger + '55' },
  reviewOptText: { fontSize: fontSize.sm, flex: 1 },
  optTextNeutral: { color: colors.textMuted },
  optTextCorrect: { color: colors.success, fontWeight: fontWeight.semibold },
  optTextWrong: { color: colors.danger },
  resultActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  retryBtn: {
    flex: 1, paddingVertical: spacing.md, borderRadius: radius.md,
    backgroundColor: colors.accent + '22', borderWidth: 1, borderColor: colors.accent + '55',
    alignItems: 'center',
  },
  retryBtnText: { color: colors.accent, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  doneBtn: {
    flex: 1, paddingVertical: spacing.md, borderRadius: radius.md,
    backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center',
  },
  doneBtnText: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
});
