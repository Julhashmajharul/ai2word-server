import { useState, useRef, useEffect, useCallback } from 'react';
import { marked } from 'marked';
import { useAuth } from '../../contexts/AuthContext';
import { convertAPI, creditsAPI, historyAPI } from '../../services/api';
import { preprocessForPreview, restoreMathBlocks, preprocessForExport } from '../../utils/markdownProcessor';
import SettingsModal from './SettingsModal';
import {
  Settings, FileDown, FileText, Trash2, Download, Loader2,
} from 'lucide-react';

// Default editor content
const DEFAULT_CONTENT = `# Kinetic & Static Friction Formulas
*AB-type friction formulas (for two blocks A and B in contact)*

## Case 1: Block A on horizontal surface
### Friction on A
\\[
F = \\mu N
\\]
*Since \\( N = m_A g \\), substituting \\(N\\) gives:*
\\[
F = \\mu m_A g
\\]

## Case 2: Contact on smooth surface
*(External force \\(F\\) applied on Block A)*

### Acceleration of system
\\[
a = \\frac{F}{m_A + m_B}
\\]

### Contact force between A and B
\\[
F_{AB} = \\frac{m_B F}{m_A + m_B}
\\]`;

// Configure marked renderer (same as original)
const renderer = {
  heading({ text, depth, tokens }) {
    const parsedText = tokens && this.parser ? this.parser.parseInline(tokens) : String(text || '');
    const cleanText = parsedText.replace(/^[✅◆🔹]\s*/, '').trim();
    if (depth === 1) return `<h1 class="textbook-h1">${cleanText}</h1>`;
    if (depth === 2) return `<h2 class="textbook-h2">${cleanText}</h2>`;
    return `<h${depth} class="textbook-h3">${cleanText}</h${depth}>`;
  },
  list(token) {
    let body = '';
    if (token.items && Array.isArray(token.items)) {
      for (let i = 0; i < token.items.length; i++) {
        body += this.listitem(token.items[i]);
      }
    } else if (token.body) {
      body = token.body;
    }
    if (!token.ordered) return `<ul class="textbook-list">${body}</ul>`;
    return `<ol style="list-style-type: decimal; padding-left: 2rem; margin-bottom: 1rem;">${body}</ol>`;
  },
  hr() {
    return '<hr style="border: none; border-top: 1px solid #000; margin: 1rem 0;">';
  },
};
marked.use({ renderer });

