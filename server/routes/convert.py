"""
Convert route — Markdown to Word document.
Preserves the entire original conversion pipeline from the original app.py.
"""
import os
import re
import subprocess
import tempfile

from flask import Blueprint, request, jsonify, send_file
from utils.docx_processor import apply_docx_settings

convert_bp = Blueprint("convert", __name__)

# Regex for display math
display_math_pattern = re.compile(r'\$\$(.*?)\$\$', re.DOTALL)


@convert_bp.route("/convert", methods=["POST"])
def convert():
    """
    POST /convert
    Receives markdown + settings, runs Pandoc, applies DOCX styling, returns .docx blob.
    This endpoint does NOT require authentication to preserve backward compatibility
    during migration. Add @require_auth when ready.
    """
    data = request.get_json(force=True)
    markdown_text = data.get("markdown", "")
    settings = data.get("settings", {})

    # Fix broken table rows caused by newlines around <br> tags
    markdown_text = re.sub(r'(<br\s*/?>)\s*[\r\n]+', r'\1 ', markdown_text, flags=re.IGNORECASE)
    markdown_text = re.sub(r'[\r\n]+\s*(<br\s*/?>)', r' \1', markdown_text, flags=re.IGNORECASE)

    # Pandoc ignores <br> inside tables, so use a safe placeholder
    markdown_text = re.sub(r'<br\s*/?>', 'XYZZYBRXYZZY', markdown_text, flags=re.IGNORECASE)

    # $$ blocks: ensure blank lines around them
    markdown_text = re.sub(r'(\$\$[\s\S]*?\$\$)', r'\n\n\1\n\n', markdown_text)

    # Inline math spacing fix
    markdown_text = re.sub(r'\$(.*?)\$', lambda m: '$' + m.group(1).strip() + '$', markdown_text)

    # Replace $\square$ with Unicode box
    markdown_text = re.sub(r'\$\\+square\$', '☐', markdown_text)
    markdown_text = re.sub(r'\$\\+box\$', '☐', markdown_text)
    markdown_text = re.sub(r'\$\s*\\+square\s*\$', '☐', markdown_text)

    # Danda (।) fix — only in normal text, skip tables and math
    lines = markdown_text.split('\n')
    for idx, line in enumerate(lines):
        trimmed = line.strip()
        if trimmed.startswith('|') or (line.count('|') >= 2 and not trimmed.startswith('#') and not trimmed.startswith('>')):
            continue
        parts = line.split('$')
        for i in range(0, len(parts), 2):
            parts[i] = re.sub(r'([\u0980-\u09FF]\s*)\|', r'\1।', parts[i])
            parts[i] = re.sub(r'\|\s*(?=\()', '। ', parts[i])
        lines[idx] = '$'.join(parts)
    markdown_text = '\n'.join(lines)

    # Remove Windows hidden characters
    markdown_text = markdown_text.replace('\r', '')

    # Perfect line breaks (preserve tables, protect math)
    math_blocks = []
    def math_extract(m):
        math_blocks.append(m.group(1))
        return f"@@MATH_BLOCK_{len(math_blocks)-1}@@"
    markdown_text = re.sub(r'(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$[^$\n]+\$)', math_extract, markdown_text)

    lines = markdown_text.split('\n')
    processed_lines = []
    for i, line in enumerate(lines):
        trimmed = line.strip()
        if line.lstrip() != line and not re.match(r'^\s*([*\-+]\s|\d+\.\s|>|\|)', line):
            line = line.lstrip()
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

    markdown_text = re.sub(r'^[-_*]{3,}[ \t]*$', 'SINGLE_LINE_PLACEHOLDER', markdown_text, flags=re.MULTILINE)

    with tempfile.TemporaryDirectory() as tmpdir:
        md_path = os.path.join(tmpdir, "input.md")
        docx_path = os.path.join(tmpdir, "output.docx")

        with open(md_path, "w", encoding="utf-8") as f:
            f.write(markdown_text)

        result = subprocess.run(
            [
                "pandoc", md_path, "-o", docx_path,
                "--from=markdown+tex_math_dollars+tex_math_single_backslash+raw_tex",
                "--standalone",
            ],
            capture_output=True, text=True, timeout=60,
        )

        if result.returncode != 0:
            return jsonify({"error": "Pandoc failed", "details": result.stderr}), 500

        try:
            import io
            docx_buffer = apply_docx_settings(docx_path, settings)
        except Exception as exc:
            print(f"[ERROR] Docx styling error: {exc}")
            with open(docx_path, "rb") as f:
                docx_buffer = io.BytesIO(f.read())

    docx_buffer.seek(0)
    return send_file(
        docx_buffer,
        mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        as_attachment=True,
        download_name="AI2Word_Document.docx",
    )
