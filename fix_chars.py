import re

with open('app/templates/forecasting.html', 'r', encoding='utf-8', errors='ignore') as f:
    t = f.read()

# Remove the corrupted Tamil text class
t = re.sub(r'<div class="festival-name-ta">.*?</div>', '', t)

# Fix corrupted emojis if any (like )
t = t.replace('', '')

with open('app/templates/forecasting.html', 'w', encoding='utf-8') as f:
    f.write(t)
