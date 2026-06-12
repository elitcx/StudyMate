import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { fontSize, fontWeight } from '../../../utils/theme';

const TabIcon = ({ name, focused, color }) => (
  <Ionicons name={focused ? name : `${name}-outline`} size={22} color={color} />
);

export default function StudentTabsLayout() {
  const { colors } = useTheme();

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
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: 'Beranda', tabBarIcon: ({ focused, color }) => <TabIcon name="home" focused={focused} color={color} /> }}
      />
      <Tabs.Screen
        name="classes"
        options={{ title: 'Kelas', tabBarIcon: ({ focused, color }) => <TabIcon name="book" focused={focused} color={color} /> }}
      />
      <Tabs.Screen
        name="tests"
        options={{ title: 'Ujian', tabBarIcon: ({ focused, color }) => <TabIcon name="calendar" focused={focused} color={color} /> }}
      />
      <Tabs.Screen
        name="banksoal"
        options={{ title: 'Bank Soal', tabBarIcon: ({ focused, color }) => <TabIcon name="document-text" focused={focused} color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profil', tabBarIcon: ({ focused, color }) => <TabIcon name="person" focused={focused} color={color} /> }}
      />
    </Tabs>
  );
}
