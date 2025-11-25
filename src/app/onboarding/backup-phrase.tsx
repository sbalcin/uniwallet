import React, {useEffect, useState} from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {Copy, Eye, EyeOff, TriangleAlert} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import {Button, Card, Header, Screen} from '@/components';
import {colors, spacing, typography} from '@/theme';
import {toast} from 'sonner-native';

export default function BackupPhraseScreen() {
    const router = useRouter();
    const [mnemonic, setMnemonic] = useState<string[]>([]);
    const [isVisible, setIsVisible] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const params = useLocalSearchParams<{ mnemonic: string }>();

    useEffect(() => {
        loadMnemonic();
    }, []);

    const loadMnemonic = () => {
        try {
            if (params.mnemonic) {
                const words = params.mnemonic.split(' ');
                if (words.length === 12) {
                    setMnemonic(words);
                } else {
                    Alert.alert('Error', 'Invalid recovery phrase');
                    console.error('Invalid mnemonic length:', words.length);
                }
            } else {
                Alert.alert('Error', 'No recovery phrase found');
                console.error('No mnemonic in params');
            }
        } catch (error) {
            console.error('Load mnemonic error:', error);
        }
    };

    const handleCopy = async () => {
        if (mnemonic.length === 0) return;

        await Clipboard.setStringAsync(mnemonic.join(' '));
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        toast.success('Copied to clipboard');
    };

    const handleContinue = () => {
        if (!confirmed) {
            Alert.alert(
                'Confirmation Required',
                'Please confirm that you have saved your recovery phrase',
                [{text: 'OK'}]
            );
            return;
        }
        router.push('/onboarding/complete');
    };

    return (
        <Screen scrollable>
            <Header title="Backup Phrase" showBack/>

            <View style={styles.content}>
                <View style={styles.warning}>
                    <TriangleAlert style={styles.warningIcon} size={32} color={colors.warning}/>
                    <Text style={styles.warningText}>
                        Write down your recovery phrase and store it in a safe place. Never
                        share it with anyone.
                    </Text>
                </View>

                <Card style={styles.phraseCard}>
                    <View style={styles.phraseHeader}>
                        <Text style={styles.phraseTitle}>Recovery Phrase</Text>
                        <View style={styles.phraseActions}>
                            <TouchableOpacity
                                onPress={() => setIsVisible(!isVisible)}
                                style={styles.iconButton}
                            >
                                {isVisible ? (
                                    <EyeOff size={20} color={colors.textSecondary}/>
                                ) : (
                                    <Eye size={20} color={colors.textSecondary}/>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleCopy} style={styles.iconButton}>
                                <Copy size={20} color={colors.textSecondary}/>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.phraseGrid}>
                        {mnemonic.map((word, index) => (
                            <View key={index} style={styles.wordCard}>
                                <Text style={styles.wordNumber}>{index + 1}</Text>
                                <Text style={styles.word}>
                                    {isVisible ? word : '••••••'}
                                </Text>
                            </View>
                        ))}
                    </View>
                </Card>

                <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => setConfirmed(!confirmed)}
                >
                    <View style={[styles.checkboxBox, confirmed && styles.checkboxChecked]}>
                        {confirmed && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxLabel}>
                        I have saved my recovery phrase in a safe place
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Button
                    title="Continue"
                    onPress={handleContinue}
                    disabled={!confirmed}
                />
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
    },
    warning: {
        backgroundColor: colors.warning + '20',
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.lg,
        alignItems: 'center',
    },
    warningIcon: {
        marginBottom: spacing.sm,
    },
    warningText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    phraseCard: {
        marginBottom: spacing.lg,
    },
    phraseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    phraseTitle: {
        ...typography.headingSmall,
        color: colors.text,
    },
    phraseActions: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    iconButton: {
        padding: spacing.xs,
    },
    phraseGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    wordCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceHover,
        borderRadius: 8,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        width: '47%',
    },
    wordNumber: {
        ...typography.labelSmall,
        color: colors.textTertiary,
        marginRight: spacing.sm,
    },
    word: {
        ...typography.bodyMedium,
        color: colors.text,
    },
    checkbox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxBox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.border,
        marginRight: spacing.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    checkmark: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
    },
    checkboxLabel: {
        ...typography.bodyMedium,
        color: colors.text,
        flex: 1,
    },
    footer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
    },
});