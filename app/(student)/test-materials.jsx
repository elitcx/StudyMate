import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useData } from '../../src/contexts/DataContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { spacing, radius, fontSize, fontWeight } from '../../utils/theme';

const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d) ? dateStr : `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function MaterialBody({ mat, s, colors }) {
  const typeColor = mat.type === 'video' ? colors.admin : mat.type === 'pdf' ? colors.danger : colors.accent;

  if (mat.type === 'video') {
    return (
      <TouchableOpacity
        style={[s.videoBlock, { borderColor: typeColor + '44' }]}
        onPress={() => mat.fileUrl && Linking.openURL(mat.fileUrl)}
        activeOpacity={0.8}
      >
        <View style={[s.videoThumb, { backgroundColor: typeColor + '22' }]}>
          <Text style={s.videoPlay}>▶</Text>
          <Text style={[s.videoDuration, { color: typeColor }]}>{mat.duration || '—'}</Text>
        </View>
        <Text style={s.videoNote}>
          Ketuk untuk membuka video. Tonton sebelum hari ujian.
        </Text>
      </TouchableOpacity>
    );
  }

  if (mat.type === 'pdf') {
    return (
      <View style={s.pdfBlock}>
        <View style={[s.pdfHeader, { backgroundColor: typeColor + '18', borderColor: typeColor + '44' }]}>
          <Text style={s.pdfHeaderIcon}>📄</Text>
          <View style={s.pdfHeaderInfo}>
            <Text style={[s.pdfHeaderTitle, { color: typeColor }]}>{mat.title}</Text>
            <Text style={s.pdfHeaderMeta}>{mat.pages ? `${mat.pages} halaman` : ''} · {mat.author}</Text>
          </View>
        </View>
        <Text style={s.pdfDesc}>{mat.description}</Text>
        <View style={[s.pdfNote, { borderLeftColor: typeColor }]}>
          <Text style={s.pdfNoteText}>
            Dokumen PDF tersedia untuk diunduh melalui portal pembelajaran. Baca seluruh dokumen dan catat poin-poin penting.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.notesBlock}>
      <Text style={s.notesBody}>{mat.description}</Text>
      {mat.content ? (
        <Text style={s.notesContent}>{mat.content}</Text>
      ) : (
        <View style={[s.notesTip, { borderLeftColor: colors.accent }]}>
          <Text style={s.notesTipText}>
            Pelajari catatan ini dengan seksama. Semua poin dalam catatan ini berpotensi keluar dalam ujian.
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TestMaterialsScreen() {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  const { testId, subjectId } = useLocalSearchParams();
  const { subjects, materials, quizzes } = useData();
  const router = useRouter();
  const [expandedId, setExpandedId] = useState(null);

  const test = quizzes.find((q) => q.id === testId);
  const subject = subjects.find((su) => su.id === subjectId);

  const linkedMats = test?.materialIds
    ? test.materialIds.map((mid) => materials.find((m) => m.id === mid)).filter(Boolean)
    : materials.filter((m) => m.subjectId === subjectId);

  const typeIcon  = (t) => t === 'video' ? '🎬' : t === 'pdf' ? '📄' : '📝';
  const typeColor = (t) => t === 'video' ? colors.admin : t === 'pdf' ? colors.danger : colors.accent;
  const typeLabel = (t) => t === 'video' ? 'Video' : t === 'pdf' ? 'PDF' : 'Catatan';

  if (!test || !subject) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <Text style={s.notFoundText}>Ujian tidak ditemukan</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={s.backLink}>← Kembali</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <FlatList
        data={linkedMats}
        keyExtractor={(m) => m.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.list}
        ListHeaderComponent={
          <>
            <TouchableOpacity style={s.back} onPress={() => router.back()}>
              <Text style={s.backText}>← Kembali</Text>
            </TouchableOpacity>

            <View style={[s.testCard, { borderLeftColor: subject.color, borderLeftWidth: 4 }]}>
              <View style={s.testCardTop}>
                <View style={[s.subjectBadge, { backgroundColor: subject.color + '22' }]}>
                  <Text style={[s.subjectBadgeText, { color: subject.color }]}>
                    {subject.icon} {subject.title}
                  </Text>
                </View>
                <Text style={s.testDate}>📅 {formatDate(test.date)}</Text>
              </View>
              <Text style={s.testTitle}>{test.title}</Text>
              {test.description ? (
                <Text style={s.testDesc}>{test.description}</Text>
              ) : null}
              <View style={s.testMeta}>
                <Text style={s.testMetaItem}>⏱ {test.duration} menit</Text>
                <Text style={s.testMetaItem}>🏆 {test.totalMarks} poin</Text>
                <Text style={s.testMetaItem}>📚 {linkedMats.length} materi</Text>
              </View>
            </View>

            <Text style={s.sectionTitle}>Materi yang Perlu Dipelajari</Text>
            {linkedMats.length === 0 && (
              <View style={s.empty}>
                <Text style={s.emptyIcon}>📭</Text>
                <Text style={s.emptyText}>Belum ada materi yang ditambahkan untuk ujian ini</Text>
              </View>
            )}
          </>
        }
        renderItem={({ item: mat, index }) => {
          const isExpanded = expandedId === mat.id;
          const tc = typeColor(mat.type);
          return (
            <View style={[s.matCard, { borderLeftColor: tc, borderLeftWidth: 3 }]}>
              <TouchableOpacity
                style={s.matHeader}
                onPress={() => setExpandedId(isExpanded ? null : mat.id)}
                activeOpacity={0.8}
              >
                <View style={[s.matNumBadge, { backgroundColor: tc + '22' }]}>
                  <Text style={[s.matNum, { color: tc }]}>{index + 1}</Text>
                </View>
                <View style={[s.matIconBox, { backgroundColor: tc + '22' }]}>
                  <Text style={{ fontSize: 18 }}>{typeIcon(mat.type)}</Text>
                </View>
                <View style={s.matHeaderInfo}>
                  <View style={s.matHeaderTop}>
                    <View style={[s.typePill, { backgroundColor: tc + '22', borderColor: tc + '55' }]}>
                      <Text style={[s.typePillText, { color: tc }]}>{typeLabel(mat.type)}</Text>
                    </View>
                  </View>
                  <Text style={s.matTitle}>{mat.title}</Text>
                  <Text style={s.matAuthor}>👤 {mat.author}
                    {mat.pages ? `  ·  📃 ${mat.pages} hal` : ''}
                    {mat.duration ? `  ·  ⏱ ${mat.duration}` : ''}
                  </Text>
                </View>
                <View style={[s.expandBtn, isExpanded && { backgroundColor: tc + '22', borderColor: tc + '55' }]}>
                  <Text style={[s.expandBtnText, isExpanded && { color: tc }]}>
                    {isExpanded ? '▲' : '▼'}
                  </Text>
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <View style={s.matBody}>
                  <View style={[s.matDivider, { backgroundColor: tc + '33' }]} />
                  <MaterialBody mat={mat} s={s} colors={colors} />
                </View>
              )}
            </View>
          );
        }}
        ListFooterComponent={
          <>
            {linkedMats.length > 0 && (
              <View style={[s.tipCard, { borderColor: subject.color + '44' }]}>
                <Text style={s.tipIcon}>💡</Text>
                <Text style={s.tipText}>
                  Ketuk setiap materi untuk membuka isinya. Pelajari semua materi di atas sebelum hari ujian.
                </Text>
              </View>
            )}

            {test.questions && test.questions.length > 0 && (
              <View style={s.prepQSection}>
                <Text style={s.prepQTitle}>❓ Contoh Soal Persiapan ({test.questions.length} soal)</Text>
                {test.questions.map((q, i) => (
                  <View key={q.id || i} style={s.prepQCard}>
                    <Text style={s.prepQNum}>Soal {i + 1}</Text>
                    <Text style={s.prepQText}>{q.text}</Text>
                    {q.options.map((opt, oi) => (
                      <View
                        key={oi}
                        style={[s.prepQOpt, oi === q.correct && s.prepQOptCorrect]}
                      >
                        <Text style={[s.prepQOptText, oi === q.correct && s.prepQOptTextCorrect]}>
                          {String.fromCharCode(65 + oi)}. {opt}
                        </Text>
                        {oi === q.correct && <Text style={s.prepQOptCheck}>✓</Text>}
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}
          </>
        }
      />
    </SafeAreaView>
  );
}

const makeStyles = (c, isDark) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    list: { padding: spacing.lg, paddingBottom: spacing.xxl },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
    notFoundText: { color: c.textMuted, fontSize: fontSize.lg },
    backLink: { color: c.accent, fontSize: fontSize.md },
    back: { marginBottom: spacing.md },
    backText: { color: c.textMuted, fontSize: fontSize.sm },

    testCard: {
      backgroundColor: c.bgCard, borderRadius: radius.lg,
      borderWidth: 1, borderColor: c.border,
      padding: spacing.md, marginBottom: spacing.xl, gap: spacing.sm,
    },
    testCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.sm },
    subjectBadge: { borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
    subjectBadgeText: { fontSize: 12, fontWeight: fontWeight.bold },
    testDate: { color: c.textMuted, fontSize: fontSize.xs },
    testTitle: { color: c.text, fontSize: fontSize.xl, fontWeight: fontWeight.black },
    testDesc: { color: c.textMuted, fontSize: fontSize.sm, lineHeight: 20 },
    testMeta: { flexDirection: 'row', gap: spacing.md, paddingTop: spacing.xs, borderTopWidth: 1, borderTopColor: c.border },
    testMetaItem: { color: c.textFaint, fontSize: fontSize.xs },

    sectionTitle: { color: c.text, fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: spacing.md },

    matCard: {
      backgroundColor: c.bgCard, borderRadius: radius.lg,
      borderWidth: 1, borderColor: c.border,
      marginBottom: spacing.md, overflow: 'hidden',
    },
    matHeader: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
      padding: spacing.md,
    },
    matNumBadge: {
      width: 28, height: 28, borderRadius: 14,
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    matNum: { fontSize: 12, fontWeight: fontWeight.black },
    matIconBox: {
      width: 40, height: 40, borderRadius: radius.sm,
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    matHeaderInfo: { flex: 1, minWidth: 0 },
    matHeaderTop: { marginBottom: 3 },
    typePill: {
      alignSelf: 'flex-start', borderRadius: radius.full,
      paddingHorizontal: spacing.sm, paddingVertical: 2, borderWidth: 1,
    },
    typePillText: { fontSize: 10, fontWeight: fontWeight.black, letterSpacing: 0.5 },
    matTitle: { color: c.text, fontSize: fontSize.sm, fontWeight: fontWeight.bold, marginBottom: 2 },
    matAuthor: { color: c.textFaint, fontSize: fontSize.xs },
    expandBtn: {
      width: 32, height: 32, borderRadius: radius.full,
      borderWidth: 1, borderColor: c.border,
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    expandBtnText: { color: c.textMuted, fontSize: 10, fontWeight: fontWeight.bold },

    matBody: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
    matDivider: { height: 1, marginBottom: spacing.md },

    pdfBlock: { gap: spacing.md },
    pdfHeader: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.md,
      borderRadius: radius.md, borderWidth: 1, padding: spacing.md,
    },
    pdfHeaderIcon: { fontSize: 28 },
    pdfHeaderInfo: { flex: 1 },
    pdfHeaderTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, marginBottom: 2 },
    pdfHeaderMeta: { color: c.textFaint, fontSize: fontSize.xs },
    pdfDesc: { color: c.textMuted, fontSize: fontSize.sm, lineHeight: 22 },
    pdfNote: {
      borderLeftWidth: 3, paddingLeft: spacing.md,
      paddingVertical: spacing.sm,
    },
    pdfNoteText: { color: c.textMuted, fontSize: fontSize.sm, lineHeight: 20, fontStyle: 'italic' },

    videoBlock: {
      borderRadius: radius.md, borderWidth: 1,
      overflow: 'hidden', gap: spacing.md, padding: spacing.md,
    },
    videoThumb: {
      height: 140, borderRadius: radius.md,
      alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    },
    videoPlay: { fontSize: 40, color: c.white },
    videoDuration: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
    videoNote: { color: c.textMuted, fontSize: fontSize.sm, lineHeight: 20, fontStyle: 'italic' },

    notesBlock: { gap: spacing.md },
    notesBody: { color: c.text, fontSize: fontSize.sm, lineHeight: 24 },
    notesContent: { color: c.text, fontSize: fontSize.sm, lineHeight: 24 },
    notesTip: {
      borderLeftWidth: 3, paddingLeft: spacing.md, paddingVertical: spacing.sm,
    },
    notesTipText: { color: c.textMuted, fontSize: fontSize.sm, lineHeight: 20, fontStyle: 'italic' },

    tipCard: {
      flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md,
      backgroundColor: c.bgCard, borderRadius: radius.md,
      borderWidth: 1, padding: spacing.md, marginTop: spacing.sm,
    },
    tipIcon: { fontSize: 20 },
    tipText: { flex: 1, color: c.textMuted, fontSize: fontSize.sm, lineHeight: 20 },

    empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
    emptyIcon: { fontSize: 40 },
    emptyText: { color: c.textMuted, fontSize: fontSize.md, textAlign: 'center' },

    prepQSection: { marginTop: spacing.lg },
    prepQTitle: { color: c.text, fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: spacing.md },
    prepQCard: {
      backgroundColor: c.bgCard, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border,
      padding: spacing.md, marginBottom: spacing.md,
    },
    prepQNum: { color: c.textMuted, fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', marginBottom: spacing.xs },
    prepQText: { color: c.text, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.md },
    prepQOpt: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      padding: spacing.sm, borderRadius: radius.sm,
      borderWidth: 1, borderColor: 'transparent',
      marginBottom: spacing.xs, backgroundColor: c.bg,
    },
    prepQOptCorrect: { backgroundColor: c.success + '22', borderColor: c.success + '55' },
    prepQOptText: { color: c.textMuted, fontSize: fontSize.sm, flex: 1 },
    prepQOptTextCorrect: { color: c.success, fontWeight: fontWeight.semibold },
    prepQOptCheck: { color: c.success, fontSize: 14 },
  });
