import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useData } from '../../src/contexts/DataContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { spacing, radius, fontSize, fontWeight, getShadow } from '../../utils/theme';

// ---------------------------------------------------------------------------
// Sub-components — each calls useTheme() directly
// ---------------------------------------------------------------------------

const StatBox = ({ label, value, icon, color }) => {
  const { colors, isDark } = useTheme();
  const cardStyle = isDark
    ? {
        borderWidth: 1,
        borderColor: colors.border,
        borderTopWidth: 3,
        borderTopColor: color,
      }
    : {
        borderTopWidth: 3,
        borderTopColor: color,
        ...getShadow(isDark).sm,
      };

  return (
    <View
      style={[
        {
          width: '47%',
          backgroundColor: colors.bgCard,
          borderRadius: radius.md,
          padding: spacing.md,
          alignItems: 'center',
        },
        cardStyle,
      ]}
    >
      <Text style={{ fontSize: 18, marginBottom: 4 }}>{icon}</Text>
      <Text style={{ color, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}>
        {value}
      </Text>
      <Text
        style={{
          color: colors.textMuted,
          fontSize: fontSize.xs,
          marginTop: 2,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </View>
  );
};

const InfoRow = ({ label, value, isLast }) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: spacing.md,
        },
        !isLast && {
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>{label}</Text>
      <Text
        style={{ color: colors.text, fontSize: fontSize.sm, fontWeight: fontWeight.medium }}
      >
        {value}
      </Text>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function ProfileScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  const { user, logout } = useAuth();
  const { subjects, getUserScores, quizzes } = useData();
  const router = useRouter();

  const mySubjects = subjects.filter((sub) => user?.enrolledSubjects?.includes(sub.id));
  const myScores = getUserScores(user?.id || '');
  const avgScore = myScores.length
    ? Math.round(myScores.reduce((a, sc) => a + sc.percentage, 0) / myScores.length)
    : 0;
  const bestScore = myScores.length ? Math.max(...myScores.map((sc) => sc.percentage)) : 0;

  const confirmLogout = () => {
    Alert.alert('Keluar', 'Yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Avatar section */}
        <View style={s.avatarSection}>
          <View style={s.avatarWrap}>
            <Text style={s.avatarEmoji}>{user?.avatar}</Text>
          </View>
          <Text style={s.name}>{user?.name}</Text>
          <Text style={s.email}>{user?.email}</Text>
          {user?.grade ? (
            <View style={[s.gradeBadge, { marginBottom: spacing.xs }]}>
              <Text style={s.gradeBadgeText}>Kelas {user.grade}</Text>
            </View>
          ) : null}
          <View style={s.roleBadge}>
            <Text style={s.roleText}>🎓 Siswa</Text>
          </View>
        </View>

        {/* Stats 2×2 grid */}
        <View style={s.statsGrid}>
          <StatBox label="Kelas" value={mySubjects.length} icon="📖" color={colors.accent} />
          <StatBox label="Kuis Selesai" value={myScores.length} icon="✅" color={colors.success} />
          <StatBox
            label="Rata-rata"
            value={myScores.length ? `${avgScore}%` : '--'}
            icon="📊"
            color={colors.warning}
          />
          <StatBox
            label="Skor Terbaik"
            value={myScores.length ? `${bestScore}%` : '--'}
            icon="🏆"
            color={colors.admin}
          />
        </View>

        {/* Kelas Saya */}
        <Text style={s.sectionTitle}>Kelas Saya</Text>
        {mySubjects.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyText}>Belum terdaftar di kelas apapun</Text>
          </View>
        ) : (
          mySubjects.map((sub) => {
            const rowStyle = isDark
              ? [s.subjectRow, { borderWidth: 1, borderColor: colors.border }]
              : [s.subjectRow, getShadow(isDark).sm];
            return (
              <View key={sub.id} style={rowStyle}>
                <View style={[s.subjectIcon, { backgroundColor: sub.color + '22' }]}>
                  <Text style={{ fontSize: 20 }}>{sub.icon}</Text>
                </View>
                <View style={s.subjectInfo}>
                  <Text style={s.subjectName}>{sub.title}</Text>
                  <Text style={s.subjectMeta}>
                    {sub.materialsCount} materi · {sub.quizzesCount} kuis
                  </Text>
                </View>
              </View>
            );
          })
        )}

        {/* Riwayat Nilai */}
        {myScores.length > 0 && (
          <>
            <Text style={[s.sectionTitle, { marginTop: spacing.lg }]}>Riwayat Nilai</Text>
            {myScores.map((sc) => {
              const quiz = quizzes.find((q) => q.id === sc.quizId);
              const sub = subjects.find((su) => su.id === sc.subjectId);
              const pctColor =
                sc.percentage >= 70
                  ? colors.success
                  : sc.percentage >= 50
                  ? colors.warning
                  : colors.danger;
              const scoreRowStyle = isDark
                ? [s.scoreRow, { borderWidth: 1, borderColor: colors.border }]
                : [s.scoreRow, getShadow(isDark).sm];
              return (
                <View key={sc.id} style={scoreRowStyle}>
                  <View style={s.scoreLeft}>
                    <Text style={s.scoreQuiz}>{quiz?.title || 'Kuis'}</Text>
                    <Text style={s.scoreSub}>
                      {sub?.title} · {sc.completedAt}
                    </Text>
                  </View>
                  <View
                    style={[
                      s.scoreBadge,
                      { backgroundColor: pctColor + '22', borderColor: pctColor + '55' },
                    ]}
                  >
                    <Text style={[s.scoreValue, { color: pctColor }]}>
                      {sc.percentage}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* Info Akun */}
        <Text style={[s.sectionTitle, { marginTop: spacing.lg }]}>Info Akun</Text>
        <View style={s.infoCard}>
          <InfoRow label="Nama" value={user?.name} />
          <InfoRow label="Email" value={user?.email} />
          <InfoRow label="Peran" value="Siswa" />
          <InfoRow label="ID Pengguna" value={`#${user?.id}`} isLast />
        </View>

        {/* Theme Toggle */}
        <TouchableOpacity style={[s.navBtn, { borderColor: colors.accent + '55' }]} onPress={toggleTheme}>
          <Text style={[s.navBtnText, { color: colors.accent }]}>{isDark ? '☀️ Mode Terang' : '🌙 Mode Gelap'}</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={s.logoutBtn} onPress={confirmLogout}>
          <Text style={s.logoutText}>🚪  Keluar</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles factory
// ---------------------------------------------------------------------------

const makeStyles = (c, isDark) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },

    // Avatar section
    avatarSection: { alignItems: 'center', marginBottom: spacing.xl },
    avatarWrap: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: c.accent + '18',
      borderWidth: 2,
      borderColor: c.accent + '55',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    avatarEmoji: { fontSize: 40 },
    name: { color: c.text, fontSize: fontSize.xxl, fontWeight: fontWeight.bold },
    email: { color: c.textMuted, fontSize: fontSize.sm, marginTop: 2 },
    gradeBadge: {
      marginTop: spacing.sm,
      backgroundColor: c.bgElevated,
      borderRadius: radius.full,
      paddingHorizontal: spacing.md,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: c.border,
    },
    gradeBadgeText: {
      color: c.textMuted,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
    },
    roleBadge: {
      marginTop: spacing.sm,
      backgroundColor: c.accent + '22',
      borderRadius: radius.full,
      paddingHorizontal: spacing.md,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: c.accent + '44',
    },
    roleText: { color: c.accent, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

    // Stats grid
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginBottom: spacing.xl,
    },

    // Section titles
    sectionTitle: {
      color: c.text,
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      marginBottom: spacing.md,
    },

    // Empty card
    emptyCard: {
      backgroundColor: c.bgCard,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border,
      padding: spacing.lg,
      alignItems: 'center',
    },
    emptyText: { color: c.textMuted, fontSize: fontSize.sm },

    // Subject rows
    subjectRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.bgCard,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
      gap: spacing.md,
    },
    subjectIcon: {
      width: 40,
      height: 40,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    subjectInfo: { flex: 1 },
    subjectName: { color: c.text, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
    subjectMeta: { color: c.textFaint, fontSize: fontSize.xs, marginTop: 2 },

    // Score rows
    scoreRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: c.bgCard,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    scoreLeft: { flex: 1 },
    scoreQuiz: { color: c.text, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
    scoreSub: { color: c.textMuted, fontSize: fontSize.xs, marginTop: 2 },
    scoreBadge: {
      borderRadius: radius.full,
      borderWidth: 1,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    scoreValue: { fontSize: fontSize.sm, fontWeight: fontWeight.black },

    // Info card (grouped list)
    infoCard: {
      backgroundColor: c.bgCard,
      borderRadius: radius.md,
      borderWidth: isDark ? 1 : 0,
      borderColor: c.border,
      marginBottom: spacing.xl,
      overflow: 'hidden',
      ...(isDark ? {} : getShadow(isDark).sm),
    },

    // Theme toggle & Logout
    navBtn: {
      backgroundColor: c.bgCard,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: spacing.sm,
      ...(isDark ? {} : getShadow(isDark).sm),
    },
    navBtnText: { color: c.accent, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
    logoutBtn: {
      backgroundColor: c.danger + '18',
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.danger + '55',
    },
    logoutText: { color: c.danger, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  });
