import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useData } from '../../src/contexts/DataContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { spacing, radius, fontSize, fontWeight } from '../../utils/theme';

export default function MaterialDetailScreen() {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  const { matId } = useLocalSearchParams();
  const { materials, subjects } = useData();
  const router = useRouter();
  const [opening, setOpening] = useState(false);

  const mat     = materials.find((m) => m.id === matId);
  const subject = mat ? subjects.find((su) => su.id === mat.subjectId) : null;

  const typeColor = mat?.type === 'video' ? colors.admin : mat?.type === 'pdf' ? colors.danger : colors.accent;
  const typeIcon  = mat?.type === 'video' ? '🎬' : mat?.type === 'pdf' ? '📄' : '📝';
  const typeLabel = mat?.type === 'video' ? 'Video' : mat?.type === 'pdf' ? 'PDF' : 'Catatan';

  const hasFile = !!mat?.fileUrl;

  const resolvePdfUrl = (url) => {
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/?]+)/);
    if (driveMatch) return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    if (url.includes('docs.google.com')) return url;
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  };

  const openFile = async () => {
    if (!hasFile) {
      Alert.alert('File belum tersedia', 'Admin belum mengunggah file untuk materi ini.', [{ text: 'OK' }]);
      return;
    }
    setOpening(true);
    try {
      if (mat.type === 'pdf') {
        await WebBrowser.openBrowserAsync(resolvePdfUrl(mat.fileUrl), {
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
          toolbarColor: colors.bg,
        });
      } else if (mat.type === 'video') {
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
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <Text style={s.notFound}>Materi tidak ditemukan</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={s.backLink}>← Kembali</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <TouchableOpacity style={s.back} onPress={() => router.back()}>
          <Text style={s.backText}>← Kembali</Text>
        </TouchableOpacity>

        <View style={[s.header, { borderTopColor: typeColor, borderTopWidth: 4 }]}>
          <View style={s.headerTop}>
            <View style={[s.typeIconBox, { backgroundColor: typeColor + '22' }]}>
              <Text style={{ fontSize: 32 }}>{typeIcon}</Text>
            </View>
            <View style={[s.typePill, { backgroundColor: typeColor + '22', borderColor: typeColor + '55' }]}>
              <Text style={[s.typePillText, { color: typeColor }]}>{typeLabel}</Text>
            </View>
          </View>
          <Text style={s.title}>{mat.title}</Text>
          {subject && (
            <View style={[s.subjectTag, { backgroundColor: subject.color + '22' }]}>
              <Text style={[s.subjectTagText, { color: subject.color }]}>
                {subject.icon} {subject.title}
              </Text>
            </View>
          )}
          <View style={s.metaRow}>
            <Text style={s.metaItem}>👤 {mat.author}</Text>
            {mat.pages    && <Text style={s.metaItem}>·  📃 {mat.pages} halaman</Text>}
            {mat.duration && <Text style={s.metaItem}>·  ⏱ {mat.duration}</Text>}
            {mat.createdAt && <Text style={s.metaItem}>·  📅 {mat.createdAt}</Text>}
          </View>
        </View>

        <TouchableOpacity
          style={[s.openBtn, { backgroundColor: typeColor }, !hasFile && s.openBtnDisabled]}
          onPress={openFile}
          disabled={opening}
          activeOpacity={0.8}
        >
          {opening ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={s.openBtnText}>
              {mat.type === 'pdf'   ? '📄 Buka PDF'   :
               mat.type === 'video' ? '▶ Putar Video' : '📝 Buka Catatan'}
              {!hasFile ? ' (Belum tersedia)' : ''}
            </Text>
          )}
        </TouchableOpacity>

        {!hasFile && (
          <View style={s.noFileBanner}>
            <Text style={s.noFileIcon}>⏳</Text>
            <Text style={s.noFileText}>
              Admin belum mengunggah file untuk materi ini. Cek kembali nanti.
            </Text>
          </View>
        )}

        <View style={s.section}>
          <Text style={s.sectionTitle}>Deskripsi</Text>
          <Text style={s.desc}>{mat.description || 'Tidak ada deskripsi.'}</Text>
        </View>

        {mat.type === 'pdf' && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Tentang Dokumen</Text>
            <View style={[s.infoCard, { borderColor: typeColor + '44' }]}>
              <InfoRow s={s} icon="📃" label="Jumlah Halaman" value={mat.pages ? `${mat.pages} halaman` : 'Tidak diketahui'} />
              <InfoRow s={s} icon="👤" label="Penulis"        value={mat.author} />
              <InfoRow s={s} icon="📅" label="Tanggal Upload" value={mat.createdAt || '—'} last />
            </View>
            <View style={[s.tipRow, { borderLeftColor: typeColor }]}>
              <Text style={s.tipText}>
                PDF akan dibuka di browser bawaan. Pastikan koneksi internet stabil.
              </Text>
            </View>
          </View>
        )}

        {mat.type === 'video' && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Tentang Video</Text>
            <View style={[s.videoThumb, { backgroundColor: typeColor + '22', borderColor: typeColor + '44' }]}>
              <Text style={s.videoPlayIcon}>▶</Text>
              <Text style={[s.videoDuration, { color: typeColor }]}>{mat.duration || '—'}</Text>
            </View>
            <View style={[s.tipRow, { borderLeftColor: typeColor }]}>
              <Text style={s.tipText}>
                Video akan dibuka di aplikasi video atau browser. Tonton hingga selesai dan buat catatan penting.
              </Text>
            </View>
          </View>
        )}

        {mat.type === 'notes' && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Isi Catatan</Text>
            <View style={[s.notesCard, { borderColor: typeColor + '44' }]}>
              <Text style={s.notesText}>{mat.description}</Text>
              {mat.content && <Text style={s.notesContent}>{mat.content}</Text>}
            </View>
          </View>
        )}

        <View style={[s.tipCard, { borderColor: colors.warning + '44', backgroundColor: colors.warning + '0a' }]}>
          <Text style={s.tipCardIcon}>💡</Text>
          <View style={s.tipCardInfo}>
            <Text style={s.tipCardTitle}>Tips Belajar</Text>
            <Text style={s.tipCardText}>
              Pelajari materi ini setidaknya 2 hari sebelum ujian. Ulangi bagian yang sulit
              dan diskusikan dengan teman atau guru jika ada yang tidak dipahami.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoRow = ({ s, icon, label, value, last }) => (
  <View style={[s.infoRow, !last && s.infoRowBorder]}>
    <Text style={s.infoRowIcon}>{icon}</Text>
    <Text style={s.infoRowLabel}>{label}</Text>
    <Text style={s.infoRowValue}>{value}</Text>
  </View>
);

