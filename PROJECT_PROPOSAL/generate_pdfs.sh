#!/bin/bash

# Script to generate PDF versions of all markdown files
# Requires pandoc to be installed: sudo apt-get install pandoc
# Or on macOS: brew install pandoc

# Check if pandoc is installed
if ! command -v pandoc &> /dev/null; then
    echo "Error: pandoc is not installed."
    echo "Please install pandoc first:"
    echo "  - Ubuntu/Debian: sudo apt-get install pandoc"
    echo "  - macOS: brew install pandoc"
    echo "  - Windows: Download from https://pandoc.org/installing.html"
    exit 1
fi

# Create pdfs directory if it doesn't exist
mkdir -p pdfs

# Define source files and output PDFs
declare -A files=(
    ["bosnian/PRIJEDLOG_PROJEKTA_TuzlaTourApp_GradTuzla.md"]="pdfs/bosnian_GradTuzla.pdf"
    ["bosnian/PRIJEDLOG_PROJEKTA_TuzlaTourApp_PrivatniSektor.md"]="pdfs/bosnian_PrivatniSektor.pdf"
    ["english/PROJECT_PROPOSAL_TuzlaTourApp_CityCouncil.md"]="pdfs/english_CityCouncil.pdf"
    ["english/PROJECT_PROPOSAL_TuzlaTourApp_PrivateSector.md"]="pdfs/english_PrivateSector.pdf"
    ["BUSINESS_PLAN_TuzlaTourApp.md"]="pdfs/BUSINESS_PLAN.pdf"
    ["charts/ROI_CHARTS.md"]="pdfs/ROI_CHARTS.pdf"
)

echo "Generating PDF files..."
echo "======================"

# Generate each PDF
for source in "${!files[@]}"; do
    output="${files[$source]}"
    echo "Converting: $source -> $output"
    
    # Use pandoc to convert markdown to PDF
    # --toc: Add table of contents
    # --number-sections: Number sections
    # --highlight-style: Syntax highlighting style
    # --pdf-engine: Use weasyprint or wkhtmltopdf if available
    pandoc "$source" \
        --toc \
        --number-sections \
        --highlight-style=kate \
        --pdf-engine=weasyprint \
        -o "$output" \
        --metadata title="Tuzla Tour App - $(basename $source .md)" \
        --metadata author="AISO Tuzla" \
        --metadata date="$(date +%Y-%m-%d)"
    
    if [ $? -eq 0 ]; then
        echo "  ✓ Successfully generated: $output"
    else
        echo "  ✗ Failed to generate: $output"
    fi
done

echo ""
echo "PDF Generation Complete!"
echo "========================"
echo "Generated PDFs:"
for output in "${files[@]}"; do
    if [ -f "$output" ]; then
        echo "  ✓ $(basename $output)"
    fi
done

echo ""
echo "To view the PDFs, open the pdfs/ directory."
