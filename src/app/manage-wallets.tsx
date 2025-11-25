import React from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useRouter} from 'expo-router';
import {useWallet} from '@tetherto/wdk-react-native-provider';
import {Key, Megaphone, Plus} from 'lucide-react-native';
import {Card, Header, Screen} from '@/components';
import {colors, spacing, typography} from '@/theme';

export default function ManageWalletsScreen() {
    const router = useRouter();
    const {wallet} = useWallet();

    return (
        <Screen>
            <Header title="Manage Wallet" showBack/>

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>Current Wallet</Text>

                <Card style={styles.walletCard}>

                    <View style={styles.walletInfo}>
                        <Text style={styles.walletName}>{wallet?.name || 'My Wallet'}</Text>
                        <Text style={styles.walletLabel}>Active</Text>
                    </View>

                    <View style={styles.activeIndicator}>
                        <View style={styles.activeDot}/>
                    </View>
                </Card>

                <Text style={styles.description}>
                    This is your currently active wallet. All transactions and balances are associated with this wallet.
                </Text>

                <View style={styles.optionsSection}>
                    <Text style={styles.sectionTitle}>Options</Text>

                    <TouchableOpacity style={styles.optionCard} onPress={() => router.push('/onboarding/create')}>
                        <View style={styles.optionIcon}>
                            <Plus size={24} color={colors.primary}/>
                        </View>
                        <View style={styles.optionContent}>
                            <Text style={styles.optionTitle}>Create New Wallet</Text>
                            <Text style={styles.optionDescription}>
                                Generate a new wallet with a new recovery phrase
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionCard} onPress={() => router.push('/onboarding/import')}>
                        <View style={styles.optionIcon}>
                            <Key size={24} color={colors.primary}/>
                        </View>
                        <View style={styles.optionContent}>
                            <Text style={styles.optionTitle}>Import Wallet</Text>
                            <Text style={styles.optionDescription}>
                                Restore a wallet using your recovery phrase
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.noteContainer}>
                    <Megaphone size={16} color={colors.warning} style={styles.warningIcon}/>
                    <Text style={styles.noteText}>
                        Tip: Make sure to backup your recovery phrase before creating or importing a new wallet. You'll
                        need it to restore access to your funds.
                    </Text>
                </View>
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
    },
    sectionTitle: {
        ...typography.labelLarge,
        color: colors.textSecondary,
        marginTop: spacing.lg,
        marginBottom: spacing.md,
        fontWeight: '600',
    },
    walletCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    walletIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    walletIconText: {
        fontSize: 28,
    },
    walletInfo: {
        flex: 1,
    },
    walletName: {
        ...typography.headingMedium,
        color: colors.text,
        marginBottom: 4,
    },
    walletLabel: {
        ...typography.bodySmall,
        color: colors.success,
        fontWeight: '600',
    },
    activeIndicator: {
        marginLeft: spacing.sm,
    },
    activeDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.success,
    },
    description: {
        ...typography.bodyMedium,
        color: colors.textSecondary,
        lineHeight: 22,
        marginBottom: spacing.lg,
    },
    optionsSection: {
        marginTop: spacing.md,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    optionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    optionContent: {
        flex: 1,
    },
    optionTitle: {
        ...typography.bodyLarge,
        color: colors.text,
        fontWeight: '600',
        marginBottom: 4,
    },
    optionDescription: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        lineHeight: 18,
    },
    noteContainer: {
        flexDirection: 'row',
        backgroundColor: colors.warning + '15',
        borderRadius: 12,
        padding: spacing.md,
        marginTop: spacing.lg,
        borderWidth: 1,
        borderColor: colors.warning + '30',
    },
    warningIcon: {
        marginTop: 4,
        marginRight: spacing.sm,
    },
    noteText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        lineHeight: 20,
    },
});