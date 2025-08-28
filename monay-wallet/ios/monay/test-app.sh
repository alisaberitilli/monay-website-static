#!/bin/bash

echo "🚀 Monay iOS App Test Script"
echo "============================"

# Check Xcode installation
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Xcode not found. Please install Xcode from App Store"
    exit 1
fi

# Accept license if needed
echo "📝 Checking Xcode license..."
sudo xcodebuild -license accept 2>/dev/null

# Install pods
echo "📦 Installing CocoaPods dependencies..."
pod install

# Clean build folder
echo "🧹 Cleaning build folder..."
xcodebuild clean -workspace Monay.xcworkspace -scheme Monay

# Build for simulator
echo "🔨 Building for iOS Simulator..."
xcodebuild build \
    -workspace Monay.xcworkspace \
    -scheme Monay \
    -configuration Debug \
    -sdk iphonesimulator \
    -derivedDataPath build \
    -destination 'platform=iOS Simulator,name=iPhone 15,OS=latest' \
    CODE_SIGN_IDENTITY="" \
    CODE_SIGNING_REQUIRED=NO

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "To run the app:"
    echo "1. Open Xcode: open Monay.xcworkspace"
    echo "2. Select iPhone simulator from the device menu"
    echo "3. Press ⌘+R to run"
    echo ""
    echo "Or use the Simulator directly:"
    echo "1. Open Simulator: open /Applications/Xcode.app/Contents/Developer/Applications/Simulator.app"
    echo "2. Drag the app from build/Build/Products/Debug-iphonesimulator/Monay.app to the simulator"
else
    echo "❌ Build failed. Please check the error messages above."
fi