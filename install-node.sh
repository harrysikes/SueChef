#!/bin/bash

# SueChef - Node.js Installation Script
# This script will help you install Node.js on macOS

echo "🔍 Checking for Node.js..."

if command -v node &> /dev/null; then
    echo "✅ Node.js is already installed!"
    node --version
    npm --version
    exit 0
fi

echo "📦 Node.js not found. Installing..."

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "🍺 Homebrew not found. Installing Homebrew first..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH (for Apple Silicon Macs)
    if [ -f /opt/homebrew/bin/brew ]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
fi

echo "📥 Installing Node.js via Homebrew..."
brew install node

echo "✅ Node.js installation complete!"
echo ""
echo "📋 Verifying installation:"
node --version
npm --version

echo ""
echo "🎉 Ready to install project dependencies!"
echo "Run: npm install"


