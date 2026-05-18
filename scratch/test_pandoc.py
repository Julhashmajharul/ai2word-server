import subprocess
import os

md = """| A | B |
|---|---|
| 1. $VC = \\frac{x}{n}$ <br/> <br /> 2. $VC = s - x$ | $m$ |"""

with open("test.md", "w", encoding="utf-8") as f:
    f.write(md)

subprocess.run([
    "pandoc", "test.md", "-o", "test.docx",
    "--from=markdown+tex_math_dollars+tex_math_single_backslash+raw_html"
])
print("Pandoc finished.")
