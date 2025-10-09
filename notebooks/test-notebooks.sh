#!/bin/bash
#
# Notebook Testing Script - Headless Execution
#
# This script executes all Jupyter notebooks in the notebooks/ directory
# using jupyter nbconvert --execute for headless, non-interactive testing.
#
# Requirements:
# - Python 3.x with jupyter and nbconvert installed
# - Node.js 20+ with npm
# - tslab kernel installed globally
# - argo-core package built (npm run build --workspace=@argo/core)
#
# Usage:
#   ./test-notebooks.sh                    # Test all notebooks
#   ./test-notebooks.sh argo-tutorial.ipynb  # Test specific notebook
#
# Exit Codes:
#   0 - All notebooks executed successfully
#   1 - One or more notebooks failed to execute
#

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Configuration
OUTPUT_DIR="$SCRIPT_DIR/test-output"
FAILED_COUNT=0
PASSED_COUNT=0
TOTAL_COUNT=0

echo -e "${BLUE}=== Argo Notebook Testing ===${NC}"
echo ""

# Create output directory for executed notebooks
mkdir -p "$OUTPUT_DIR"

# Check if jupyter is installed
if ! command -v jupyter &> /dev/null; then
    echo -e "${RED}ERROR: jupyter command not found${NC}"
    echo "Please install Jupyter: pip install jupyter nbconvert"
    exit 1
fi

# Check if nbconvert is available
if ! python3 -c "import nbconvert" 2>/dev/null; then
    echo -e "${RED}ERROR: nbconvert module not found${NC}"
    echo "Please install nbconvert: pip install nbconvert"
    exit 1
fi

# Check if tslab kernel is installed
if ! jupyter kernelspec list | grep -q "tslab"; then
    echo -e "${YELLOW}WARNING: tslab kernel not found${NC}"
    echo "Install with: npm install -g tslab && tslab install"
    echo ""
fi

# Check if argo-core is built
if [ ! -f "../packages/argo-core/dist/index.js" ]; then
    echo -e "${YELLOW}WARNING: argo-core package not built${NC}"
    echo "Building argo-core..."
    cd ..
    npm run build --workspace=@argo/core
    cd "$SCRIPT_DIR"
    echo ""
fi

# Function to test a single notebook
test_notebook() {
    local notebook="$1"
    local basename=$(basename "$notebook" .ipynb)
    local output_notebook="$OUTPUT_DIR/${basename}_executed.ipynb"

    echo -e "${BLUE}Testing:${NC} $notebook"

    # Execute notebook with timeout
    if timeout 300 jupyter nbconvert \
        --to notebook \
        --execute \
        --output="$output_notebook" \
        --ExecutePreprocessor.timeout=180 \
        --ExecutePreprocessor.kernel_name=tslab \
        "$notebook" 2>&1 | tee "$OUTPUT_DIR/${basename}.log"; then

        echo -e "${GREEN}✓ PASS:${NC} $notebook"
        PASSED_COUNT=$((PASSED_COUNT + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL:${NC} $notebook"
        echo -e "${RED}  See log: $OUTPUT_DIR/${basename}.log${NC}"
        FAILED_COUNT=$((FAILED_COUNT + 1))
        return 1
    fi
}

# Get list of notebooks to test
if [ $# -eq 0 ]; then
    # Test all .ipynb files
    NOTEBOOKS=(*.ipynb)
else
    # Test specific notebooks provided as arguments
    NOTEBOOKS=("$@")
fi

echo "Found ${#NOTEBOOKS[@]} notebook(s) to test"
echo ""

# Test each notebook
for notebook in "${NOTEBOOKS[@]}"; do
    if [ -f "$notebook" ]; then
        TOTAL_COUNT=$((TOTAL_COUNT + 1))
        test_notebook "$notebook" || true  # Don't exit on first failure
        echo ""
    else
        echo -e "${YELLOW}WARNING: Notebook not found: $notebook${NC}"
        echo ""
    fi
done

# Print summary
echo -e "${BLUE}=== Test Summary ===${NC}"
echo "Total:  $TOTAL_COUNT"
echo -e "${GREEN}Passed: $PASSED_COUNT${NC}"
echo -e "${RED}Failed: $FAILED_COUNT${NC}"
echo ""

if [ $TOTAL_COUNT -eq 0 ]; then
    echo -e "${YELLOW}No notebooks found to test${NC}"
    exit 1
fi

if [ $FAILED_COUNT -eq 0 ]; then
    echo -e "${GREEN}✓ All notebooks passed!${NC}"
    echo "Executed notebooks saved to: $OUTPUT_DIR"
    exit 0
else
    echo -e "${RED}✗ Some notebooks failed${NC}"
    echo "Check logs in: $OUTPUT_DIR"
    exit 1
fi
