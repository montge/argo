#!/bin/bash
# Quick start script for Argo Jupyter notebooks

set -e

echo "🚀 Argo Notebook Quick Start"
echo "=============================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from project root directory"
    echo "   cd /path/to/argo && ./notebooks/start-notebook.sh"
    exit 1
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js not found"
    echo "   Install Node.js 20.x or 22.x from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "⚠️  Warning: Node.js $NODE_VERSION detected. Recommended: Node.js 20 or 22"
fi

echo "✅ Node.js $(node -v) detected"

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 not found"
    echo "   Install Python 3.7+ from https://python.org"
    exit 1
fi

echo "✅ Python $(python3 --version) detected"

# Install npm dependencies
echo ""
echo "📦 Installing npm dependencies..."
npm install

# Check for tslab
if ! command -v tslab &> /dev/null; then
    echo ""
    echo "📦 Installing tslab (TypeScript kernel for Jupyter)..."
    npm install -g tslab

    echo "📝 Registering tslab with Jupyter..."
    tslab install --python=python3
else
    echo "✅ tslab already installed"
fi

# Check for Jupyter
if ! command -v jupyter &> /dev/null; then
    echo ""
    echo "📦 Installing Jupyter..."
    pip3 install --user jupyter notebook

    # Add user bin to PATH if needed
    if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
        echo "⚠️  Adding ~/.local/bin to PATH"
        export PATH="$HOME/.local/bin:$PATH"
    fi
else
    echo "✅ Jupyter already installed"
fi

# Verify tslab kernel is registered
echo ""
echo "🔍 Checking Jupyter kernels..."
if jupyter kernelspec list | grep -q tslab; then
    echo "✅ TypeScript kernel (tslab) registered"
else
    echo "📝 Registering TypeScript kernel..."
    tslab install --python=python3
fi

# Start Jupyter
echo ""
echo "🎉 Setup complete! Starting Jupyter Notebook..."
echo ""
echo "📖 The tutorial will open in your browser"
echo "   Navigate to: notebooks/argo-tutorial.ipynb"
echo ""
echo "💡 Tips:"
echo "   - Press Shift+Enter to run a cell"
echo "   - Select Kernel > TypeScript if prompted"
echo "   - Press Ctrl+C here to stop the server"
echo ""

sleep 2

jupyter notebook notebooks/argo-tutorial.ipynb
