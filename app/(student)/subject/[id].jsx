import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useData } from '../../../src/contexts/DataContext';
import { useAuth } from '../../../src/contexts/AuthContext';
import { colors, spacing, fontSize, fontWeight, radius } from '../../../utils/theme';

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

export default function SubjectDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { subjects, materials, quizzes, getUserScores } = useData();
  const router = useRouter();
  const [tab, setTab] = useState('materi');

  const subject = subjects.find((s) => s.id === id);
  const subMats    = materials.filter((m) => m.subjectId === id);
  const subQuizzes = quizzes.filter((q) => q.subjectId === id);
  const myScores   = getUserScores(user?.id || '');

  // Split materials: notes/pdf = materi, video = sumber belajar
  const coreMats   = subMats.filter((m) => m.type !== 'video');
  const videoMats  = subMats.filter((m) => m.type === 'video');

  const typeIcon  = (t) => t === 'video' ? '🎬' : t === 'pdf' ? '📄' : '📝';
  const typeColor = (t) => t === 'video' ? colors.admin : t === 'pdf' ? colors.danger : colors.accent;

  if (!subject) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.notFoundText}>Mata pelajaran tidak ditemukan</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>← Kembali</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Back + title */}
      <View style={styles.pageHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={[styles.subjectBadge, { backgroundColor: subject.color + '22' }]}>
          <Text style={styles.subjectBadgeIcon}>{subject.icon}</Text>
          <Text style={[styles.subjectBadgeTitle, { color: subject.color }]}>{subject.title}</Text>
        </View>
      </View>

      {/* Tab bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBar}
      >
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={[styles.tabBtn, active && { borderBottomColor: subject.color, borderBottomWidth: 2 }]}
              onPress={() => setTab(t.key)}
            >
              <Text style={styles.tabIcon}>{t.icon}</Text>
              <Text style={[styles.tabLabel, active && { color: subject.color, fontWeight: fontWeight.bold }]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={styles.tabDivider} />

      {/* ── MATERI ──────────────────────────────────────── */}
      {tab === 'materi' && (
        <FlatList
          data={coreMats}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.listPad}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyTab icon="📄" text="Belum ada materi untuk mata pelajaran ini" />}
          renderItem={({ item: mat }) => (
            <TouchableOpacity
              style={[styles.matCard, { borderLeftColor: typeColor(mat.type), borderLeftWidth: 3 }]}
              onPress={() => router.push({ pathname: '/(student)/material-detail', params: { matId: mat.id } })}
              activeOpacity={0.8}
            >
              <View style={[styles.matIcon, { backgroundColor: typeColor(mat.type) + '22' }]}>
                <Text style={{ fontSize: 22 }}>{typeIcon(mat.type)}</Text>
              </View>
              <View style={styles.matInfo}>
                <View style={[styles.typePill, { backgroundColor: typeColor(mat.type) + '22', borderColor: typeColor(mat.type) + '55' }]}>
                  <Text style={[styles.typePillTxt, { color: typeColor(mat.type) }]}>{mat.type.toUpperCase()}</Text>
                </View>
                <Text style={styles.matTitle}>{mat.title}</Text>
                <Text style={styles.matDesc} numberOfLines={2}>{mat.description}</Text>
                <Text style={styles.matMeta}>
                  👤 {mat.author}{mat.pages ? `  ·  📃 ${mat.pages} hal` : ''}{mat.duration ? `  ·  ⏱ ${mat.duration}` : ''}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* ── KISI-KISI UJIAN ─────────────────────────────── */}
      {tab === 'kisi' && (
        <FlatList
          data={subQuizzes.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0))}
          keyExtractor={(q) => q.id}
          contentContainerStyle={styles.listPad}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyTab icon="📅" text="Belum ada ujian yang dijadwalkan" />}
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
                style={[styles.testCard, { borderLeftColor: subject.color, borderLeftWidth: 4 }]}
                onPress={() => router.push({ pathname: '/(student)/test-materials', params: { testId: test.id, subjectId: id } })}
                activeOpacity={0.8}
              >
                <View style={styles.testTop}>
                  <Text style={styles.testTitle}>{test.title}</Text>
                  {urgencyLabel ? (
                    <View style={[styles.urgencyBadge, { backgroundColor: urgencyColor + '22', borderColor: urgencyColor + '55' }]}>
                      <Text style={[styles.urgencyTxt, { color: urgencyColor }]}>{urgencyLabel}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.testDate}>📅 {fmtDate(test.date)}</Text>
                {test.description ? <Text style={styles.testDesc}>{test.description}</Text> : null}
                {linkedMats.length > 0 && (
                  <View style={styles.matChips}>
                    <Text style={styles.matChipsLabel}>Materi terkait:</Text>
                    {linkedMats.map((m) => (
                      <View key={m.id} style={styles.matChip}>
                        <Text style={styles.matChipTxt}>{typeIcon(m.type)} {m.title}</Text>
                      </View>
                    ))}
                  </View>
                )}
                <View style={styles.testFooter}>
                  <Text style={styles.testFooterItem}>⏱ {test.duration} menit</Text>
                  <Text style={styles.testFooterItem}>🏆 {test.totalMarks} poin</Text>
                  <View style={styles.viewMatBtn}>
                    <Text style={[styles.viewMatTxt, { color: subject.color }]}>Lihat Materi →</Text>
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
          data={videoMats}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.listPad}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyTab icon="🔗" text="Belum ada sumber belajar ditambahkan" />}
          renderItem={({ item: mat }) => (
            <View style={[styles.sourceCard, { borderColor: colors.admin + '44' }]}>
              <View style={[styles.sourcThumb, { backgroundColor: colors.admin + '22' }]}>
                <Text style={styles.sourcPlay}>▶</Text>
                <Text style={[styles.sourcDur, { color: colors.admin }]}>{mat.duration || '—'}</Text>
              </View>
              <View style={styles.sourcInfo}>
                <Text style={styles.sourcTitle}>{mat.title}</Text>
                <Text style={styles.sourcDesc} numberOfLines={2}>{mat.description}</Text>
                <Text style={styles.sourcMeta}>👤 {mat.author}</Text>
              </View>
            </View>
          )}
        />
      )}

      {/* ── LATIHAN SOAL ────────────────────────────────── */}
      {tab === 'latihan' && (
        <FlatList
          data={subQuizzes}
          keyExtractor={(q) => q.id}
          contentContainerStyle={styles.listPad}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyTab icon="✏️" text="Belum ada latihan soal untuk mata pelajaran ini" />}
          renderItem={({ item: quiz }) => {
            const score = myScores.find((sc) => sc.quizId === quiz.id);
            const isDone = !!score;
            const pctColor = score
              ? score.percentage >= 70 ? colors.success : score.percentage >= 50 ? colors.warning : colors.danger
              : colors.accent;
            return (
              <TouchableOpacity
                style={styles.quizCard}
                onPress={() => router.push(`/(student)/quiz/${quiz.id}`)}
                activeOpacity={0.8}
              >
                <View style={styles.quizTop}>
                  <View style={styles.quizInfo}>
                    <Text style={styles.quizTitle}>{quiz.title}</Text>
                    {quiz.description ? <Text style={styles.quizDesc} numberOfLines={1}>{quiz.description}</Text> : null}
                  </View>
                  {isDone ? (
                    <View style={[styles.scoreBadge, { backgroundColor: pctColor + '22', borderColor: pctColor + '55' }]}>
                      <Text style={[styles.scoreVal, { color: pctColor }]}>{score.percentage}%</Text>
                    </View>
                  ) : (
                    <View style={styles.startBadge}>
                      <Text style={styles.startTxt}>Mulai →</Text>
                    </View>
                  )}
                </View>
                <View style={styles.quizMeta}>
                  <Text style={styles.quizMetaItem}>❓ {quiz.questions?.length || 0} soal</Text>
                  <Text style={styles.quizMetaItem}>⏱ {quiz.duration} menit</Text>
                  <Text style={styles.quizMetaItem}>🏆 {quiz.totalMarks} poin</Text>
                </View>
                {isDone && score && (
                  <View style={styles.scoreBar}>
                    <View style={styles.scoreTrack}>
                      <View style={[styles.scoreFill, { width: `${score.percentage}%`, backgroundColor: pctColor }]} />
                    </View>
                    <Text style={[styles.scorePct, { color: pctColor }]}>{score.score}/{score.total}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const EmptyTab = ({ icon, text }) => (
  <View style={styles.emptyWrap}>
    <Text style={styles.emptyIcon}>{icon}</Text>
    <Text style={styles.emptyText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  notFoundText: { color: colors.textMuted, fontSize: fontSize.lg },
  backLink: { color: colors.accent, fontSize: fontSize.md },

  pageHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  backText: { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  subjectBadge: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2,
  },
  subjectBadgeIcon: { fontSize: 18 },
  subjectBadgeTitle: { fontSize: fontSize.md, fontWeight: fontWeight.black },

  tabBar: { paddingHorizontal: spacing.lg, gap: spacing.xs, paddingBottom: 0 },
  tabBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabIcon: { fontSize: 14 },
  tabLabel: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  tabDivider: { height: 1, backgroundColor: colors.border, marginBottom: spacing.sm },

  listPad: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, paddingTop: spacing.xs },

  // Material card
  matCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md,
    backgroundColor: colors.bgCard, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  matIcon: { width: 48, height: 48, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  matInfo: { flex: 1, minWidth: 0 },
  typePill: { alignSelf: 'flex-start', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2, borderWidth: 1, marginBottom: spacing.xs },
  typePillTxt: { fontSize: 10, fontWeight: fontWeight.black, letterSpacing: 0.5 },
  matTitle: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.bold, marginBottom: spacing.xs },
  matDesc: { color: colors.textMuted, fontSize: fontSize.sm, marginBottom: spacing.xs },
  matMeta: { color: colors.textFaint, fontSize: fontSize.xs },
  chevron: { color: colors.textMuted, fontSize: 20, alignSelf: 'center' },

  // Test / kisi-kisi card
  testCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.md, gap: spacing.sm,
  },
  testTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  testTitle: { flex: 1, color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.bold },
  urgencyBadge: { borderRadius: radius.full, borderWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: 3, flexShrink: 0 },
  urgencyTxt: { fontSize: 11, fontWeight: fontWeight.bold },
  testDate: { color: colors.textMuted, fontSize: fontSize.xs },
  testDesc: { color: colors.textMuted, fontSize: fontSize.sm, lineHeight: 20 },
  matChips: { gap: 4 },
  matChipsLabel: { color: colors.textFaint, fontSize: fontSize.xs },
  matChip: { backgroundColor: colors.bg, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.sm, paddingVertical: 3, alignSelf: 'flex-start' },
  matChipTxt: { color: colors.textMuted, fontSize: fontSize.xs },
  testFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingTop: spacing.xs, borderTopWidth: 1, borderTopColor: colors.border },
  testFooterItem: { color: colors.textFaint, fontSize: fontSize.xs },
  viewMatBtn: { marginLeft: 'auto' },
  viewMatTxt: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },

  // Source / video card
  sourceCard: {
    borderRadius: radius.lg, borderWidth: 1,
    overflow: 'hidden', marginBottom: spacing.md,
  },
  sourcThumb: { height: 120, alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  sourcPlay: { fontSize: 36, color: colors.white },
  sourcDur: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  sourcInfo: { padding: spacing.md },
  sourcTitle: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.bold, marginBottom: spacing.xs },
  sourcDesc: { color: colors.textMuted, fontSize: fontSize.sm, marginBottom: spacing.xs },
  sourcMeta: { color: colors.textFaint, fontSize: fontSize.xs },

  // Quiz card
  quizCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.sm, gap: spacing.sm,
  },
  quizTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  quizInfo: { flex: 1 },
  quizTitle: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.bold },
  quizDesc: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  scoreBadge: { borderRadius: radius.full, borderWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  scoreVal: { fontSize: fontSize.sm, fontWeight: fontWeight.black },
  startBadge: { backgroundColor: colors.accent + '22', borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderWidth: 1, borderColor: colors.accent + '55' },
  startTxt: { color: colors.accent, fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  quizMeta: { flexDirection: 'row', gap: spacing.md },
  quizMetaItem: { color: colors.textFaint, fontSize: fontSize.xs },
  scoreBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  scoreTrack: { flex: 1, height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' },
  scoreFill: { height: 4, borderRadius: 2 },
  scorePct: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },

  emptyWrap: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyIcon: { fontSize: 40 },
  emptyText: { color: colors.textMuted, fontSize: fontSize.md, textAlign: 'center' },
});
