import React, {useEffect, useState} from 'react';
import {FlatList, RefreshControl, StyleSheet, Text, View} from 'react-native';
import {AssetTicker, NetworkType, useWallet} from '@tetherto/wdk-react-native-provider';
import {ArrowDownLeft, ArrowUpRight} from 'lucide-react-native';
import {Card, Screen} from '@/components';
import {colors, spacing, typography} from '@/theme';
import {FiatCurrency, pricingService} from '@/services/pricing.service';
import {assetConfig} from '@/config/assets';
import {formatAmount, formatTokenAmount} from "@/utils/format";
import {networkConfigs} from "@/config/networks";

interface Transaction {
    id: string;
    type: 'sent' | 'received';
    amount: number;
    amountUSD: number;
    symbol: string;
    name: string;
    address: string;
    timestamp: number;
    status: 'pending' | 'confirmed' | 'failed';
    blockchain: string;
}

export default function TransactionsScreen() {
    const {transactions: walletTransactions, addresses, refreshWalletBalance, refreshTransactions} = useWallet();
    const [refreshing, setRefreshing] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const getTransactionsWithFiatValues = async () => {
        if (!walletTransactions?.list) return [];

        const walletAddresses = addresses
            ? Object.values(addresses).map(addr => addr?.toLowerCase())
            : [];

        return await Promise.all(
            walletTransactions.list
                .sort((a, b) => b.timestamp - a.timestamp)
                .map(async (tx, index) => {
                    const fromAddress = tx.from?.toLowerCase();
                    const isSent = walletAddresses.includes(fromAddress);
                    const amount = parseFloat(tx.amount);
                    const config = assetConfig[tx.token as keyof typeof assetConfig];

                    const amountUSD = await pricingService.getFiatValue(
                        amount,
                        tx.token as AssetTicker,
                        FiatCurrency.USD
                    );

                    return {
                        id: `${tx.transactionHash}-${index}`,
                        type: isSent ? ('sent' as const) : ('received' as const),
                        amount: amount,
                        symbol: tx.token,
                        name: config?.name || tx.token.toUpperCase(),
                        address: isSent ? tx.to || '' : tx.from || '',
                        timestamp: tx.timestamp,
                        status: 'confirmed' as const,
                        amountUSD: amountUSD,
                        blockchain: tx.blockchain,
                    };
                })
        );
    };

    useEffect(() => {
        getTransactionsWithFiatValues().then(setTransactions);
    }, [walletTransactions?.list, addresses]);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await refreshWalletBalance();
            await refreshTransactions();
            const updatedTransactions = await getTransactionsWithFiatValues();
            setTransactions(updatedTransactions);
        } catch (error) {
            console.error('Failed to refresh transactions:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const renderTransaction = ({item}: { item: Transaction }) => {
        const isReceived = item.type === 'received';
        const date = new Date(item.timestamp).toLocaleDateString();
        const time = new Date(item.timestamp).toLocaleTimeString();

        const networkInfo = networkConfigs[item.blockchain as NetworkType];

        return (
            <Card style={styles.transactionCard}>
                <View style={styles.transactionIcon}>
                    {isReceived ? (
                        <ArrowDownLeft size={20} color={colors.success}/>
                    ) : (
                        <ArrowUpRight size={20} color={colors.error}/>
                    )}
                </View>

                <View style={styles.transactionInfo}>
                    <Text style={styles.transactionType}>
                        {isReceived ? 'Received' : 'Sent'} {item.name}
                    </Text>
                    <Text style={styles.transactionAddress} numberOfLines={1}>
                        {networkInfo?.name}
                    </Text>
                    <Text style={styles.transactionDate}>{`${date} ${time}`}</Text>
                </View>

                <View style={styles.transactionAmount}>
                    <Text
                        style={[
                            styles.amount,
                            {color: isReceived ? colors.success : colors.error},
                        ]}
                    >
                        {isReceived ? '+' : '-'}
                        {formatTokenAmount(item.amount, item.symbol as AssetTicker)}
                    </Text>
                    <Text style={styles.fiatAmount}>${formatAmount(item.amountUSD)}</Text>
                </View>
            </Card>
        );
    };

    return (
        <Screen>
            <View style={styles.header}>
                <Text style={styles.title}>Activity</Text>
            </View>

            {transactions.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No transactions yet</Text>
                    <Text style={styles.emptySubtext}>
                        Your transaction history will appear here
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={transactions}
                    renderItem={renderTransaction}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.primary}
                        />
                    }
                />
            )}
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
    list: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xl,
    },
    transactionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
        padding: spacing.md,
    },
    transactionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surfaceHover,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    transactionInfo: {
        flex: 1,
    },
    transactionType: {
        ...typography.bodyMedium,
        color: colors.text,
        marginBottom: 2,
    },
    transactionAddress: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    transactionDate: {
        ...typography.bodySmall,
        color: colors.textTertiary,
    },
    transactionAmount: {
        alignItems: 'flex-end',
    },
    amount: {
        ...typography.bodyMedium,
        fontWeight: '600',
        marginBottom: 2,
    },
    fiatAmount: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },
    emptyText: {
        ...typography.headingMedium,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    emptySubtext: {
        ...typography.bodyMedium,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});