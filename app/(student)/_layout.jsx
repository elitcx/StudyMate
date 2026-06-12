import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';

export default function StudentLayout() {
  const { user } = useAuth();

  if (!user) return <Redirect href="/(auth)/login" />;
  if (user.role !== 'student') return <Redirect href="/" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
