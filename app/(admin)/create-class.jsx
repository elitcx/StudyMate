import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useData } from '../../src/contexts/DataContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { spacing, radius, fontSize, fontWeight, getShadow, opacity } from '../../utils/theme';


const ICONS = ['📚', '🔢', '⚛️', '🧪', '🌿', '📜', '🌍', '💻', '🎨', '🎵', '⚽', '🏛️'];
const COLORS = ['#38bdf8', '#a78bfa', '#4ade80', '#fb923c', '#fbbf24', '#f87171', '#34d399', '#60a5fa'];
const GRADES = [
  { value: 'X',   label: 'Kelas X',   sub: 'Grade 10' },
  { value: 'XI',  label: 'Kelas XI',  sub: 'Grade 11' },
  { value: 'XII', label: 'Kelas XII', sub: 'Grade 12' },
];

export default function CreateClassScreen() {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  const { addSubject, addMaterial } = useData();
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedGrade, setSelectedGrade] = useState('X');

  const [materials, setMaterials] = useState([]);
  const [matTitle, setMatTitle] = useState('');
  const [matDesc, setMatDesc] = useState('');
  const [matType, setMatType] = useState('pdf');
  const [matAuthor, setMatAuthor] = useState(user?.name || '');

  const addMaterialLocal = () => {
    if (!matTitle.trim()) {
      Alert.alert('Judul kosong', 'Isi judul materi terlebih dahulu.');
      return;
    }
    setMaterials((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        title: matTitle.trim(),
        description: matDesc.trim(),
        type: matType,
        author: matAuthor.trim() || user?.name || 'Admin',
        pages: matType === 'pdf' ? 1 : undefined,
        duration: matType === 'video' ? '10 min' : undefined,
      },
    ]);
    setMatTitle('');
    setMatDesc('');
  };

  const removeMaterial = (id) => setMaterials((prev) => prev.filter((m) => m.id !== id));

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Nama kelas kosong', 'Harap isi nama kelas.');
      return;
    }
    try {
      const newSubject = await addSubject({
        title: title.trim(),
        description: description.trim(),
        icon: selectedIcon,
        color: selectedColor,
        grade: selectedGrade,
      });
      await Promise.all(
        materials.map((mat) => addMaterial({ ...mat, subjectId: newSubject.id }))
      );
      Alert.alert(
        'Kelas dibuat! 🎉',
        `Kelas "${title}" berhasil dibuat dengan ${materials.length} materi.`,
        [{ text: 'OK', onPress: () => router.replace('/(admin)/classes') }]
      );
    } catch (e) {
      Alert.alert('Gagal membuat kelas', e.message);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          <View style={s.pageHeader}>
            <Text style={s.pageTitle}>Buat Kelas Baru</Text>
            <Text style={s.pageSubtitle}>Isi informasi kelas dan materi pembelajaran</Text>
          </View>

          <View style={s.section}>
            <Text style={s.sectionTitle}>Informasi Kelas</Text>

            <Text style={s.label}>Nama Kelas *</Text>
            <TextInput
              style={s.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Contoh: Matematika Kelas 10"
              placeholderTextColor={colors.textFaint}
            />

            <Text style={s.label}>Deskripsi</Text>
            <TextInput
              style={[s.input, s.textarea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Deskripsi singkat materi yang dipelajari..."
              placeholderTextColor={colors.textFaint}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <Text style={s.label}>Ikon Kelas</Text>
            <View style={s.iconsRow}>
              {ICONS.map((ic) => (
                <TouchableOpacity
                  key={ic}
                  style={[s.iconOption, selectedIcon === ic && s.iconOptionSelected]}
                  onPress={() => setSelectedIcon(ic)}
                >
                  <Text style={{ fontSize: 22 }}>{ic}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.label}>Warna Kelas</Text>
            <View style={s.colorsRow}>
              {COLORS.map((col) => (
                <TouchableOpacity
                  key={col}
                  style={[s.colorOption, { backgroundColor: col }, selectedColor === col && s.colorOptionSelected]}
                  onPress={() => setSelectedColor(col)}
                >
                  {selectedColor === col && <Text style={s.colorCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.label}>Kelas / Grade *</Text>
            <View style={s.gradeRow}>
              {GRADES.map((g) => (
                <TouchableOpacity
                  key={g.value}
                  style={[s.gradeBtn, selectedGrade === g.value && s.gradeBtnActive]}
                  onPress={() => setSelectedGrade(g.value)}
                >
                  <Text style={[s.gradeBtnLabel, selectedGrade === g.value && s.gradeBtnLabelActive]}>
                    {g.label}
                  </Text>
                  <Text style={[s.gradeBtnSub, selectedGrade === g.value && s.gradeBtnSubActive]}>
                    {g.sub}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={[s.preview, { borderTopColor: selectedColor, borderTopWidth: 3 }]}>
              <View style={[s.previewIcon, { backgroundColor: selectedColor + opacity.subtle }]}>
                <Text style={{ fontSize: 28 }}>{selectedIcon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
                  <Text style={s.previewTitle}>{title || 'Nama Kelas'}</Text>
                  <View style={[s.gradeBadge, { backgroundColor: selectedColor + '33', borderColor: selectedColor + '88' }]}>
                    <Text style={[s.gradeBadgeText, { color: selectedColor }]}>{selectedGrade}</Text>
                  </View>
                </View>
                <Text style={s.previewDesc} numberOfLines={1}>{description || 'Deskripsi kelas'}</Text>
              </View>
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.sectionTitle}>Tambah Materi</Text>
            <Text style={s.sectionSubtitle}>Materi yang kamu tambahkan akan langsung tersedia di kelas ini.</Text>

            <Text style={s.label}>Judul Materi</Text>
            <TextInput
              style={s.input}
              value={matTitle}
              onChangeText={setMatTitle}
              placeholder="Contoh: Pengantar Aljabar"
              placeholderTextColor={colors.textFaint}
            />

            <Text style={s.label}>Deskripsi Materi</Text>
            <TextInput
              style={[s.input, s.textarea]}
              value={matDesc}
              onChangeText={setMatDesc}
              placeholder="Deskripsi singkat materi ini..."
              placeholderTextColor={colors.textFaint}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />

            <Text style={s.label}>Tipe</Text>
            <View style={s.typeRow}>
              {['pdf', 'video', 'notes'].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[s.typeBtn, matType === t && s.typeBtnActive]}
                  onPress={() => setMatType(t)}
                >
                  <Text style={{ fontSize: 16 }}>{t === 'pdf' ? '📄' : t === 'video' ? '🎬' : '📝'}</Text>
                  <Text style={[s.typeBtnText, matType === t && s.typeBtnTextActive]}>
                    {t.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.label}>Author / Pengajar</Text>
            <TextInput
              style={s.input}
              value={matAuthor}
              onChangeText={setMatAuthor}
              placeholder="Nama pengajar"
              placeholderTextColor={colors.textFaint}
            />

            <TouchableOpacity style={s.addMatBtn} onPress={addMaterialLocal}>
              <Text style={s.addMatBtnText}>+ Tambahkan Materi</Text>
            </TouchableOpacity>

            {materials.length > 0 && (
              <View style={s.materialsPreview}>
                <Text style={s.materialsPreviewTitle}>
                  Materi ditambahkan ({materials.length}):
                </Text>
                {materials.map((m) => (
                  <View key={m.id} style={s.matRow}>
                    <Text style={{ fontSize: 14 }}>{m.type === 'video' ? '🎬' : '📄'}</Text>
                    <View style={s.matInfo}>
                      <Text style={s.matTitle}>{m.title}</Text>
                      <Text style={s.matMeta}>{m.type.toUpperCase()} · {m.author}</Text>
                    </View>
                    <TouchableOpacity onPress={() => removeMaterial(m.id)}>
                      <Text style={{ color: colors.danger, fontSize: 16 }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity style={s.createBtn} onPress={handleCreate} activeOpacity={0.8}>
            <Text style={s.createBtnText}>
              🚀 Buat Kelas{materials.length > 0 ? ` + ${materials.length} Materi` : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.cancelBtn} onPress={() => router.back()}>
            <Text style={s.cancelBtnText}>Batal</Text>
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
    pageHeader: { marginBottom: spacing.xl },
    pageTitle: { color: c.text, fontSize: fontSize.xxxl, fontWeight: fontWeight.black },
    pageSubtitle: { color: c.textMuted, fontSize: fontSize.sm, marginTop: spacing.xs },
    section: {
      backgroundColor: c.bgCard, borderRadius: radius.lg,
      borderWidth: 1, borderColor: c.border,
      padding: spacing.lg, marginBottom: spacing.lg,
    },
    sectionTitle: { color: c.text, fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: spacing.xs },
    sectionSubtitle: { color: c.textMuted, fontSize: fontSize.xs, marginBottom: spacing.md },
    label: { color: c.textMuted, fontSize: fontSize.sm, fontWeight: fontWeight.medium, marginBottom: spacing.xs, marginTop: spacing.md },
    input: {
      backgroundColor: c.bg, borderWidth: 1, borderColor: c.border,
      borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md,
      color: c.text, fontSize: fontSize.md,
    },
    textarea: { minHeight: 72, textAlignVertical: 'top' },
    iconsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    iconOption: {
      width: 48, height: 48, borderRadius: radius.md,
      backgroundColor: c.bg, borderWidth: 1, borderColor: c.border,
      alignItems: 'center', justifyContent: 'center',
    },
    iconOptionSelected: { borderColor: c.admin, backgroundColor: c.admin + opacity.subtle },
    colorsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    colorOption: {
      width: 36, height: 36, borderRadius: 18,
      alignItems: 'center', justifyContent: 'center',
    },
    colorOptionSelected: { borderWidth: 3, borderColor: c.white },
    colorCheck: { color: c.white, fontWeight: fontWeight.black, fontSize: 14 },
    gradeRow: { flexDirection: 'row', gap: spacing.sm },
    gradeBtn: {
      flex: 1, alignItems: 'center', paddingVertical: spacing.sm,
      borderRadius: radius.md, borderWidth: 1, borderColor: c.border,
      backgroundColor: c.bg,
    },
    gradeBtnActive: { backgroundColor: c.admin + opacity.subtle, borderColor: c.admin },
    gradeBtnLabel: { color: c.textMuted, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
    gradeBtnLabelActive: { color: c.admin },
    gradeBtnSub: { color: c.textFaint, fontSize: 10, marginTop: 2 },
    gradeBtnSubActive: { color: c.admin + 'aa' },
    gradeBadge: {
      borderRadius: radius.full, borderWidth: 1,
      paddingHorizontal: spacing.sm, paddingVertical: 2,
    },
    gradeBadgeText: { fontSize: 11, fontWeight: fontWeight.black },
    preview: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.md,
      backgroundColor: c.bg, borderRadius: radius.md,
      padding: spacing.md, marginTop: spacing.md,
      borderWidth: 1, borderColor: c.border,
    },
    previewIcon: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
    previewTitle: { color: c.text, fontSize: fontSize.md, fontWeight: fontWeight.bold },
    previewDesc: { color: c.textMuted, fontSize: fontSize.xs, marginTop: 2 },
    typeRow: { flexDirection: 'row', gap: spacing.sm },
    typeBtn: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
      backgroundColor: c.bg, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border,
      paddingVertical: spacing.sm,
    },
    typeBtnActive: { backgroundColor: c.admin + opacity.subtle, borderColor: c.admin },
    typeBtnText: { color: c.textMuted, fontSize: fontSize.xs, fontWeight: fontWeight.bold },
    typeBtnTextActive: { color: c.admin },
    addMatBtn: {
      marginTop: spacing.md, backgroundColor: c.admin + opacity.subtle,
      borderRadius: radius.md, paddingVertical: spacing.md,
      alignItems: 'center', borderWidth: 1, borderColor: c.admin + opacity.muted,
    },
    addMatBtnText: { color: c.admin, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
    materialsPreview: {
      marginTop: spacing.md, backgroundColor: c.bg,
      borderRadius: radius.md, borderWidth: 1, borderColor: c.border,
      padding: spacing.md,
    },
    materialsPreviewTitle: { color: c.textMuted, fontSize: fontSize.xs, fontWeight: fontWeight.bold, marginBottom: spacing.sm },
    matRow: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
      paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: c.border + opacity.muted,
    },
    matInfo: { flex: 1 },
    matTitle: { color: c.text, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
    matMeta: { color: c.textFaint, fontSize: 11, marginTop: 2 },
    createBtn: {
      backgroundColor: c.admin, borderRadius: radius.md,
      paddingVertical: spacing.md + 2, alignItems: 'center', marginBottom: spacing.sm,
    },
    createBtnText: { color: c.white, fontSize: fontSize.md, fontWeight: fontWeight.black },
    cancelBtn: {
      borderRadius: radius.md, paddingVertical: spacing.md,
      alignItems: 'center', borderWidth: 1, borderColor: c.border,
    },
    cancelBtnText: { color: c.textMuted, fontSize: fontSize.md },
  });
