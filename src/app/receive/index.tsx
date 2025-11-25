import React, {useMemo, useState} from 'react';
import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import {useRouter} from 'expo-router';
import {NetworkType, useWallet} from '@tetherto/wdk-react-native-provider';
import {ChevronRight, X} from 'lucide-react-native';
import {Screen} from '@/components';
import {colors, spacing, typography} from '@/theme';
import {assetConfig} from '@/config/assets';
import {networkConfigs} from '@/config/networks';
import getDisplaySymbol from '@/utils/get-display-symbol';

interface TokenOption {
    id: string;
    symbol: string;
    name: string;
    icon: any;
    color: string;
    networks: NetworkOption[];
}

interface NetworkOption {
    id: NetworkType;
    name: string;
    address: string;
    icon: any;
    color: string;
    description: string;
}

const NETWORK_DESCRIPTIONS = {
    [NetworkType.ETHEREUM]: 'ERC20',
    [NetworkType.POLYGON]: 'Polygon Network',
    [NetworkType.ARBITRUM]: 'Arbitrum One',
    [NetworkType.TON]: 'TON Network',
    [NetworkType.TRON]: 'Tron Network',
    [NetworkType.SOLANA]: 'Solana Network',
    [NetworkType.SEGWIT]: 'Native Bitcoin',
    [NetworkType.LIGHTNING]: 'Lightning Network',
};

export default function ReceiveScreen() {
    const router = useRouter();
    const {wallet, addresses} = useWallet();
    const [selectedToken, setSelectedToken] = useState<string | null>(null);

    const tokenOptions: TokenOption[] = useMemo(() => {
        if (!wallet?.enabledAssets) return [];

        return wallet.enabledAssets
            .map(assetSymbol => {
                const config = assetConfig[assetSymbol as keyof typeof assetConfig];
                if (!config) return null;

                const networks = config.supportedNetworks
                    .map(networkType => {
                        const network = networkConfigs[networkType];
                        const address = addresses?.[networkType];
                        if (!address) return null;

                        return {
                            id: networkType,
                            name: network.name,
                            address: address as string,
                            icon: network.icon,
                            color: network.color,
                            description: NETWORK_DESCRIPTIONS[networkType] || network.name,
                        };
                    })
                    .filter(Boolean) as NetworkOption[];

                if (networks.length === 0) return null;

                return {
                    id: assetSymbol,
                    symbol: getDisplaySymbol(assetSymbol),
                    name: config.name,
                    icon: config.icon,
                    color: config.color,
                    networks,
                };
            })
            .filter(Boolean) as TokenOption[];
    }, [wallet?.enabledAssets, addresses]);

    const handleSelectNetwork = (token: TokenOption, network: NetworkOption) => {
        router.push({
            pathname: '/receive/details',
            params: {
                tokenId: token.id,
                tokenSymbol: token.symbol,
                tokenName: token.name,
                networkId: network.id,
                networkName: network.name,
                address: network.address,
            },
        });
    };

    const handleClose = () => {
        router.back();
    };

    return (
        <Screen>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Receive Crypto</Text>
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                    <X size={24} color={colors.text}/>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.description}>
                    Select the asset and network to receive funds
                </Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select Asset</Text>

                    {tokenOptions.map(token => (
                        <View key={token.id} style={styles.tokenContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.tokenCard,
                                    selectedToken === token.id && styles.tokenCardSelected,
                                ]}
                                onPress={() => setSelectedToken(token.id)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.tokenInfo}>
                                    <View style={[styles.tokenIcon, {backgroundColor: token.color}]}>
                                        <Image source={token.icon} style={styles.tokenIconImage}/>
                                    </View>
                                    <View style={styles.tokenDetails}>
                                        <Text style={styles.tokenName}>{token.name}</Text>
                                        <Text style={styles.tokenSymbol}>
                                            {token.networks.length} network{token.networks.length > 1 ? 's' : ''} available
                                        </Text>
                                    </View>
                                </View>
                                <ChevronRight
                                    size={20}
                                    color={selectedToken === token.id ? colors.primary : colors.textTertiary}
                                />
                            </TouchableOpacity>

                            {selectedToken === token.id && (
                                <View style={styles.networksContainer}>
                                    <Text style={styles.networksSectionTitle}>Select Network</Text>
                                    {token.networks.map(network => (
                                        <TouchableOpacity
                                            key={network.id}
                                            style={styles.networkCard}
                                            onPress={() => handleSelectNetwork(token, network)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={styles.networkInfo}>
                                                <View style={[styles.networkIcon, {backgroundColor: network.color}]}>
                                                    <Image source={network.icon} style={styles.networkIconImage}/>
                                                </View>
                                                <View style={styles.networkDetails}>
                                                    <Text style={styles.networkName}>{network.name}</Text>
                                                    <Text style={styles.networkDescription}>{network.description}</Text>
                                                </View>
                                            </View>
                                            <ChevronRight size={18} color={colors.textTertiary}/>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
    },
    headerTitle: {
        ...typography.displaySmall,
        color: colors.text,
    },
    closeButton: {
        padding: spacing.xs,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: spacing.xl,
    },
    description: {
        ...typography.bodyMedium,
        color: colors.textSecondary,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.lg,
    },
    section: {
        paddingHorizontal: spacing.md,
    },
    sectionTitle: {
        ...typography.labelLarge,
        color: colors.textSecondary,
        marginBottom: spacing.md,
        fontWeight: '600',
    },
    tokenContainer: {
        marginBottom: spacing.sm,
    },
    tokenCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing.md,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    tokenCardSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '10',
    },
    tokenInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    tokenIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    tokenIconImage: {
        width: 24,
        height: 24,
    },
    tokenDetails: {
        flex: 1,
    },
    tokenName: {
        ...typography.bodyLarge,
        color: colors.text,
        fontWeight: '600',
        marginBottom: 2,
    },
    tokenSymbol: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    networksContainer: {
        marginTop: spacing.sm,
        marginLeft: spacing.lg,
        paddingLeft: spacing.md,
        borderLeftWidth: 2,
        borderLeftColor: colors.primary,
    },
    networksSectionTitle: {
        ...typography.labelSmall,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        fontWeight: '600',
    },
    networkCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 8,
        padding: spacing.sm,
        marginBottom: spacing.xs,
    },
    networkInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    networkIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    networkIconImage: {
        width: 18,
        height: 18,
    },
    networkDetails: {
        flex: 1,
    },
    networkName: {
        ...typography.bodyMedium,
        color: colors.text,
        fontWeight: '500',
        marginBottom: 2,
    },
    networkDescription: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing.xxl,
        paddingHorizontal: spacing.xl,
    },
    emptyText: {
        ...typography.headingMedium,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    emptySubtext: {
        ...typography.bodyMedium,
        color: colors.textTertiary,
        textAlign: 'center',
    },
});