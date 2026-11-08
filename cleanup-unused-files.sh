#!/bin/bash

# Tuzla Tour App - Cleanup Script
# This script removes duplicate and unused files to reduce bundle size
# Run this from the project root directory

set -e

echo "=========================================="
echo "Tuzla Tour App - Cleanup Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track changes
DELETED_COUNT=0
TOTAL_SAVED=0

# Function to safely delete file
safe_delete() {
    local file="$1"
    local description="$2"
    local size="$3"
    
    if [ -f "$file" ]; then
        echo "  ${RED}Deleting${NC}: $file ($description)"
        rm "$file"
        DELETED_COUNT=$((DELETED_COUNT + 1))
        TOTAL_SAVED=$((TOTAL_SAVED + size))
        echo "  ${GREEN}✓ Deleted${NC}"
    else
        echo "  ${YELLOW}Skipping${NC}: $file (not found)"
    fi
}

echo "1. Removing duplicate files from resources/ directory..."
echo "   These files are duplicates of files in public/resources/"
echo ""

# Duplicate files in resources/ (identical to public/resources/)
safe_delete "resources/icon.webp" "Duplicate of public/resources/icon.webp" 46902
safe_delete "resources/TuzlaTourAppLogo192x192.png" "Duplicate logo" 76717
safe_delete "resources/TuzlaTourAppLogo350x350.png" "Duplicate logo" 222284
safe_delete "resources/TuzlaTourAppLogo512x512.png" "Duplicate logo" 431632
safe_delete "resources/TuzlaTourAppLogo96x96.png" "Duplicate logo" 21583
safe_delete "resources/TuzlaTourGuideIcon192x192.webp" "Duplicate icon" 11830
safe_delete "resources/TuzlaTourGuideIcon512x512.webp" "Duplicate icon" 46902
safe_delete "resources/TuzlaTourGuideIcon96x96.webp" "Duplicate icon" 4634

echo ""
echo "2. Removing unused PNG files from Accommodation (WEBP versions exist)..."
echo ""

# Unused accommodation PNG files
safe_delete "public/assets/Gallery/Accommodation/DorrahO.png" "Unused PNG (DorrahO.webp exists)" 0
safe_delete "public/assets/Gallery/Accommodation/grandO.png" "Unused PNG (grand hotel.webp exists)" 0
safe_delete "public/assets/Gallery/Accommodation/heartlandO.png" "Unused PNG (heartland.webp exists)" 0
safe_delete "public/assets/Gallery/Accommodation/mellainO.png" "Unused PNG (mellain.webp exists)" 0
safe_delete "public/assets/Gallery/Accommodation/mineroO.png" "Unused PNG (Minero.webp exists)" 0
safe_delete "public/assets/Gallery/Accommodation/pansionO.png" "Unused PNG (pansion.webp exists)" 0
safe_delete "public/assets/Gallery/Accommodation/salisO.png" "Unused PNG (salis.webp exists)" 0
safe_delete "public/assets/Gallery/Accommodation/SoniO.png" "Unused PNG (Soni.webp exists)" 0
safe_delete "public/assets/Gallery/Accommodation/tehnoO.png" "Unused PNG (tehno.webp exists)" 0
safe_delete "public/assets/Gallery/Accommodation/VertigosO.png" "Unused PNG (Vertigos.webp exists)" 0

echo ""
echo "3. Removing unused icon files..."
echo ""

# Unused icon files
safe_delete "public/assets/icons/icon-384x384.png" "Unused icon" 0
safe_delete "public/assets/icons/icon-512x512.png" "Unused icon" 0
safe_delete "public/assets/icons/Tuzlacrestsaturation.webp" "Unused/duplicate icon" 0

echo ""
echo "4. Removing unused root asset files..."
echo ""

# Unused root assets
safe_delete "public/assets/TZGoldlogo.webp" "Unused logo" 0
safe_delete "public/assets/TZGoldlogo90x90.webp" "Unused logo" 0
safe_delete "public/assets/Taxi1525.webp" "Unused (duplicate in QuestQRLocations)" 0
safe_delete "public/assets/kulin2.webp" "Unused image" 0
safe_delete "public/assets/Screenshot/TuzlaTour.png" "Unused screenshot" 0
safe_delete "public/favicon.ico.jpg" "Invalid file (should be .ico)" 0

echo ""
echo "5. Removing unused QuestQR files..."
echo ""

# Unused QuestQR files
safe_delete "public/assets/Gallery/QuestQRLocations/cge.webp" "Unused image" 0
safe_delete "public/assets/Gallery/QuestQRLocations/bun.webp" "Unused image" 0
safe_delete "public/assets/Gallery/QuestQRLocations/vozic.webp" "Unused image" 0
safe_delete "public/assets/Gallery/QuestQRLocations/QuestQR/sojO.webp" "Unused image" 0
safe_delete "public/assets/Gallery/QuestQRLocations/QuestQR/slapO.webp" "Unused image" 0
safe_delete "public/assets/Gallery/QuestQRLocations/QuestQR/QRpalacinkara.png" "Unused QR" 0
safe_delete "public/assets/Gallery/QuestQRLocations/QuestQR/QRPannonica.png" "Unused QR" 0

echo ""
echo "6. Removing unused Tvrko pannellum files..."
echo ""

# Unused panorama files
safe_delete "public/assets/Gallery/QuestQRLocations/Tvrko pannellum/360.jpg" "Unused panorama" 0
safe_delete "public/assets/Gallery/QuestQRLocations/Tvrko pannellum/TvrtkoPanorama.jpg" "Unused panorama" 0
safe_delete "public/assets/Gallery/QuestQRLocations/Tvrko pannellum/tz.jpg" "Unused image" 0

echo ""
echo "7. Removing unused History files..."
echo ""

# Unused history files
safe_delete "public/assets/HistoryBA2.webp" "Unused history image" 0
safe_delete "public/assets/HistoryDE2.webp" "Unused history image" 0
safe_delete "public/assets/HistoryEN2.webp" "Unused history image" 0
safe_delete "public/assets/HistoryTR2.webp" "Unused history image" 0

echo ""
echo "=========================================="
echo "Cleanup Summary"
echo "=========================================="
echo "Files deleted: $DELETED_COUNT"
echo "Space saved: ~${TOTAL_SAVED} bytes (actual savings will be more)"
echo ""
echo "${GREEN}✓ Cleanup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Run 'git status' to review changes"
echo "2. Test the app to ensure nothing is broken"
echo "3. Commit the changes"
echo ""
