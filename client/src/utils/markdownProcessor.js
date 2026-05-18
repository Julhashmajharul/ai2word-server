/**
 * Markdown pre-processing utilities — ported from the original index.html.
 * Handles math overflow, auto-alignment, line break normalization, and danda fixes.
 */

/** Pre-process long math equations with multiple '=' into aligned blocks */
export function processMathForOverflow(text) {
  return text.replace(/(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\])/g, (match) => {
    const isDoubleDollar = match.startsWith('$$');
    const startDelim = isDoubleDollar ? '$$' : '\\[';
    const endDelim = isDoubleDollar ? '$$' : '\\]';
    let content = match.slice(startDelim.length, -endDelim.length).trim();
    const eqCount = (content.match(/=/g) || []).length;

    if (eqCount >= 2 && !content.includes('\\begin{')) {
      const parts = content.split('=');
      let alignedContent = parts[0].trim() + ' &= ' +
        parts.slice(1).map(p => p.trim()).join(' \\\\ &= ');
      return `${startDelim}\\begin{aligned}${alignedContent}\\end{aligned}${endDelim}`;
    }
    return match;
  });
}

/** Auto Align '=' — reformats consecutive $= lines into \begin{aligned} blocks */
export function applyAutoAlign(text, enabled = true) {
  if (!enabled) return text;

  const lines = text.split('\n');
  const processedLines = [];
  let inBlock = false;
  let blockLines = [];

  function processBlock(bLines) {
    if (bLines.length === 0) return [];
    if (bLines.length === 1) return bLines;

    let aligned = ['\n\n$$', '\\begin{aligned}'];
    for (let i = 0; i < bLines.length; i++) {
      let l = bLines[i];
      let match = l.match(/^(.*?)\$\s*=\s*(.*?)\$(.*)$/);
      if (match) {
        let prefix = match[1].trim();
        let math = match[2].trim();
        let suffix = match[3].replace(/\*\*/g, '').trim();
        let row = '';
        if (prefix) row += `\\text{${prefix} } `;
        row += `&= ${math}`;
        if (suffix) row += ` \\quad \\text{ ${suffix}}`;
        if (i < bLines.length - 1) row += ' \\\\';
        aligned.push(row);
      } else {
        aligned.push(`\\text{${l}}` + (i < bLines.length - 1 ? ' \\\\' : ''));
      }
    }
    aligned.push('\\end{aligned}', '$$\n\n');
    return aligned;
  }

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (line.includes('$=') || line.includes('$ =')) {
      inBlock = true;
      blockLines.push(line);
    } else {
      if (inBlock) {
        processedLines.push(...processBlock(blockLines));
        blockLines = [];
        inBlock = false;
      }
      processedLines.push(lines[i]);
    }
  }
  if (inBlock) {
    processedLines.push(...processBlock(blockLines));
  }

  return processedLines.join('\n');
}

/**
 * Full markdown preprocessing pipeline for the preview pane.
 * Matches the original index.html logic exactly.
 */
export function preprocessForPreview(markdownText, autoAlignEnabled = true) {
  // Fix broken table rows caused by newlines around <br> tags
  markdownText = markdownText.replace(/(<br\s*\/?>)\s*[\r\n]+/gi, '$1 ');
  markdownText = markdownText.replace(/[\r\n]+\s*(<br\s*\/?>)/gi, ' $1');

  // Apply Auto Align '='
  markdownText = applyAutoAlign(markdownText, autoAlignEnabled);

  // Apply pre-processing for long equations
  markdownText = processMathForOverflow(markdownText);

  // Extract math blocks to prevent marked.js from corrupting them
  const mathBlocks = [];
  markdownText = markdownText.replace(
    /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$[^$\n]+\$)/g,
    (match) => {
      mathBlocks.push(match);
      return `@@MATH_BLOCK_${mathBlocks.length - 1}@@`;
    }
  );

  // Perfect line breaks
  let lines = markdownText.split(/\n/);
  let processedText = '';
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let trimmed = line.trim();

    // Un-indent manually padded lines (unless they are lists, quotes, or tables)
    if (/^\s+/.test(line) && !/^\s*([*\-+]\s|\d+\.\s|>|\|)/.test(line)) {
      line = line.trimStart();
    }

    let isTable = trimmed.startsWith('|') || (trimmed.includes('|') && !trimmed.startsWith('#') && !trimmed.startsWith('>'));
    let nextTrimmed = i + 1 < lines.length ? lines[i + 1].trim() : '';
    let nextIsTable = nextTrimmed.startsWith('|') || (nextTrimmed.includes('|') && !nextTrimmed.startsWith('#') && !nextTrimmed.startsWith('>') && nextTrimmed !== '');

    processedText += line;
    if (i < lines.length - 1) {
      if (isTable && nextIsTable) {
        processedText += '\n';
      } else if (trimmed === '' && nextTrimmed === '') {
        processedText += '\n';
      } else {
        processedText += '\n\n';
      }
    }
  }
  markdownText = processedText.replace(/\n{3,}/g, '\n\n');

  return { markdownText, mathBlocks };
}

/** Restore math blocks after marked.js parsing */
export function restoreMathBlocks(html, mathBlocks) {
  let result = html;
  mathBlocks.forEach((math, index) => {
    result = result.replace(`@@MATH_BLOCK_${index}@@`, math);
  });
  return result.replace(/undefined/g, '');
}

/**
 * Preprocess markdown for the Word export endpoint (Pandoc).
 * Converts delimiters and applies the same fixes as the backend.
 */
export function preprocessForExport(markdownText, autoAlignEnabled = true) {
  // Apply Auto Align '='
  let text = applyAutoAlign(markdownText, autoAlignEnabled);
  // Apply overflow processing
  text = processMathForOverflow(text);
  // Standardize delimiters for Pandoc
  text = text.split('\\[').join('$$').split('\\]').join('$$')
             .split('\\(').join('$').split('\\)').join('$');
  return text;
}
