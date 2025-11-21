#!/usr/bin/env python3
"""
Convert demo HTML files to use shared sidebar layout
"""

import os
import re
from pathlib import Path

DEMO_DIR = Path(__file__).parent.parent / 'docs' / 'demos'

# Page identifiers mapping
PAGE_IDS = {
    'form-builder.html': 'form-builder',
    'modal-builder.html': 'modal-builder',
    'chart-builder.html': 'chart-builder',
    'tab-builder.html': 'tab-builder',
    'menu-builder.html': 'menu-builder',
    'sidebar-builder.html': 'sidebar-builder',
    'site-builder.html': 'site-builder',
    'icon-system.html': 'icon-system',
    'icon-weight-demo.html': 'icon-weight-demo',
    'global-config-playground.html': 'global-config',
    'all-builders-overview.html': 'all-builders',
}

def convert_file(file_path):
    """Convert a single HTML file to sidebar layout"""

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Get page identifier
    filename = file_path.name
    page_id = PAGE_IDS.get(filename, filename.replace('.html', ''))

    # Add SidebarBuilder.css if not present
    if 'SidebarBuilder.css' not in content:
        content = content.replace(
            '<link rel="stylesheet" href="../../src/shared.css">',
            '<link rel="stylesheet" href="../../src/shared.css">\n    <link rel="stylesheet" href="../../src/SidebarBuilder.css">'
        )

    # Add layout.css if not present
    if 'layout.css' not in content:
        # Find last stylesheet link
        last_link_pattern = r'(<link rel="stylesheet"[^>]*>)(?![\s\S]*<link rel="stylesheet")'
        content = re.sub(
            last_link_pattern,
            r'\1\n    <link rel="stylesheet" href="./layout.css">',
            content
        )

    # Remove old navigation if present
    nav_pattern = r'<nav class="nav">.*?</nav>'
    content = re.sub(nav_pattern, '', content, flags=re.DOTALL)

    # Remove hero section if present
    hero_pattern = r'<div class="hero">.*?</div>'
    content = re.sub(hero_pattern, '', content, flags=re.DOTALL)

    # Wrap body content with new layout
    body_start = content.find('<body>')
    body_end = content.find('</body>')

    if body_start == -1 or body_end == -1:
        print(f"⚠️  Warning: Could not find body tags in {filename}")
        return False

    body_content = content[body_start + 6:body_end].strip()

    # Extract container/main content
    container_pattern = r'<div class="container">(.*?)</div>\s*(?=<script|$)'
    container_match = re.search(container_pattern, body_content, flags=re.DOTALL)

    if container_match:
        main_content = container_match.group(1).strip()
    else:
        # If no container, use all content except scripts
        script_start = body_content.find('<script')
        if script_start != -1:
            main_content = body_content[:script_start].strip()
        else:
            main_content = body_content

    # Extract all scripts
    script_pattern = r'(<script[\s\S]*?</script>)'
    scripts = re.findall(script_pattern, body_content)

    # Get page title from h1 or nav
    title_match = re.search(r'<h1[^>]*>(.*?)</h1>', body_content)
    if not title_match:
        title_match = re.search(r'<div class="nav-title">(.*?)</div>', body_content)

    page_title = title_match.group(1) if title_match else 'Demo'
    page_title = re.sub(r'<[^>]+>', '', page_title)  # Remove HTML tags

    # Create page header
    page_header = f'''                <!-- Page Header -->
                <div class="page-header">
                    <h1>{page_title}</h1>
                    <p>Interactive demonstration and documentation</p>
                </div>'''

    # Build new body with sidebar layout
    new_body = f'''<body>
    <div class="page-layout">
        <!-- Sidebar -->
        <div id="sidebar-container"></div>

        <!-- Main Content -->
        <main class="demo-content">
            <div class="demo-content-inner">
{page_header}

{main_content}
            </div>
        </main>
    </div>

'''

    # Add layout initialization to main script
    layout_init = f'''        import {{ initializeLayout, addMobileMenuToggle }} from './layout.js';

        // Initialize layout with sidebar
        initializeLayout('{page_id}');
        addMobileMenuToggle();

'''

    # Modify first module script to include layout init
    for i, script in enumerate(scripts):
        if 'type="module"' in script:
            # Add imports and initialization
            script_content = re.search(r'<script[^>]*>(.*?)</script>', script, flags=re.DOTALL)
            if script_content:
                inner = script_content.group(1)
                # Add layout init after first import
                import_pattern = r'(import .*?;)'
                if re.search(import_pattern, inner):
                    inner = re.sub(import_pattern, r'\1\n' + layout_init, inner, count=1)
                else:
                    # No imports, add at beginning
                    inner = layout_init + inner

                scripts[i] = f'<script type="module">\n{inner}\n    </script>'
            break

    # Add all scripts
    for script in scripts:
        new_body += '    ' + script + '\n'

    new_body += '</body>'

    # Replace body content
    new_content = content[:body_start] + new_body + content[body_end + 7:]

    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    return True

def main():
    """Convert all demo files"""
    print("🔄 Converting demo files to sidebar layout...\n")

    converted = 0
    failed = 0

    for filename, page_id in PAGE_IDS.items():
        file_path = DEMO_DIR / filename

        if not file_path.exists():
            print(f"⏭️  Skipping {filename} (not found)")
            continue

        print(f"📄 Converting {filename}... ", end='')

        try:
            if convert_file(file_path):
                print("✅")
                converted += 1
            else:
                print("❌")
                failed += 1
        except Exception as e:
            print(f"❌ Error: {e}")
            failed += 1

    print(f"\n✨ Done! Converted: {converted}, Failed: {failed}")

if __name__ == '__main__':
    main()
