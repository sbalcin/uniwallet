import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {CameraView, useCameraPermissions} from 'expo-camera';
import {Button, Screen} from '@/components';
import {colors, spacing, typography} from '@/theme';
import {X} from 'lucide-react-native';

export default function ScanQRScreen() {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const params = useLocalSearchParams();
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        if (permission && !permission.granted) {
            void requestPermission();
        }
    }, [permission]);

    const handleBarCodeScanned = ({data}: { data: string }) => {
        if (scanned) return;

        setScanned(true);

        let address = data;

        if (data.startsWith('ethereum:')) {
            address = data.replace('ethereum:', '').split('?')[0];
        } else if (data.startsWith('bitcoin:')) {
            address = data.replace('bitcoin:', '').split('?')[0];
        } else if (data.includes(':')) {
            address = data.split(':')[1].split('?')[0];
        }

        const returnParams = params as any;

        router.replace({
            pathname: '/send/details',
            params: {
                ...returnParams,
                scannedAddress: address,
            },
        });
    };

    const handleClose = () => {
        router.back();
    };

    if (!permission) {
        return (
            <Screen>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Scan QR Code</Text>
                    <TouchableOpacity onPress={handleClose}>
                        <X size={24} color={colors.text}/>
                    </TouchableOpacity>
                </View>
                <View style={styles.centerContainer}>
                    <Text style={styles.message}>Requesting camera permission...</Text>
                </View>
            </Screen>
        );
    }

    if (!permission.granted) {
        return (
            <Screen>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Scan QR Code</Text>
                    <TouchableOpacity onPress={handleClose}>
                        <X size={24} color={colors.text}/>
                    </TouchableOpacity>
                </View>
                <View style={styles.centerContainer}>
                    <Text style={styles.message}>
                        Camera permission is required to scan QR codes
                    </Text>
                    <Button title="Grant Permission" onPress={requestPermission}/>
                </View>
            </Screen>
        );
    }

    return (
        <Screen>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Scan QR Code</Text>
                    <TouchableOpacity onPress={handleClose}>
                        <X size={24} color={colors.text}/>
                    </TouchableOpacity>
                </View>

                <View style={styles.cameraContainer}>
                    <CameraView
                        style={styles.camera}
                        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                        barcodeScannerSettings={{
                            barcodeTypes: ['qr'],
                        }}
                    />

                    <View style={styles.overlay}>
                        <View style={styles.scanArea}>
                            <View style={[styles.corner, styles.topLeft]}/>
                            <View style={[styles.corner, styles.topRight]}/>
                            <View style={[styles.corner, styles.bottomLeft]}/>
                            <View style={[styles.corner, styles.bottomRight]}/>
                        </View>

                        <Text style={styles.instruction}>
                            Position the QR code within the frame
                        </Text>
                    </View>
                </View>

                {scanned && (
                    <View style={styles.footer}>
                        <Button
                            title="Scan Again"
                            onPress={() => setScanned(false)}
                            variant="outline"
                        />
                    </View>
                )}
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        ...typography.headingLarge,
        color: colors.text,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
    },
    message: {
        ...typography.bodyLarge,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    cameraContainer: {
        flex: 1,
        position: 'relative',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    scanArea: {
        width: 250,
        height: 250,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: colors.primary,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
    },
    instruction: {
        ...typography.bodyMedium,
        color: colors.text,
        marginTop: spacing.xl,
        textAlign: 'center',
        backgroundColor: colors.overlay,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: 8,
    },
    footer: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
    },
});