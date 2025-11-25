import React, {useEffect, useState} from 'react';
import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import {useRouter} from 'expo-router';
import {AssetTicker, NetworkType, useWallet} from '@tetherto/wdk-react-native-provider';
import {ChevronRight, X} from 'lucide-react-native';
import {Screen} from '@/components';
import {colors, spacing, typography} from '@/theme';
import {assetConfig} from '@/config/assets';
import {networkConfigs} from '@/config/networks';
import getDisplaySymbol from '@/utils/get-display-symbol';
import {formatTokenAmount} from '@/utils/format';
import {FiatCurrency, pricingService} from '@/services/pricing.service';
import {formatAmount} from '@/utils/format';

interface TokenOption {
    id: string;
    symbol: string;
    name: string;
    icon: any;
    color: string;
    totalBalance: number;
    totalBalanceUSD: number;
    networks: NetworkOption[];
    hasBalance: boolean;
}

interface NetworkOption {
    id: NetworkType;
    name: string;
    balance: number;
    balanceUSD: number;
    icon: any;
    color: string;
    hasBalance: boolean;
}

export default function SendScreen() {
    const router = useRouter();
    const {wallet, balances} = useWallet();
    const [selectedToken, setSelectedToken] = useState<string | null>(null);
    const [tokenOptions, setTokenOptions] = useState<TokenOption[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const calculateTokenOptions = async () => {
            if (!wallet?.enabledAssets || !balances?.list) {
                setTokenOptions([]);
                setLoading(false);
                return;
            }

            const options: TokenOption[] = [];

            for (const assetSymbol of wallet.enabledAssets) {
                const config = assetConfig[assetSymbol as keyof typeof assetConfig];
                if (!config) continue;

                let totalBalance = 0;
                const networks: NetworkOption[] = [];

                for (const networkType of config.supportedNetworks) {
                    const network = networkConfigs[networkType];

                    const balance = balances.list.find(
                        b => b.networkType === networkType && b.denomination === assetSymbol
                    );

                    const balanceValue = balance ? parseFloat(balance.value) : 0;
                    totalBalance += balanceValue;

                    const balanceUSD = await pricingService.getFiatValue(
                        balanceValue,
                        assetSymbol as AssetTicker,
                        FiatCurrency.USD
                    );

                    networks.push({
                        id: networkType,
                        name: network.name,
                        balance: balanceValue,
                        balanceUSD: balanceUSD,
                        icon: network.icon,
                        color: network.color,
                        hasBalance: balanceValue > 0,
                    });
                }

                const totalBalanceUSD = await pricingService.getFiatValue(
                    totalBalance,
                    assetSymbol as AssetTicker,
                    FiatCurrency.USD
                );

                options.push({
                    id: assetSymbol,
                    symbol: getDisplaySymbol(assetSymbol),
                    name: config.name,
                    icon: config.icon,
                    color: config.color,
                    totalBalance,
                    totalBalanceUSD,
                    networks: networks,
                    hasBalance: totalBalance > 0,
                });
            }

            options.sort((a, b) => {
                if (a.hasBalance && !b.hasBalance) return -1;
                if (!a.hasBalance && b.hasBalance) return 1;
                if (a.hasBalance && b.hasBalance) {
                    return b.totalBalanceUSD - a.totalBalanceUSD;
                }
                return a.name.localeCompare(b.name);
            });

            setTokenOptions(options);
            setLoading(false);
        };

        void calculateTokenOptions();
    }, [wallet?.enabledAssets, balances?.list]);

    const handleSelectNetwork = (token: TokenOption, network: NetworkOption) => {
        if (!network.hasBalance) {
            return;
        }

        router.push({
            pathname: '/send/details',
            params: {
                tokenId: token.id,
                tokenSymbol: token.symbol,
                tokenName: token.name,
                tokenBalance: formatTokenAmount(network.balance, token.id as AssetTicker, false),
                tokenBalanceUSD: formatAmount(network.balanceUSD),
                networkName: network.name,
                networkId: network.id,
            },
        });
    };

    const handleTokenPress = (token: TokenOption) => {
        if (!token.hasBalance) {
            return;
        }
        setSelectedToken(token.id === selectedToken ? null : token.id);
    };

    const handleClose = () => {
        router.back();
    };

    return (
        <Screen>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Send Crypto</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                        <X size={24} color={colors.text}/>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.description}>
                    Select the asset and network to send funds from
                </Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select Asset</Text>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>Loading assets...</Text>
                        </View>
                    ) : tokenOptions.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No assets found</Text>
                            <Text style={styles.emptySubtext}>
                                Enable assets in settings to send crypto
                            </Text>
                        </View>
                    ) : (
                        tokenOptions.map(token => (
                            <View key={token.id} style={styles.tokenContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.tokenCard,
                                        selectedToken === token.id && styles.tokenCardSelected,
                                        !token.hasBalance && styles.tokenCardDisabled,
                                    ]}
                                    onPress={() => handleTokenPress(token)}
                                    activeOpacity={token.hasBalance ? 0.7 : 1}
                                    disabled={!token.hasBalance}
                                >
                                    <View style={styles.tokenInfo}>
                                        <View style={[
                                            styles.tokenIcon,
                                            {backgroundColor: token.color},
                                            !token.hasBalance && styles.tokenIconDisabled
                                        ]}>
                                            <Image
                                                source={token.icon}
                                                style={[
                                                    styles.tokenIconImage,
                                                    !token.hasBalance && styles.tokenIconImageDisabled
                                                ]}
                                            />
                                        </View>
                                        <View style={styles.tokenDetails}>
                                            <Text style={[
                                                styles.tokenName,
                                                !token.hasBalance && styles.tokenNameDisabled
                                            ]}>
                                                {token.name}
                                            </Text>
                                            <Text style={[
                                                styles.tokenBalance,
                                                !token.hasBalance && styles.tokenBalanceDisabled
                                            ]}>
                                                {token.hasBalance
                                                    ? `${formatTokenAmount(token.totalBalance, token.id as AssetTicker)} • $${formatAmount(token.totalBalanceUSD)}`
                                                    : 'No balance available'
                                                }
                                            </Text>
                                        </View>
                                    </View>
                                    <ChevronRight
                                        size={20}
                                        color={
                                            !token.hasBalance
                                                ? colors.textTertiary + '50'
                                                : selectedToken === token.id
                                                    ? colors.primary
                                                    : colors.textTertiary
                                        }
                                    />
                                </TouchableOpacity>

                                {selectedToken === token.id && token.networks.length > 0 && (
                                    <View style={styles.networksContainer}>
                                        <Text style={styles.networksSectionTitle}>Select Network</Text>
                                        {token.networks.map(network => (
                                            <TouchableOpacity
                                                key={network.id}
                                                style={[
                                                    styles.networkCard,
                                                    !network.hasBalance && styles.networkCardDisabled
                                                ]}
                                                onPress={() => handleSelectNetwork(token, network)}
                                                activeOpacity={network.hasBalance ? 0.7 : 1}
                                                disabled={!network.hasBalance}
                                            >
                                                <View style={styles.networkInfo}>
                                                    <View style={[
                                                        styles.networkIcon,
                                                        {backgroundColor: network.color},
                                                        !network.hasBalance && styles.networkIconDisabled
                                                    ]}>
                                                        <Image
                                                            source={network.icon}
                                                            style={[
                                                                styles.networkIconImage,
                                                                !network.hasBalance && styles.networkIconImageDisabled
                                                            ]}
                                                        />
                                                    </View>
                                                    <View style={styles.networkDetails}>
                                                        <Text style={[
                                                            styles.networkName,
                                                            !network.hasBalance && styles.networkNameDisabled
                                                        ]}>
                                                            {network.name}
                                                        </Text>
                                                        <Text style={[
                                                            styles.networkBalance,
                                                            !network.hasBalance && styles.networkBalanceDisabled
                                                        ]}>
                                                            {network.hasBalance
                                                                ? `${formatTokenAmount(network.balance, token.id as AssetTicker)} • $${formatAmount(network.balanceUSD)}`
                                                                : 'No balance on this network'
                                                            }
                                                        </Text>
                                                    </View>
                                                </View>
                                                <ChevronRight
                                                    size={18}
                                                    color={network.hasBalance ? colors.textTertiary : colors.textTertiary + '50'}
                                                />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>
                        ))
                    )}
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
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    scanButton: {
        padding: spacing.xs,
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
    loadingContainer: {
        paddingVertical: spacing.xl,
        alignItems: 'center',
    },
    loadingText: {
        ...typography.bodyMedium,
        color: colors.textSecondary,
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
    tokenCardDisabled: {
        opacity: 0.5,
        backgroundColor: colors.surface,
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
    tokenIconDisabled: {
        opacity: 0.5,
    },
    tokenIconImage: {
        width: 24,
        height: 24,
    },
    tokenIconImageDisabled: {
        opacity: 0.6,
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
    tokenNameDisabled: {
        color: colors.textSecondary,
    },
    tokenBalance: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    tokenBalanceDisabled: {
        color: colors.textTertiary,
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
    networkCardDisabled: {
        opacity: 0.5,
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
    networkIconDisabled: {
        opacity: 0.5,
    },
    networkIconImage: {
        width: 18,
        height: 18,
    },
    networkIconImageDisabled: {
        opacity: 0.6,
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
    networkNameDisabled: {
        color: colors.textSecondary,
    },
    networkBalance: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    networkBalanceDisabled: {
        color: colors.textTertiary,
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