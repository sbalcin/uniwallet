import React, {useState} from 'react';
import {StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View,} from 'react-native';
import {Eye, EyeOff} from 'lucide-react-native';
import {colors, spacing, typography} from '@/theme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    secureTextEntry?: boolean;
}

export const Input: React.FC<InputProps> = ({
                                                label,
                                                error,
                                                hint,
                                                leftIcon,
                                                rightIcon,
                                                secureTextEntry,
                                                style,
                                                ...props
                                            }) => {
    const [isSecure, setIsSecure] = useState(secureTextEntry);

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View style={[styles.inputContainer, error && styles.inputError]}>
                {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

                <TextInput
                    style={[styles.input,
                        ...(leftIcon ? [styles.inputWithLeftIcon] : []),
                        style]}
                    placeholderTextColor={colors.textTertiary}
                    secureTextEntry={isSecure}
                    {...props}
                />

                {secureTextEntry && (
                    <TouchableOpacity
                        style={styles.rightIcon}
                        onPress={() => setIsSecure(!isSecure)}
                    >
                        {isSecure ? (
                            <EyeOff size={20} color={colors.textSecondary}/>
                        ) : (
                            <Eye size={20} color={colors.textSecondary}/>
                        )}
                    </TouchableOpacity>
                )}

                {rightIcon && !secureTextEntry && (
                    <View style={styles.rightIcon}>{rightIcon}</View>
                )}
            </View>

            {error && <Text style={styles.error}>{error}</Text>}
            {hint && !error && <Text style={styles.hint}>{hint}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        ...typography.labelMedium,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    inputError: {
        borderColor: colors.error,
    },
    input: {
        ...typography.bodyMedium,
        flex: 1,
        color: colors.text,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
    },
    inputWithLeftIcon: {
        paddingLeft: spacing.sm,
    },
    leftIcon: {
        paddingLeft: spacing.md,
    },
    rightIcon: {
        paddingRight: spacing.md,
    },
    error: {
        ...typography.bodySmall,
        color: colors.error,
        marginTop: spacing.xs,
    },
    hint: {
        ...typography.bodySmall,
        color: colors.textTertiary,
        marginTop: spacing.xs,
    },
});