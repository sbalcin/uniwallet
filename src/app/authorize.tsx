import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useWallet } from '@tetherto/wdk-react-native-provider';
import { Fingerprint } from 'lucide-react-native';
import { Screen, Button } from '@/components';
import { colors, typography, spacing } from '@/theme';
import { BiometricService } from '@/services/biometric.service';
import getErrorMessage from "@/utils/get-error-message";


export default function AuthorizeScreen() {
  const router = useRouter();
  const { wallet, unlockWallet } = useWallet();
  //const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleAuthorize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAuthorize = async () => {
    if (!wallet) {
      Alert.alert('Error', 'No wallet found');
      router.replace('/onboarding');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const isDone = await unlockWallet();
      if (isDone) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Failed to unlock wallet:', error);
      setError(getErrorMessage(error, 'Failed to unlock wallet'));
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    handleAuthorize();
  };


  /*useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    const available = await BiometricService.isAvailable();
    setBiometricAvailable(available);
    if (available) {
      handleBiometricAuth();
    }
  };

  const handleBiometricAuth = async () => {
    try {
      setLoading(true);
      const success = await BiometricService.authenticate('Unlock your wallet');

      if (success) {
        await unlock();
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Biometric auth error:', error);
      Alert.alert('Error', 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };*/

  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Fingerprint size={64} color={colors.primary} />
        </View>
        <Text style={styles.title}>Unlock Wallet</Text>
        <Text style={styles.description}>
          {biometricAvailable
            ? 'Use biometric authentication to unlock your wallet'
            : 'Authenticate to continue'}
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          title={biometricAvailable ? 'Unlock with Biometric' : 'Unlock'}
          onPress={handleBiometricAuth}
          loading={isLoading}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.displayMedium,
    color: colors.text,
    marginBottom: spacing.md,
  },
  description: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  footer: {
    paddingBottom: spacing.xl,
  },
});