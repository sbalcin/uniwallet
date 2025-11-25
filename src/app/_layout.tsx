import {DarkTheme, ThemeProvider as NavigationThemeProvider} from '@react-navigation/native';
import {WalletProvider, WDKService} from '@tetherto/wdk-react-native-provider';
import {ThemeProvider} from '@tetherto/wdk-uikit-react-native';
import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {StatusBar} from 'expo-status-bar';
import {useEffect} from 'react';
import {Platform, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import 'react-native-reanimated';
import {Toaster} from 'sonner-native';
import {colors} from '@/theme';
import getChainsConfig from "@/config/chains";
import * as NavigationBar from 'expo-navigation-bar';

void SplashScreen.preventAutoHideAsync();

const CustomDarkTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        background: colors.background,
        card: colors.background,
    },
};

export default function RootLayout() {
    useEffect(() => {
        const initApp = async () => {
            try {
                await WDKService.initialize();

                if (Platform.OS === 'android') {
                    await NavigationBar.setButtonStyleAsync("light");
                }
            } catch (error) {
                console.error('Failed to initialize WDK:', error);
            } finally {
                void SplashScreen.hideAsync();
            }
        };

        void initApp();
    }, []);

    return (
        <GestureHandlerRootView style={{flex: 1}}>
            <ThemeProvider
                defaultMode="dark"
                brandConfig={{
                    primaryColor: colors.primary,
                }}
            >
                <WalletProvider
                    config={{
                        indexer: {
                            apiKey: process.env.EXPO_PUBLIC_WDK_INDEXER_API_KEY!,
                            url: process.env.EXPO_PUBLIC_WDK_INDEXER_BASE_URL!,
                        },
                        chains: getChainsConfig(),
                        enableCaching: true,
                    }}
                >
                    <NavigationThemeProvider value={CustomDarkTheme}>
                        <View style={{flex: 1, backgroundColor: colors.background}}>
                            <Stack
                                screenOptions={{
                                    headerShown: false,
                                    contentStyle: {backgroundColor: colors.background},
                                    animation: 'slide_from_right',
                                }}
                            >
                                <Stack.Screen name="index"/>
                                <Stack.Screen name="onboarding"/>
                                <Stack.Screen name="authorize"/>
                            </Stack>
                            <StatusBar style="light"/>
                        </View>
                    </NavigationThemeProvider>
                </WalletProvider>
                <Toaster
                    offset={90}
                    toastOptions={{
                        style: {
                            backgroundColor: colors.surface,
                            borderWidth: 1,
                            borderColor: colors.border,
                        },
                        titleStyle: {color: colors.text},
                        descriptionStyle: {color: colors.textSecondary},
                    }}
                />
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}