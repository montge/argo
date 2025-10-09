#!/bin/bash
#
# Asset Verification Script
#
# Verifies that all required assets exist and meet quality standards
#
# Usage:
#   ./verify-assets.sh
#

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ASSETS_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}=== Asset Verification ===${NC}"
echo "Assets directory: $ASSETS_DIR"
echo ""

TOTAL=0
PRESENT=0
MISSING=0

# Function to check if file exists
check_file() {
    local file="$1"
    local full_path="$ASSETS_DIR/$file"

    TOTAL=$((TOTAL + 1))

    if [ -f "$full_path" ]; then
        # Check file size
        size=$(stat -f%z "$full_path" 2>/dev/null || stat -c%s "$full_path" 2>/dev/null)
        if [ "$size" -gt 0 ]; then
            echo -e "${GREEN}✓${NC} $file (${size} bytes)"
            PRESENT=$((PRESENT + 1))
            return 0
        else
            echo -e "${RED}✗${NC} $file (empty file)"
            MISSING=$((MISSING + 1))
            return 1
        fi
    else
        echo -e "${RED}✗${NC} $file (missing)"
        MISSING=$((MISSING + 1))
        return 1
    fi
}

# Logo files (6 sizes)
echo -e "${BLUE}Logo Icons:${NC}"
check_file "icons/logo-16.png"
check_file "icons/logo-32.png"
check_file "icons/logo-64.png"
check_file "icons/logo-80.png"
check_file "icons/logo-128.png"
check_file "icons/logo.svg"
echo ""

# Ribbon command icons (6 commands × 2 sizes = 12 files)
echo -e "${BLUE}Ribbon Command Icons:${NC}"
for cmd in simulate builder dashboard settings help about; do
    check_file "icons/ribbon-${cmd}-32.png"
    check_file "icons/ribbon-${cmd}-80.png"
done
check_file "icons/ribbon-simulate.svg"
check_file "icons/ribbon-builder.svg"
check_file "icons/ribbon-dashboard.svg"
check_file "icons/ribbon-settings.svg"
check_file "icons/ribbon-help.svg"
check_file "icons/ribbon-about.svg"
echo ""

# Distribution icons (14 types × 2 sizes = 28 files)
echo -e "${BLUE}Distribution Icons:${NC}"
for dist in normal uniform triangular lognormal exponential beta gamma weibull pareto pert binomial poisson geometric hypergeometric; do
    check_file "distributions/dist-${dist}-24.png"
    check_file "distributions/dist-${dist}-48.png"
done
echo ""

# UI state icons (4 states)
echo -e "${BLUE}UI State Icons:${NC}"
check_file "ui-states/state-loading-24.png"
check_file "ui-states/state-error-24.png"
check_file "ui-states/state-success-24.png"
check_file "ui-states/state-warning-24.png"
echo ""

# Summary
echo -e "${BLUE}=== Verification Summary ===${NC}"
echo "Total expected: $TOTAL"
echo -e "${GREEN}Present: $PRESENT${NC}"
echo -e "${RED}Missing: $MISSING${NC}"

if [ $MISSING -eq 0 ]; then
    echo -e "${GREEN}✓ All required assets are present!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some assets are missing${NC}"
    echo ""
    echo "To generate missing assets:"
    echo "  1. Create SVG sources in appropriate directories"
    echo "  2. Run: npm run build:assets"
    exit 1
fi
