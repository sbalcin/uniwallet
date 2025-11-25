import React from 'react';
import {Image, Linking, StyleSheet, Text, View} from 'react-native';
import {ExternalLink} from 'lucide-react-native';
import {Card, Header, Screen} from '@/components';
import {colors, spacing, typography} from '@/theme';

export default function AboutScreen() {
    const handleOpenLink = (url: string) => {
        Linking.openURL(url);
    };

    return (
        <Screen scrollable>
            <Header title="About" showBack/>

            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../assets/images/app-logo.png')}
                        style={styles.logo}
                        resizeMode="cover"
                    />
                    <Text style={styles.appName}>UniWallet</Text>
                    <Text style={styles.version}>Version 1.0.0</Text>
                </View>

                <Card style={styles.infoCard}>
                    <Text style={styles.infoTitle}>About UniWallet</Text>
                    <Text style={styles.infoText}>
                        UniWallet is a secure, self-custodial cryptocurrency wallet built
                        with Tether WDK. It provides a simple and professional interface for
                        managing your digital assets across multiple blockchains.
                    </Text>
                </Card>

                <Card
                    style={styles.linkCard}
                    onPress={() => handleOpenLink('https://docs.wallet.tether.io')}
                >
                    <Text style={styles.linkText}>Documentation</Text>
                    <ExternalLink size={20} color={colors.textSecondary}/>
                </Card>

                <Card
                    style={styles.linkCard}
                    onPress={() => handleOpenLink('https://github.com/tetherto/wdk-react-native-provider')}
                >
                    <Text style={styles.linkText}>GitHub Repository</Text>
                    <ExternalLink size={20} color={colors.textSecondary}/>
                </Card>

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
    logoContainer: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    appName: {
        ...typography.displaySmall,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    version: {
        ...typography.bodyMedium,
        color: colors.textSecondary,
    },
    infoCard: {
        marginBottom: spacing.md,
    },
    infoTitle: {
        ...typography.headingMedium,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    infoText: {
        ...typography.bodyMedium,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    linkCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    linkText: {
        ...typography.bodyMedium,
        color: colors.text,
    },
    footer: {
        alignItems: 'center',
        marginTop: spacing.xl,
        paddingTop: spacing.xl,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    footerText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    copyright: {
        ...typography.bodySmall,
        color: colors.textTertiary,
    },
});