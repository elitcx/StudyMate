import { Tabs, Redirect } from 'expo-router';
import { Text } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors, fontSize } from '../../utils/theme';

const TabIcon = ({ emoji, focused }) => (
  <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
);

export default function AdminLayout() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/(auth)/login" />;
  if (user.role !== 'admin') return <Redirect href="/" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgCard,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: colors.admin,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: { fontSize: fontSize.xs, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ title: 'Dashboard', tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} /> }}
      />
      <Tabs.Screen
        name="classes"
        options={{ title: 'Kelas', tabBarIcon: ({ focused }) => <TabIcon emoji="📚" focused={focused} /> }}
      />
      <Tabs.Screen
        name="create-class"
        options={{ title: 'Buat Kelas', tabBarIcon: ({ focused }) => <TabIcon emoji="➕" focused={focused} /> }}
      />
      <Tabs.Screen
        name="quizzes"
        options={{ title: 'Kuis', tabBarIcon: ({ focused }) => <TabIcon emoji="✏️" focused={focused} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profil', tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} /> }}
      />
      {/* Hidden from tab bar — navigated to via router.push */}
      <Tabs.Screen name="add-material" options={{ href: null }} />
      <Tabs.Screen name="create-quiz" options={{ href: null }} />
    </Tabs>
  );
}
