import React from 'react';
import {Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useRouter} from 'expo-router';
import {NetworkType, useWallet} from '@tetherto/wdk-react-native-provider';
import * as Clipboard from 'expo-clipboard';
import {ChevronRight, Copy, Info, Key, Shield, Trash2, Wallet,} from 'lucide-react-native';
import {Card, Screen} from '@/components';
import {colors, spacing, typography} from '@/theme';
import {toast} from 'sonner-native';
import {networkConfigs} from "@/config/networks";

export default function SettingsScreen() {
    const router = useRouter();
    const {wallet, clearWallet, addresses} = useWallet();

    const handleDeleteWallet = () => {
        Alert.alert(
            'Delete Wallet',
            'This will permanently delete your wallet and all associated data. Make sure you have backed up your recovery phrase. This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete Wallet',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await clearWallet();
                            toast.success('Wallet deleted successfully');
                            router.replace('/');
                        } catch (error) {
                            console.error('Failed to delete wallet:', error);
                            toast.error('Failed to delete wallet');
                        }
                    },
                },
            ]
        );
    };

    const handleCopyAddress = async (address: string, networkName: string) => {
        await Clipboard.setStringAsync(address);
        toast.success(`${networkName} address copied`);
    };

    const formatAddress = (address: string) => {
        if (!address) return 'N/A';
        if (address.length <= 15) return address;
        return `${address.slice(0, 10)}...${address.slice(-10)}`;
    };

    const getNetworkName = (network: string) => {
        return networkConfigs[network as NetworkType]?.name || network;
    };

    const settingsOptions = [
        {
            icon: Wallet,
            title: 'Manage Wallets',
            onPress: () => router.push('/manage-wallets'),
        },
        {
            icon: Key,
            title: 'Security & Privacy',
            onPress: () => router.push('/security'),
        },
        {
            icon: Shield,
            title: 'Backup Wallet',
            onPress: () => router.push('/backup'),
        },
        {
            icon: Info,
            title: 'About',
            onPress: () => router.push('/about'),
        },
    ];

    return (
        <Screen>
            <View style={styles.header}>
                <Text style={styles.title}>Settings</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >

                <View style={styles.section}>
                    {settingsOptions.map((option, index) => (
                        <Card
                            key={index}
                            style={styles.optionCard}
                            onPress={option.onPress}
                        >
                            <View style={styles.optionContent}>
                                <View style={styles.optionLeft}>
                                    <option.icon size={20} color={colors.primary}/>
                                    <Text style={styles.optionTitle}>{option.title}</Text>
                                </View>
                                <ChevronRight size={20} color={colors.textTertiary}/>
                            </View>
                        </Card>
                    ))}
                </View>

                {addresses && Object.keys(addresses).length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Shield size={20} color={colors.primary}/>
                            <Text style={styles.sectionTitle}>{wallet?.name || 'Unknown'}: Network Addresses</Text>
                        </View>

                        <Card style={styles.addressCard}>
                            {Object.entries(addresses).map(([network, address], index, array) => (
                                <TouchableOpacity
                                    key={network}
                                    style={[
                                        styles.addressRow,
                                        index === array.length - 1 ? styles.addressRowLast : null,
                                    ]}
                                    onPress={() => handleCopyAddress(address as string, getNetworkName(network))}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.addressContent}>
                                        <Text style={styles.networkLabel}>{getNetworkName(network)}</Text>
                                        <Text style={styles.addressValue}>{formatAddress(address as string)}</Text>
                                    </View>
                                    <Copy size={18} color={colors.primary}/>
                                </TouchableOpacity>
                            ))}
                        </Card>
                    </View>
                )}

                <View style={styles.actionsSection}>

                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDeleteWallet}
                    >
                        <Trash2 size={20} color={colors.text}/>
                        <Text style={styles.deleteButtonText}>Delete Wallet</Text>
                    </TouchableOpacity>

                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Built with Tether WDK</Text>
                    <Text style={styles.copyright}>© 2025 UniWallet</Text>
                </View>
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.displaySmall,
        color: colors.text,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: spacing.xl,
    },
    section: {
        paddingHorizontal: spacing.md,
        marginBottom: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        ...typography.bodyLarge,
        fontWeight: '600',
        color: colors.text,
        marginLeft: spacing.sm,
    },
    infoCard: {
        padding: spacing.md,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoLabel: {
        ...typography.bodyMedium,
        color: colors.textSecondary,
    },
    infoValue: {
        ...typography.bodyMedium,
        color: colors.text,
        fontWeight: '500',
    },
    addressCard: {
        padding: spacing.md,
    },
    addressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    addressRowLast: {
        borderBottomWidth: 0,
    },
    addressContent: {
        flex: 1,
        marginRight: spacing.md,
    },
    networkLabel: {
        ...typography.bodyMedium,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    addressValue: {
        ...typography.bodySmall,
        color: colors.text,
        fontFamily: 'monospace',
    },
    optionCard: {
        marginBottom: spacing.sm,
    },
    optionContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    optionTitle: {
        ...typography.bodyMedium,
        color: colors.text,
    },
    actionsSection: {
        paddingHorizontal: spacing.md,
        marginTop: spacing.lg,
    },
    lockButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: 12,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.sm,
    },
    lockText: {
        ...typography.bodyMedium,
        color: colors.text,
        fontWeight: '600',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: 12,
        backgroundColor: colors.error,
        marginBottom: spacing.sm,
    },
    deleteButtonText: {
        ...typography.bodyMedium,
        color: colors.text,
        fontWeight: '600',
    },
    footer: {
        alignItems: 'center',
        marginTop: spacing.xl,
        paddingVertical: spacing.lg,
    },
    footerText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    copyright: {
        ...typography.bodySmall,
        color: colors.textTertiary,
    },
});