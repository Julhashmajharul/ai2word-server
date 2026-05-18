import re

def fix_line_breaks(markdown_text):
    math_blocks = []
    def math_extract(m):
        math_blocks.append(m.group(1))
        return f"@@MATH_BLOCK_{len(math_blocks)-1}@@"
    
    # Extract ALL math blocks temporarily
    markdown_text = re.sub(r'(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$[^$\n]+\$)', math_extract, markdown_text)
    
    lines = markdown_text.split('\n')
    processed_lines = []
    for i, line in enumerate(lines):
        trimmed = line.strip()
        is_table = trimmed.startswith('|') or ('|' in trimmed and not trimmed.startswith('#') and not trimmed.startswith('>'))
        
        next_trimmed = lines[i+1].strip() if i+1 < len(lines) else ''
        next_is_table = next_trimmed.startswith('|') or ('|' in next_trimmed and not next_trimmed.startswith('#') and not next_trimmed.startswith('>'))
        
        processed_lines.append(line)
        if i < len(lines) - 1:
            if is_table and next_is_table:
                processed_lines.append('\n')
            else:
                processed_lines.append('\n\n')
                
    markdown_text = "".join(processed_lines)
    markdown_text = re.sub(r'\n{3,}', '\n\n', markdown_text)
    
    # Restore math blocks
    for i, block in enumerate(math_blocks):
        markdown_text = markdown_text.replace(f"@@MATH_BLOCK_{i}@@", block)
        
    return markdown_text

test_text = """
| শ্রেণিব্যাপ্তি | গণসংখ্যা |
| --- | --- |
| 40-49 | 3 |
| মোট | $n=25$ |

এখানে, 
$\sum f_i = 12$
$n = 25$

$$
\begin{aligned}
x &= 12 \\
y &= 13
\end{aligned}
$$
"""

print(fix_line_breaks(test_text))
