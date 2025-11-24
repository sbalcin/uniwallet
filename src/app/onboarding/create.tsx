import React, {useEffect, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {useRouter} from 'expo-router';
import {useWallet, WDKService} from '@tetherto/wdk-react-native-provider';
import {Button, Header, Input, Screen} from '@/components';
import {colors, spacing, typography} from '@/theme';
import {getUniqueId} from 'react-native-device-info';

export default function CreateWalletScreen() {
    const router = useRouter();
    const [walletName, setWalletName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [mnemonic, setMnemonic] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(true);

    const {createWallet} = useWallet();

    useEffect(() => {
        void generateMnemonic();
    }, []);

    const generateMnemonic = async () => {
        try {
            setIsGenerating(true);
            setError(null);
            const prf = await getUniqueId();
            const mnemonicString = await WDKService.createSeed({prf});

            if (!mnemonicString) {
                throw new Error('Received empty mnemonic');
            }

            const words = mnemonicString.split(' ');
            if (words.length !== 12) {
                throw new Error(`Invalid mnemonic length: expected 12 words, got ${words.length}`);
            }

            setMnemonic(words);
        } catch (error) {
            console.error('Failed to generate seed phrase', error);
            setError('Failed to generate seed phrase. Please try again.');
            setMnemonic([]);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCreate = async () => {
        if (!walletName.trim()) {
            Alert.alert('Error', 'Please enter a wallet name');
            return;
        }

        if (mnemonic.length === 0) {
            Alert.alert('Error', 'Mnemonic not generated. Please try again.');
            return;
        }

        try {
            setLoading(true);

            const mnemonicString = mnemonic.join(' ');

            await createWallet({
                name: walletName.trim(),
                mnemonic: mnemonicString
            });

            router.push({
                pathname: '/onboarding/backup-phrase',
                params: {mnemonic: mnemonicString}
            });

        } catch (error) {
            Alert.alert('Error', 'Failed to create wallet. Please try again.');
            console.error('Create wallet error:', error);
        } finally {
            setLoading(false);
        }
    };

    // for debug only, delete it
    const renderMnemonicPreview = () => {
        if (isGenerating) {
            return <Text style={styles.generatingText}>Generating mnemonic...</Text>;
        }

        if (mnemonic.length > 0) {
            return (
                <View style={styles.mnemonicPreview}>
                    <Text style={styles.mnemonicLabel}>Generated Mnemonic (Preview):</Text>
                    <Text style={styles.mnemonicWords}>{mnemonic.join(' ')}</Text>
                </View>
            );
        }

        return null;
    };

    return (
        <Screen>
            <Header title="Create Wallet" showBack/>

            <View style={styles.content}>
                <View style={styles.info}>
                    <Text style={styles.title}>Name Your Wallet</Text>
                    <Text style={styles.description}>
                        Choose a name to help you identify this wallet
                    </Text>
                </View>

                <Input
                    label="Wallet Name"
                    placeholder="My Main Wallet"
                    value={walletName}
                    onChangeText={setWalletName}
                    autoFocus
                />

                {renderMnemonicPreview()}

                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                        <Button
                            title="Retry"
                            onPress={generateMnemonic}
                            variant="outline"
                            size="small"
                        />
                    </View>
                )}
            </View>

            <View style={styles.footer}>
                <Button
                    title="Continue"
                    onPress={handleCreate}
                    loading={loading || isGenerating}
                    disabled={!walletName.trim() || mnemonic.length === 0}
                />
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
    },
    info: {
        marginBottom: spacing.xl,
    },
    title: {
        ...typography.displaySmall,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    description: {
        ...typography.bodyMedium,
        color: colors.textSecondary,
    },
    footer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
    },
    mnemonicPreview: {
        marginTop: spacing.lg,
        padding: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: 8,
    },
    mnemonicLabel: {
        ...typography.bodyMedium,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    mnemonicWords: {
        ...typography.bodyMedium,
        color: colors.text,
        fontFamily: 'monospace',
    },
    generatingText: {
        ...typography.bodyMedium,
        color: colors.textSecondary,
        marginTop: spacing.lg,
    },
    errorContainer: {
        marginTop: spacing.lg,
        padding: spacing.md,
        backgroundColor: colors.error + '20',
        borderRadius: 8,
    },
    errorText: {
        ...typography.bodyMedium,
        color: colors.error,
        marginBottom: spacing.sm,
    },
});