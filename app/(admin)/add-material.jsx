import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useData } from '../../src/contexts/DataContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { spacing, radius, fontSize, fontWeight, getShadow, opacity } from '../../utils/theme';


const TYPES = [
  { key: 'pdf',   label: 'PDF',    icon: '📄', placeholder: 'https://drive.google.com/file/d/.../view' },
  { key: 'video', label: 'Video',  icon: '🎬', placeholder: 'https://youtube.com/watch?v=... atau link video' },
  { key: 'notes', label: 'Catatan',icon: '📝', placeholder: '' },
];

const URL_HINTS = {
  pdf: [
    '• Google Drive: buka file → Share → "Anyone with the link" → copy link',
    '• Dropbox: buka file → Share → "Copy link"',
    '• OneDrive: buka file → Share → "Copy link"',
  ],
  video: [
    '• YouTube: buka video → Share → "Copy link"',
    '• Google Drive video: Share → "Anyone with the link" → copy link',
    '• Vimeo: buka video → Share → copy link',
  ],
  notes: [],
};

export default function AddMaterialScreen() {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  const { subjectId } = useLocalSearchParams();
  const { subjects, addMaterial } = useData();
  const { user } = useAuth();
  const router = useRouter();

  const subject = subjects.find((su) => su.id === subjectId);

  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [type,        setType]        = useState('pdf');
  const [author,      setAuthor]      = useState(user?.name || '');
  const [fileUrl,     setFileUrl]     = useState('');
  const [pages,       setPages]       = useState('');
  const [duration,    setDuration]    = useState('');
  const [loading,     setLoading]     = useState(false);

  const tc = (t) => t === 'video' ? colors.admin : t === 'pdf' ? colors.danger : colors.accent;

  const handleSave = async () => {
    if (!title.trim()) { Alert.alert('Judul kosong', 'Isi judul materi.'); return; }
    if (!subjectId)    { Alert.alert('Error', 'Kelas tidak valid.'); return; }
    if (type !== 'notes' && fileUrl.trim() && !fileUrl.startsWith('http')) {
      Alert.alert('URL tidak valid', 'URL harus dimulai dengan https://'); return;
    }
    setLoading(true);
    try {
      await addMaterial({
        subjectId,
        title:    title.trim(),
        description: description.trim(),
        type,
        author:   author.trim() || user?.name || 'Admin',
        fileUrl:  fileUrl.trim(),
        ...(type === 'pdf'   && pages    ? { pages: parseInt(pages) } : {}),
        ...(type === 'video' && duration ? { duration: duration.trim() } : {}),
      });
      Alert.alert('Berhasil ✅', `Materi "${title}" berhasil ditambahkan.`, [
        { text: 'Tambah Lagi', onPress: () => { setTitle(''); setDescription(''); setFileUrl(''); setPages(''); setDuration(''); } },
        { text: 'Kembali', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Gagal menyimpan', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={s.back} onPress={() => router.back()}>
            <Text style={s.backText}>← Kembali</Text>
          </TouchableOpacity>
          <Text style={s.pageTitle}>Tambah Materi</Text>

          {subject && (
            <View style={[s.subjectBadge, { backgroundColor: subject.color + opacity.subtle, borderColor: subject.color + opacity.muted }]}>
              <Text>{subject.icon}</Text>
              <Text style={[s.subjectBadgeText, { color: subject.color }]}>{subject.title}</Text>
            </View>
          )}

          <View style={s.form}>
            <Text style={s.label}>Tipe Materi</Text>
            <View style={s.typeRow}>
              {TYPES.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[s.typeBtn, type === t.key && { backgroundColor: tc(t.key) + opacity.subtle, borderColor: tc(t.key) }]}
                  onPress={() => { setType(t.key); setFileUrl(''); }}
                >
                  <Text style={{ fontSize: 20 }}>{t.icon}</Text>
                  <Text style={[s.typeBtnText, type === t.key && { color: tc(t.key) }]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.label}>Judul Materi *</Text>
            <TextInput style={s.input} value={title} onChangeText={setTitle}
              placeholder="Contoh: Pengantar Aljabar" placeholderTextColor={colors.textFaint} />

            <Text style={s.label}>Deskripsi</Text>
            <TextInput style={[s.input, s.textarea]} value={description} onChangeText={setDescription}
              placeholder="Deskripsi singkat isi materi..." placeholderTextColor={colors.textFaint}
              multiline numberOfLines={3} textAlignVertical="top" />

            <Text style={s.label}>Pengajar</Text>
            <TextInput style={s.input} value={author} onChangeText={setAuthor}
              placeholder="Nama pengajar" placeholderTextColor={colors.textFaint} />

            {type === 'pdf' && (
              <>
                <Text style={s.label}>Jumlah Halaman</Text>
                <TextInput style={s.input} value={pages} onChangeText={setPages}
                  placeholder="Contoh: 24" placeholderTextColor={colors.textFaint} keyboardType="numeric" />
              </>
            )}
            {type === 'video' && (
              <>
                <Text style={s.label}>Durasi</Text>
                <TextInput style={s.input} value={duration} onChangeText={setDuration}
                  placeholder="Contoh: 45 min" placeholderTextColor={colors.textFaint} />
              </>
            )}

            {type !== 'notes' && (
              <>
                <Text style={s.label}>
                  Link {type === 'pdf' ? 'PDF' : 'Video'}{' '}
                  <Text style={s.labelOptional}>(opsional — bisa diisi nanti)</Text>
                </Text>
                <TextInput
                  style={[s.input, fileUrl && !fileUrl.startsWith('http') && { borderColor: colors.danger }]}
                  value={fileUrl}
                  onChangeText={setFileUrl}
                  placeholder={TYPES.find((t) => t.key === type)?.placeholder}
                  placeholderTextColor={colors.textFaint}
                  autoCapitalize="none"
                  keyboardType="url"
                />
                <View style={[s.hintBox, { borderColor: tc(type) + opacity.soft, backgroundColor: tc(type) + '0d' }]}>
                  <Text style={[s.hintTitle, { color: tc(type) }]}>
                    📋 Cara mendapatkan link {type === 'pdf' ? 'PDF' : 'Video'}:
                  </Text>
                  {URL_HINTS[type].map((hint, i) => (
                    <Text key={i} style={s.hintLine}>{hint}</Text>
                  ))}
                  <Text style={s.hintNote}>
                    Pastikan file diatur ke "Anyone with the link can view" agar siswa dapat mengaksesnya.
                  </Text>
                </View>
              </>
            )}

            {type === 'notes' && (
              <View style={[s.hintBox, { borderColor: colors.accent + opacity.soft, backgroundColor: colors.accent + '0d' }]}>
                <Text style={[s.hintTitle, { color: colors.accent }]}>📝 Tentang tipe Catatan</Text>
                <Text style={s.hintLine}>Tipe catatan menampilkan deskripsi materi langsung ke siswa tanpa perlu link eksternal.</Text>
                <Text style={s.hintLine}>Tulis isi catatan lengkap di kolom Deskripsi di atas.</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[s.saveBtn, loading && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={s.saveBtnText}>{loading ? 'Menyimpan...' : '✅  Simpan Materi'}</Text>
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
    form: {
      backgroundColor: c.bgCard, borderRadius: radius.lg,
      borderWidth: 1, borderColor: c.border,
      padding: spacing.lg, marginBottom: spacing.lg,
    },
    label: { color: c.textMuted, fontSize: fontSize.sm, fontWeight: fontWeight.medium, marginBottom: spacing.xs, marginTop: spacing.md },
    labelOptional: { color: c.textFaint, fontSize: fontSize.xs, fontWeight: 'normal' },
    input: {
      backgroundColor: c.bg, borderWidth: 1, borderColor: c.border,
      borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md,
      color: c.text, fontSize: fontSize.md,
    },
    textarea: { minHeight: 80, textAlignVertical: 'top' },
    typeRow: { flexDirection: 'row', gap: spacing.sm },
    typeBtn: {
      flex: 1, alignItems: 'center', gap: spacing.xs,
      paddingVertical: spacing.md, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border, backgroundColor: c.bg,
    },
    typeBtnText: { color: c.textMuted, fontSize: fontSize.xs, fontWeight: fontWeight.bold },
    hintBox: {
      marginTop: spacing.md, borderRadius: radius.md, borderWidth: 1,
      padding: spacing.md, gap: spacing.xs,
    },
    hintTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, marginBottom: spacing.xs },
    hintLine: { color: c.textMuted, fontSize: fontSize.xs, lineHeight: 18 },
    hintNote: { color: c.textFaint, fontSize: fontSize.xs, fontStyle: 'italic', marginTop: spacing.xs },
    saveBtn: {
      backgroundColor: c.admin, borderRadius: radius.md,
      paddingVertical: spacing.md + 2, alignItems: 'center', marginBottom: spacing.sm,
    },
    saveBtnText: { color: c.white, fontSize: fontSize.md, fontWeight: fontWeight.black },
    cancelBtn: {
      borderRadius: radius.md, paddingVertical: spacing.md,
      alignItems: 'center', borderWidth: 1, borderColor: c.border,
    },
    cancelText: { color: c.textMuted, fontSize: fontSize.md },
  });
