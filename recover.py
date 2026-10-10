import os

filepath = 'app/templates/forecasting.html'

with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

# Strip BOM if exists
if text.startswith('\ufeff'):
    text = text[1:]

try:
    recovered = text.encode('cp1252').decode('utf-8')
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(recovered)
    print("Recovered perfectly via cp1252!")
except Exception as e:
    print("Could not recover via cp1252:", e)
