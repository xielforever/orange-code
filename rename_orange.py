import os
import re
import shutil

IGNORE_DIRS = {'.git', 'target', '__pycache__', '.pytest_cache'}

def is_text_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            f.read(1024)
        return True
    except UnicodeDecodeError:
        return False
    except Exception:
        return False

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    def replacer(match):
        word = match.group(0)
        if word == 'Orange': return 'Orange'
        if word == 'ORANGE': return 'ORANGE'
        if word == 'orange': return 'orange'
        return word

    new_content = re.sub(r'Orange|ORANGE|orange', replacer, content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

# 1. Rename contents in files
for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
    for file in files:
        filepath = os.path.join(root, file)
        if is_text_file(filepath):
            replace_in_file(filepath)

# 2. Rename files and directories (bottom-up to avoid breaking paths)
for root, dirs, files in os.walk('.', topdown=False):
    dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
    for name in files + dirs:
        if 'orange' in name.lower():
            old_path = os.path.join(root, name)
            
            # replace in filename
            def replacer_name(match):
                w = match.group(0)
                if w == 'Orange': return 'Orange'
                if w == 'ORANGE': return 'ORANGE'
                if w == 'orange': return 'orange'
                return w
            
            new_name = re.sub(r'Orange|ORANGE|orange', replacer_name, name)
            new_path = os.path.join(root, new_name)
            
            print(f"Renaming {old_path} -> {new_path}")
            os.rename(old_path, new_path)

