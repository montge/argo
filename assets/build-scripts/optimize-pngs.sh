#!/bin/bash
#
# PNG Optimization Script
#
# Optimizes all PNG files in the assets directory to reduce file size
# while maintaining visual quality
#
# Usage:
#   ./optimize-pngs.sh [directory]
#
# Example:
#   ./optimize-pngs.sh                  # Optimize all PNGs in assets/
#   ./optimize-pngs.sh ../icons/        # Optimize PNGs in specific directory
#
# Requirements:
#   - optipng or pngcrush
#

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Determine target directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ASSETS_DIR="$(dirname "$SCRIPT_DIR")"

if [ $# -eq 0 ]; then
    TARGET_DIR="$ASSETS_DIR"
else
    TARGET_DIR="$1"
fi

# Verify directory exists
if [ ! -d "$TARGET_DIR" ]; then
    echo -e "${RED}ERROR: Directory not found: $TARGET_DIR${NC}"
    exit 1
fi

echo -e "${BLUE}=== PNG Optimization ===${NC}"
echo "Target: $TARGET_DIR"
echo ""

# Check for optimization tools
OPTIMIZER=""
if command -v optipng &> /dev/null; then
    OPTIMIZER="optipng"
    echo "Using: optipng"
elif command -v pngcrush &> /dev/null; then
    OPTIMIZER="pngcrush"
    echo "Using: pngcrush"
else
    echo -e "${YELLOW}WARNING: No PNG optimizer found${NC}"
    echo "Install with:"
    echo "  sudo apt-get install optipng (Ubuntu/Debian)"
    echo "  brew install optipng (macOS)"
    echo ""
    echo "Skipping optimization..."
    exit 0
fi

echo ""

# Find all PNG files
PNG_FILES=$(find "$TARGET_DIR" -type f -name "*.png" 2>/dev/null)

if [ -z "$PNG_FILES" ]; then
    echo -e "${YELLOW}No PNG files found in $TARGET_DIR${NC}"
    exit 0
fi

# Count files
TOTAL=$(echo "$PNG_FILES" | wc -l)
OPTIMIZED=0
FAILED=0

echo "Found $TOTAL PNG file(s) to optimize"
echo ""

# Optimize each file
while IFS= read -r file; do
    filename=$(basename "$file")
    echo -e "${BLUE}Optimizing:${NC} $filename"

    if [ "$OPTIMIZER" = "optipng" ]; then
        # optipng: -o2 is good balance of speed and compression
        if optipng -quiet -o2 "$file" 2>&1 | grep -q "error"; then
            echo -e "${RED}✗${NC} Failed: $filename"
            FAILED=$((FAILED + 1))
        else
            echo -e "${GREEN}✓${NC} Optimized: $filename"
            OPTIMIZED=$((OPTIMIZED + 1))
        fi
    elif [ "$OPTIMIZER" = "pngcrush" ]; then
        # pngcrush: create temporary file then replace
        temp_file="${file}.tmp"
        if pngcrush -q "$file" "$temp_file" 2>&1 | grep -q "error"; then
            echo -e "${RED}✗${NC} Failed: $filename"
            FAILED=$((FAILED + 1))
            rm -f "$temp_file"
        else
            mv "$temp_file" "$file"
            echo -e "${GREEN}✓${NC} Optimized: $filename"
            OPTIMIZED=$((OPTIMIZED + 1))
        fi
    fi
done <<< "$PNG_FILES"

# Summary
echo ""
echo -e "${BLUE}=== Optimization Summary ===${NC}"
echo "Total files: $TOTAL"
echo -e "${GREEN}Optimized: $OPTIMIZED${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}Failed: $FAILED${NC}"
fi

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All PNGs optimized successfully${NC}"
    exit 0
else
    echo -e "${RED}✗ Some files failed to optimize${NC}"
    exit 1
fi