const makeStyles = (c, isDark) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
    notFound: { color: c.textMuted, fontSize: fontSize.lg },
    backLink: { color: c.accent, fontSize: fontSize.md },
    back: { marginBottom: spacing.md },
    backText: { color: c.textMuted, fontSize: fontSize.sm },

    header: {
      backgroundColor: c.bgCard, borderRadius: radius.lg,
      borderWidth: 1, borderColor: c.border,
      padding: spacing.lg, marginBottom: spacing.lg, gap: spacing.sm,
    },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    typeIconBox: { width: 56, height: 56, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
    typePill: { borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderWidth: 1 },
    typePillText: { fontSize: fontSize.sm, fontWeight: fontWeight.black, letterSpacing: 0.5 },
    title: { color: c.text, fontSize: fontSize.xxl, fontWeight: fontWeight.black, lineHeight: 30 },
    subjectTag: { alignSelf: 'flex-start', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
    subjectTagText: { fontSize: 12, fontWeight: fontWeight.bold },
    metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    metaItem: { color: c.textFaint, fontSize: fontSize.xs },

    openBtn: {
      borderRadius: radius.md, paddingVertical: spacing.md + 2,
      alignItems: 'center', marginBottom: spacing.md,
    },
    openBtnDisabled: { opacity: 0.5 },
    openBtnText: { color: c.white, fontSize: fontSize.md, fontWeight: fontWeight.black },

    noFileBanner: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.md,
      backgroundColor: c.warning + '11', borderRadius: radius.md,
      borderWidth: 1, borderColor: c.warning + '33',
      padding: spacing.md, marginBottom: spacing.lg,
    },
    noFileIcon: { fontSize: 20 },
    noFileText: { flex: 1, color: c.warning, fontSize: fontSize.sm, lineHeight: 20 },

    section: { marginBottom: spacing.lg },
    sectionTitle: { color: c.text, fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: spacing.md },
    desc: { color: c.textMuted, fontSize: fontSize.md, lineHeight: 24 },

    infoCard: { borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.md, marginBottom: spacing.md },
    infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, gap: spacing.sm },
    infoRowBorder: { borderBottomWidth: 1, borderBottomColor: c.border },
    infoRowIcon: { fontSize: 16, width: 24 },
    infoRowLabel: { flex: 1, color: c.textMuted, fontSize: fontSize.sm },
    infoRowValue: { color: c.text, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

    tipRow: { borderLeftWidth: 3, paddingLeft: spacing.md, paddingVertical: spacing.xs },
    tipText: { color: c.textMuted, fontSize: fontSize.sm, lineHeight: 20, fontStyle: 'italic' },

    videoThumb: {
      height: 160, borderRadius: radius.lg, borderWidth: 1,
      alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.md,
    },
    videoPlayIcon: { fontSize: 48, color: c.text },
    videoDuration: { fontSize: fontSize.md, fontWeight: fontWeight.bold },

    notesCard: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, gap: spacing.md },
    notesText: { color: c.text, fontSize: fontSize.md, lineHeight: 26 },
    notesContent: { color: c.text, fontSize: fontSize.md, lineHeight: 26 },

    tipCard: {
      flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md,
      borderRadius: radius.md, borderWidth: 1, padding: spacing.md,
    },
    tipCardIcon: { fontSize: 24 },
    tipCardInfo: { flex: 1 },
    tipCardTitle: { color: c.warning, fontSize: fontSize.sm, fontWeight: fontWeight.bold, marginBottom: spacing.xs },
    tipCardText: { color: c.textMuted, fontSize: fontSize.sm, lineHeight: 20 },
  });
