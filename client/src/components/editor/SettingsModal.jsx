import { X } from 'lucide-react';

const FONT_OPTIONS = [
  { value: "'Times New Roman', 'bangla', serif", label: 'Times New Roman + Bangla (Default)' },
  { value: "'Times New Roman', serif", label: 'Times New Roman' },
  { value: "Arial, sans-serif", label: 'Arial' },
  { value: "'Calibri', sans-serif", label: 'Calibri' },
  { value: "'Georgia', serif", label: 'Georgia' },
  { value: "'Kalpurush', sans-serif", label: 'Kalpurush (Bangla)' },
  { value: "'SolaimanLipi', sans-serif", label: 'SolaimanLipi (Bangla)' },
  { value: "'Siyam Rupali', sans-serif", label: 'Siyam Rupali (Bangla)' },
  { value: "'bangla', sans-serif", label: 'Bangla (Avro Default)' },
];

export default function SettingsModal({ settings, setSettings, autoAlign, setAutoAlign, onClose }) {
  function set(key, val) {
    setSettings(prev => ({ ...prev, [key]: val }));
  }

  function handle2ColToggle(checked) {
    if (checked) {
      setSettings(prev => ({
        ...prev,
        twoColumn: true,
        bodySize: 10.5,
        marginLeft: 0.3,
        marginRight: 0.3,
        marginTop: 0.5,
        marginBottom: 0.5,
        spaceBefore: 0,
        spaceAfter: 0,
        mathAlign: 'left',
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        twoColumn: false,
        bodySize: 12,
        marginLeft: 0.5,
        marginRight: 0.5,
        marginTop: 0.5,
        marginBottom: 0.5,
        spaceBefore: 0,
        spaceAfter: 0,
        mathAlign: 'center',
      }));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-surface-900 border border-white/10 rounded-2xl shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-surface-900/95 backdrop-blur-xl border-b border-white/5 p-5 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-white">Document Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-5 h-5 text-surface-400" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Body Text */}
          <section>
            <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-4">Body Text</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="input-label">Font Family</label>
                <select value={settings.bodyFont} onChange={e => set('bodyFont', e.target.value)} className="select-field">
                  {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Font Size (pt)</label>
                <input type="number" value={settings.bodySize} onChange={e => set('bodySize', parseFloat(e.target.value) || 12)} className="input-field" />
              </div>
              <div>
                <label className="input-label">Text Color</label>
                <input type="color" value={settings.bodyColor} onChange={e => set('bodyColor', e.target.value)}
                  className="w-full h-11 rounded-xl border border-white/10 cursor-pointer bg-transparent p-1" />
              </div>
              <div>
                <label className="input-label">Line Spacing</label>
                <input type="number" step="0.1" value={settings.lineSpacing} onChange={e => set('lineSpacing', parseFloat(e.target.value) || 1)} className="input-field" />
              </div>
              <div>
                <label className="input-label">Space Before (pt)</label>
                <input type="number" value={settings.spaceBefore} onChange={e => set('spaceBefore', parseFloat(e.target.value) || 0)} className="input-field" />
              </div>
              <div>
                <label className="input-label">Space After (pt)</label>
                <input type="number" value={settings.spaceAfter} onChange={e => set('spaceAfter', parseFloat(e.target.value) || 0)} className="input-field" />
              </div>
            </div>
          </section>

          {/* Margins */}
          <section>
            <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-4">Margins (inches)</h3>
            <div className="grid grid-cols-4 gap-3">
              {['Top', 'Bottom', 'Left', 'Right'].map((side) => (
                <div key={side}>
                  <label className="input-label">{side}</label>
                  <input type="number" step="0.1"
                    value={settings[`margin${side}`]}
                    onChange={e => set(`margin${side}`, parseFloat(e.target.value) || 0.5)}
                    className="input-field text-center" />
                </div>
              ))}
            </div>
          </section>

          {/* Page Border */}
          <section>
            <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-4">Page Border</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="input-label">Style</label>
                <select value={settings.borderStyle} onChange={e => set('borderStyle', e.target.value)} className="select-field">
                  <option value="none">None</option>
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                  <option value="double">Double</option>
                </select>
              </div>
              <div>
                <label className="input-label">Width (px)</label>
                <input type="number" min={1} max={10} value={settings.borderWidth}
                  onChange={e => set('borderWidth', parseInt(e.target.value) || 1)} className="input-field" />
              </div>
              <div>
                <label className="input-label">Color</label>
                <input type="color" value={settings.borderColor} onChange={e => set('borderColor', e.target.value)}
                  className="w-full h-11 rounded-xl border border-white/10 cursor-pointer bg-transparent p-1" />
              </div>
            </div>
          </section>

          {/* Horizontal Line */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">Horizontal Line</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs text-surface-400">Enable</span>
                <input type="checkbox" checked={settings.hrEnabled} onChange={e => set('hrEnabled', e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-brand-500 focus:ring-brand-500/50" />
              </label>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="input-label">Width</label>
                <select value={settings.hrWidth} onChange={e => set('hrWidth', e.target.value)} className="select-field">
                  {['100%', '75%', '50%', '25%'].map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Thickness (pt)</label>
                <input type="number" min={1} max={10} step={0.5} value={settings.hrHeight}
                  onChange={e => set('hrHeight', parseFloat(e.target.value) || 1)} className="input-field" />
              </div>
              <div>
                <label className="input-label">Color</label>
                <input type="color" value={settings.hrColor} onChange={e => set('hrColor', e.target.value)}
                  className="w-full h-11 rounded-xl border border-white/10 cursor-pointer bg-transparent p-1" />
              </div>
              <div>
                <label className="input-label">Align</label>
                <select value={settings.hrAlign} onChange={e => set('hrAlign', e.target.value)} className="select-field">
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
          </section>

          {/* Math & Heading */}
          <section>
            <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-4">Math & Heading</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Heading Color</label>
                <input type="color" value={settings.headingColor} onChange={e => set('headingColor', e.target.value)}
                  className="w-full h-11 rounded-xl border border-white/10 cursor-pointer bg-transparent p-1" />
              </div>
              <div>
                <label className="input-label">Math Alignment</label>
                <select value={settings.mathAlign} onChange={e => set('mathAlign', e.target.value)} className="select-field">
                  <option value="center">Center (Default)</option>
                  <option value="left">Left (Textbook Style)</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={autoAlign} onChange={e => setAutoAlign(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-brand-500 focus:ring-brand-500/50" />
                  <span className="text-sm text-surface-300">Auto Align '='</span>
                  <span className="text-xs text-surface-500">Formats consecutive $= lines into aligned LaTeX blocks</span>
                </label>
              </div>
            </div>
          </section>

          {/* Layout */}
          <section>
            <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-4">Layout</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={settings.twoColumn} onChange={e => handle2ColToggle(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-brand-500 focus:ring-brand-500/50" />
              <span className="text-sm text-surface-300">Optimize for 2-Column Layout</span>
              <span className="text-xs text-surface-500">Auto-sets font 10.5pt, margins 0.3in, math left-aligned</span>
            </label>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-surface-900/95 backdrop-blur-xl border-t border-white/5 p-5 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary !px-6">Cancel</button>
          <button onClick={onClose} className="btn-primary !px-6">Apply</button>
        </div>
      </div>
    </div>
  );
}
