import os
import re
import uuid

templates_dir = r"c:\deepak\coding\AI Population Analyser\app\templates"
css_file = r"c:\deepak\coding\AI Population Analyser\app\static\css\pages.css"

inline_style_pattern = re.compile(r'style="([^"]+)"')
css_classes = []

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix escaped backticks in JS template literals
    content = content.replace(r"\`", "`")

    # Fix inline styles
    def style_replacer(match):
        style_content = match.group(1).strip()
        # Create a unique class name based on a hash of the content to avoid duplicates
        class_hash = abs(hash(style_content)) % 100000
        class_name = f"auto-style-{class_hash}"
        
        # Add to global css classes if not already there
        css_rule = f".{class_name} {{ {style_content} }}"
        if css_rule not in css_classes:
            css_classes.append(css_rule)
            
        return f'class="{class_name}"'

    # Need to handle existing classes merging, but simple replace for now is:
    # If the element already has a class, this might result in class="..." class="auto-style-X", which is invalid HTML (only first class attribute is read).
    # A better regex: find the tag, if it has style, remove style and append to class.
    
    # Let's do a more robust tag level replacement
    def tag_replacer(match):
        tag = match.group(0)
        style_match = inline_style_pattern.search(tag)
        if not style_match:
            return tag
            
        style_content = style_match.group(1).strip()
        class_hash = abs(hash(style_content)) % 100000
        class_name = f"auto-style-{class_hash}"
        
        css_rule = f".{class_name} {{ {style_content} }}"
        if css_rule not in css_classes:
            css_classes.append(css_rule)
            
        tag = inline_style_pattern.sub('', tag)
        
        class_match = re.search(r'class="([^"]+)"', tag)
        if class_match:
            new_classes = class_match.group(1) + f" {class_name}"
            tag = tag.replace(class_match.group(0), f'class="{new_classes}"')
        else:
            tag = tag.replace('>', f' class="{class_name}">', 1)
            
        # Clean up double spaces
        tag = tag.replace('  ', ' ')
        return tag

    new_content = re.sub(r'<[^>]+>', tag_replacer, content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed {os.path.basename(filepath)}")

for root, _, files in os.walk(templates_dir):
    for file in files:
        if file.endswith('.html'):
            process_file(os.path.join(root, file))

if css_classes:
    with open(css_file, 'a', encoding='utf-8') as f:
        f.write("\n/* Auto-generated classes to replace inline styles */\n")
        f.write("\n".join(css_classes))
    print("CSS updated.")
