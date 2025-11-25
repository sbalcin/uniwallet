import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useRouter} from 'expo-router';
import {Download, Plus} from 'lucide-react-native';
import {Card, Header, Screen} from '@/components';
import {colors, spacing, typography} from '@/theme';

export default function AddWalletScreen() {
    const router = useRouter();

    return (
        <Screen>
            <Header title="Add Wallet" showBack/>

            <View style={styles.content}>
                <Text style={styles.title}>Options</Text>

                <Card style={styles.optionCard} onPress={() => router.push('/onboarding/create')}>
                    <View style={styles.iconContainer}>
                        <Plus size={32} color={colors.primary}/>
                    </View>
                    <View style={styles.optionContent}>
                        <Text style={styles.optionTitle}>Create New Wallet</Text>
                        <Text style={styles.optionDescription}>
                            Generate a new wallet with a recovery phrase
                        </Text>
                    </View>
                </Card>

                <Card style={styles.optionCard} onPress={() => router.push('/onboarding/import')}>
                    <View style={styles.iconContainer}>
                        <Download size={32} color={colors.primary}/>
                    </View>
                    <View style={styles.optionContent}>
                        <Text style={styles.optionTitle}>Import Wallet</Text>
                        <Text style={styles.optionDescription}>
                            Restore an existing wallet with recovery phrase
                        </Text>
                    </View>
                </Card>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
    },
    title: {
        ...typography.displaySmall,
        color: colors.text,
        marginBottom: spacing.xl,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        padding: spacing.lg,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    optionContent: {
        flex: 1,
    },
    optionTitle: {
        ...typography.headingMedium,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    optionDescription: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
});