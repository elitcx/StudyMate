import { Stack } from 'expo-router';
import { AuthProvider } from '../src/contexts/AuthContext';
import { DataProvider } from '../src/contexts/DataContext';
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';
import { StatusBar } from 'expo-status-bar';

function AppShell() {
  const { isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <AppShell />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
