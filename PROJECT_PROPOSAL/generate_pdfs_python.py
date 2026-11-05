#!/usr/bin/env python3
"""
Script to generate PDF versions of markdown files.
This script uses reportlab to create PDFs from markdown content.

Requirements:
    pip install reportlab markdown

Usage:
    python generate_pdfs_python.py
"""

import os
import sys
from datetime import datetime

try:
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
    from reportlab.lib import colors
    import markdown
    HAS_REQUIREMENTS = True
except ImportError as e:
    HAS_REQUIREMENTS = False
    print(f"Error: Missing required packages: {e}")
    print("\nPlease install the required packages:")
    print("  pip install reportlab markdown")
    sys.exit(1)


def markdown_to_pdf(input_file, output_file):
    """Convert a markdown file to PDF."""
    
    # Read markdown content
    with open(input_file, 'r', encoding='utf-8') as f:
        markdown_content = f.read()
    
    # Convert markdown to HTML
    html_content = markdown.markdown(markdown_content, extensions=[
        'tables',
        'fenced_code',
        'codehilite',
        'toc',
        'extra'
    ])
    
    # Create PDF document
    doc = SimpleDocTemplate(
        output_file,
        pagesize=A4,
        rightMargin=inch * 0.75,
        leftMargin=inch * 0.75,
        topMargin=inch * 0.75,
        bottomMargin=inch * 0.75,
        title=f"Tuzla Tour App - {os.path.basename(input_file)}"
    )
    
    # Create styles
    styles = getSampleStyleSheet()
    
    # Custom styles for better formatting
    styles.add(ParagraphStyle(
        name='Title',
        fontSize=24,
        leading=28,
        alignment=1,  # Center
        spaceAfter=20,
        textColor=colors.darkblue,
        fontName='Helvetica-Bold'
    ))
    
    styles.add(ParagraphStyle(
        name='Heading1',
        fontSize=18,
        leading=22,
        spaceBefore=12,
        spaceAfter=6,
        textColor=colors.darkblue,
        fontName='Helvetica-Bold'
    ))
    
    styles.add(ParagraphStyle(
        name='Heading2',
        fontSize=14,
        leading=18,
        spaceBefore=10,
        spaceAfter=4,
        textColor=colors.darkblue,
        fontName='Helvetica-Bold'
    ))
    
    styles.add(ParagraphStyle(
        name='Heading3',
        fontSize=12,
        leading=16,
        spaceBefore=8,
        spaceAfter=4,
        textColor=colors.darkblue,
        fontName='Helvetica-Bold'
    ))
    
    styles.add(ParagraphStyle(
        name='Code',
        fontSize=10,
        leading=12,
        textColor=colors.darkgreen,
        fontName='Courier',
        backColor=colors.lightgrey
    ))
    
    styles.add(ParagraphStyle(
        name='Table',
        fontSize=10,
        leading=12
    ))
    
    # Story for PDF content
    story = []
    
    # Add title
    story.append(Spacer(1, inch * 0.5))
    story.append(Paragraph(
        f"Tuzla Tour App - {os.path.basename(input_file).replace('.md', '').replace('_', ' ').title()}",
        styles['Title']
    ))
    story.append(Paragraph(
        f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        styles['Normal']
    ))
    story.append(Spacer(1, inch * 0.5))
    
    # Convert HTML to PDF elements (simplified approach)
    # For a more complete solution, consider using a proper HTML to PDF converter
    lines = markdown_content.split('\n')
    in_code_block = False
    in_table = False
    
    for line in lines:
        line = line.strip()
        
        if not line:
            story.append(Spacer(1, 6))
            continue
        
        # Headings
        if line.startswith('# '):
            story.append(Paragraph(line[2:], styles['Title']))
            story.append(Spacer(1, 12))
        elif line.startswith('## '):
            story.append(Paragraph(line[3:], styles['Heading1']))
            story.append(Spacer(1, 8))
        elif line.startswith('### '):
            story.append(Paragraph(line[4:], styles['Heading2']))
            story.append(Spacer(1, 6))
        elif line.startswith('#### '):
            story.append(Paragraph(line[5:], styles['Heading3']))
            story.append(Spacer(1, 4))
        # Code blocks
        elif line.startswith('```'):
            in_code_block = not in_code_block
            if not in_code_block:
                story.append(Spacer(1, 6))
        elif in_code_block:
            story.append(Paragraph(line, styles['Code']))
        # Tables
        elif line.startswith('|'):
            if not in_table:
                in_table = True
                story.append(Spacer(1, 6))
            # Simple table handling - in a real implementation, use Table flowable
            story.append(Paragraph(line, styles['Table']))
        else:
            if in_table:
                in_table = False
                story.append(Spacer(1, 6))
            # Regular text
            story.append(Paragraph(line, styles['Normal']))
            story.append(Spacer(1, 4))
    
    # Build PDF
    doc.build(story)
    print(f"  ✓ Generated: {output_file}")


def main():
    """Main function to generate all PDFs."""
    
    # Create pdfs directory
    os.makedirs('pdfs', exist_ok=True)
    
    # Define files to convert
    files = [
        ('bosnian/PRIJEDLOG_PROJEKTA_TuzlaTourApp_GradTuzla.md', 'pdfs/bosnian_GradTuzla.pdf'),
        ('bosnian/PRIJEDLOG_PROJEKTA_TuzlaTourApp_PrivatniSektor.md', 'pdfs/bosnian_PrivatniSektor.pdf'),
        ('english/PROJECT_PROPOSAL_TuzlaTourApp_CityCouncil.md', 'pdfs/english_CityCouncil.pdf'),
        ('english/PROJECT_PROPOSAL_TuzlaTourApp_PrivateSector.md', 'pdfs/english_PrivateSector.pdf'),
        ('BUSINESS_PLAN_TuzlaTourApp.md', 'pdfs/BUSINESS_PLAN.pdf'),
        ('charts/ROI_CHARTS.md', 'pdfs/ROI_CHARTS.pdf'),
    ]
    
    print("Generating PDF files using Python...")
    print("=" * 50)
    
    for input_file, output_file in files:
        if os.path.exists(input_file):
            print(f"Converting: {input_file} -> {output_file}")
            try:
                markdown_to_pdf(input_file, output_file)
            except Exception as e:
                print(f"  ✗ Failed to generate {output_file}: {e}")
        else:
            print(f"  ✗ Input file not found: {input_file}")
    
    print("\n" + "=" * 50)
    print("PDF Generation Complete!")
    print("\nGenerated PDFs:")
    for _, output_file in files:
        if os.path.exists(output_file):
            print(f"  ✓ {os.path.basename(output_file)}")
    
    print("\nNote: For better formatting, consider using pandoc:")
    print("  pandoc input.md -o output.pdf --toc --number-sections")


if __name__ == '__main__':
    main()
