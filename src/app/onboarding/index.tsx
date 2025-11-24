import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useRouter} from 'expo-router';
import {Button, Screen} from '@/components';
import {colors, spacing, typography} from '@/theme';
import {Globe, Lock, Rocket} from "lucide-react-native";

export default function OnboardingScreen() {
    const router = useRouter();

    return (
        <Screen style={styles.container}>
            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <View style={styles.logo}>
                        <Text style={styles.logoText}>UW</Text>
                    </View>
                    <Text style={styles.title}>UniWallet</Text>
                    <Text style={styles.subtitle}>Your secure crypto wallet</Text>
                </View>

                <View style={styles.features}>
                    <View style={styles.feature}>
                        <Lock size={32} color={colors.textSecondary}/>
                        <Text style={styles.featureText}>Secure & Private</Text>
                    </View>
                    <View style={styles.feature}>
                        <Rocket size={32} color={colors.textSecondary}/>
                        <Text style={styles.featureText}>Fast Transactions</Text>
                    </View>
                    <View style={styles.feature}>
                        <Globe size={32} color={colors.textSecondary}/>
                        <Text style={styles.featureText}>Multi-Chain Support</Text>
                    </View>
                </View>
            </View>

            <View style={styles.actions}>
                <Button
                    title="Create New Wallet"
                    onPress={() => router.push('/onboarding/create')}
                    style={styles.button}
                />
                <Button
                    title="Import Existing Wallet"
                    onPress={() => router.push('/onboarding/import')}
                    variant="outline"
                    style={styles.button}
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
    logoContainer: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    logoText: {
        ...typography.displayMedium,
        color: colors.text,
        fontWeight: '700',
    },
    title: {
        ...typography.displayLarge,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.bodyLarge,
        color: colors.textSecondary,
    },
    features: {
        gap: spacing.lg,
    },
    feature: {
        alignItems: 'center',
        gap: spacing.xs,
    },
    featureText: {
        ...typography.bodyMedium,
        color: colors.textSecondary,
    },
    actions: {
        paddingBottom: spacing.xl,
        gap: spacing.md,
    },
    button: {
        width: '100%',
    },
});