import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useData } from '../../src/contexts/DataContext';
import { colors, spacing, fontSize, fontWeight, radius } from '../../utils/theme';

export default function MaterialDetailScreen() {
  const { matId } = useLocalSearchParams();
  const { materials, subjects } = useData();
  const router = useRouter();
  const [opening, setOpening] = useState(false);

  const mat     = materials.find((m) => m.id === matId);
  const subject = mat ? subjects.find((s) => s.id === mat.subjectId) : null;

  const typeColor = mat?.type === 'video' ? colors.admin : mat?.type === 'pdf' ? colors.danger : colors.accent;
  const typeIcon  = mat?.type === 'video' ? '🎬' : mat?.type === 'pdf' ? '📄' : '📝';
  const typeLabel = mat?.type === 'video' ? 'Video' : mat?.type === 'pdf' ? 'PDF' : 'Catatan';

  const hasFile = !!mat?.fileUrl;

  const openFile = async () => {
    if (!hasFile) {
      Alert.alert(
        'File belum tersedia',
        'Admin belum mengunggah file untuk materi ini.',
        [{ text: 'OK' }]
      );
      return;
    }
    setOpening(true);
    try {
      if (mat.type === 'pdf') {
        // Open PDF via Google Docs viewer so it works on all devices
        const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(mat.fileUrl)}&embedded=true`;
        await WebBrowser.openBrowserAsync(viewerUrl, {
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
          toolbarColor: '#0f172a',
        });
      } else if (mat.type === 'video') {
        // Try to open in system player first, fall back to browser
        const canOpen = await Linking.canOpenURL(mat.fileUrl);
        if (canOpen) {
          await Linking.openURL(mat.fileUrl);
        } else {
          await WebBrowser.openBrowserAsync(mat.fileUrl);
        }
      } else {
        await WebBrowser.openBrowserAsync(mat.fileUrl);
      }
    } catch (err) {
      Alert.alert('Gagal membuka file', err.message);
    } finally {
      setOpening(false);
    }
  };

  if (!mat) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.notFound}>Materi tidak ditemukan</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>← Kembali</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Back */}
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>← Kembali</Text>
        </TouchableOpacity>

        {/* Header card */}
        <View style={[styles.header, { borderTopColor: typeColor, borderTopWidth: 4 }]}>
          <View style={styles.headerTop}>
            <View style={[styles.typeIconBox, { backgroundColor: typeColor + '22' }]}>
              <Text style={{ fontSize: 32 }}>{typeIcon}</Text>
            </View>
            <View style={[styles.typePill, { backgroundColor: typeColor + '22', borderColor: typeColor + '55' }]}>
              <Text style={[styles.typePillText, { color: typeColor }]}>{typeLabel}</Text>
            </View>
          </View>
          <Text style={styles.title}>{mat.title}</Text>
          {subject && (
            <View style={[styles.subjectTag, { backgroundColor: subject.color + '22' }]}>
              <Text style={[styles.subjectTagText, { color: subject.color }]}>
                {subject.icon} {subject.title}
              </Text>
            </View>
          )}
          <View style={styles.metaRow}>
            <Text style={styles.metaItem}>👤 {mat.author}</Text>
            {mat.pages    && <Text style={styles.metaItem}>·  📃 {mat.pages} halaman</Text>}
            {mat.duration && <Text style={styles.metaItem}>·  ⏱ {mat.duration}</Text>}
            {mat.createdAt && <Text style={styles.metaItem}>·  📅 {mat.createdAt}</Text>}
          </View>
        </View>

        {/* Open file button */}
        <TouchableOpacity
          style={[
            styles.openBtn,
            { backgroundColor: typeColor },
            !hasFile && styles.openBtnDisabled,
          ]}
          onPress={openFile}
          disabled={opening}
          activeOpacity={0.8}
        >
          {opening ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.openBtnText}>
              {mat.type === 'pdf'   ? '📄 Buka PDF'   :
               mat.type === 'video' ? '▶ Putar Video' : '📝 Buka Catatan'}
              {!hasFile ? ' (Belum tersedia)' : ''}
            </Text>
          )}
        </TouchableOpacity>

        {!hasFile && (
          <View style={styles.noFileBanner}>
            <Text style={styles.noFileIcon}>⏳</Text>
            <Text style={styles.noFileText}>
              Admin belum mengunggah file untuk materi ini. Cek kembali nanti.
            </Text>
          </View>
        )}

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Deskripsi</Text>
          <Text style={styles.desc}>{mat.description || 'Tidak ada deskripsi.'}</Text>
        </View>

        {/* Type-specific info */}
        {mat.type === 'pdf' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tentang Dokumen</Text>
            <View style={[styles.infoCard, { borderColor: typeColor + '44' }]}>
              <InfoRow icon="📃" label="Jumlah Halaman" value={mat.pages ? `${mat.pages} halaman` : 'Tidak diketahui'} />
              <InfoRow icon="👤" label="Penulis"        value={mat.author} />
              <InfoRow icon="📅" label="Tanggal Upload" value={mat.createdAt || '—'} last />
            </View>
            <View style={[styles.tipRow, { borderLeftColor: typeColor }]}>
              <Text style={styles.tipText}>
                PDF akan dibuka di browser bawaan. Pastikan koneksi internet stabil.
              </Text>
            </View>
          </View>
        )}

        {mat.type === 'video' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tentang Video</Text>
            <View style={[styles.videoThumb, { backgroundColor: typeColor + '22', borderColor: typeColor + '44' }]}>
              <Text style={styles.videoPlayIcon}>▶</Text>
              <Text style={[styles.videoDuration, { color: typeColor }]}>{mat.duration || '—'}</Text>
            </View>
            <View style={[styles.tipRow, { borderLeftColor: typeColor }]}>
              <Text style={styles.tipText}>
                Video akan dibuka di aplikasi video atau browser. Tonton hingga selesai dan buat catatan penting.
              </Text>
            </View>
          </View>
        )}

        {mat.type === 'notes' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Isi Catatan</Text>
            <View style={[styles.notesCard, { borderColor: typeColor + '44' }]}>
              <Text style={styles.notesText}>{mat.description}</Text>
              {mat.content && <Text style={styles.notesContent}>{mat.content}</Text>}
            </View>
          </View>
        )}

        {/* Study tip */}
        <View style={[styles.tipCard, { borderColor: colors.warning + '44', backgroundColor: colors.warning + '0a' }]}>
          <Text style={styles.tipCardIcon}>💡</Text>
          <View style={styles.tipCardInfo}>
            <Text style={styles.tipCardTitle}>Tips Belajar</Text>
            <Text style={styles.tipCardText}>
              Pelajari materi ini setidaknya 2 hari sebelum ujian. Ulangi bagian yang sulit
              dan diskusikan dengan teman atau guru jika ada yang tidak dipahami.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoRow = ({ icon, label, value, last }) => (
  <View style={[infoStyles.row, !last && infoStyles.rowBorder]}>
    <Text style={infoStyles.icon}>{icon}</Text>
    <Text style={infoStyles.label}>{label}</Text>
    <Text style={infoStyles.value}>{value}</Text>
  </View>
);
const infoStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, gap: spacing.sm },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  icon: { fontSize: 16, width: 24 },
  label: { flex: 1, color: colors.textMuted, fontSize: fontSize.sm },
  value: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  notFound: { color: colors.textMuted, fontSize: fontSize.lg },
  backLink: { color: colors.accent, fontSize: fontSize.md },
  back: { marginBottom: spacing.md },
  backText: { color: colors.textMuted, fontSize: fontSize.sm },

  header: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.lg, marginBottom: spacing.lg, gap: spacing.sm,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  typeIconBox: { width: 56, height: 56, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  typePill: { borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderWidth: 1 },
  typePillText: { fontSize: fontSize.sm, fontWeight: fontWeight.black, letterSpacing: 0.5 },
  title: { color: colors.white, fontSize: fontSize.xxl, fontWeight: fontWeight.black, lineHeight: 30 },
  subjectTag: { alignSelf: 'flex-start', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  subjectTagText: { fontSize: 12, fontWeight: fontWeight.bold },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metaItem: { color: colors.textFaint, fontSize: fontSize.xs },

  openBtn: {
    borderRadius: radius.md, paddingVertical: spacing.md + 2,
    alignItems: 'center', marginBottom: spacing.md,
  },
  openBtnDisabled: { opacity: 0.5 },
  openBtnText: { color: '#fff', fontSize: fontSize.md, fontWeight: fontWeight.black },

  noFileBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.warning + '11', borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.warning + '33',
    padding: spacing.md, marginBottom: spacing.lg,
  },
  noFileIcon: { fontSize: 20 },
  noFileText: { flex: 1, color: colors.warning, fontSize: fontSize.sm, lineHeight: 20 },

  section: { marginBottom: spacing.lg },
  sectionTitle: { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: spacing.md },
  desc: { color: colors.textMuted, fontSize: fontSize.md, lineHeight: 24 },

  infoCard: { borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.md, marginBottom: spacing.md },
  tipRow: { borderLeftWidth: 3, paddingLeft: spacing.md, paddingVertical: spacing.xs },
  tipText: { color: colors.textMuted, fontSize: fontSize.sm, lineHeight: 20, fontStyle: 'italic' },

  videoThumb: {
    height: 160, borderRadius: radius.lg, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.md,
  },
  videoPlayIcon: { fontSize: 48, color: colors.white },
  videoDuration: { fontSize: fontSize.md, fontWeight: fontWeight.bold },

  notesCard: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, gap: spacing.md },
  notesText: { color: colors.text, fontSize: fontSize.md, lineHeight: 26 },
  notesContent: { color: colors.text, fontSize: fontSize.md, lineHeight: 26 },

  tipCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md,
    borderRadius: radius.md, borderWidth: 1, padding: spacing.md,
  },
  tipCardIcon: { fontSize: 24 },
  tipCardInfo: { flex: 1 },
  tipCardTitle: { color: colors.warning, fontSize: fontSize.sm, fontWeight: fontWeight.bold, marginBottom: spacing.xs },
  tipCardText: { color: colors.textMuted, fontSize: fontSize.sm, lineHeight: 20 },
});
