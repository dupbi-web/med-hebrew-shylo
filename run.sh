#!/bin/bash

# Med Hebrew Shylo - Development Server Runner
# This script starts the Vite development server

echo "🚀 Starting Med Hebrew Shylo development server..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 node_modules not found. Installing dependencies..."
    npm install
    echo ""
fi

# Start the development server
echo "🔧 Starting Vite dev server..."
npm run dev
