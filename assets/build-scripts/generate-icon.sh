#!/bin/bash
#
# Icon Generation Script
#
# Generates PNG icons at multiple sizes from an SVG source file
#
# Usage:
#   ./generate-icon.sh <svg-file> <output-prefix> <size1> [size2] [size3] ...
#
# Example:
#   ./generate-icon.sh logo.svg logo 16 32 64 80 128
#   Generates: logo-16.png, logo-32.png, logo-64.png, logo-80.png, logo-128.png
#
# Requirements:
#   - ImageMagick (convert command)
#   - Inkscape (optional, for better SVG rendering)
#

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if required tools are installed
if ! command -v convert &> /dev/null; then
    echo -e "${RED}ERROR: ImageMagick 'convert' command not found${NC}"
    echo "Install with: sudo apt-get install imagemagick (Ubuntu/Debian)"
    echo "           or: brew install imagemagick (macOS)"
    exit 1
fi

# Parse arguments
if [ $# -lt 3 ]; then
    echo -e "${RED}ERROR: Insufficient arguments${NC}"
    echo ""
    echo "Usage: $0 <svg-file> <output-prefix> <size1> [size2] [size3] ..."
    echo ""
    echo "Example:"
    echo "  $0 logo.svg logo 16 32 64 80 128"
    echo "  $0 ribbon-simulate.svg ribbon-simulate 32 80"
    echo ""
    exit 1
fi

SVG_FILE="$1"
OUTPUT_PREFIX="$2"
shift 2
SIZES=("$@")

# Verify SVG file exists
if [ ! -f "$SVG_FILE" ]; then
    echo -e "${RED}ERROR: SVG file not found: $SVG_FILE${NC}"
    exit 1
fi

echo -e "${BLUE}=== Icon Generation ===${NC}"
echo "Source: $SVG_FILE"
echo "Prefix: $OUTPUT_PREFIX"
echo "Sizes: ${SIZES[*]}"
echo ""

# Determine output directory (same as script location)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="$(dirname "$SVG_FILE")"

# Counter for generated files
GENERATED=0
FAILED=0

# Generate each size
for size in "${SIZES[@]}"; do
    output_file="${OUTPUT_DIR}/${OUTPUT_PREFIX}-${size}.png"

    echo -e "${BLUE}Generating:${NC} ${OUTPUT_PREFIX}-${size}.png (${size}x${size})"

    # Use Inkscape if available (better SVG rendering)
    if command -v inkscape &> /dev/null; then
        if inkscape --export-type=png \
                    --export-filename="$output_file" \
                    --export-width="$size" \
                    --export-height="$size" \
                    --export-background-opacity=0 \
                    "$SVG_FILE" &> /dev/null; then
            echo -e "${GREEN}✓${NC} Generated: $output_file"
            GENERATED=$((GENERATED + 1))
        else
            echo -e "${RED}✗${NC} Failed to generate $output_file"
            FAILED=$((FAILED + 1))
        fi
    else
        # Fallback to ImageMagick
        if convert -background none \
                   -density 300 \
                   -resize "${size}x${size}" \
                   "$SVG_FILE" \
                   "$output_file" 2> /dev/null; then
            echo -e "${GREEN}✓${NC} Generated: $output_file"
            GENERATED=$((GENERATED + 1))
        else
            echo -e "${RED}✗${NC} Failed to generate $output_file"
            FAILED=$((FAILED + 1))
        fi
    fi
done

# Summary
echo ""
echo -e "${BLUE}=== Generation Summary ===${NC}"
echo -e "${GREEN}Generated: $GENERATED${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}Failed: $FAILED${NC}"
fi

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All icons generated successfully${NC}"
    exit 0
else
    echo -e "${RED}✗ Some icons failed to generate${NC}"
    exit 1
fi
