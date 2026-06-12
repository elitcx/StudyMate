import { Tabs, Redirect } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { fontSize, fontWeight } from '../../utils/theme';

const TabIcon = ({ name, focused, color }) => (
  <Ionicons name={focused ? name : `${name}-outline`} size={22} color={color} />
);

export default function AdminLayout() {
  const { user } = useAuth();
  const { colors } = useTheme();

  if (!user) return <Redirect href="/(auth)/login" />;
  if (user.role !== 'admin') return <Redirect href="/" />;

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
        tabBarActiveTintColor: colors.admin,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ title: 'Dashboard', tabBarIcon: ({ focused, color }) => <TabIcon name="bar-chart" focused={focused} color={color} /> }}
      />
      <Tabs.Screen
        name="classes"
        options={{ title: 'Kelas', tabBarIcon: ({ focused, color }) => <TabIcon name="library" focused={focused} color={color} /> }}
      />
      <Tabs.Screen
        name="create-class"
        options={{ title: 'Buat Kelas', tabBarIcon: ({ focused, color }) => <TabIcon name="add-circle" focused={focused} color={color} /> }}
      />
      <Tabs.Screen
        name="quizzes"
        options={{ title: 'Kuis', tabBarIcon: ({ focused, color }) => <TabIcon name="create" focused={focused} color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profil', tabBarIcon: ({ focused, color }) => <TabIcon name="person" focused={focused} color={color} /> }}
      />
      <Tabs.Screen name="add-material" options={{ href: null }} />
      <Tabs.Screen name="create-quiz" options={{ href: null }} />
      <Tabs.Screen name="edit-quiz" options={{ href: null }} />
    </Tabs>
  );
}
