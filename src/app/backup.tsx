import React from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {useRouter} from 'expo-router';
import {Button, Card, Header, Screen} from '@/components';
import {colors, spacing, typography} from '@/theme';
import {LockKeyhole, Megaphone} from "lucide-react-native";
import {getUniqueId} from "react-native-device-info";
import {WDKService} from "@tetherto/wdk-react-native-provider";

export default function BackupScreen() {
    const router = useRouter();

    const handleBackupNow = () => {
        Alert.alert(
            'Backup Wallet',
            'You will be shown your recovery phrase. Make sure to write it down and store it securely.',
            [
                {text: 'Cancel', style: 'cancel'},
                {
                    text: 'Continue',
                    onPress: async () => {
                        const prf = await getUniqueId();
                        const mnemonicString = await WDKService.retrieveSeed(prf);

                        router.push({
                            pathname: '/onboarding/backup-phrase',
                            params: {mnemonic: mnemonicString}
                        })
                    },
                },
            ]
        );
    };

    return (
        <Screen scrollable>
            <Header title="Backup Wallet" showBack/>

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <LockKeyhole size={32} color={colors.warning}/>
                </View>

                <Text style={styles.title}>Protect Your Wallet</Text>
                <Text style={styles.description}>
                    Your recovery phrase is the only way to restore your wallet if you
                    lose access to this device.
                </Text>

                <Card style={styles.infoCard}>
                    <Text style={styles.infoTitle}>What to do:</Text>
                    <View style={styles.stepContainer}>
                        <Text style={styles.step}>✓ Write down your recovery phrase</Text>
                        <Text style={styles.step}>✓ Store it in a secure location</Text>
                        <Text style={styles.step}>✓ Never share it with anyone</Text>
                        <Text style={styles.step}>✓ Keep it offline</Text>
                    </View>
                </Card>

                <Card style={styles.warningCard}>
                    <Megaphone size={16} color={colors.warning} style={styles.warningIcon}/>
                    <Text style={styles.warningText}>
                        Anyone with your recovery phrase can access your funds. UniWallet
                        will never ask for your recovery phrase.
                    </Text>
                </Card>
            </View>

            <View style={styles.footer}>
                <Button title="View Recovery Phrase" onPress={handleBackupNow}/>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        alignItems: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.displaySmall,
        color: colors.text,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    description: {
        ...typography.bodyMedium,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
        paddingHorizontal: spacing.md,
    },
    infoCard: {
        width: '100%',
        marginBottom: spacing.md,
    },
    infoTitle: {
        ...typography.headingSmall,
        color: colors.text,
        marginBottom: spacing.md,
    },
    stepContainer: {
        gap: spacing.sm,
    },
    step: {
        ...typography.bodyMedium,
        color: colors.textSecondary,
    },
    warningCard: {
        flexDirection: 'row',
        width: '100%',
        backgroundColor: colors.warning + '20',
        borderWidth: 1,
        borderColor: colors.warning + '40',
    },
    warningIcon: {
        marginTop: 4,
        marginRight: spacing.sm,
    },
    warningText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        lineHeight: 20,
        padding: 2
    },
    footer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
    },
});