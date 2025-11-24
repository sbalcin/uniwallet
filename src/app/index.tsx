import {useWallet} from '@tetherto/wdk-react-native-provider';
import {Redirect} from 'expo-router';
import {LoadingSpinner} from '@/components';

export default function Index() {
    const {wallet, isInitialized, isUnlocked} = useWallet();

    if (!isInitialized) {
        return <LoadingSpinner message="Initializing UniWallet..."/>;
    }

    if (!wallet) {
        return <Redirect href="/onboarding"/>;
    }

    return <Redirect href={isUnlocked ? '/(tabs)' as any : '/authorize'}/>;
}