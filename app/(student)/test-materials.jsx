import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useData } from '../../src/contexts/DataContext';
import { colors, spacing, fontSize, fontWeight, radius } from '../../utils/theme';

const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d) ? dateStr : `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// Simulated content bodies for each material type
function MaterialBody({ mat }) {
  const typeColor = mat.type === 'video' ? colors.admin : mat.type === 'pdf' ? colors.danger : colors.accent;
  const typeIcon = mat.type === 'video' ? '🎬' : mat.type === 'pdf' ? '📄' : '📝';

  if (mat.type === 'video') {
    return (
      <View style={[styles.videoBlock, { borderColor: typeColor + '44' }]}>
        <View style={[styles.videoThumb, { backgroundColor: typeColor + '22' }]}>
          <Text style={styles.videoPlay}>▶</Text>
          <Text style={[styles.videoDuration, { color: typeColor }]}>{mat.duration || '—'}</Text>
        </View>
        <Text style={styles.videoNote}>
          Video tersedia melalui platform pembelajaran. Tonton video ini untuk mempersiapkan diri sebelum ujian.
        </Text>
      </View>
    );
  }

  if (mat.type === 'pdf') {
    // Render a rich notes-style view simulating PDF content
    return (
      <View style={styles.pdfBlock}>
        <View style={[styles.pdfHeader, { backgroundColor: typeColor + '18', borderColor: typeColor + '44' }]}>
          <Text style={[styles.pdfHeaderIcon]}>📄</Text>
          <View style={styles.pdfHeaderInfo}>
            <Text style={[styles.pdfHeaderTitle, { color: typeColor }]}>{mat.title}</Text>
            <Text style={styles.pdfHeaderMeta}>{mat.pages ? `${mat.pages} halaman` : ''} · {mat.author}</Text>
          </View>
        </View>
        <Text style={styles.pdfDesc}>{mat.description}</Text>
        <View style={[styles.pdfNote, { borderLeftColor: typeColor }]}>
          <Text style={styles.pdfNoteText}>
            Dokumen PDF tersedia untuk diunduh melalui portal pembelajaran. Baca seluruh dokumen dan catat poin-poin penting.
          </Text>
        </View>
      </View>
    );
  }

  // notes type — show full text content
  return (
    <View style={styles.notesBlock}>
      <Text style={styles.notesBody}>{mat.description}</Text>
      {mat.content ? (
        <Text style={styles.notesContent}>{mat.content}</Text>
      ) : (
        <View style={[styles.notesTip, { borderLeftColor: colors.accent }]}>
          <Text style={styles.notesTipText}>
            Pelajari catatan ini dengan seksama. Semua poin dalam catatan ini berpotensi keluar dalam ujian.
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TestMaterialsScreen() {
  const { testId, subjectId } = useLocalSearchParams();
  const { subjects, materials, quizzes } = useData();
  const router = useRouter();
  const [expandedId, setExpandedId] = useState(null);

  const test = quizzes.find((q) => q.id === testId);
  const subject = subjects.find((s) => s.id === subjectId);

  // Get materials linked to this test
  const linkedMats = test?.materialIds
    ? test.materialIds.map((mid) => materials.find((m) => m.id === mid)).filter(Boolean)
    : materials.filter((m) => m.subjectId === subjectId);

  const typeIcon  = (t) => t === 'video' ? '🎬' : t === 'pdf' ? '📄' : '📝';
  const typeColor = (t) => t === 'video' ? colors.admin : t === 'pdf' ? colors.danger : colors.accent;
  const typeLabel = (t) => t === 'video' ? 'Video' : t === 'pdf' ? 'PDF' : 'Catatan';

  if (!test || !subject) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.notFoundText}>Ujian tidak ditemukan</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>← Kembali</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={linkedMats}
        keyExtractor={(m) => m.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            {/* Back */}
            <TouchableOpacity style={styles.back} onPress={() => router.back()}>
              <Text style={styles.backText}>← Kembali</Text>
            </TouchableOpacity>

            {/* Test info card */}
            <View style={[styles.testCard, { borderLeftColor: subject.color, borderLeftWidth: 4 }]}>
              <View style={styles.testCardTop}>
                <View style={[styles.subjectBadge, { backgroundColor: subject.color + '22' }]}>
                  <Text style={[styles.subjectBadgeText, { color: subject.color }]}>
                    {subject.icon} {subject.title}
                  </Text>
                </View>
                <Text style={styles.testDate}>📅 {formatDate(test.date)}</Text>
              </View>
              <Text style={styles.testTitle}>{test.title}</Text>
              {test.description ? (
                <Text style={styles.testDesc}>{test.description}</Text>
              ) : null}
              <View style={styles.testMeta}>
                <Text style={styles.testMetaItem}>⏱ {test.duration} menit</Text>
                <Text style={styles.testMetaItem}>🏆 {test.totalMarks} poin</Text>
                <Text style={styles.testMetaItem}>📚 {linkedMats.length} materi</Text>
              </View>
            </View>

            {/* Section title */}
            <Text style={styles.sectionTitle}>Materi yang Perlu Dipelajari</Text>
            {linkedMats.length === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>📭</Text>
                <Text style={styles.emptyText}>Belum ada materi yang ditambahkan untuk ujian ini</Text>
              </View>
            )}
          </>
        }
        renderItem={({ item: mat, index }) => {
          const isExpanded = expandedId === mat.id;
          const tc = typeColor(mat.type);
          return (
            <View style={[styles.matCard, { borderLeftColor: tc, borderLeftWidth: 3 }]}>
              {/* Header — always visible, tap to expand */}
              <TouchableOpacity
                style={styles.matHeader}
                onPress={() => setExpandedId(isExpanded ? null : mat.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.matNumBadge, { backgroundColor: tc + '22' }]}>
                  <Text style={[styles.matNum, { color: tc }]}>{index + 1}</Text>
                </View>
                <View style={[styles.matIconBox, { backgroundColor: tc + '22' }]}>
                  <Text style={{ fontSize: 18 }}>{typeIcon(mat.type)}</Text>
                </View>
                <View style={styles.matHeaderInfo}>
                  <View style={styles.matHeaderTop}>
                    <View style={[styles.typePill, { backgroundColor: tc + '22', borderColor: tc + '55' }]}>
                      <Text style={[styles.typePillText, { color: tc }]}>{typeLabel(mat.type)}</Text>
                    </View>
                  </View>
                  <Text style={styles.matTitle}>{mat.title}</Text>
                  <Text style={styles.matAuthor}>👤 {mat.author}
                    {mat.pages ? `  ·  📃 ${mat.pages} hal` : ''}
                    {mat.duration ? `  ·  ⏱ ${mat.duration}` : ''}
                  </Text>
                </View>
                <View style={[styles.expandBtn, isExpanded && { backgroundColor: tc + '22', borderColor: tc + '55' }]}>
                  <Text style={[styles.expandBtnText, isExpanded && { color: tc }]}>
                    {isExpanded ? '▲' : '▼'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Expanded body */}
              {isExpanded && (
                <View style={styles.matBody}>
                  <View style={[styles.matDivider, { backgroundColor: tc + '33' }]} />
                  <MaterialBody mat={mat} />
                </View>
              )}
            </View>
          );
        }}
        ListFooterComponent={
          linkedMats.length > 0 ? (
            <View style={[styles.tipCard, { borderColor: subject.color + '44' }]}>
              <Text style={styles.tipIcon}>💡</Text>
              <Text style={styles.tipText}>
                Ketuk setiap materi untuk membuka isinya. Pelajari semua materi di atas sebelum hari ujian.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  notFoundText: { color: colors.textMuted, fontSize: fontSize.lg },
  backLink: { color: colors.accent, fontSize: fontSize.md },
  back: { marginBottom: spacing.md },
  backText: { color: colors.textMuted, fontSize: fontSize.sm },

  // Test info card
  testCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.xl, gap: spacing.sm,
  },
  testCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.sm },
  subjectBadge: { borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  subjectBadgeText: { fontSize: 12, fontWeight: fontWeight.bold },
  testDate: { color: colors.textMuted, fontSize: fontSize.xs },
  testTitle: { color: colors.white, fontSize: fontSize.xl, fontWeight: fontWeight.black },
  testDesc: { color: colors.textMuted, fontSize: fontSize.sm, lineHeight: 20 },
  testMeta: { flexDirection: 'row', gap: spacing.md, paddingTop: spacing.xs, borderTopWidth: 1, borderTopColor: colors.border },
  testMetaItem: { color: colors.textFaint, fontSize: fontSize.xs },

  sectionTitle: { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: spacing.md },

  // Material cards
  matCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
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
  matTitle: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.bold, marginBottom: 2 },
  matAuthor: { color: colors.textFaint, fontSize: fontSize.xs },
  expandBtn: {
    width: 32, height: 32, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  expandBtnText: { color: colors.textMuted, fontSize: 10, fontWeight: fontWeight.bold },

  matBody: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  matDivider: { height: 1, marginBottom: spacing.md },

  // PDF block
  pdfBlock: { gap: spacing.md },
  pdfHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    borderRadius: radius.md, borderWidth: 1, padding: spacing.md,
  },
  pdfHeaderIcon: { fontSize: 28 },
  pdfHeaderInfo: { flex: 1 },
  pdfHeaderTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, marginBottom: 2 },
  pdfHeaderMeta: { color: colors.textFaint, fontSize: fontSize.xs },
  pdfDesc: { color: colors.textMuted, fontSize: fontSize.sm, lineHeight: 22 },
  pdfNote: {
    borderLeftWidth: 3, paddingLeft: spacing.md,
    paddingVertical: spacing.sm,
  },
  pdfNoteText: { color: colors.textMuted, fontSize: fontSize.sm, lineHeight: 20, fontStyle: 'italic' },

  // Video block
  videoBlock: {
    borderRadius: radius.md, borderWidth: 1,
    overflow: 'hidden', gap: spacing.md, padding: spacing.md,
  },
  videoThumb: {
    height: 140, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
  },
  videoPlay: { fontSize: 40, color: colors.white },
  videoDuration: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  videoNote: { color: colors.textMuted, fontSize: fontSize.sm, lineHeight: 20, fontStyle: 'italic' },

  // Notes block
  notesBlock: { gap: spacing.md },
  notesBody: { color: colors.text, fontSize: fontSize.sm, lineHeight: 24 },
  notesContent: { color: colors.text, fontSize: fontSize.sm, lineHeight: 24 },
  notesTip: {
    borderLeftWidth: 3, paddingLeft: spacing.md, paddingVertical: spacing.sm,
  },
  notesTipText: { color: colors.textMuted, fontSize: fontSize.sm, lineHeight: 20, fontStyle: 'italic' },

  // Tip footer
  tipCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md,
    backgroundColor: colors.bgCard, borderRadius: radius.md,
    borderWidth: 1, padding: spacing.md, marginTop: spacing.sm,
  },
  tipIcon: { fontSize: 20 },
  tipText: { flex: 1, color: colors.textMuted, fontSize: fontSize.sm, lineHeight: 20 },

  // Empty
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyIcon: { fontSize: 40 },
  emptyText: { color: colors.textMuted, fontSize: fontSize.md, textAlign: 'center' },
});
