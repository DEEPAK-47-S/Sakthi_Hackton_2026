import re

filepath = 'app/templates/forecasting.html'

with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Keep standard ASCII characters + newlines + tabs
clean_text = "".join(c for c in text if ord(c) < 128 or c in '\n\r\t')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(clean_text)

print("Cleaned!")
