import React from 'react';
import {KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, ViewStyle,} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors} from '@/theme';

interface ScreenProps {
    children: React.ReactNode;
    style?: ViewStyle;
    scrollable?: boolean;
    edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export const Screen: React.FC<ScreenProps> = ({
                                                  children,
                                                  style,
                                                  scrollable = false,
                                                  edges = ['top', 'bottom'],
                                              }) => {
    const content = scrollable ? (
        <ScrollView
            contentContainerStyle={[styles.scrollContent, style]}
            showsVerticalScrollIndicator={false}
        >
            {children}
        </ScrollView>
    ) : (
        <View style={[styles.container, style]}>{children}</View>
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={edges}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {content}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
});