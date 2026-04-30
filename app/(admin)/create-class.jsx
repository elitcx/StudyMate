import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useData } from '../../src/contexts/DataContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors, spacing, fontSize, fontWeight, radius } from '../../utils/theme';

const ICONS = ['📚', '🔢', '⚛️', '🧪', '🌿', '📜', '🌍', '💻', '🎨', '🎵', '⚽', '🏛️'];
const COLORS = ['#38bdf8', '#a78bfa', '#4ade80', '#fb923c', '#fbbf24', '#f87171', '#34d399', '#60a5fa'];
const GRADES = [
  { value: 'X',   label: 'Kelas X',   sub: 'Grade 10' },
  { value: 'XI',  label: 'Kelas XI',  sub: 'Grade 11' },
  { value: 'XII', label: 'Kelas XII', sub: 'Grade 12' },
];

export default function CreateClassScreen() {
  const { addSubject, addMaterial } = useData();
  const { user } = useAuth();
  const router = useRouter();

  // Class info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedGrade, setSelectedGrade] = useState('X');

  // Materials
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

  const handleCreate = () => {
    if (!title.trim()) {
      Alert.alert('Nama kelas kosong', 'Harap isi nama kelas.');
      return;
    }
    const newSubject = addSubject({
      title: title.trim(),
      description: description.trim(),
      icon: selectedIcon,
      color: selectedColor,
      grade: selectedGrade,
    });
    materials.forEach((mat) => {
      addMaterial({ ...mat, subjectId: newSubject.id });
    });
    Alert.alert(
      'Kelas dibuat! 🎉',
      `Kelas "${title}" berhasil dibuat dengan ${materials.length} materi.`,
      [{ text: 'OK', onPress: () => router.replace('/(admin)/classes') }]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>Buat Kelas Baru</Text>
            <Text style={styles.pageSubtitle}>Isi informasi kelas dan materi pembelajaran</Text>
          </View>

          {/* ── Class Info ────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informasi Kelas</Text>

            <Text style={styles.label}>Nama Kelas *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Contoh: Matematika Kelas 10"
              placeholderTextColor={colors.textFaint}
            />

            <Text style={styles.label}>Deskripsi</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Deskripsi singkat materi yang dipelajari..."
              placeholderTextColor={colors.textFaint}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <Text style={styles.label}>Ikon Kelas</Text>
            <View style={styles.iconsRow}>
              {ICONS.map((ic) => (
                <TouchableOpacity
                  key={ic}
                  style={[styles.iconOption, selectedIcon === ic && styles.iconOptionSelected]}
                  onPress={() => setSelectedIcon(ic)}
                >
                  <Text style={{ fontSize: 22 }}>{ic}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Warna Kelas</Text>
            <View style={styles.colorsRow}>
              {COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorOption, { backgroundColor: c }, selectedColor === c && styles.colorOptionSelected]}
                  onPress={() => setSelectedColor(c)}
                >
                  {selectedColor === c && <Text style={styles.colorCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Kelas / Grade *</Text>
            <View style={styles.gradeRow}>
              {GRADES.map((g) => (
                <TouchableOpacity
                  key={g.value}
                  style={[styles.gradeBtn, selectedGrade === g.value && styles.gradeBtnActive]}
                  onPress={() => setSelectedGrade(g.value)}
                >
                  <Text style={[styles.gradeBtnLabel, selectedGrade === g.value && styles.gradeBtnLabelActive]}>
                    {g.label}
                  </Text>
                  <Text style={[styles.gradeBtnSub, selectedGrade === g.value && styles.gradeBtnSubActive]}>
                    {g.sub}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Preview */}
            <View style={[styles.preview, { borderTopColor: selectedColor, borderTopWidth: 3 }]}>
              <View style={[styles.previewIcon, { backgroundColor: selectedColor + '22' }]}>
                <Text style={{ fontSize: 28 }}>{selectedIcon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
                  <Text style={styles.previewTitle}>{title || 'Nama Kelas'}</Text>
                  <View style={[styles.gradeBadge, { backgroundColor: selectedColor + '33', borderColor: selectedColor + '88' }]}>
                    <Text style={[styles.gradeBadgeText, { color: selectedColor }]}>{selectedGrade}</Text>
                  </View>
                </View>
                <Text style={styles.previewDesc} numberOfLines={1}>{description || 'Deskripsi kelas'}</Text>
              </View>
            </View>
          </View>

          {/* ── Materials ─────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tambah Materi</Text>
            <Text style={styles.sectionSubtitle}>Materi yang kamu tambahkan akan langsung tersedia di kelas ini.</Text>

            <Text style={styles.label}>Judul Materi</Text>
            <TextInput
              style={styles.input}
              value={matTitle}
              onChangeText={setMatTitle}
              placeholder="Contoh: Pengantar Aljabar"
              placeholderTextColor={colors.textFaint}
            />

            <Text style={styles.label}>Deskripsi Materi</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={matDesc}
              onChangeText={setMatDesc}
              placeholder="Deskripsi singkat materi ini..."
              placeholderTextColor={colors.textFaint}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />

            <Text style={styles.label}>Tipe</Text>
            <View style={styles.typeRow}>
              {['pdf', 'video', 'notes'].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, matType === t && styles.typeBtnActive]}
                  onPress={() => setMatType(t)}
                >
                  <Text style={{ fontSize: 16 }}>{t === 'pdf' ? '📄' : t === 'video' ? '🎬' : '📝'}</Text>
                  <Text style={[styles.typeBtnText, matType === t && styles.typeBtnTextActive]}>
                    {t.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Author / Pengajar</Text>
            <TextInput
              style={styles.input}
              value={matAuthor}
              onChangeText={setMatAuthor}
              placeholder="Nama pengajar"
              placeholderTextColor={colors.textFaint}
            />

            <TouchableOpacity style={styles.addMatBtn} onPress={addMaterialLocal}>
              <Text style={styles.addMatBtnText}>+ Tambahkan Materi</Text>
            </TouchableOpacity>

            {/* Materials list */}
            {materials.length > 0 && (
              <View style={styles.materialsPreview}>
                <Text style={styles.materialsPreviewTitle}>
                  Materi ditambahkan ({materials.length}):
                </Text>
                {materials.map((m) => (
                  <View key={m.id} style={styles.matRow}>
                    <Text style={{ fontSize: 14 }}>{m.type === 'video' ? '🎬' : '📄'}</Text>
                    <View style={styles.matInfo}>
                      <Text style={styles.matTitle}>{m.title}</Text>
                      <Text style={styles.matMeta}>{m.type.toUpperCase()} · {m.author}</Text>
                    </View>
                    <TouchableOpacity onPress={() => removeMaterial(m.id)}>
                      <Text style={{ color: colors.danger, fontSize: 16 }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* ── Create Button ─────────────────────────────── */}
          <TouchableOpacity style={styles.createBtn} onPress={handleCreate} activeOpacity={0.8}>
            <Text style={styles.createBtnText}>
              🚀 Buat Kelas{materials.length > 0 ? ` + ${materials.length} Materi` : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
            <Text style={styles.cancelBtnText}>Batal</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  pageHeader: { marginBottom: spacing.xl },
  pageTitle: { color: colors.white, fontSize: fontSize.xxxl, fontWeight: fontWeight.black },
  pageSubtitle: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.xs },
  section: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.lg, marginBottom: spacing.lg,
  },
  sectionTitle: { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: spacing.xs },
  sectionSubtitle: { color: colors.textMuted, fontSize: fontSize.xs, marginBottom: spacing.md },
  label: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: fontWeight.medium, marginBottom: spacing.xs, marginTop: spacing.md },
  input: {
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    color: colors.text, fontSize: fontSize.md,
  },
  textarea: { minHeight: 72, textAlignVertical: 'top' },
  iconsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  iconOption: {
    width: 48, height: 48, borderRadius: radius.md,
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  iconOptionSelected: { borderColor: colors.admin, backgroundColor: colors.admin + '22' },
  colorsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  colorOption: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  colorOptionSelected: { borderWidth: 3, borderColor: colors.white },
  colorCheck: { color: colors.white, fontWeight: fontWeight.black, fontSize: 14 },
  gradeRow: { flexDirection: 'row', gap: spacing.sm },
  gradeBtn: {
    flex: 1, alignItems: 'center', paddingVertical: spacing.sm,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  gradeBtnActive: { backgroundColor: colors.admin + '22', borderColor: colors.admin },
  gradeBtnLabel: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  gradeBtnLabelActive: { color: colors.admin },
  gradeBtnSub: { color: colors.textFaint, fontSize: 10, marginTop: 2 },
  gradeBtnSubActive: { color: colors.admin + 'aa' },
  gradeBadge: {
    borderRadius: radius.full, borderWidth: 1,
    paddingHorizontal: spacing.sm, paddingVertical: 2,
  },
  gradeBadgeText: { fontSize: 11, fontWeight: fontWeight.black },
  preview: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.bg, borderRadius: radius.md,
    padding: spacing.md, marginTop: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  previewIcon: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  previewTitle: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.bold },
  previewDesc: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  typeRow: { flexDirection: 'row', gap: spacing.sm },
  typeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
    backgroundColor: colors.bg, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    paddingVertical: spacing.sm,
  },
  typeBtnActive: { backgroundColor: colors.admin + '22', borderColor: colors.admin },
  typeBtnText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  typeBtnTextActive: { color: colors.admin },
  addMatBtn: {
    marginTop: spacing.md, backgroundColor: colors.admin + '22',
    borderRadius: radius.md, paddingVertical: spacing.md,
    alignItems: 'center', borderWidth: 1, borderColor: colors.admin + '55',
  },
  addMatBtnText: { color: colors.admin, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  materialsPreview: {
    marginTop: spacing.md, backgroundColor: colors.bg,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    padding: spacing.md,
  },
  materialsPreviewTitle: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: fontWeight.bold, marginBottom: spacing.sm },
  matRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border + '55',
  },
  matInfo: { flex: 1 },
  matTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  matMeta: { color: colors.textFaint, fontSize: 11, marginTop: 2 },
  createBtn: {
    backgroundColor: colors.admin, borderRadius: radius.md,
    paddingVertical: spacing.md + 2, alignItems: 'center', marginBottom: spacing.sm,
  },
  createBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.black },
  cancelBtn: {
    borderRadius: radius.md, paddingVertical: spacing.md,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  cancelBtnText: { color: colors.textMuted, fontSize: fontSize.md },
});
