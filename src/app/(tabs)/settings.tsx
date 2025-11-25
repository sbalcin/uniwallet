import React from 'react';
import {Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
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
                    text: 'Delete',
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
        return `${address.slice(0, 8)}...${address.slice(-8)}`;
    };

    const getNetworkInfo = (network: string) => {
        const config = networkConfigs[network as NetworkType];
        return {
            name: config?.name || network,
            icon: config?.icon,
            color: config?.color || colors.primary,
        };
    };

    const settingsOptions = [
        {
            icon: Wallet,
            title: 'Manage Wallet',
            onPress: () => router.push('/manage-wallets'),
        },
        ...(wallet ? [{
            icon: Shield,
            title: 'Backup Wallet',
            onPress: () => router.push('/backup'),
        }] : []),
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
                    <Text style={styles.sectionTitle}>Wallet</Text>
                    <Card style={styles.walletInfoCard}>
                        <View style={styles.walletInfo}>
                            <View style={styles.walletIconContainer}>
                                <Wallet size={24} color={colors.primary}/>
                            </View>
                            <View style={styles.walletDetails}>
                                <Text style={styles.walletName}>{wallet?.name || 'My Wallet'}</Text>
                                <Text style={styles.walletStatus}>Active</Text>
                            </View>
                        </View>
                    </Card>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Settings</Text>
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
                        <Text style={styles.sectionTitle}>Network Addresses</Text>

                        {Object.entries(addresses).map(([network, address]) => {
                            const networkInfo = getNetworkInfo(network);
                            return (
                                <Card
                                    key={network}
                                    style={styles.networkCard}
                                    onPress={() => handleCopyAddress(address as string, networkInfo.name)}
                                >
                                    <View style={styles.networkContent}>
                                        <View style={styles.networkLeft}>
                                            <View style={[
                                                styles.networkIconContainer,
                                                {backgroundColor: networkInfo.color + '20'}
                                            ]}>
                                                <Image
                                                    source={networkInfo.icon}
                                                    style={styles.networkIconImage}
                                                />
                                            </View>
                                            <View style={styles.networkDetails}>
                                                <Text style={styles.networkName}>
                                                    {networkInfo.name}
                                                </Text>
                                                <Text style={styles.networkAddress}>
                                                    {formatAddress(address as string)}
                                                </Text>
                                            </View>
                                        </View>
                                        <Copy size={20} color={colors.primary}/>
                                    </View>
                                </Card>
                            );
                        })}
                    </View>
                )}

                {wallet && (
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={handleDeleteWallet}
                        >
                            <Trash2 size={20} color={colors.text}/>
                            <Text style={styles.deleteButtonText}>Delete Wallet</Text>
                        </TouchableOpacity>
                    </View>
                )}

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
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        ...typography.labelLarge,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: spacing.md,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    dangerSectionTitle: {
        ...typography.labelLarge,
        fontWeight: '600',
        color: colors.error,
        marginBottom: spacing.md,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    walletInfoCard: {
        padding: spacing.md,
    },
    walletInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    walletIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    walletDetails: {
        flex: 1,
    },
    walletName: {
        ...typography.bodyLarge,
        color: colors.text,
        fontWeight: '600',
        marginBottom: 4,
    },
    walletStatus: {
        ...typography.bodySmall,
        color: colors.success,
        fontWeight: '500',
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
    networkCard: {
        marginBottom: spacing.sm,
        padding: spacing.md,
    },
    networkContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    networkLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: spacing.md,
    },
    networkIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    networkIconImage: {
        width: 24,
        height: 24,
    },
    networkDetails: {
        flex: 1,
    },
    networkName: {
        ...typography.bodyMedium,
        color: colors.text,
        fontWeight: '600',
        marginBottom: 4,
    },
    networkAddress: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        fontFamily: 'monospace',
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
    warningText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 18,
    },
    footer: {
        alignItems: 'center',
        marginTop: spacing.lg,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.md,
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