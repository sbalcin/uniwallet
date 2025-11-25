import {Alert} from "react-native";

export const showCreateWalletAlert = (onContinue: () => void) => {
    Alert.alert(
        'Create New Wallet',
        'Creating a new wallet will require you to back up a new recovery phrase. Your current wallet will remain accessible only if you have your recovery phrase.',
        [
            {text: 'Cancel', style: 'cancel'},
            {
                text: 'Continue',
                onPress: onContinue,
            },
        ]
    );
};

export const showImportWalletAlert = (onContinue: () => void) => {
    Alert.alert(
        'Import Wallet',
        'You can import an existing wallet using your recovery phrase. Your current wallet will remain accessible only if you have your recovery phrase.',
        [
            {text: 'Cancel', style: 'cancel'},
            {
                text: 'Continue',
                onPress: onContinue,
            },
        ]
    );
};