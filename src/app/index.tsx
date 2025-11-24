import {useWallet} from '@tetherto/wdk-react-native-provider';
import {Redirect} from 'expo-router';
import {LoadingSpinner} from '@/components';
import {pricingService} from "@/services/pricing.service";
import {useEffect, useState} from "react";

export default function Index() {
    const {wallet, isInitialized, isUnlocked} = useWallet();
    const [isPricingReady, setIsPricingReady] = useState(false);

    useEffect(() => {
        const initializePricing = async () => {
            try {
                await pricingService.initialize();
                setIsPricingReady(true);
            } catch (error) {
                console.error('Failed to initialize pricing service:', error);
                setIsPricingReady(true);
            }
        };

        void initializePricing();
    }, []);

    if (!isInitialized || !isPricingReady) {
        return <LoadingSpinner message="Initializing UniWallet..."/>;
    }

    if (!wallet) {
        return <Redirect href="/onboarding"/>;
    }

    return <Redirect href={isUnlocked ? '/(tabs)' as any : '/authorize'}/>;
}