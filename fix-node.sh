#!/bin/bash

# Automatic Node.js Version Fixer
# This script automatically upgrades Node.js to a compatible version

echo "🔧 Automatic Node.js Version Fixer"
echo "=================================="
echo ""

# Check current Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)

echo "📊 Current Node.js version: v$NODE_VERSION"
echo ""

if [ "$MAJOR_VERSION" -ge 20 ]; then
    echo "✅ Node.js version is already compatible!"
    exit 0
fi

echo "⚠️  Node.js needs to be upgraded (requires v20.19+ or v22.12+)"
echo ""

# Method 1: Try nvm
echo "🔍 Checking for nvm..."
if command -v nvm &> /dev/null || [ -f "$HOME/.nvm/nvm.sh" ]; then
    echo "✅ nvm found! Using nvm to install Node.js 20..."
    
    # Source nvm
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    
    echo "📦 Installing Node.js 20 via nvm..."
    nvm install 20
    
    echo "🔄 Switching to Node.js 20..."
    nvm use 20
    
    echo "💾 Setting Node.js 20 as default..."
    nvm alias default 20
    
    echo ""
    echo "✅ Node.js upgraded successfully!"
    echo "📊 New version: $(node -v)"
    echo ""
    ./run.sh
fi

echo "❌ nvm not found"
echo ""

# Method 2: Try Homebrew
echo "🔍 Checking for Homebrew..."
if command -v brew &> /dev/null; then
    echo "✅ Homebrew found! Using brew to upgrade Node.js..."
    
    echo "📦 Updating Homebrew..."
    brew update
    
    echo "⬆️  Upgrading Node.js..."
    brew upgrade node
    
    echo ""
    echo "✅ Node.js upgraded successfully!"
    echo "📊 New version: $(node -v)"
    echo ""
    echo "💡 Run './run.sh' to start the dev server"
    exit 0
fi

echo "❌ Homebrew not found"
echo ""

# Method 3: Manual instructions
echo "❌ Automatic installation not available"
echo ""
echo "📋 Please upgrade Node.js manually:"
echo ""
echo "Option 1 - Install nvm first (recommended):"
echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
echo "  source ~/.zshrc  # or ~/.bashrc"
echo "  nvm install 20"
echo "  nvm use 20"
echo ""
echo "Option 2 - Install Homebrew first:"
echo "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
echo "  brew install node@20"
echo ""
echo "Option 3 - Download directly:"
echo "  Visit https://nodejs.org/ and download v20.x LTS"
echo ""
exit 1
