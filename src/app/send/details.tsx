import React, {useCallback, useEffect, useState} from 'react';
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {AssetTicker, useWallet, WDKService} from '@tetherto/wdk-react-native-provider';
import {RefreshCw, X} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import {Button, Screen} from '@/components';
import {colors, spacing, typography} from '@/theme';
import {toast} from 'sonner-native';
import getDisplaySymbol from '@/utils/get-display-symbol';
import {FiatCurrency, pricingService} from '@/services/pricing.service';
import {calculateGasFee, GasFeeEstimate, getAssetTicker, getNetworkType} from "@/services/gas-fee.service";
import {CryptoAddressInput} from "@tetherto/wdk-uikit-react-native";
import {formatUSDValue, formatTokenAmount} from "@/utils/format";

export default function SendDetailsScreen() {
    const router = useRouter();
    const {refreshWalletBalance} = useWallet();
    const params = useLocalSearchParams();

    const {
        tokenId,
        tokenSymbol,
        tokenName,
        tokenBalance,
        tokenBalanceUSD,
        networkName,
        networkId,
        scannedAddress,
    } = params as {
        tokenId: string;
        tokenSymbol: string;
        tokenName: string;
        tokenBalance: string;
        tokenBalanceUSD: string;
        networkName: string;
        networkId: string;
        scannedAddress?: string;
    };

    const [recipientAddress, setRecipientAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [gasEstimate, setGasEstimate] = useState<GasFeeEstimate>({fee: undefined, error: undefined});
    const [isLoadingGas, setIsLoadingGas] = useState(false);
    const [amountError, setAmountError] = useState<string | null>(null);
    const [sendingTransaction, setSendingTransaction] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const tokenPrice = pricingService.getExchangeRate(getAssetTicker(tokenId), FiatCurrency.USD) || 0;

    useEffect(() => {
        if (scannedAddress) {
            setRecipientAddress(scannedAddress);
        }
    }, [scannedAddress]);

    const handleCalculateGas = useCallback(async () => {
        setIsLoadingGas(true);
        setGasEstimate({fee: undefined, error: undefined});

        const numericAmount = amount ? parseFloat(amount.replace(/,/g, '')) : undefined;
        const estimate = await calculateGasFee(networkId, tokenId, numericAmount);

        setGasEstimate(estimate);
        setIsLoadingGas(false);
    }, [networkId, tokenId, amount]);

    useEffect(() => {
        const isBtc = tokenId.toLowerCase() === 'btc';
        if (!isBtc) {
            void handleCalculateGas();
        }
    }, [handleCalculateGas, tokenId]);

    const validateAmount = useCallback((value: string) => {
        if (!value || parseFloat(value) <= 0) {
            setAmountError(null);
            return;
        }

        const numericBalance = parseFloat(tokenBalance.replace(/,/g, ''));
        const numericAmount = parseFloat(value.replace(/,/g, ''));

        if (numericAmount > numericBalance) {
            setAmountError(`Maximum: ${formatTokenAmount(numericBalance, tokenSymbol as AssetTicker)}`);
        } else {
            setAmountError(null);
        }
    }, [tokenBalance, tokenSymbol]);

    const handleAmountChange = useCallback((value: string) => {
        const sanitized = value.replace(/[^0-9.]/g, '');
        const parts = sanitized.split('.');
        const formatted = parts[0] + (parts.length > 1 ? '.' + parts[1] : '');

        setAmount(formatted);
        validateAmount(formatted);
    }, [validateAmount]);

    const handleUseMax = useCallback(() => {
        const numericBalance = parseFloat(tokenBalance.replace(/,/g, ''));
        let maxAmount = numericBalance;

        if (gasEstimate.fee !== undefined) {
            maxAmount = Math.max(0, numericBalance - gasEstimate.fee);
            toast.info('Max amount reduced by gas fee');
        }

        setAmount(maxAmount.toString());
        setAmountError(null);
    }, [tokenBalance, gasEstimate.fee]);

    const handleScanQR = () => {
        router.push({
            pathname: '/send/scan',
            params: {
                returnTo: '/send/details',
                ...params,
            },
        });
    };

    const handlePaste = async () => {
        const text = await Clipboard.getStringAsync();
        setRecipientAddress(text);
    };

    const handleSend = async () => {
        if (!recipientAddress) {
            Alert.alert('Error', 'Please enter recipient address');
            return;
        }
        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert('Error', 'Please enter valid amount');
            return;
        }
        if (amountError) {
            Alert.alert('Error', 'Amount exceeds balance');
            return;
        }

        setSendingTransaction(true);
        try {
            const numericAmount = parseFloat(amount.replace(/,/g, ''));
            const networkType = getNetworkType(networkId);
            const assetTicker = getAssetTicker(tokenId);

            const result = await WDKService.sendByNetwork(
                networkType,
                0, //acc index
                numericAmount,
                recipientAddress,
                assetTicker
            );

            setShowConfirmation(true);
            await refreshWalletBalance();
        } catch (error) {
            console.error('Transaction failed:', error);
            Alert.alert('Transaction Failed', error instanceof Error ? error.message : 'Unknown error');
        } finally {
            setSendingTransaction(false);
        }
    };

    const handleClose = () => {
        router.replace('/(tabs)');
    };

    const handleConfirmClose = () => {
        setShowConfirmation(false);
        router.replace('/(tabs)');
    };

    const displayAmount = amount && parseFloat(amount) > 0
        ? formatTokenAmount(parseFloat(amount), tokenSymbol as AssetTicker)
        : '0.00';

    const displayAmountUSD = amount && parseFloat(amount) > 0 && tokenPrice > 0
        ? formatUSDValue(parseFloat(amount) * tokenPrice)
        : '$0.00';

    return (
        <>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <Screen>
                        <View style={styles.container}>
                            <View style={styles.header}>
                                <Text style={styles.headerTitle}>Send {getDisplaySymbol(tokenSymbol)}</Text>
                                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                                    <X size={24} color={colors.text}/>
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                style={styles.scrollView}
                                contentContainerStyle={styles.scrollContent}
                                keyboardShouldPersistTaps="handled"
                            >
                                <View style={styles.infoCard}>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Network:</Text>
                                        <Text style={styles.infoValue}>{networkName}</Text>
                                    </View>
                                </View>

                                <View style={styles.section}>
                                    <CryptoAddressInput
                                        value={recipientAddress}
                                        onChangeText={setRecipientAddress}
                                        onPaste={handlePaste}
                                        onQRScan={handleScanQR}
                                        placeholder="Enter or scan wallet address"
                                    />

                                </View>

                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Amount</Text>
                                    <View style={styles.amountContainer}>
                                        <TextInput
                                            style={styles.amountInput}
                                            placeholder="0.00"
                                            placeholderTextColor={colors.textTertiary}
                                            value={amount}
                                            onChangeText={handleAmountChange}
                                            keyboardType="decimal-pad"
                                        />
                                        <Text style={styles.currencyLabel}>{getDisplaySymbol(tokenSymbol)}</Text>
                                    </View>

                                    <View style={styles.balanceRow}>
                                        <TouchableOpacity
                                            onPress={handleUseMax}
                                            disabled={!gasEstimate.fee && tokenId.toLowerCase() !== 'btc'}
                                        >
                                            <Text style={[
                                                styles.useMaxText,
                                                (!gasEstimate.fee && tokenId.toLowerCase() !== 'btc') && styles.useMaxTextDisabled
                                            ]}>
                                                Use Max
                                            </Text>
                                        </TouchableOpacity>
                                        <Text style={styles.balanceText}>
                                            Balance: {tokenBalance} {getDisplaySymbol(tokenSymbol)}
                                        </Text>
                                    </View>

                                    {amount && parseFloat(amount) > 0 && (
                                        <Text style={styles.amountUsdText}>≈ {displayAmountUSD}</Text>
                                    )}

                                    {amountError && (
                                        <Text style={styles.errorText}>{amountError}</Text>
                                    )}
                                </View>

                                <View style={styles.gasCard}>
                                    <View style={styles.gasHeader}>
                                        <Text style={styles.gasTitle}>Network Fee</Text>
                                        <TouchableOpacity
                                            onPress={handleCalculateGas}
                                            disabled={isLoadingGas}
                                        >
                                            <RefreshCw
                                                size={18}
                                                color={isLoadingGas ? colors.textTertiary : colors.primary}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    {isLoadingGas ? (
                                        <Text style={styles.gasValue}>Calculating...</Text>
                                    ) : gasEstimate.error ? (
                                        <Text style={styles.gasError}>{gasEstimate.error}</Text>
                                    ) : gasEstimate.fee !== undefined ? (
                                        <>
                                            <Text style={styles.gasValue}>
                                                {formatTokenAmount(gasEstimate.fee, tokenSymbol as AssetTicker)}
                                            </Text>
                                            <Text style={styles.gasUsd}>
                                                ≈ {formatUSDValue(gasEstimate.fee * tokenPrice)}
                                            </Text>
                                        </>
                                    ) : tokenId.toLowerCase() === 'btc' && (!amount || parseFloat(amount) <= 0) ? (
                                        <Text style={styles.gasNote}>Enter amount to calculate fee</Text>
                                    ) : (
                                        <Text style={styles.gasValue}>Loading...</Text>
                                    )}
                                </View>

                                {amount && parseFloat(amount) > 0 && gasEstimate.fee !== undefined && (
                                    <View style={styles.totalCard}>
                                        <Text style={styles.totalLabel}>Total Amount (including fee)</Text>
                                        <Text style={styles.totalValue}>
                                            {formatTokenAmount(parseFloat(amount) + gasEstimate.fee, tokenSymbol as AssetTicker)}
                                        </Text>
                                        <Text style={styles.totalUsd}>
                                            ≈ {formatUSDValue((parseFloat(amount) + gasEstimate.fee) * tokenPrice)}
                                        </Text>
                                    </View>
                                )}
                            </ScrollView>

                            <View style={styles.footer}>
                                <Button
                                    title={sendingTransaction ? 'Sending...' : 'Send'}
                                    onPress={handleSend}
                                    disabled={!recipientAddress || !amount || !!amountError || sendingTransaction}
                                    loading={sendingTransaction}
                                />
                            </View>
                        </View>
                    </Screen>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

            <Modal visible={showConfirmation} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>✓ Transaction Sent</Text>
                        <Text style={styles.modalDescription}>
                            Your transaction has been submitted successfully
                        </Text>

                        <View style={styles.summaryContainer}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Amount</Text>
                                <Text style={styles.summaryValue}>{displayAmount}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>To</Text>
                                <Text style={styles.summaryValue} numberOfLines={1}>
                                    {recipientAddress.substring(0, 10)}...{recipientAddress.substring(recipientAddress.length - 8)}
                                </Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Network</Text>
                                <Text style={styles.summaryValue}>{networkName}</Text>
                            </View>
                        </View>

                        <Button title="Done" onPress={handleConfirmClose}/>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        ...typography.headingLarge,
        color: colors.text,
    },
    closeButton: {
        padding: spacing.xs,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: 100,
    },
    infoCard: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.lg,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.xs,
    },
    infoLabel: {
        ...typography.bodyMedium,
        color: colors.textSecondary,
    },
    infoValue: {
        ...typography.bodyMedium,
        color: colors.text,
        fontWeight: '600',
    },
    section: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        ...typography.labelMedium,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        fontWeight: '600',
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 12,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        gap: spacing.sm,
    },
    amountInput: {
        flex: 1,
        ...typography.displayMedium,
        color: colors.text,
        minHeight: 44,
    },
    currencyLabel: {
        ...typography.bodyLarge,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.sm,
    },
    useMaxText: {
        ...typography.labelMedium,
        color: colors.primary,
        fontWeight: '600',
    },
    useMaxTextDisabled: {
        color: colors.textTertiary,
    },
    balanceText: {
        ...typography.labelMedium,
        color: colors.textSecondary,
    },
    amountUsdText: {
        ...typography.bodyMedium,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    errorText: {
        ...typography.bodySmall,
        color: colors.error,
        marginTop: spacing.xs,
    },
    gasCard: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    gasHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    gasTitle: {
        ...typography.labelMedium,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    gasValue: {
        ...typography.bodyLarge,
        color: colors.text,
        fontWeight: '600',
    },
    gasUsd: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        marginTop: 2,
    },
    gasError: {
        ...typography.bodySmall,
        color: colors.error,
    },
    gasNote: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    totalCard: {
        backgroundColor: colors.primary + '15',
        borderRadius: 12,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.primary + '30',
    },
    totalLabel: {
        ...typography.labelMedium,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    totalValue: {
        ...typography.headingLarge,
        color: colors.text,
        fontWeight: '600',
    },
    totalUsd: {
        ...typography.bodyMedium,
        color: colors.textSecondary,
        marginTop: 2,
    },
    footer: {
        padding: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: spacing.xl,
        marginHorizontal: spacing.lg,
        width: '90%',
        maxWidth: 400,
    },
    modalTitle: {
        ...typography.headingLarge,
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    modalDescription: {
        ...typography.bodyMedium,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    summaryContainer: {
        marginBottom: spacing.lg,
        gap: spacing.sm,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        ...typography.bodyMedium,
        color: colors.textSecondary,
    },
    summaryValue: {
        ...typography.bodyMedium,
        color: colors.text,
        fontWeight: '600',
        flex: 1,
        textAlign: 'right',
        marginLeft: spacing.sm,
    },
});