import os
import re

files = ['index.html', 'catalog.html', 'about.html', 'contact.html', 'account.html']
base_domain = 'premgold.pythonanywhere.com'

for f in files:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # 1. Update versioning to v=2.0 for everything
        content = re.sub(r'styles\.css\?v=[0-9.]*', 'styles.css?v=2.0', content)
        content = re.sub(r'script\.js\?v=[0-9.]*', 'script.js?v=2.0', content)
        
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f'Polished {f} to v2.0')
