import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, StyleSheet, Image } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // Navigate based on authentication status
      if (isAuthenticated) {
        router.replace('/(main)');
      } else {
        router.replace('/(auth)');
      }
    }
  }, [isAuthenticated, isLoading]);

  // Show splash screen while determining auth status
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/splash-icon.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
});