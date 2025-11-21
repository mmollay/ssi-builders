#!/bin/bash

# Convert demo pages to sidebar layout
# Processes all HTML files except index.html and list-builder.html

DEMO_DIR="docs/demos"

# Page ID mapping
declare -A PAGE_IDS
PAGE_IDS["form-builder.html"]="form-builder"
PAGE_IDS["modal-builder.html"]="modal-builder"
PAGE_IDS["chart-builder.html"]="chart-builder"
PAGE_IDS["tab-builder.html"]="tab-builder"
PAGE_IDS["menu-builder.html"]="menu-builder"
PAGE_IDS["sidebar-builder.html"]="sidebar-builder"
PAGE_IDS["site-builder.html"]="site-builder"

for file in "${!PAGE_IDS[@]}"; do
    filepath="$DEMO_DIR/$file"
    page_id="${PAGE_IDS[$file]}"
    
    if [ ! -f "$filepath" ]; then
        echo "⏭️  Skipping $file (not found)"
        continue
    fi
    
    echo "📄 Converting $file..."
    
    # Create backup
    cp "$filepath" "$filepath.bak"
    
    # TODO: Add conversion logic here
    # For now just restore backup
    mv "$filepath.bak" "$filepath"
done

echo "✅ Done!"
