import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useRouter} from 'expo-router';
import {ArrowLeft} from 'lucide-react-native';
import {colors, spacing, typography} from '@/theme';

interface HeaderProps {
    title?: string;
    showBack?: boolean;
    rightAction?: React.ReactNode;
    onBackPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
                                                  title,
                                                  showBack = false,
                                                  rightAction,
                                                  onBackPress,
                                              }) => {
    const router = useRouter();

    const handleBackPress = () => {
        if (onBackPress) {
            onBackPress();
        } else {
            router.back();
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.left}>
                {showBack && (
                    <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                        <ArrowLeft size={24} color={colors.text}/>
                    </TouchableOpacity>
                )}
            </View>

            {title && (
                <View style={styles.center}>
                    <Text style={styles.title} numberOfLines={1}>
                        {title}
                    </Text>
                </View>
            )}

            <View style={styles.right}>{rightAction}</View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    left: {
        width: 48,
        alignItems: 'flex-start',
    },
    center: {
        flex: 1,
        alignItems: 'center',
    },
    right: {
        width: 48,
        alignItems: 'flex-end',
    },
    backButton: {
        padding: spacing.xs,
    },
    title: {
        ...typography.headingMedium,
        color: colors.text,
    },
});