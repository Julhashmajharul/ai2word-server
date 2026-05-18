import re

markdown_text = r'''**Brilliant Academy**
**Special Suggestion Answer Sheet**
**বিষয়: সাধারণ গণিত (সেট ও ফাংশন)**
**প্রস্তুতকারক: Shahriar Talim (Talim Sir)**

---

### Type-01 (80%) [অনুশীলনী ২.১ (১ ও ২)]
**i. সমাধান:**'''

markdown_text = markdown_text.replace('\r', '')
markdown_text = re.sub(r'\n+', '\n\n', markdown_text)
markdown_text = re.sub(r'^[-_*]{3,}[ \t]*$', 'SINGLE_LINE_PLACEHOLDER', markdown_text, flags=re.MULTILINE)

with open('test_regex2.txt', 'w', encoding='utf-8') as f:
    f.write(markdown_text)
