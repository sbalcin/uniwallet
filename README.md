# UniWallet - React Native Crypto Wallet

A polished, secure React Native cryptocurrency wallet application built with Tether WDK, featuring biometric authentication, multi-chain support, and comprehensive transaction management.

## 🚀 Features

### Core Functionality
- ✅ **Biometric Authentication** - Face ID/Touch ID for secure wallet access
- ✅ **Wallet Management** - Create new wallets or import existing seed phrases
- ✅ **Multi-Wallet Support** - Create and switch between multiple wallets
- ✅ **Balance Display** - Real-time balance tracking for BTC, USDT, and XAUT
- ✅ **QR Code Support** - Generate and scan QR codes for addresses
- ✅ **Send Transactions** - Send crypto with real-time fee estimation
- ✅ **Transaction History** - View incoming and outgoing transactions
- ✅ **Address Management** - View and share wallet addresses

### Supported Assets
- Bitcoin (BTC) - SegWit
- Tether USD (USDT) - Ethereum, Polygon, Arbitrum, TON
- Tether Gold (XAUT) - Ethereum, Polygon, Arbitrum, TON

## 🛠️ Tech Stack

### Core Technologies
- **React Native** 0.81.4 - Cross-platform mobile framework
- **Expo** ~54.0.8 - Development and build tooling
- **TypeScript** 5.9.2 - Type-safe development
- **Expo Router** ~6.0.6 - File-based navigation

### Tether WDK Integration
- **@tetherto/wdk-react-native-provider** ^1.0.0-beta.3 - Wallet context and services
- **@tetherto/pear-wrk-wdk** ^1.0.0-beta.4 - Core wallet functionality
- **@tetherto/wdk-pricing-provider** ^1.0.0-beta.1 - Asset pricing
- **@tetherto/wdk-uikit-react-native** ^1.0.0-beta.2 - UI components

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- iOS Simulator (for iOS development)
- Android Studio & Android SDK (for Android development)
- Physical device for biometric testing

### Installation

```bash
# Clone and install
git clone https://github.com/sbalcin/uniwallet.git
cd uniwallet
npm install

npx expo start
```

## 🔐 Security Features

- Biometric authentication (Face ID/Touch ID)
- Encrypted seed phrase storage in device keychain
- Device-specific encryption keys
- Secure transaction signing
- Fee estimation before sending

## 📱 Key Screens

1. **Onboarding** - Create or import wallet with seed phrase
2. **Authorization** - Biometric unlock
3. **Wallet** - Balance overview and transaction history
4. **Receive** - QR code and address display
5. **Send** - Amount input, address scanning, fee estimation



## 📦 Build

```bash
# Android APK
npx expo run:android --variant release

# iOS
eas build --platform ios --profile production
```

**Built with using React Native and Tether WDK**