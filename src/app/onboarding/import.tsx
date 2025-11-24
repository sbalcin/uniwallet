import React, {useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {useRouter} from 'expo-router';
import {useWallet} from '@tetherto/wdk-react-native-provider';
import {Button, Header, Input, Screen} from '@/components';
import {colors, spacing, typography} from '@/theme';
import {Megaphone} from "lucide-react-native";

export default function ImportWalletScreen() {
    const router = useRouter();
    const {createWallet} = useWallet();
    const [walletName, setWalletName] = useState('');
    const [mnemonic, setMnemonic] = useState('');
    const [loading, setLoading] = useState(false);

    const handleImport = async () => {
        if (!walletName.trim()) {
            Alert.alert('Error', 'Please enter a wallet name');
            return;
        }

        if (!mnemonic.trim()) {
            Alert.alert('Error', 'Please enter your recovery phrase');
            return;
        }

        const words = mnemonic.trim().split(/\s+/);
        if (words.length !== 12 && words.length !== 24) {
            Alert.alert('Error', 'Recovery phrase must be 12 or 24 words');
            return;
        }

        try {
            setLoading(true);
            await createWallet({
                name: walletName.trim(),
                mnemonic: mnemonic.trim(),
            });
            router.push('/onboarding/complete');
        } catch (error) {
            Alert.alert('Error', 'Failed to import wallet. Please check your recovery phrase.');
            console.error('Import wallet error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Screen scrollable>
            <Header title="Import Wallet" showBack/>

            <View style={styles.content}>
                <View style={styles.info}>
                    <Text style={styles.title}>Restore Your Wallet</Text>
                    <Text style={styles.description}>
                        Enter your recovery phrase to restore your wallet
                    </Text>
                </View>

                <Input
                    label="Wallet Name"
                    placeholder="e.g., My Imported Wallet"
                    value={walletName}
                    onChangeText={setWalletName}
                />

                <Input
                    label="Recovery Phrase"
                    placeholder="Enter your 12 or 24 word recovery phrase"
                    value={mnemonic}
                    onChangeText={setMnemonic}
                    multiline
                    numberOfLines={4}
                    style={styles.mnemonicInput}
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                <View style={styles.hint}>
                    <Megaphone size={16} color={colors.textSecondary}/>
                    <Text style={styles.hintText}>
                        Separate each word with a space
                    </Text>
                </View>
            </View>

            <View style={styles.spacing} />

            <View style={styles.footer}>
                <Button
                    title="Import Wallet"
                    onPress={handleImport}
                    loading={loading}
                    disabled={!walletName.trim() || !mnemonic.trim()}
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
    mnemonicInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    hint: {
        flexDirection: 'row',
        gap: spacing.sm,
        alignItems: 'center',
        backgroundColor: colors.primary + '20',
        borderRadius: 8,
        padding: spacing.md,
    },
    hintText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    spacing: {
        height: spacing.md,
    },
    footer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
    },
});