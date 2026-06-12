import { Tabs, Redirect } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { fontSize, fontWeight } from '../../utils/theme';

const TabIcon = ({ name, focused, color }) => (
  <Ionicons name={focused ? name : `${name}-outline`} size={22} color={color} />
);

export default function SuperAdminLayout() {
  const { user } = useAuth();
  const { colors } = useTheme();

  if (!user) return <Redirect href="/(auth)/login" />;
  if (user.role !== 'superadmin') return <Redirect href="/" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgCard,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: Platform.OS === 'ios' ? 82 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.superadmin,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ title: 'Dashboard', tabBarIcon: ({ focused, color }) => <TabIcon name="flash" focused={focused} color={color} /> }}
      />
      <Tabs.Screen
        name="users"
        options={{ title: 'Pengguna', tabBarIcon: ({ focused, color }) => <TabIcon name="people" focused={focused} color={color} /> }}
      />
      <Tabs.Screen
        name="content"
        options={{ title: 'Konten', tabBarIcon: ({ focused, color }) => <TabIcon name="layers" focused={focused} color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profil', tabBarIcon: ({ focused, color }) => <TabIcon name="person" focused={focused} color={color} /> }}
      />
    </Tabs>
  );
}
