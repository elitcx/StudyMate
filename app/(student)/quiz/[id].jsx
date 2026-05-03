import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useData } from '../../../src/contexts/DataContext';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius } from '../../../utils/theme';

const InfoBox = ({ s, icon, label, value }) => (
  <View style={s.infoBox}>
    <Text style={{ fontSize: 24, marginBottom: 4 }}>{icon}</Text>
    <Text style={s.infoBoxValue}>{value}</Text>
    <Text style={s.infoBoxLabel}>{label}</Text>
  </View>
);

export default function QuizScreen() {
  const { colors, isDark } = useTheme();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { quizzes, subjects, submitScore, getQuizScore } = useData();
  const router = useRouter();

  const quiz = quizzes.find((q) => q.id === id);
  const subject = quiz ? subjects.find((su) => su.id === quiz.subjectId) : null;
  const existingScore = quiz ? getQuizScore(user?.id, quiz.id) : null;

  const [phase, setPhase] = useState(existingScore ? 'result' : 'intro');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quiz ? quiz.duration * 60 : 0);
  const [submitted, setSubmitted] = useState(existingScore || null);
  const timerRef = useRef(null);

  const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

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

  const formatTime = (sec) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
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

  const doSubmit = async (questions) => {
    let score = 0;
    const answersArr = questions.map((q, i) => {
      const chosen = answers[i] ?? -1;
      if (chosen === q.correct) score++;
      return chosen;
    });
    const result = await submitScore(user.id, quiz.id, quiz.subjectId, score, questions.length, answersArr);
    setSubmitted(result);
    setPhase('result');
  };

  if (!quiz) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <Text style={s.notFoundText}>Kuis tidak ditemukan</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={s.backLink}>← Kembali</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const questions = quiz.questions || [];

  // ── INTRO ───────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.scroll}>
          <TouchableOpacity style={s.back} onPress={() => router.back()}>
            <Text style={s.backText}>← Kembali</Text>
          </TouchableOpacity>

          <View style={s.introHero}>
            <Text style={{ fontSize: 48, marginBottom: spacing.md }}>{subject?.icon || '📝'}</Text>
            <Text style={s.introTitle}>{quiz.title}</Text>
            <Text style={s.introSub}>{subject?.title}</Text>
            {quiz.description && <Text style={s.introDesc}>{quiz.description}</Text>}
          </View>

          <View style={s.infoGrid}>
            <InfoBox s={s} icon="❓" label="Soal" value={`${questions.length} pertanyaan`} />
            <InfoBox s={s} icon="⏱" label="Durasi" value={`${quiz.duration} menit`} />
            <InfoBox s={s} icon="🏆" label="Total Poin" value={`${quiz.totalMarks} poin`} />
            <InfoBox s={s} icon="✅" label="Passing" value="70%" />
          </View>

          <View style={s.rulesCard}>
            <Text style={s.rulesTitle}>📋 Peraturan Kuis</Text>
            {[
              'Pilih satu jawaban untuk setiap soal',
              'Kuis akan otomatis dikumpul jika waktu habis',
              'Jawaban tidak bisa diubah setelah dikumpul',
              'Kamu bisa mengerjakan ulang kuis ini kapan saja',
            ].map((rule, i) => (
              <View key={i} style={s.ruleRow}>
                <Text style={s.ruleDot}>•</Text>
                <Text style={s.ruleText}>{rule}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={s.startBtn}
            onPress={() => { setPhase('quiz'); }}
            activeOpacity={0.8}
          >
            <Text style={s.startBtnText}>Mulai Kuis →</Text>
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
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.scroll}>
          <View style={s.resultHero}>
            <Text style={{ fontSize: 64 }}>{passed ? '🎉' : '📚'}</Text>
            <Text style={s.resultTitle}>{passed ? 'Hebat!' : 'Terus Berlatih!'}</Text>
            <View style={[s.scoreCircle, { borderColor: pctColor }]}>
              <Text style={[s.scoreCircleValue, { color: pctColor }]}>{pct}%</Text>
              <Text style={s.scoreCircleLabel}>Nilai Akhir</Text>
            </View>
            <Text style={s.scoreDetail}>
              {submitted.score} benar dari {submitted.total} soal
            </Text>
          </View>

          <Text style={s.reviewTitle}>Pembahasan Jawaban</Text>
          {questions.map((q, i) => {
            const chosen = submitted.answers[i];
            const isCorrect = chosen === q.correct;
            return (
              <View key={q.id} style={[s.reviewCard, { borderLeftColor: isCorrect ? colors.success : colors.danger, borderLeftWidth: 4 }]}>
                <View style={s.reviewHeader}>
                  <Text style={s.reviewQNum}>Soal {i + 1}</Text>
                  <Text style={{ fontSize: 16 }}>{isCorrect ? '✅' : '❌'}</Text>
                </View>
                <Text style={s.reviewQText}>{q.text}</Text>
                {q.options.map((opt, oi) => {
                  const isChosen = oi === chosen;
                  const isCorrectOpt = oi === q.correct;
                  let optStyle = s.optNeutral;
                  let optTextStyle = s.optTextNeutral;
                  if (isCorrectOpt) { optStyle = s.optCorrect; optTextStyle = s.optTextCorrect; }
                  else if (isChosen && !isCorrectOpt) { optStyle = s.optWrong; optTextStyle = s.optTextWrong; }

                  return (
                    <View key={oi} style={[s.reviewOpt, optStyle]}>
                      <Text style={[s.reviewOptText, optTextStyle]}>
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

          <View style={s.resultActions}>
            <TouchableOpacity
              style={s.retryBtn}
              onPress={() => {
                setAnswers({});
                setCurrent(0);
                setTimeLeft(quiz.duration * 60);
                setSubmitted(null);
                setPhase('intro');
              }}
            >
              <Text style={s.retryBtnText}>🔄 Ulangi Kuis</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.doneBtn} onPress={() => router.back()}>
              <Text style={s.doneBtnText}>← Kembali</Text>
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
    <SafeAreaView style={s.safe}>
      <View style={s.timerBar}>
        <View style={s.timerLeft}>
          <Text style={s.quizName} numberOfLines={1}>{quiz.title}</Text>
          <Text style={s.progress}>{current + 1} / {questions.length}</Text>
        </View>
        <View style={[s.timerPill, { borderColor: timerColor + '88' }]}>
          <Text style={[s.timerText, { color: timerColor }]}>⏱ {formatTime(timeLeft)}</Text>
        </View>
      </View>

      <View style={s.progressBarWrap}>
        <View style={[s.progressBarFill, { width: `${progress * 100}%`, backgroundColor: timerColor }]} />
      </View>

      <ScrollView contentContainerStyle={s.quizScroll} showsVerticalScrollIndicator={false}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.dotsWrap}>
          {questions.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => setCurrent(i)}>
              <View style={[
                s.dot,
                i === current && s.dotActive,
                answers[i] !== undefined && i !== current && s.dotAnswered,
              ]}>
                <Text style={[s.dotText, i === current && s.dotTextActive]}>{i + 1}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={s.questionCard}>
          <Text style={s.questionLabel}>Pertanyaan {current + 1}</Text>
          <Text style={s.questionText}>{q?.text}</Text>
        </View>

        {q?.options?.map((opt, oi) => {
          const isSelected = answers[current] === oi;
          return (
            <TouchableOpacity
              key={oi}
              style={[s.optionBtn, isSelected && s.optionBtnSelected]}
              onPress={() => handleAnswer(current, oi)}
              activeOpacity={0.8}
            >
              <View style={[s.optLetter, isSelected && s.optLetterSelected]}>
                <Text style={[s.optLetterText, isSelected && s.optLetterTextSelected]}>
                  {String.fromCharCode(65 + oi)}
                </Text>
              </View>
              <Text style={[s.optText, isSelected && s.optTextSelected]}>{opt}</Text>
              {isSelected && <Text style={{ color: colors.accent, fontSize: 16 }}>●</Text>}
            </TouchableOpacity>
          );
        })}

        <View style={s.navRow}>
          <TouchableOpacity
            style={[s.navBtn, current === 0 && s.navBtnDisabled]}
            onPress={() => current > 0 && setCurrent(current - 1)}
            disabled={current === 0}
          >
            <Text style={s.navBtnText}>← Sebelumnya</Text>
          </TouchableOpacity>

          {current < questions.length - 1 ? (
            <TouchableOpacity style={s.navBtnNext} onPress={() => setCurrent(current + 1)}>
              <Text style={s.navBtnNextText}>Berikutnya →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={s.submitBtn} onPress={() => handleSubmit(false)}>
              <Text style={s.submitBtnText}>
                Kumpulkan ({totalAnswered}/{questions.length})
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (c, isDark) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
    notFoundText: { color: c.textMuted, fontSize: fontSize.lg },
    backLink: { color: c.accent, fontSize: fontSize.md },
    back: { marginBottom: spacing.md },
    backText: { color: c.textMuted, fontSize: fontSize.sm },

    introHero: {
      backgroundColor: c.bgCard, borderRadius: radius.lg,
      borderWidth: 1, borderColor: c.border,
      padding: spacing.xl, alignItems: 'center', marginBottom: spacing.lg,
    },
    introTitle: { color: c.text, fontSize: fontSize.xxl, fontWeight: fontWeight.black, textAlign: 'center' },
    introSub: { color: c.textMuted, fontSize: fontSize.sm, marginTop: spacing.xs },
    introDesc: { color: c.textMuted, fontSize: fontSize.sm, textAlign: 'center', marginTop: spacing.md, lineHeight: 22 },
    infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
    infoBox: {
      width: '47%', backgroundColor: c.bgCard,
      borderRadius: radius.md, borderWidth: 1, borderColor: c.border,
      padding: spacing.md, alignItems: 'center',
    },
    infoBoxValue: { color: c.text, fontSize: fontSize.md, fontWeight: fontWeight.bold },
    infoBoxLabel: { color: c.textFaint, fontSize: fontSize.xs, marginTop: 2 },
    rulesCard: {
      backgroundColor: c.bgCard, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border,
      padding: spacing.md, marginBottom: spacing.xl, gap: spacing.sm,
    },
    rulesTitle: { color: c.text, fontSize: fontSize.md, fontWeight: fontWeight.bold, marginBottom: spacing.xs },
    ruleRow: { flexDirection: 'row', gap: spacing.sm },
    ruleDot: { color: c.accent },
    ruleText: { color: c.textMuted, fontSize: fontSize.sm, flex: 1, lineHeight: 20 },
    startBtn: {
      backgroundColor: c.accent, borderRadius: radius.md,
      paddingVertical: spacing.md + 2, alignItems: 'center',
    },
    startBtnText: { color: c.bg, fontSize: fontSize.md, fontWeight: fontWeight.black },

    timerBar: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
      backgroundColor: c.bgCard, borderBottomWidth: 1, borderBottomColor: c.border,
    },
    timerLeft: { flex: 1 },
    quizName: { color: c.text, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
    progress: { color: c.textMuted, fontSize: fontSize.xs, marginTop: 2 },
    timerPill: {
      borderRadius: radius.full, borderWidth: 1,
      paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    },
    timerText: { fontSize: fontSize.md, fontWeight: fontWeight.black },
    progressBarWrap: { height: 3, backgroundColor: c.border },
    progressBarFill: { height: 3 },
    quizScroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
    dotsWrap: { marginBottom: spacing.lg },
    dot: {
      width: 32, height: 32, borderRadius: 16,
      backgroundColor: c.bgCard, borderWidth: 1, borderColor: c.border,
      alignItems: 'center', justifyContent: 'center', marginRight: spacing.xs,
    },
    dotActive: { backgroundColor: c.accent, borderColor: c.accent },
    dotAnswered: { backgroundColor: c.success + '33', borderColor: c.success + '88' },
    dotText: { color: c.textMuted, fontSize: fontSize.xs, fontWeight: fontWeight.bold },
    dotTextActive: { color: c.bg },
    questionCard: {
      backgroundColor: c.bgCard, borderRadius: radius.lg,
      borderWidth: 1, borderColor: c.border,
      padding: spacing.lg, marginBottom: spacing.lg,
    },
    questionLabel: { color: c.textMuted, fontSize: fontSize.xs, fontWeight: fontWeight.bold, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 1 },
    questionText: { color: c.text, fontSize: fontSize.lg, fontWeight: fontWeight.semibold, lineHeight: 26 },
    optionBtn: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.md,
      backgroundColor: c.bgCard, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border,
      padding: spacing.md, marginBottom: spacing.sm,
    },
    optionBtnSelected: { borderColor: c.accent, backgroundColor: c.accent + '11' },
    optLetter: {
      width: 32, height: 32, borderRadius: 16,
      backgroundColor: c.border, alignItems: 'center', justifyContent: 'center',
    },
    optLetterSelected: { backgroundColor: c.accent },
    optLetterText: { color: c.textMuted, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
    optLetterTextSelected: { color: c.bg },
    optText: { flex: 1, color: c.text, fontSize: fontSize.md },
    optTextSelected: { color: c.text, fontWeight: fontWeight.semibold },
    navRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
    navBtn: {
      flex: 1, paddingVertical: spacing.md,
      borderRadius: radius.md, borderWidth: 1, borderColor: c.border,
      alignItems: 'center',
    },
    navBtnDisabled: { opacity: 0.3 },
    navBtnText: { color: c.textMuted, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
    navBtnNext: {
      flex: 1, paddingVertical: spacing.md,
      borderRadius: radius.md, backgroundColor: c.bgCard,
      borderWidth: 1, borderColor: c.accent + '55', alignItems: 'center',
    },
    navBtnNextText: { color: c.accent, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
    submitBtn: {
      flex: 1, paddingVertical: spacing.md,
      borderRadius: radius.md, backgroundColor: c.success,
      alignItems: 'center',
    },
    submitBtnText: { color: c.bg, fontSize: fontSize.sm, fontWeight: fontWeight.black },

    resultHero: {
      alignItems: 'center', padding: spacing.xl,
      backgroundColor: c.bgCard, borderRadius: radius.lg,
      borderWidth: 1, borderColor: c.border, marginBottom: spacing.xl,
    },
    resultTitle: { color: c.text, fontSize: fontSize.xxl, fontWeight: fontWeight.black, marginBottom: spacing.lg },
    scoreCircle: {
      width: 120, height: 120, borderRadius: 60,
      borderWidth: 4, alignItems: 'center', justifyContent: 'center',
      marginBottom: spacing.md,
    },
    scoreCircleValue: { fontSize: fontSize.xxxl, fontWeight: fontWeight.black },
    scoreCircleLabel: { color: c.textMuted, fontSize: fontSize.xs },
    scoreDetail: { color: c.textMuted, fontSize: fontSize.md },
    reviewTitle: { color: c.text, fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: spacing.md },
    reviewCard: {
      backgroundColor: c.bgCard, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border,
      padding: spacing.md, marginBottom: spacing.md,
    },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
    reviewQNum: { color: c.textMuted, fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase' },
    reviewQText: { color: c.text, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.md },
    reviewOpt: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      padding: spacing.sm, borderRadius: radius.sm, marginBottom: spacing.xs,
      borderWidth: 1, borderColor: 'transparent',
    },
    optNeutral: { backgroundColor: c.bg },
    optCorrect: { backgroundColor: c.success + '22', borderColor: c.success + '55' },
    optWrong: { backgroundColor: c.danger + '22', borderColor: c.danger + '55' },
    reviewOptText: { fontSize: fontSize.sm, flex: 1 },
    optTextNeutral: { color: c.textMuted },
    optTextCorrect: { color: c.success, fontWeight: fontWeight.semibold },
    optTextWrong: { color: c.danger },
    resultActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
    retryBtn: {
      flex: 1, paddingVertical: spacing.md, borderRadius: radius.md,
      backgroundColor: c.accent + '22', borderWidth: 1, borderColor: c.accent + '55',
      alignItems: 'center',
    },
    retryBtnText: { color: c.accent, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
    doneBtn: {
      flex: 1, paddingVertical: spacing.md, borderRadius: radius.md,
      backgroundColor: c.bgCard, borderWidth: 1, borderColor: c.border,
      alignItems: 'center',
    },
    doneBtnText: { color: c.textMuted, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  });
