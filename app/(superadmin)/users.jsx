import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, TextInput, Modal, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors, spacing, fontSize, fontWeight, radius } from '../../utils/theme';

const ROLES = ['student', 'admin', 'superadmin'];
const ROLE_META = {
  student:    { label: 'Siswa',      color: colors.student,    icon: '🎓' },
  admin:      { label: 'Admin',      color: colors.admin,      icon: '👩‍🏫' },
  superadmin: { label: 'Superadmin', color: colors.superadmin, icon: '⚡' },
};
const GRADES = ['X', 'XI', 'XII'];
const GRADE_COLORS = { X: '#38bdf8', XI: '#a78bfa', XII: '#4ade80' };

export default function UsersScreen() {
  const { user: currentUser, allUsers, updateUserRole, deleteUser, register, refreshAllUsers } = useAuth();

  const [search, setSearch]           = useState('');
  const [roleFilter, setRoleFilter]   = useState('all');
  const [roleModal, setRoleModal]     = useState(null); // user object
  const [addModal, setAddModal]       = useState(false);

  // Load all users on mount
  useEffect(() => {
    refreshAllUsers();
  }, []);

  // Add user form
  const [newName, setNewName]         = useState('');
  const [newEmail, setNewEmail]       = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole]         = useState('student');
  const [newGrade, setNewGrade]       = useState('X');

  const filtered = allUsers.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const counts = {
    all:        allUsers.length,
    student:    allUsers.filter((u) => u.role === 'student').length,
    admin:      allUsers.filter((u) => u.role === 'admin').length,
    superadmin: allUsers.filter((u) => u.role === 'superadmin').length,
  };

  const handleRoleChange = (targetUser, newR) => {
    if (targetUser.id === currentUser.id) {
      Alert.alert('Tidak bisa', 'Kamu tidak bisa mengubah peranmu sendiri.');
      return;
    }
    updateUserRole(targetUser.id, newR);
    setRoleModal(null);
  };

  const handleDelete = (targetUser) => {
    if (targetUser.id === currentUser.id) {
      Alert.alert('Tidak bisa', 'Kamu tidak bisa menghapus akunmu sendiri.');
      return;
    }
    Alert.alert(
      'Hapus Pengguna',
      `Yakin hapus akun "${targetUser.name}"? Tindakan ini tidak bisa dibatalkan.`,
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: () => deleteUser(targetUser.id) },
      ]
    );
  };

  const handleAddUser = async () => {
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      Alert.alert('Field kosong', 'Isi semua kolom terlebih dahulu.');
      return;
    }
    try {
      const grade = newRole === 'student' ? newGrade : null;
      const created = await register(newName.trim(), newEmail.trim().toLowerCase(), newPassword, grade);
      await updateUserRole(created.id, newRole);
      setAddModal(false);
      setNewName(''); setNewEmail(''); setNewPassword(''); setNewRole('student'); setNewGrade('X');
      Alert.alert('Pengguna ditambahkan ✅', `Akun "${newName}" berhasil dibuat sebagai ${ROLE_META[newRole].label}.`);
    } catch (e) {
      Alert.alert('Gagal', e.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Kelola Pengguna</Text>
          <Text style={styles.subtitle}>{allUsers.length} pengguna terdaftar</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setAddModal(true)}>
          <Text style={styles.addBtnText}>+ Tambah</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama atau email..."
            placeholderTextColor={colors.textFaint}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: colors.textMuted, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Role filter */}
      <View style={styles.filterWrap}>
        {[
          { key: 'all',        label: `Semua (${counts.all})`,         color: colors.white },
          { key: 'student',    label: `Siswa (${counts.student})`,     color: colors.student },
          { key: 'admin',      label: `Admin (${counts.admin})`,       color: colors.admin },
          { key: 'superadmin', label: `SA (${counts.superadmin})`,     color: colors.superadmin },
        ].map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterChip,
              roleFilter === f.key && { backgroundColor: f.color + '22', borderColor: f.color },
            ]}
            onPress={() => setRoleFilter(f.key)}
          >
            <Text style={[
              styles.filterText,
              roleFilter === f.key && { color: f.color, fontWeight: fontWeight.bold },
            ]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyText}>Tidak ada pengguna ditemukan</Text>
          </View>
        }
        renderItem={({ item: u }) => {
          const meta = ROLE_META[u.role];
          const isSelf = u.id === currentUser.id;
          return (
            <View style={[styles.userCard, isSelf && { borderColor: colors.superadmin + '55' }]}>
              <View style={styles.userTop}>
                {/* Avatar */}
                <View style={[styles.avatar, { backgroundColor: meta.color + '22', borderColor: meta.color + '44' }]}>
                  <Text style={{ fontSize: 22 }}>{u.avatar}</Text>
                </View>
                {/* Info */}
                <View style={styles.userInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.userName}>{u.name}</Text>
                    {isSelf && (
                      <View style={styles.selfBadge}>
                        <Text style={styles.selfBadgeText}>Kamu</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.userEmail} numberOfLines={1}>{u.email}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 2 }}>
                    {u.role === 'student' && u.grade && (
                      <View style={[styles.gradeBadge, { backgroundColor: (GRADE_COLORS[u.grade] || colors.accent) + '22', borderColor: (GRADE_COLORS[u.grade] || colors.accent) + '55' }]}>
                        <Text style={[styles.gradeBadgeText, { color: GRADE_COLORS[u.grade] || colors.accent }]}>
                          Kelas {u.grade}
                        </Text>
                      </View>
                    )}
                    {u.enrolledSubjects?.length > 0 && (
                      <Text style={styles.userMeta}>📚 {u.enrolledSubjects.length} kelas</Text>
                    )}
                  </View>
                </View>
                {/* Role pill */}
                <TouchableOpacity
                  style={[styles.rolePill, { backgroundColor: meta.color + '22', borderColor: meta.color + '55' }]}
                  onPress={() => !isSelf && setRoleModal(u)}
                  disabled={isSelf}
                >
                  <Text style={[styles.rolePillText, { color: meta.color }]}>
                    {meta.icon} {meta.label}
                  </Text>
                  {!isSelf && <Text style={[styles.rolePillChevron, { color: meta.color }]}>▼</Text>}
                </TouchableOpacity>
              </View>

              {/* Actions */}
              {!isSelf && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.roleBtn}
                    onPress={() => setRoleModal(u)}
                  >
                    <Text style={styles.roleBtnText}>🔄 Ubah Peran</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(u)}
                  >
                    <Text style={styles.deleteBtnText}>🗑 Hapus</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
      />

      {/* ── Role Change Modal ──────────────────────────────── */}
      <Modal transparent visible={!!roleModal} animationType="slide" onRequestClose={() => setRoleModal(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setRoleModal(null)}>
          <Pressable style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Ubah Peran Pengguna</Text>
            {roleModal && (
              <Text style={styles.modalSubtitle}>{roleModal.name} · {roleModal.email}</Text>
            )}
            <View style={styles.modalOptions}>
              {ROLES.map((r) => {
                const m = ROLE_META[r];
                const isCurrentRole = roleModal?.role === r;
                return (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.modalRoleBtn,
                      isCurrentRole && { backgroundColor: m.color + '22', borderColor: m.color },
                    ]}
                    onPress={() => roleModal && handleRoleChange(roleModal, r)}
                    disabled={isCurrentRole}
                  >
                    <Text style={{ fontSize: 24 }}>{m.icon}</Text>
                    <View style={styles.modalRoleInfo}>
                      <Text style={[styles.modalRoleLabel, isCurrentRole && { color: m.color }]}>
                        {m.label}
                        {isCurrentRole ? ' (saat ini)' : ''}
                      </Text>
                      <Text style={styles.modalRoleDesc}>
                        {r === 'student' ? 'Akses materi & kuis'
                          : r === 'admin' ? 'Kelola kelas & kuis'
                          : 'Akses penuh sistem'}
                      </Text>
                    </View>
                    {isCurrentRole && (
                      <Text style={[styles.modalCheck, { color: m.color }]}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setRoleModal(null)}>
              <Text style={styles.modalCancelText}>Batal</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Add User Modal ─────────────────────────────────── */}
      <Modal transparent visible={addModal} animationType="slide" onRequestClose={() => setAddModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setAddModal(false)}>
          <Pressable style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Tambah Pengguna Baru</Text>

            <Text style={styles.fieldLabel}>Nama Lengkap</Text>
            <TextInput style={styles.fieldInput} value={newName} onChangeText={setNewName}
              placeholder="Nama Lengkap" placeholderTextColor={colors.textFaint} />

            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput style={styles.fieldInput} value={newEmail} onChangeText={setNewEmail}
              placeholder="email@contoh.com" placeholderTextColor={colors.textFaint}
              keyboardType="email-address" autoCapitalize="none" />

            <Text style={styles.fieldLabel}>Password</Text>
            <TextInput style={styles.fieldInput} value={newPassword} onChangeText={setNewPassword}
              placeholder="Min. 6 karakter" placeholderTextColor={colors.textFaint}
              secureTextEntry />

            <Text style={styles.fieldLabel}>Peran</Text>
            <View style={styles.rolePickerRow}>
              {ROLES.map((r) => {
                const m = ROLE_META[r];
                const isSelected = newRole === r;
                return (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.rolePick,
                      isSelected && { backgroundColor: m.color + '22', borderColor: m.color },
                    ]}
                    onPress={() => setNewRole(r)}
                  >
                    <Text style={{ fontSize: 18 }}>{m.icon}</Text>
                    <Text style={[styles.rolePickText, isSelected && { color: m.color }]}>{m.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {newRole === 'student' && (
              <>
                <Text style={styles.fieldLabel}>Kelas / Grade</Text>
                <View style={styles.gradePickerRow}>
                  {GRADES.map((g) => {
                    const gc = GRADE_COLORS[g];
                    const isSelected = newGrade === g;
                    return (
                      <TouchableOpacity
                        key={g}
                        style={[
                          styles.gradePick,
                          isSelected && { backgroundColor: gc + '22', borderColor: gc },
                        ]}
                        onPress={() => setNewGrade(g)}
                      >
                        <Text style={[styles.gradePickText, isSelected && { color: gc }]}>
                          Kelas {g}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setAddModal(false)}>
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleAddUser}>
                <Text style={styles.modalConfirmText}>Tambahkan</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xs,
  },
  title: { color: colors.white, fontSize: fontSize.xxxl, fontWeight: fontWeight.black },
  subtitle: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: 2 },
  addBtn: {
    backgroundColor: colors.superadmin + '22', borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2,
    borderWidth: 1, borderColor: colors.superadmin + '55',
  },
  addBtnText: { color: colors.superadmin, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  searchWrap: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgCard, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, gap: spacing.sm,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, color: colors.text, fontSize: fontSize.md, paddingVertical: spacing.md },
  filterWrap: {
    flexDirection: 'row', gap: spacing.xs,
    paddingHorizontal: spacing.lg, paddingBottom: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs + 2,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  filterText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: fontWeight.medium },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  userCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.md, gap: spacing.sm,
  },
  userTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  userInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  userName: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.bold },
  selfBadge: {
    backgroundColor: colors.superadmin + '22', borderRadius: radius.full,
    paddingHorizontal: spacing.sm, paddingVertical: 2,
    borderWidth: 1, borderColor: colors.superadmin + '55',
  },
  selfBadgeText: { color: colors.superadmin, fontSize: 10, fontWeight: fontWeight.bold },
  userEmail: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 1 },
  userMeta: { color: colors.textFaint, fontSize: 10, marginTop: 2 },
  rolePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: radius.full, borderWidth: 1,
    paddingHorizontal: spacing.sm, paddingVertical: 4,
  },
  rolePillText: { fontSize: 11, fontWeight: fontWeight.bold },
  rolePillChevron: { fontSize: 8 },
  actionRow: { flexDirection: 'row', gap: spacing.sm },
  roleBtn: {
    flex: 1, paddingVertical: spacing.sm,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', backgroundColor: colors.bg,
  },
  roleBtnText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  deleteBtn: {
    paddingVertical: spacing.sm, paddingHorizontal: spacing.lg,
    borderRadius: radius.md, borderWidth: 1,
    borderColor: colors.danger + '55', backgroundColor: colors.danger + '11',
    alignItems: 'center',
  },
  deleteBtnText: { color: colors.danger, fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyIcon: { fontSize: 40 },
  emptyText: { color: colors.textMuted, fontSize: fontSize.md },

  // Modals
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.xl, paddingBottom: spacing.xxl,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.lg,
  },
  modalTitle: { color: colors.white, fontSize: fontSize.xl, fontWeight: fontWeight.black, marginBottom: spacing.xs },
  modalSubtitle: { color: colors.textMuted, fontSize: fontSize.sm, marginBottom: spacing.lg },
  modalOptions: { gap: spacing.sm, marginBottom: spacing.lg },
  modalRoleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.bg, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md,
  },
  modalRoleInfo: { flex: 1 },
  modalRoleLabel: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.bold },
  modalRoleDesc: { color: colors.textFaint, fontSize: fontSize.xs, marginTop: 2 },
  modalCheck: { fontSize: 20, fontWeight: fontWeight.black },
  modalCancel: {
    paddingVertical: spacing.md, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center',
  },
  modalCancelText: { color: colors.textMuted, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  fieldLabel: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: fontWeight.medium, marginBottom: spacing.xs, marginTop: spacing.md },
  fieldInput: {
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    color: colors.text, fontSize: fontSize.md,
  },
  rolePickerRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  rolePick: {
    flex: 1, alignItems: 'center', gap: spacing.xs,
    paddingVertical: spacing.md, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg,
  },
  rolePickText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  gradeBadge: {
    borderRadius: radius.full, borderWidth: 1,
    paddingHorizontal: spacing.sm, paddingVertical: 2,
  },
  gradeBadgeText: { fontSize: 10, fontWeight: fontWeight.black },
  gradePickerRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  gradePick: {
    flex: 1, alignItems: 'center',
    paddingVertical: spacing.sm, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg,
  },
  gradePickText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  modalConfirm: {
    flex: 1, paddingVertical: spacing.md, borderRadius: radius.md,
    backgroundColor: colors.superadmin, alignItems: 'center',
  },
  modalConfirmText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.black },
});
