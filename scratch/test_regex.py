import re

text = """| সূত্র | প্রতীক পরিচিতি | একক | মাত্রা |
| --- | --- | --- | --- |
| 1. $VC = \\frac{x}{n}$ <br>

<br> 2. $VC = s - x$ | VC = ভার্নিয়ার ধ্রুবক | m | L |
| | s = প্রধান স্কেলের ক্ষুদ্রতম 1 ভাগের দৈর্ঘ্য | m | L |"""

text = re.sub(r'(<br\s*/?>)\s*[\r\n]+', r'\1 ', text, flags=re.IGNORECASE)
text = re.sub(r'[\r\n]+\s*(<br\s*/?>)', r' \1', text, flags=re.IGNORECASE)

with open("out.txt", "w", encoding="utf-8") as f:
    f.write(text)
