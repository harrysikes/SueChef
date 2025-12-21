#!/bin/bash

# Quick Install Script for SueChef
# Run this AFTER you've installed Homebrew and Node.js

echo "🚀 SueChef Installation Script"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo ""
    echo "Please install Node.js first:"
    echo "  1. Install Homebrew: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    echo "  2. Install Node.js: brew install node"
    echo ""
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo "✅ npm found: $(npm --version)"
echo ""

# Navigate to project directory
cd "$(dirname "$0")"

echo "📦 Installing project dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Installation complete!"
    echo ""
    echo "📝 Next steps:"
    echo "  1. Create a .env file with your Firebase and OpenAI credentials"
    echo "  2. Run 'npm start' to start the development server"
    echo ""
else
    echo ""
    echo "❌ Installation failed. Please check the error messages above."
    exit 1
fi


