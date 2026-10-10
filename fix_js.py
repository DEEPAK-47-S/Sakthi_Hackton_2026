with open('app/static/js/dashboard.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(r'\${', '${')

with open('app/static/js/dashboard.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed JS template literals")
