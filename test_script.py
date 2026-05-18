import os
import subprocess
from app import apply_docx_settings

markdown = """
---
### $\square$ Type-01 (80%) [\u0985\u09a8\u09c1\u09b6\u09c0\u09b2\u09a8\u09c0 \u09e8.\u09e7 (\u09e7 \u0993 \u09e8)]
"""
open('test.md', 'w', encoding='utf-8').write(markdown)
subprocess.run(['pandoc', 'test.md', '-o', 'test_output.docx', '--from=markdown+tex_math_dollars', '--standalone'])
apply_docx_settings('test_output.docx', {'hr_enabled': True})

from docx import Document
doc = Document('test_output.docx')
with open('out.txt', 'w', encoding='utf-8') as f:
    for p in doc.paragraphs:
        f.write(p.style.name + '|' + repr(p.text) + '\n')
