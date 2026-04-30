import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();

  // While Firebase resolves the persisted session, show a spinner.
  // This keeps the Stack mounted so all routes stay registered.
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  if (!user) return <Redirect href="/(auth)/welcome" />;
  if (user.role === 'superadmin') return <Redirect href="/(superadmin)/dashboard" />;
  if (user.role === 'admin')      return <Redirect href="/(admin)/dashboard" />;
  return <Redirect href="/(student)/home" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
