import React, {useCallback} from 'react';
import {ScrollView, Share as RNShare, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {Copy, Megaphone, Share, X} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import {QRCode} from '@tetherto/wdk-uikit-react-native';
import {Screen} from '@/components';
import {colors, spacing, typography} from '@/theme';
import {toast} from 'sonner-native';

export default function ReceiveDetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const {tokenName, networkName, address} = params as {
        tokenName: string;
        networkName: string;
        address: string;
    };

    const handleClose = useCallback(() => {
        router.back();
    }, [router]);

    const handleCopyAddress = useCallback(async () => {
        try {
            await Clipboard.setStringAsync(address);
            toast.success('Address copied to clipboard');
        } catch (error) {
            console.error('Error copying address:', error);
            toast.error('Failed to copy address');
        }
    }, [address]);

    const handleShareAddress = useCallback(async () => {
        try {
            await RNShare.share({
                message: `${tokenName} Address (${networkName}): ${address}`,
                title: `${tokenName} Receive Address`,
            });
        } catch (error) {
            console.error('Error sharing address:', error);
        }
    }, [address, tokenName, networkName]);

    return (
        <Screen>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Receive {tokenName}</Text>
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                    <X size={24} color={colors.text}/>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.content}>
                    <View style={styles.infoSection}>
                        <Text style={styles.subtitle}>
                            Scan this QR code or share your address to receive {tokenName} on {networkName}
                        </Text>
                    </View>

                    <View style={styles.qrSection}>
                        <View style={styles.qrContainer}>
                            <QRCode
                                value={address}
                                size={220}
                                color={colors.text}
                                backgroundColor={colors.overlay}
                            />
                        </View>
                    </View>

                    <View style={styles.addressSection}>
                        <Text style={styles.addressLabel}>{networkName} Address</Text>
                        <View style={styles.addressContainer}>
                            <Text style={styles.addressText} numberOfLines={3}>
                                {address}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.copyButton]}
                            onPress={handleCopyAddress}
                            activeOpacity={0.7}
                        >
                            <Copy size={20} color={colors.text}/>
                            <Text style={styles.actionButtonText}>Copy Address</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.shareButton]}
                            onPress={handleShareAddress}
                            activeOpacity={0.7}
                        >
                            <Share size={20} color={colors.text}/>
                            <Text style={styles.actionButtonText}>Share</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.warningContainer}>
                        <Megaphone size={16} color={colors.warning}/>
                        <Text style={styles.warningText}>
                            Only send {tokenName} on {networkName} to this address. Sending other assets or using a
                            different network may result in permanent loss of funds.
                        </Text>
                    </View>
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
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
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
        flexGrow: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.lg,
    },
    infoSection: {
        marginBottom: spacing.xl,
        alignItems: 'center',
    },
    subtitle: {
        ...typography.bodyMedium,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    qrSection: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    qrContainer: {
        padding: spacing.lg,
        backgroundColor: colors.text,
        borderRadius: 16,
        shadowColor: colors.overlay,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    addressSection: {
        marginBottom: spacing.lg,
    },
    addressLabel: {
        ...typography.labelMedium,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        fontWeight: '600',
    },
    addressContainer: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    addressText: {
        ...typography.bodyMedium,
        color: colors.text,
        fontFamily: 'monospace',
        lineHeight: 22,
    },
    buttonsContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: 12,
        gap: spacing.xs,
    },
    copyButton: {
        backgroundColor: colors.primary,
    },
    shareButton: {
        backgroundColor: colors.textSecondary,
    },
    actionButtonText: {
        ...typography.bodyMedium,
        color: colors.text,
        fontWeight: '600',
    },
    warningContainer: {
        flexDirection: 'row',
        backgroundColor: colors.warning + '15',
        borderRadius: 12,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.warning + '30',
    },
    warningText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        paddingLeft: 3
    },
});