export default function EditorView() {
  const { user, refreshProfile } = useAuth();
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [showSettings, setShowSettings] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [autoAlign, setAutoAlign] = useState(true);
  const previewRef = useRef(null);
  const timeoutRef = useRef(null);

  // Settings state (matches the original index.html settings)
  const [settings, setSettings] = useState({
    bodyFont: "'Times New Roman', 'bangla', serif",
    bodySize: 12,
    bodyColor: '#000000',
    lineSpacing: 1,
    spaceBefore: 0,
    spaceAfter: 0,
    marginTop: 0.5,
    marginBottom: 0.5,
    marginLeft: 0.5,
    marginRight: 0.5,
    borderStyle: 'none',
    borderWidth: 1,
    borderColor: '#000000',
    headingColor: '#003366',
    hrEnabled: true,
    hrWidth: '100%',
    hrHeight: 1,
    hrColor: '#000000',
    hrAlign: 'center',
    mathAlign: 'center',
    twoColumn: false,
  });

  // Load user's saved page setup if available
  useEffect(() => {
    if (user?.page_setup) {
      const ps = user.page_setup;
      setSettings(prev => ({
        ...prev,
        bodyFont: ps.font_family || prev.bodyFont,
        bodySize: ps.font_size_pt || prev.bodySize,
        marginTop: ps.margin_top_in ?? prev.marginTop,
        marginBottom: ps.margin_bottom_in ?? prev.marginBottom,
        marginLeft: ps.margin_left_in ?? prev.marginLeft,
        marginRight: ps.margin_right_in ?? prev.marginRight,
        borderStyle: ps.border_style || prev.borderStyle,
        borderWidth: ps.border_width_px || prev.borderWidth,
        borderColor: ps.border_color || prev.borderColor,
        headingColor: ps.header_color || prev.headingColor,
        hrEnabled: ps.hr_enabled ?? prev.hrEnabled,
        hrWidth: ps.hr_width || prev.hrWidth,
        hrHeight: ps.hr_height || prev.hrHeight,
        hrColor: ps.hr_color || prev.hrColor,
        hrAlign: ps.hr_align || prev.hrAlign,
        mathAlign: ps.math_align || prev.mathAlign,
        lineSpacing: ps.line_spacing || prev.lineSpacing,
        spaceBefore: ps.space_before_pt || prev.spaceBefore,
        spaceAfter: ps.space_after_pt || prev.spaceAfter,
        twoColumn: (ps.column_count || 1) > 1,
      }));
    }
  }, [user]);

  const updatePreview = useCallback(() => {
    if (!previewRef.current) return;

    const { markdownText, mathBlocks } = preprocessForPreview(content, autoAlign);
    let htmlContent = marked.parse(markdownText);
    htmlContent = restoreMathBlocks(htmlContent, mathBlocks);
    previewRef.current.innerHTML = htmlContent;

    // Re-typeset MathJax
    if (window.MathJax && window.MathJax.Hub) {
      window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, previewRef.current]);
    }
  }, [content, autoAlign]);

  // Debounced preview update
  useEffect(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(updatePreview, 300);
    return () => clearTimeout(timeoutRef.current);
  }, [updatePreview]);

  // Apply CSS variables when settings change
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--doc-font', `'DandaFix', ${settings.bodyFont}`);
    root.style.setProperty('--selected-math-text-font', settings.bodyFont);
    root.style.setProperty('--doc-font-size', settings.bodySize + 'pt');
    root.style.setProperty('--doc-color', settings.bodyColor);
    root.style.setProperty('--doc-line-height', String(settings.lineSpacing));
    root.style.setProperty('--page-mt', settings.marginTop + 'in');
    root.style.setProperty('--page-mb', settings.marginBottom + 'in');
    root.style.setProperty('--page-ml', settings.marginLeft + 'in');
    root.style.setProperty('--page-mr', settings.marginRight + 'in');
    root.style.setProperty('--page-border-style', settings.borderStyle);
    root.style.setProperty('--page-border-width', settings.borderStyle === 'none' ? '0px' : settings.borderWidth + 'px');
    root.style.setProperty('--page-border-color', settings.borderColor);
    root.style.setProperty('--heading-color', settings.headingColor);
    root.style.setProperty('--math-align', settings.mathAlign);
  }, [settings]);

  async function handleExportWord() {
    if (!content.trim()) return;
    setExporting(true);

    try {
      // Parse font stack
      const fontParts = settings.bodyFont
        .split(',').map(f => f.trim().replace(/['"]/g, '').trim())
        .filter(f => f && f !== 'serif' && f !== 'sans-serif');
      const fontFamily = fontParts[0] || 'Times New Roman';
      const csFont = fontParts[1] || '';

      const processedMd = preprocessForExport(content, autoAlign);

      const payload = {
        font_family: fontFamily,
        cs_font: csFont,
        font_size_pt: settings.bodySize,
        margin_top_in: settings.marginTop,
        margin_bottom_in: settings.marginBottom,
        margin_left_in: settings.marginLeft,
        margin_right_in: settings.marginRight,
        border_style: settings.borderStyle,
        border_width_px: settings.borderWidth,
        border_color: settings.borderColor,
        header_color: settings.headingColor,
        hr_enabled: settings.hrEnabled,
        hr_width: settings.hrWidth,
        hr_height: settings.hrHeight,
        hr_color: settings.hrColor,
        hr_align: settings.hrAlign,
        math_align: settings.mathAlign,
        space_before_pt: settings.spaceBefore,
        space_after_pt: settings.spaceAfter,
        column_count: settings.twoColumn ? 2 : 1,
      };

      const blob = await convertAPI.toWord(processedMd, payload);

      // Download the file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'AI2Word_Document.docx';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      // Deduct credits (1 credit per 1500 words)
      const wordCount = content.split(/\s+/).filter(Boolean).length;
      try {
        await creditsAPI.deduct(wordCount);
        refreshProfile();
      } catch {
        // Credit deduction failure shouldn't block download
      }
    } catch (err) {
      console.error('Export error:', err);
      alert('Export failed: ' + (err.message || 'Connection error'));
    } finally {
      setExporting(false);
    }
  }

  function handleClear() {
    if (confirm('Are you sure you want to clear the editor?')) {
      setContent('');
    }
  }

  return (
    <div className="h-full flex flex-col lg:flex-row gap-0 overflow-hidden">
      {/* Editor Section */}
      <section className="flex-1 flex flex-col border-r border-white/5 min-w-0">
        <header className="bg-surface-900 px-5 py-3 border-b border-white/5 flex justify-between items-center shrink-0">
          <h2 className="font-semibold text-surface-300 text-sm uppercase tracking-wider">Input</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClear}
              className="btn-ghost text-xs flex items-center gap-1.5 !px-3 !py-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        </header>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          spellCheck={false}
          className="editor-textarea flex-1 w-full p-6 resize-none outline-none bg-surface-950 text-surface-200 font-mono text-sm leading-relaxed placeholder:text-surface-600"
          placeholder="Write your Markdown here..."
        />
      </section>

      {/* Preview Section */}
      <section className="flex-1 flex flex-col min-w-0">
        <header className="bg-surface-900 px-5 py-3 border-b border-white/5 flex justify-between items-center shrink-0">
          <h2 className="font-semibold text-surface-300 text-sm uppercase tracking-wider">Preview</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="btn-ghost text-xs flex items-center gap-1.5 !px-3 !py-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </button>
            <button
              onClick={handleExportWord}
              disabled={exporting || !content.trim()}
              className="btn-primary text-xs flex items-center gap-1.5 !px-4 !py-1.5 !rounded-lg"
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              Export Word
            </button>
          </div>
        </header>
        <div className="preview-container flex-1">
          <div ref={previewRef} className="preview-content" />
        </div>
      </section>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          setSettings={setSettings}
          autoAlign={autoAlign}
          setAutoAlign={setAutoAlign}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
