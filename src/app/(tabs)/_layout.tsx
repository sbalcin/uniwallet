import {Tabs} from 'expo-router';
import {ArrowLeftRight, Settings, Wallet} from 'lucide-react-native';
import {colors} from '@/theme';
import {Platform} from "react-native";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textTertiary,
                tabBarStyle: {
                    backgroundColor: colors.background,
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                    height: Platform.OS === 'ios' ? 90 : 110,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Wallet',
                    tabBarIcon: ({color, size}) => <Wallet size={size} color={color}/>,
                }}
            />
            <Tabs.Screen
                name="transactions"
                options={{
                    title: 'Activity',
                    tabBarIcon: ({color, size}) => (
                        <ArrowLeftRight size={size} color={color}/>
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({color, size}) => <Settings size={size} color={color}/>,
                }}
            />
        </Tabs>
    );
}