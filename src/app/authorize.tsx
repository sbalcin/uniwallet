import React, {useEffect, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {useRouter} from 'expo-router';
import {useWallet} from '@tetherto/wdk-react-native-provider';
import {Fingerprint} from 'lucide-react-native';
import {Button, Screen} from '@/components';
import {colors, spacing, typography} from '@/theme';
import getErrorMessage from "@/utils/get-error-message";

export default function AuthorizeScreen() {
    const router = useRouter();
    const {wallet, unlockWallet} = useWallet();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [authAttempts, setAuthAttempts] = useState(0);

    useEffect(() => {
        if (authAttempts === 0) {
            void handleAuthorize();
        }
    }, []);

    const handleAuthorize = async () => {
        if (!wallet) {
            Alert.alert('Error', 'No wallet found');
            router.replace('/onboarding');
            return;
        }

        setIsLoading(true);
        setError(null);
        setAuthAttempts(prev => prev + 1);

        try {
            const isDone = await unlockWallet();
            if (isDone) {
                router.replace('/(tabs)');
            }
        } catch (error) {
            const errorMessage = getErrorMessage(error, 'Failed to unlock wallet');

            const isCancellation =
                errorMessage.includes('Cancel') ||
                errorMessage.includes('User canceled') ||
                errorMessage.includes('Authentication failed');

            if (isCancellation) {
                setError('Authentication cancelled. Please try again.');
            } else {
                setError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleBiometricAuth = async () => {
        setError(null);
        await handleAuthorize();
    };

    return (
        <Screen style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Fingerprint size={64} color={colors.primary}/>
                </View>
                <Text style={styles.title}>Unlock Wallet</Text>
                <Text style={styles.description}>
                    {'Use biometric authentication to unlock your wallet'}
                </Text>

                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {authAttempts > 0 && (
                    <Text style={styles.attemptsText}>
                        Attempts: {authAttempts}
                    </Text>
                )}
            </View>

            <View style={styles.footer}>
                <Button
                    title={'Unlock with Biometric'}
                    onPress={handleBiometricAuth}
                    loading={isLoading}
                    disabled={isLoading}
                />

                {authAttempts > 5 && (
                    <Button
                        title="Go to Onboarding"
                        onPress={() => router.replace('/onboarding')}
                        style={styles.secondaryButton}
                        variant="outline"
                    />
                )}
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
    errorContainer: {
        marginTop: spacing.lg,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        borderRadius: 8,
        maxWidth: '90%',
    },
    errorText: {
        ...typography.bodyMedium,
        color: '#ff3b30',
        textAlign: 'center',
    },
    attemptsText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        marginTop: spacing.md,
    },
    footer: {
        paddingBottom: spacing.xl,
        gap: spacing.md,
    },
    secondaryButton: {
        marginTop: spacing.md,
    },
});