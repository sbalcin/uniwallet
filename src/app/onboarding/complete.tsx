import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useRouter} from 'expo-router';
import {Button, Screen} from '@/components';
import {colors, spacing, typography} from '@/theme';

export default function CompleteScreen() {
    const router = useRouter();

    const handleContinue = () => {
        router.replace('/(tabs)' as any);
    };

    return (
        <Screen style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>✓</Text>
                </View>
                <Text style={styles.title}>Wallet Ready!</Text>
                <Text style={styles.description}>
                    Your wallet has been successfully set up. You can now start managing
                    your crypto assets.
                </Text>
            </View>

            <View style={styles.footer}>
                <Button title="Get Started" onPress={handleContinue}/>
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
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.success + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    icon: {
        fontSize: 48,
        color: colors.success,
    },
    title: {
        ...typography.displayMedium,
        color: colors.text,
        marginBottom: spacing.md,
        textAlign: 'center',
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