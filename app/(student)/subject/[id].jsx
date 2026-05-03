import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ScrollView, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useData } from '../../../src/contexts/DataContext';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius } from '../../../utils/theme';

const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
function fmtDate(s) {
  if (!s) return 'Tanggal belum ditetapkan';
  const d = new Date(s);
  return isNaN(d) ? s : `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
function daysUntil(s) {
  if (!s) return null;
  const t = new Date(); t.setHours(0,0,0,0);
  const d = new Date(s); d.setHours(0,0,0,0);
  return Math.ceil((d - t) / 86400000);
}

const TABS = [
  { key: 'materi',   label: 'Materi',        icon: '📄' },
  { key: 'kisi',     label: 'Kisi-kisi',     icon: '📅' },
  { key: 'sumber',   label: 'Sumber',         icon: '🔗' },
  { key: 'latihan',  label: 'Latihan Soal',  icon: '✏️' },
];

const EmptyTab = ({ s, icon, text }) => (
  <View style={s.emptyWrap}>
    <Text style={s.emptyIcon}>{icon}</Text>
    <Text style={s.emptyText}>{text}</Text>
  </View>
);

export default function SubjectDetailScreen() {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { subjects, materials, quizzes, getUserScores } = useData();
  const router = useRouter();
  const [tab, setTab] = useState('materi');

  const subject = subjects.find((su) => su.id === id);
  const subMats    = materials.filter((m) => m.subjectId === id);
  const subQuizzes = quizzes.filter((q) => q.subjectId === id);
  const myScores   = getUserScores(user?.id || '');

  const coreMats   = subMats.filter((m) => m.type !== 'video');
  const videoMats  = subMats.filter((m) => m.type === 'video');

  const typeIcon  = (t) => t === 'video' ? '🎬' : t === 'pdf' ? '📄' : '📝';
  const typeColor = (t) => t === 'video' ? colors.admin : t === 'pdf' ? colors.danger : colors.accent;

  if (!subject) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <Text style={s.notFoundText}>Mata pelajaran tidak ditemukan</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={s.backLink}>← Kembali</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.pageHeader}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.subjectIcon}>{subject.icon}</Text>
        <Text style={[s.subjectTitle, { color: subject.color }]}>{subject.title}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.tabBarScroll}
        contentContainerStyle={s.tabBar}
      >
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={[s.tabBtn, active ? { backgroundColor: subject.color, borderColor: subject.color } : null]}
              onPress={() => setTab(t.key)}
            >
              <Text style={s.tabIcon}>{t.icon}</Text>
              <Text style={[s.tabLabel, active && { color: '#fff', fontWeight: fontWeight.bold }]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── TAB CONTENT ─────────────────────────────────── */}
      <View style={s.content}>
        {/* ── MATERI ──────────────────────────────────────── */}
        {tab === 'materi' && (
          <FlatList
            style={s.listFlex}
            data={coreMats}
            keyExtractor={(m) => m.id}
            key={isDark ? 'dark' : 'light'}
            contentContainerStyle={s.listPad}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<EmptyTab s={s} icon="📄" text="Belum ada materi untuk mata pelajaran ini" />}
            renderItem={({ item: mat }) => (
              <TouchableOpacity
                style={[s.matCard, { borderLeftColor: typeColor(mat.type), borderLeftWidth: 3 }]}
                onPress={() => router.push({ pathname: '/(student)/material-detail', params: { matId: mat.id } })}
                activeOpacity={0.8}
              >
                <View style={[s.matIcon, { backgroundColor: typeColor(mat.type) + '22' }]}>
                  <Text style={{ fontSize: 22 }}>{typeIcon(mat.type)}</Text>
                </View>
                <View style={s.matInfo}>
                  <View style={[s.typePill, { backgroundColor: typeColor(mat.type) + '22', borderColor: typeColor(mat.type) + '55' }]}>
                    <Text style={[s.typePillTxt, { color: typeColor(mat.type) }]}>{mat.type.toUpperCase()}</Text>
                  </View>
                  <Text style={s.matTitle}>{mat.title}</Text>
                  <Text style={s.matDesc} numberOfLines={2}>{mat.description}</Text>
                  <Text style={s.matMeta}>
                    👤 {mat.author}{mat.pages ? `  ·  📃 ${mat.pages} hal` : ''}{mat.duration ? `  ·  ⏱ ${mat.duration}` : ''}
                  </Text>
                </View>
                <Text style={s.chevron}>›</Text>
              </TouchableOpacity>
            )}
          />
        )}

        {/* ── KISI-KISI UJIAN ─────────────────────────────── */}
        {tab === 'kisi' && (
          <FlatList
            style={s.listFlex}
            data={subQuizzes.filter((q) => (q.type ?? 'practice') === 'exam').sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0))}
            keyExtractor={(q) => q.id}
            key={isDark ? 'dark' : 'light'}
            contentContainerStyle={s.listPad}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<EmptyTab s={s} icon="📅" text="Belum ada ujian yang dijadwalkan" />}
            renderItem={({ item: test }) => {
              const days = daysUntil(test.date);
              let urgencyColor = colors.success;
              let urgencyLabel = days !== null ? `${days} hari lagi` : '';
              if (days === null)  { urgencyColor = colors.textFaint; urgencyLabel = ''; }
              if (days < 0)       { urgencyColor = colors.textFaint; urgencyLabel = 'Sudah lewat'; }
              if (days === 0)     { urgencyColor = colors.danger;    urgencyLabel = 'Hari ini!'; }
              if (days > 0 && days <= 3) urgencyColor = colors.danger;
              if (days > 3 && days <= 7) urgencyColor = colors.warning;

              const linkedMats = (test.materialIds || [])
                .map((mid) => materials.find((m) => m.id === mid)).filter(Boolean);

              return (
                <TouchableOpacity
                  style={[s.testCard, { borderLeftColor: subject.color, borderLeftWidth: 4 }]}
                  onPress={() => router.push({ pathname: '/(student)/test-materials', params: { testId: test.id, subjectId: id } })}
                  activeOpacity={0.8}
                >
                  <View style={s.testTop}>
                    <Text style={s.testTitle}>{test.title}</Text>
                    {urgencyLabel ? (
                      <View style={[s.urgencyBadge, { backgroundColor: urgencyColor + '22', borderColor: urgencyColor + '55' }]}>
                        <Text style={[s.urgencyTxt, { color: urgencyColor }]}>{urgencyLabel}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={s.testDate}>📅 {fmtDate(test.date)}</Text>
                  {test.description ? <Text style={s.testDesc}>{test.description}</Text> : null}
                  {linkedMats.length > 0 && (
                    <View style={s.matChips}>
                      <Text style={s.matChipsLabel}>Materi terkait:</Text>
                      {linkedMats.map((m) => (
                        <View key={m.id} style={s.matChip}>
                          <Text style={s.matChipTxt}>{typeIcon(m.type)} {m.title}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  <View style={s.testFooter}>
                    <Text style={s.testFooterItem}>⏱ {test.duration} menit</Text>
                    <Text style={s.testFooterItem}>🏆 {test.totalMarks} poin</Text>
                    <View style={s.viewMatBtn}>
                      <Text style={[s.viewMatTxt, { color: subject.color }]}>Lihat Materi →</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}

        {/* ── SUMBER BELAJAR ──────────────────────────────── */}
        {tab === 'sumber' && (
          <FlatList
            style={s.listFlex}
            data={videoMats}
            keyExtractor={(m) => m.id}
            key={isDark ? 'dark' : 'light'}
            contentContainerStyle={s.listPad}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<EmptyTab s={s} icon="🔗" text="Belum ada sumber belajar ditambahkan" />}
            renderItem={({ item: mat }) => (
              <TouchableOpacity
                style={[s.sourceCard, { borderColor: colors.admin + '44' }]}
                onPress={() => mat.fileUrl && Linking.openURL(mat.fileUrl)}
                activeOpacity={0.8}
              >
                <View style={[s.sourcThumb, { backgroundColor: colors.admin + '22' }]}>
                  <Text style={s.sourcPlay}>▶</Text>
                  <Text style={[s.sourcDur, { color: colors.admin }]}>{mat.duration || '—'}</Text>
                </View>
                <View style={s.sourcInfo}>
                  <Text style={s.sourcTitle}>{mat.title}</Text>
                  <Text style={s.sourcDesc} numberOfLines={2}>{mat.description}</Text>
                  <Text style={s.sourcMeta}>👤 {mat.author}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}

        {/* ── LATIHAN SOAL ────────────────────────────────── */}
        {tab === 'latihan' && (
          <FlatList
            style={s.listFlex}
            data={subQuizzes.filter((q) => (q.type ?? 'practice') === 'practice')}
            keyExtractor={(q) => q.id}
            key={isDark ? 'dark' : 'light'}
            contentContainerStyle={s.listPad}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<EmptyTab s={s} icon="✏️" text="Belum ada latihan soal untuk mata pelajaran ini" />}
            renderItem={({ item: quiz }) => {
              const score = myScores.find((sc) => sc.quizId === quiz.id);
              const isDone = !!score;
              const pctColor = score
                ? score.percentage >= 70 ? colors.success : score.percentage >= 50 ? colors.warning : colors.danger
                : colors.accent;
              return (
                <TouchableOpacity
                  style={s.quizCard}
                  onPress={() => router.push(`/(student)/quiz/${quiz.id}`)}
                  activeOpacity={0.8}
                >
                  <View style={s.quizTop}>
                    <View style={s.quizInfo}>
                      <Text style={s.quizTitle}>{quiz.title}</Text>
                      {quiz.description ? <Text style={s.quizDesc} numberOfLines={1}>{quiz.description}</Text> : null}
                    </View>
                    {isDone ? (
                      <View style={[s.scoreBadge, { backgroundColor: pctColor + '22', borderColor: pctColor + '55' }]}>
                        <Text style={[s.scoreVal, { color: pctColor }]}>{score.percentage}%</Text>
                      </View>
                    ) : (
                      <View style={s.startBadge}>
                        <Text style={s.startTxt}>Mulai →</Text>
                      </View>
                    )}
                  </View>
                  <View style={s.quizMeta}>
                    <Text style={s.quizMetaItem}>❓ {quiz.questions?.length || 0} soal</Text>
                    <Text style={s.quizMetaItem}>⏱ {quiz.duration} menit</Text>
                    <Text style={s.quizMetaItem}>🏆 {quiz.totalMarks} poin</Text>
                  </View>
                  {isDone && score && (
                    <View style={s.scoreBar}>
                      <View style={s.scoreTrack}>
                        <View style={[s.scoreFill, { width: `${score.percentage}%`, backgroundColor: pctColor }]} />
                      </View>
                      <Text style={[s.scorePct, { color: pctColor }]}>{score.score}/{score.total}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (c, isDark) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
    notFoundText: { color: c.textMuted, fontSize: fontSize.lg },
    backLink: { color: c.accent, fontSize: fontSize.md },

    pageHeader: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
      paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xs,
    },
    backBtn: {
      width: 32, height: 32, borderRadius: 16,
      backgroundColor: c.bgCard, borderWidth: 1, borderColor: c.border,
      alignItems: 'center', justifyContent: 'center', marginRight: spacing.xs,
    },
    backText: { color: c.text, fontSize: fontSize.md, fontWeight: fontWeight.bold },
    subjectIcon: { fontSize: 20 },
    subjectTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.black, flex: 1 },

    tabBarScroll: { flexGrow: 0, flexShrink: 0 },
    tabBar: { paddingHorizontal: spacing.lg, gap: spacing.xs, paddingBottom: spacing.sm, alignItems: 'center' },
    tabBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      paddingHorizontal: spacing.md, paddingVertical: 6,
      borderRadius: radius.full,
      backgroundColor: c.bgCard,
      borderWidth: 1, borderColor: c.border,
    },
    tabIcon: { fontSize: 12 },
    tabLabel: { color: c.textMuted, fontSize: fontSize.xs, fontWeight: fontWeight.medium },

    content: { flex: 1 },
    listFlex: { flex: 1 },
    listPad: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, paddingTop: spacing.xs },

    matCard: {
      flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md,
      backgroundColor: c.bgCard, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border,
      padding: spacing.md, marginBottom: spacing.sm,
    },
    matIcon: { width: 48, height: 48, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    matInfo: { flex: 1, minWidth: 0 },
    typePill: { alignSelf: 'flex-start', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2, borderWidth: 1, marginBottom: spacing.xs },
    typePillTxt: { fontSize: 10, fontWeight: fontWeight.black, letterSpacing: 0.5 },
    matTitle: { color: c.text, fontSize: fontSize.md, fontWeight: fontWeight.bold, marginBottom: spacing.xs },
    matDesc: { color: c.textMuted, fontSize: fontSize.sm, marginBottom: spacing.xs },
    matMeta: { color: c.textFaint, fontSize: fontSize.xs },
    chevron: { color: c.textMuted, fontSize: 20, alignSelf: 'center' },

    testCard: {
      backgroundColor: c.bgCard, borderRadius: radius.lg,
      borderWidth: 1, borderColor: c.border,
      padding: spacing.md, marginBottom: spacing.md, gap: spacing.sm,
    },
    testTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
    testTitle: { flex: 1, color: c.text, fontSize: fontSize.md, fontWeight: fontWeight.bold },
    urgencyBadge: { borderRadius: radius.full, borderWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: 3, flexShrink: 0 },
    urgencyTxt: { fontSize: 11, fontWeight: fontWeight.bold },
    testDate: { color: c.textMuted, fontSize: fontSize.xs },
    testDesc: { color: c.textMuted, fontSize: fontSize.sm, lineHeight: 20 },
    matChips: { gap: 4 },
    matChipsLabel: { color: c.textFaint, fontSize: fontSize.xs },
    matChip: { backgroundColor: c.bg, borderRadius: radius.sm, borderWidth: 1, borderColor: c.border, paddingHorizontal: spacing.sm, paddingVertical: 3, alignSelf: 'flex-start' },
    matChipTxt: { color: c.textMuted, fontSize: fontSize.xs },
    testFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingTop: spacing.xs, borderTopWidth: 1, borderTopColor: c.border },
    testFooterItem: { color: c.textFaint, fontSize: fontSize.xs },
    viewMatBtn: { marginLeft: 'auto' },
    viewMatTxt: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },

    sourceCard: {
      borderRadius: radius.lg, borderWidth: 1,
      overflow: 'hidden', marginBottom: spacing.md,
    },
    sourcThumb: { height: 120, alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
    sourcPlay: { fontSize: 36, color: c.text },
    sourcDur: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
    sourcInfo: { padding: spacing.md },
    sourcTitle: { color: c.text, fontSize: fontSize.md, fontWeight: fontWeight.bold, marginBottom: spacing.xs },
    sourcDesc: { color: c.textMuted, fontSize: fontSize.sm, marginBottom: spacing.xs },
    sourcMeta: { color: c.textFaint, fontSize: fontSize.xs },

    quizCard: {
      backgroundColor: c.bgCard, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border,
      padding: spacing.md, marginBottom: spacing.sm, gap: spacing.sm,
    },
    quizTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    quizInfo: { flex: 1 },
    quizTitle: { color: c.text, fontSize: fontSize.md, fontWeight: fontWeight.bold },
    quizDesc: { color: c.textMuted, fontSize: fontSize.xs, marginTop: 2 },
    scoreBadge: { borderRadius: radius.full, borderWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
    scoreVal: { fontSize: fontSize.sm, fontWeight: fontWeight.black },
    startBadge: { backgroundColor: c.accent + '22', borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderWidth: 1, borderColor: c.accent + '55' },
    startTxt: { color: c.accent, fontSize: fontSize.xs, fontWeight: fontWeight.bold },
    quizMeta: { flexDirection: 'row', gap: spacing.md },
    quizMetaItem: { color: c.textFaint, fontSize: fontSize.xs },
    scoreBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    scoreTrack: { flex: 1, height: 4, backgroundColor: c.border, borderRadius: 2, overflow: 'hidden' },
    scoreFill: { height: 4, borderRadius: 2 },
    scorePct: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },

    emptyWrap: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
    emptyIcon: { fontSize: 40 },
    emptyText: { color: c.textMuted, fontSize: fontSize.md, textAlign: 'center' },
  });
