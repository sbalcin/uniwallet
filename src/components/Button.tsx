import React from 'react';
import {ActivityIndicator, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle,} from 'react-native';
import {colors, shadows, spacing, typography} from '@/theme';

interface ButtonProps {
    title?: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
                                                  title,
                                                  onPress,
                                                  variant = 'primary',
                                                  size = 'medium',
                                                  disabled = false,
                                                  loading = false,
                                                  style,
                                                  textStyle,
                                                  children,
                                              }) => {
    const getButtonStyle = (): ViewStyle => {
        const baseStyle: ViewStyle = {
            ...styles.base,
            ...styles[size],
        };

        if (disabled || loading) {
            return {...baseStyle, ...styles.disabled};
        }

        return {...baseStyle, ...styles[variant]};
    };

    const renderContent = () => {
        if (loading) {
            return (
                <ActivityIndicator
                    color={variant === 'primary' ? colors.text : colors.primary}
                />
            );
        }

        if (children) {
            return children;
        }

        return (
            <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>
                {title}
            </Text>
        );
    };

    return (
        <TouchableOpacity
            style={[getButtonStyle(), style]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {renderContent()}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    small: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    medium: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
    },
    large: {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
    },
    primary: {
        backgroundColor: colors.primary,
        ...shadows.small,
    },
    secondary: {
        backgroundColor: colors.surface,
        ...shadows.small,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    disabled: {
        backgroundColor: colors.surfaceHover,
        opacity: 0.5,
    },
    text: {
        ...typography.labelLarge,
        fontWeight: '600',
    },
    primaryText: {
        color: colors.text,
    },
    secondaryText: {
        color: colors.text,
    },
    outlineText: {
        color: colors.text,
    },
    ghostText: {
        color: colors.primary,
    },
});