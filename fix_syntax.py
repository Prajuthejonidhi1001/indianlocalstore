with open('src/screens/SellerDashboardScreen.js', 'r', encoding='utf-8') as f:
    c = f.read()

import re
c = re.sub(r'\{ height: .%.\s*\}', '{ height: \${h}%\ }', c)

with open('src/screens/SellerDashboardScreen.js', 'w', encoding='utf-8') as f:
    f.write(c)
