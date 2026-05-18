import re

markdown_text = r'''**Brilliant Academy**
**Special Suggestion Answer Sheet**
**বিষয়: সাধারণ গণিত (সেট ও ফাংশন)**
**প্রস্তুতকারক: Shahriar Talim (Talim Sir)**

---

### $\square$ Type-01 (80%) [অনুশীলনী ২.১ (১ ও ২)]
**i. সমাধান:**
দেওয়া আছে, $C = \{x \in \mathbb{N} : x^2 - 9 = 0\}'''

markdown_text = re.sub(r'(\$\$[\s\S]*?\$\$)', r'\n\n\1\n\n', markdown_text)
markdown_text = re.sub(r'\$(.*?)\$', lambda m: '$' + m.group(1).strip() + '$', markdown_text)
markdown_text = re.sub(r'\$\\+square\$', '☐', markdown_text)
markdown_text = re.sub(r'\$\\+box\$', '☐', markdown_text)
markdown_text = re.sub(r'\$\s*\\+square\s*\$', '☐', markdown_text)
parts = markdown_text.split('$')
for i in range(0, len(parts), 2):
    parts[i] = re.sub(r'([\u0980-\u09FF]\s*)\|', r'\1।', parts[i])
    parts[i] = re.sub(r'\|\s*(?=\()', '। ', parts[i])
markdown_text = '$'.join(parts)
markdown_text = markdown_text.replace('\r', '')
markdown_text = re.sub(r'\n+', '\n\n', markdown_text)
markdown_text = re.sub(r'^[-_*]{3,}\s*$', 'SINGLE_LINE_PLACEHOLDER', markdown_text, flags=re.MULTILINE)

with open('test_regex_out.txt', 'w', encoding='utf-8') as f:
    f.write(markdown_text)
