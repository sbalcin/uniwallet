import React, {useEffect, useState} from 'react';
import {FlatList, Image, ImageSourcePropType, RefreshControl, StyleSheet, Text, View} from 'react-native';
import {AssetTicker, useWallet} from '@tetherto/wdk-react-native-provider';
import {Eye, EyeOff, Plus, QrCode, Send, Wallet} from 'lucide-react-native';
import {Button, Card, Screen} from '@/components';
import {colors, spacing, typography} from '@/theme';
import {router} from 'expo-router';
import {FiatCurrency, pricingService} from '@/services/pricing.service';
import {assetConfig} from '@/config/assets';
import Decimal from 'decimal.js';
import {formatAmount, formatTokenAmount} from "@/utils/format";

type Asset = {
    denomination: string;
    balance: number;
    balanceUSD: number;
    price: number;
    name: string;
    symbol: string;
    icon: ImageSourcePropType;
    color: string;
};

export default function WalletScreen() {
    const {wallet, balances, isUnlocked, refreshWalletBalance, refreshTransactions} = useWallet();
    const [balanceVisible, setBalanceVisible] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [assets, setAssets] = useState<Asset[]>([]);

    const hasWallet = !!wallet;

    useEffect(() => {
        if (hasWallet && !isUnlocked) {
            router.replace('/authorize');
        }
    }, [hasWallet, isUnlocked, router]);

    const getAssetsWithBalancesAndPrices = async () => {
        if (!wallet?.enabledAssets) return [];

        const balanceMap = new Map<string, { totalBalance: number }>();

        if (balances?.list) {
            balances.list.forEach(balance => {
                const current = balanceMap.get(balance.denomination) || {totalBalance: 0};
                balanceMap.set(balance.denomination, {
                    totalBalance: current.totalBalance + parseFloat(balance.value),
                });
            });
        }

        const assets = wallet.enabledAssets
            .map((assetSymbol) => {
                const config = assetConfig[assetSymbol as keyof typeof assetConfig];
                if (!config) return null;

                const balanceData = balanceMap.get(assetSymbol) || {totalBalance: 0};
                const balance = balanceData.totalBalance;

                const price = pricingService.getExchangeRate(
                    assetSymbol as AssetTicker,
                    FiatCurrency.USD
                ) || 0;

                const balanceUSD = balance * price;

                return {
                    denomination: assetSymbol,
                    balance: balance,
                    balanceUSD: balanceUSD,
                    price: price,
                    name: config.name,
                    symbol: assetSymbol.toUpperCase(),
                    icon: config.icon,
                    color: config.color,
                };
            })
            .filter(Boolean) as Asset[];

        // Sort by assets with balance first, then by usd worth
        return assets.sort((a, b) => {
            if (a.balance > 0 && b.balance === 0) return -1;
            if (a.balance === 0 && b.balance > 0) return 1;
            return (b?.balanceUSD || 0) - (a?.balanceUSD || 0);
        });
    };

    useEffect(() => {
        getAssetsWithBalancesAndPrices().then(setAssets);
    }, [balances?.list, wallet?.enabledAssets]);

    const onRefresh = async () => {
        if (!wallet) return;

        setRefreshing(true);
        try {
            await refreshWalletBalance();
            await refreshTransactions();
            const updatedAssets = await getAssetsWithBalancesAndPrices();
            setAssets(updatedAssets);
        } catch (error) {
            console.error('Failed to refresh wallet data:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const calculateTotalBalance = () => {
        const total = assets.reduce((sum, asset) => {
            return sum.plus(new Decimal(asset.balanceUSD || 0));
        }, new Decimal(0));

        return total.toFixed(2);
    };

    useEffect(() => {
        void refreshWalletBalance()
        void refreshTransactions()
    }, []);

    const renderAssetItem = ({item}: { item: Asset }) => {
        const hasBalance = item.balance > 0;

        return (
            <Card style={styles.assetCard}>
                <View style={styles.assetHeader}>
                    <View style={[styles.assetIcon]}>
                        <Image source={item.icon} style={styles.assetIconImage}/>
                    </View>
                    <View style={styles.assetInfo}>
                        <Text style={styles.assetName}>{item.name}</Text>
                        <Text style={styles.assetSymbol}>{item.symbol}</Text>
                    </View>
                </View>
                <View style={styles.assetBalance}>
                    {hasBalance ? (
                        <>
                            <Text style={styles.assetAmount}>
                                {balanceVisible ? formatTokenAmount(item.balance, item.denomination as AssetTicker) : '••••'}
                            </Text>
                            <Text style={styles.assetValue}>
                                ${balanceVisible ? formatAmount(item.balanceUSD) : '••••'}
                            </Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.assetAmount}>0.00</Text>
                            <Text style={styles.assetPrice}>
                                ${item.price.toFixed(2)}
                            </Text>
                        </>
                    )}
                </View>
            </Card>
        );
    };

    return (
        <Screen>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.walletIconContainer}>
                        <Wallet size={22} color={colors.primaryLight}/>
                    </View>
                    <View style={styles.walletInfo}>
                        <Text style={styles.walletName}>{wallet?.name || 'My Wallet'}</Text>
                        <Text style={styles.walletSubtext}>
                            {wallet?.enabledAssets?.length || 0} assets
                        </Text>
                    </View>
                </View>
                <Button
                    title=""
                    onPress={() => setBalanceVisible(!balanceVisible)}
                    variant="ghost"
                    size="small"
                    style={styles.eyeButton}
                >
                    {balanceVisible ? (
                        <Eye size={20} color={colors.textSecondary}/>
                    ) : (
                        <EyeOff size={20} color={colors.textSecondary}/>
                    )}
                </Button>
            </View>

            <View style={styles.balanceContainer}>
                <Text style={styles.balanceLabel}>Total Balance</Text>
                <Text style={styles.balanceAmount}>
                    ${balanceVisible ? calculateTotalBalance() : '••••••'}
                </Text>
                <Text style={styles.walletName}>{wallet?.name || 'My Wallet'}</Text>
            </View>

            <View style={styles.actionsContainer}>
                <View style={styles.actionButton}>
                    <Button
                        title=""
                        onPress={() => router.push('/receive/' as any)}
                        variant="secondary"
                        style={styles.actionButtonInner}
                    >
                        <QrCode size={24} color={colors.primary}/>
                    </Button>
                    <Text style={styles.actionLabel}>Receive</Text>
                </View>

                <View style={styles.actionButton}>
                    <Button
                        title=""
                        onPress={() => router.push('/send/' as any)}
                        variant="secondary"
                        style={styles.actionButtonInner}
                    >
                        <Send size={24} color={colors.primary}/>
                    </Button>
                    <Text style={styles.actionLabel}>Send</Text>
                </View>

                <View style={styles.actionButton}>
                    <Button
                        title=""
                        onPress={() => router.push('/add-wallet')}
                        variant="secondary"
                        style={styles.actionButtonInner}
                    >
                        <Plus size={24} color={colors.primary}/>
                    </Button>
                    <Text style={styles.actionLabel}>Add</Text>
                </View>
            </View>

            <View style={styles.assetsHeader}>
                <Text style={styles.assetsTitle}>Assets</Text>
            </View>

            <FlatList
                data={assets}
                renderItem={renderAssetItem}
                keyExtractor={(item) => item.denomination}
                contentContainerStyle={styles.assetsList}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No assets found</Text>
                    </View>
                }
            />
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
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    walletIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.overlayLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    walletIcon: {
        fontSize: 20,
    },
    walletInfo: {
        flex: 1,
    },
    walletName: {
        ...typography.bodyLarge,
        color: colors.text,
        fontWeight: '600',
    },
    walletSubtext: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    eyeButton: {
        padding: spacing.sm,
    },
    balanceContainer: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    balanceLabel: {
        ...typography.bodyMedium,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    balanceAmount: {
        ...typography.displayLarge,
        color: colors.text,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: spacing.md,
        marginBottom: spacing.lg,
    },
    actionButton: {
        alignItems: 'center',
    },
    actionButtonInner: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginBottom: spacing.sm,
    },
    actionLabel: {
        ...typography.labelSmall,
        color: colors.textSecondary,
    },
    assetsHeader: {
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
    },
    assetsTitle: {
        ...typography.headingMedium,
        color: colors.text,
    },
    assetsList: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xl,
    },
    assetCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
        padding: spacing.md,
    },
    assetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    assetIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    assetIconText: {
        ...typography.headingSmall,
        color: colors.text,
    },
    assetIconImage: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    assetInfo: {
        flex: 1,
    },
    assetName: {
        ...typography.bodyMedium,
        color: colors.text,
        marginBottom: 2,
    },
    assetSymbol: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    assetBalance: {
        alignItems: 'flex-end',
    },
    assetAmount: {
        ...typography.bodyMedium,
        color: colors.text,
        marginBottom: 2,
    },
    assetValue: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    assetPrice: {
        ...typography.bodySmall,
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
});