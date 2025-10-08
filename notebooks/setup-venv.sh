#!/bin/bash
# Setup script for Argo Jupyter notebooks with Python virtual environment

set -e

echo "🐍 Setting up Python virtual environment for Argo notebooks"
echo "=========================================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from project root directory"
    echo "   cd /path/to/argo && ./notebooks/setup-venv.sh"
    exit 1
fi

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 not found"
    echo "   Install Python 3.7+ from https://python.org"
    exit 1
fi

echo "✅ Python $(python3 --version) detected"

# Create virtual environment if it doesn't exist
if [ ! -d "notebooks/.venv" ]; then
    echo ""
    echo "📦 Creating Python virtual environment..."
    python3 -m venv notebooks/.venv
    echo "✅ Virtual environment created at notebooks/.venv"
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
echo ""
echo "🔄 Activating virtual environment..."
source notebooks/.venv/bin/activate

# Upgrade pip
echo "📦 Upgrading pip..."
pip install --upgrade pip

# Install Python requirements
echo ""
echo "📦 Installing Python requirements..."
pip install -r notebooks/requirements.txt

# Install tslab in the virtual environment
echo ""
echo "📦 Installing tslab (TypeScript kernel for Jupyter)..."
npm install -g tslab

# Register tslab with the virtual environment's Python
echo "📝 Registering tslab with Jupyter..."
tslab install --python=notebooks/.venv/bin/python

# Verify installation
echo ""
echo "🔍 Verifying installation..."
echo "Python packages:"
pip list | grep -E "(jupyter|notebook|ipykernel)"

echo ""
echo "Jupyter kernels:"
jupyter kernelspec list

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the notebook server:"
echo "  source notebooks/.venv/bin/activate"
echo "  jupyter notebook notebooks/argo-tutorial.ipynb"
echo ""
echo "Or use the start script:"
echo "  ./notebooks/start-notebook.sh"
