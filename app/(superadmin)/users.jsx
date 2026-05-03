import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, TextInput, Modal, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { spacing, radius, fontSize, fontWeight } from '../../utils/theme';

const ROLES = ['student', 'admin', 'superadmin'];
const GRADES = ['X', 'XI', 'XII'];
const GRADE_COLORS = { X: '#38bdf8', XI: '#a78bfa', XII: '#4ade80' };

export default function UsersScreen() {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  const ROLE_META = {
    student:    { label: 'Siswa',      color: colors.student,    icon: '🎓' },
    admin:      { label: 'Admin',      color: colors.admin,      icon: '👩‍🏫' },
    superadmin: { label: 'Superadmin', color: colors.superadmin, icon: '⚡' },
  };

  const { user: currentUser, allUsers, updateUserRole, deleteUser, register, refreshAllUsers } = useAuth();

  const [search, setSearch]           = useState('');
  const [roleFilter, setRoleFilter]   = useState('all');
  const [roleModal, setRoleModal]     = useState(null);
  const [addModal, setAddModal]       = useState(false);

  useEffect(() => {
    refreshAllUsers();
  }, []);

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
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>Kelola Pengguna</Text>
          <Text style={s.subtitle}>{allUsers.length} pengguna terdaftar</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => setAddModal(true)}>
          <Text style={s.addBtnText}>+ Tambah</Text>
        </TouchableOpacity>
      </View>

      <View style={s.searchWrap}>
        <View style={s.searchBox}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
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

      <View style={s.filterWrap}>
        {[
          { key: 'all',        label: `Semua (${counts.all})`,         color: colors.text },
          { key: 'student',    label: `Siswa (${counts.student})`,     color: colors.student },
          { key: 'admin',      label: `Admin (${counts.admin})`,       color: colors.admin },
          { key: 'superadmin', label: `SA (${counts.superadmin})`,     color: colors.superadmin },
        ].map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              s.filterChip,
              roleFilter === f.key && { backgroundColor: f.color + '22', borderColor: f.color },
            ]}
            onPress={() => setRoleFilter(f.key)}
          >
            <Text style={[
              s.filterText,
              roleFilter === f.key && { color: f.color, fontWeight: fontWeight.bold },
            ]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIcon}>👥</Text>
            <Text style={s.emptyText}>Tidak ada pengguna ditemukan</Text>
          </View>
        }
        renderItem={({ item: u }) => {
          const meta = ROLE_META[u.role];
          const isSelf = u.id === currentUser.id;
          return (
            <View style={[s.userCard, isSelf && { borderColor: colors.superadmin + '55' }]}>
              <View style={s.userTop}>
                <View style={[s.avatar, { backgroundColor: meta.color + '22', borderColor: meta.color + '44' }]}>
                  <Text style={{ fontSize: 22 }}>{u.avatar}</Text>
                </View>
                <View style={s.userInfo}>
                  <View style={s.nameRow}>
                    <Text style={s.userName}>{u.name}</Text>
                    {isSelf && (
                      <View style={s.selfBadge}>
                        <Text style={s.selfBadgeText}>Kamu</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.userEmail} numberOfLines={1}>{u.email}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 2 }}>
                    {u.role === 'student' && u.grade && (
                      <View style={[s.gradeBadge, { backgroundColor: (GRADE_COLORS[u.grade] || colors.accent) + '22', borderColor: (GRADE_COLORS[u.grade] || colors.accent) + '55' }]}>
                        <Text style={[s.gradeBadgeText, { color: GRADE_COLORS[u.grade] || colors.accent }]}>
                          Kelas {u.grade}
                        </Text>
                      </View>
                    )}
                    {u.enrolledSubjects?.length > 0 && (
                      <Text style={s.userMeta}>📚 {u.enrolledSubjects.length} kelas</Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  style={[s.rolePill, { backgroundColor: meta.color + '22', borderColor: meta.color + '55' }]}
                  onPress={() => !isSelf && setRoleModal(u)}
                  disabled={isSelf}
                >
                  <Text style={[s.rolePillText, { color: meta.color }]}>
                    {meta.icon} {meta.label}
                  </Text>
                  {!isSelf && <Text style={[s.rolePillChevron, { color: meta.color }]}>▼</Text>}
                </TouchableOpacity>
              </View>

              {!isSelf && (
                <View style={s.actionRow}>
                  <TouchableOpacity style={s.roleBtn} onPress={() => setRoleModal(u)}>
                    <Text style={s.roleBtnText}>🔄 Ubah Peran</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.deleteBtn} onPress={() => handleDelete(u)}>
                    <Text style={s.deleteBtnText}>🗑 Hapus</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
      />

      {/* Role Change Modal */}
      <Modal transparent visible={!!roleModal} animationType="slide" onRequestClose={() => setRoleModal(null)}>
        <Pressable style={s.modalOverlay} onPress={() => setRoleModal(null)}>
          <Pressable style={s.modalSheet}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>Ubah Peran Pengguna</Text>
            {roleModal && (
              <Text style={s.modalSubtitle}>{roleModal.name} · {roleModal.email}</Text>
            )}
            <View style={s.modalOptions}>
              {ROLES.map((r) => {
                const m = ROLE_META[r];
                const isCurrentRole = roleModal?.role === r;
                return (
                  <TouchableOpacity
                    key={r}
                    style={[
                      s.modalRoleBtn,
                      isCurrentRole && { backgroundColor: m.color + '22', borderColor: m.color },
                    ]}
                    onPress={() => roleModal && handleRoleChange(roleModal, r)}
                    disabled={isCurrentRole}
                  >
                    <Text style={{ fontSize: 24 }}>{m.icon}</Text>
                    <View style={s.modalRoleInfo}>
                      <Text style={[s.modalRoleLabel, isCurrentRole && { color: m.color }]}>
                        {m.label}{isCurrentRole ? ' (saat ini)' : ''}
                      </Text>
                      <Text style={s.modalRoleDesc}>
                        {r === 'student' ? 'Akses materi & kuis'
                          : r === 'admin' ? 'Kelola kelas & kuis'
                          : 'Akses penuh sistem'}
                      </Text>
                    </View>
                    {isCurrentRole && (
                      <Text style={[s.modalCheck, { color: m.color }]}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity style={s.modalCancel} onPress={() => setRoleModal(null)}>
              <Text style={s.modalCancelText}>Batal</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Add User Modal */}
      <Modal transparent visible={addModal} animationType="slide" onRequestClose={() => setAddModal(false)}>
        <Pressable style={s.modalOverlay} onPress={() => setAddModal(false)}>
          <Pressable style={s.modalSheet}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>Tambah Pengguna Baru</Text>

            <Text style={s.fieldLabel}>Nama Lengkap</Text>
            <TextInput style={s.fieldInput} value={newName} onChangeText={setNewName}
              placeholder="Nama Lengkap" placeholderTextColor={colors.textFaint} />

            <Text style={s.fieldLabel}>Email</Text>
            <TextInput style={s.fieldInput} value={newEmail} onChangeText={setNewEmail}
              placeholder="email@contoh.com" placeholderTextColor={colors.textFaint}
              keyboardType="email-address" autoCapitalize="none" />

            <Text style={s.fieldLabel}>Password</Text>
            <TextInput style={s.fieldInput} value={newPassword} onChangeText={setNewPassword}
              placeholder="Min. 6 karakter" placeholderTextColor={colors.textFaint}
              secureTextEntry />

            <Text style={s.fieldLabel}>Peran</Text>
            <View style={s.rolePickerRow}>
              {ROLES.map((r) => {
                const m = ROLE_META[r];
                const isSelected = newRole === r;
                return (
                  <TouchableOpacity
                    key={r}
                    style={[
                      s.rolePick,
                      isSelected && { backgroundColor: m.color + '22', borderColor: m.color },
                    ]}
                    onPress={() => setNewRole(r)}
                  >
                    <Text style={{ fontSize: 18 }}>{m.icon}</Text>
                    <Text style={[s.rolePickText, isSelected && { color: m.color }]}>{m.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {newRole === 'student' && (
              <>
                <Text style={s.fieldLabel}>Kelas / Grade</Text>
                <View style={s.gradePickerRow}>
                  {GRADES.map((g) => {
                    const gc = GRADE_COLORS[g];
                    const isSelected = newGrade === g;
                    return (
                      <TouchableOpacity
                        key={g}
                        style={[
                          s.gradePick,
                          isSelected && { backgroundColor: gc + '22', borderColor: gc },
                        ]}
                        onPress={() => setNewGrade(g)}
                      >
                        <Text style={[s.gradePickText, isSelected && { color: gc }]}>
                          Kelas {g}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            <View style={s.modalActions}>
              <TouchableOpacity style={s.modalCancel} onPress={() => setAddModal(false)}>
                <Text style={s.modalCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalConfirm} onPress={handleAddUser}>
                <Text style={s.modalConfirmText}>Tambahkan</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const makeStyles = (c, isDark) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xs,
    },
    title: { color: c.text, fontSize: fontSize.xxxl, fontWeight: fontWeight.black },
    subtitle: { color: c.textMuted, fontSize: fontSize.sm, marginTop: 2 },
    addBtn: {
      backgroundColor: c.superadmin + '22', borderRadius: radius.full,
      paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2,
      borderWidth: 1, borderColor: c.superadmin + '55',
    },
    addBtnText: { color: c.superadmin, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
    searchWrap: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
    searchBox: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: c.bgCard, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border,
      paddingHorizontal: spacing.md, gap: spacing.sm,
    },
    searchIcon: { fontSize: 14 },
    searchInput: { flex: 1, color: c.text, fontSize: fontSize.md, paddingVertical: spacing.md },
    filterWrap: {
      flexDirection: 'row', gap: spacing.xs,
      paddingHorizontal: spacing.lg, paddingBottom: spacing.sm,
    },
    filterChip: {
      paddingHorizontal: spacing.sm, paddingVertical: spacing.xs + 2,
      borderRadius: radius.full, borderWidth: 1, borderColor: c.border,
      backgroundColor: c.bgCard,
    },
    filterText: { color: c.textMuted, fontSize: fontSize.xs, fontWeight: fontWeight.medium },
    list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
    userCard: {
      backgroundColor: c.bgCard, borderRadius: radius.lg,
      borderWidth: 1, borderColor: c.border,
      padding: spacing.md, marginBottom: spacing.md, gap: spacing.sm,
    },
    userTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    avatar: {
      width: 48, height: 48, borderRadius: 24,
      borderWidth: 2, alignItems: 'center', justifyContent: 'center',
    },
    userInfo: { flex: 1 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    userName: { color: c.text, fontSize: fontSize.md, fontWeight: fontWeight.bold },
    selfBadge: {
      backgroundColor: c.superadmin + '22', borderRadius: radius.full,
      paddingHorizontal: spacing.sm, paddingVertical: 2,
      borderWidth: 1, borderColor: c.superadmin + '55',
    },
    selfBadgeText: { color: c.superadmin, fontSize: 10, fontWeight: fontWeight.bold },
    userEmail: { color: c.textMuted, fontSize: fontSize.xs, marginTop: 1 },
    userMeta: { color: c.textFaint, fontSize: 10, marginTop: 2 },
    rolePill: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      borderRadius: radius.full, borderWidth: 1,
      paddingHorizontal: spacing.sm, paddingVertical: 4,
    },
    rolePillText: { fontSize: 11, fontWeight: fontWeight.bold },
    rolePillChevron: { fontSize: 8 },
    gradeBadge: {
      borderRadius: radius.full, borderWidth: 1,
      paddingHorizontal: spacing.sm, paddingVertical: 2,
    },
    gradeBadgeText: { fontSize: 10, fontWeight: fontWeight.black },
    actionRow: { flexDirection: 'row', gap: spacing.sm },
    roleBtn: {
      flex: 1, paddingVertical: spacing.sm,
      borderRadius: radius.md, borderWidth: 1, borderColor: c.border,
      alignItems: 'center', backgroundColor: c.bg,
    },
    roleBtnText: { color: c.textMuted, fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
    deleteBtn: {
      paddingVertical: spacing.sm, paddingHorizontal: spacing.lg,
      borderRadius: radius.md, borderWidth: 1,
      borderColor: c.danger + '55', backgroundColor: c.danger + '11',
      alignItems: 'center',
    },
    deleteBtnText: { color: c.danger, fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
    empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
    emptyIcon: { fontSize: 40 },
    emptyText: { color: c.textMuted, fontSize: fontSize.md },

    modalOverlay: {
      flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    modalSheet: {
      backgroundColor: c.bgCard,
      borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
      borderWidth: 1, borderColor: c.border,
      padding: spacing.xl, paddingBottom: spacing.xxl,
    },
    modalHandle: {
      width: 40, height: 4, borderRadius: 2,
      backgroundColor: c.border, alignSelf: 'center', marginBottom: spacing.lg,
    },
    modalTitle: { color: c.text, fontSize: fontSize.xl, fontWeight: fontWeight.black, marginBottom: spacing.xs },
    modalSubtitle: { color: c.textMuted, fontSize: fontSize.sm, marginBottom: spacing.lg },
    modalOptions: { gap: spacing.sm, marginBottom: spacing.lg },
    modalRoleBtn: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.md,
      backgroundColor: c.bg, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border, padding: spacing.md,
    },
    modalRoleInfo: { flex: 1 },
    modalRoleLabel: { color: c.text, fontSize: fontSize.md, fontWeight: fontWeight.bold },
    modalRoleDesc: { color: c.textFaint, fontSize: fontSize.xs, marginTop: 2 },
    modalCheck: { fontSize: 20, fontWeight: fontWeight.black },
    modalCancel: {
      paddingVertical: spacing.md, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border, alignItems: 'center',
    },
    modalCancelText: { color: c.textMuted, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
    fieldLabel: { color: c.textMuted, fontSize: fontSize.sm, fontWeight: fontWeight.medium, marginBottom: spacing.xs, marginTop: spacing.md },
    fieldInput: {
      backgroundColor: c.bg, borderWidth: 1, borderColor: c.border,
      borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md,
      color: c.text, fontSize: fontSize.md,
    },
    rolePickerRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
    rolePick: {
      flex: 1, alignItems: 'center', gap: spacing.xs,
      paddingVertical: spacing.md, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border, backgroundColor: c.bg,
    },
    rolePickText: { color: c.textMuted, fontSize: fontSize.xs, fontWeight: fontWeight.bold },
    gradePickerRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
    gradePick: {
      flex: 1, alignItems: 'center',
      paddingVertical: spacing.sm, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border, backgroundColor: c.bg,
    },
    gradePickText: { color: c.textMuted, fontSize: fontSize.xs, fontWeight: fontWeight.bold },
    modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
    modalConfirm: {
      flex: 1, paddingVertical: spacing.md, borderRadius: radius.md,
      backgroundColor: c.superadmin, alignItems: 'center',
    },
    modalConfirmText: { color: c.white, fontSize: fontSize.md, fontWeight: fontWeight.black },
  });
