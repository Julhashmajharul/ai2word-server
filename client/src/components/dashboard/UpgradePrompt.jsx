import { Zap, X } from 'lucide-react';

export default function UpgradePrompt({ onUpgrade, onDismiss }) {
  return (
    <div className="relative bg-gradient-to-r from-brand-600/20 via-brand-500/10 to-violet-600/20 border border-brand-500/20 rounded-2xl p-6 mb-8 animate-slide-up overflow-hidden">
      {/* Background shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer bg-[length:200%_100%] pointer-events-none" />

      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 text-surface-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-4 relative">
        <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center shrink-0">
          <Zap className="w-6 h-6 text-brand-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Running low on credits?</h3>
          <p className="text-surface-400 text-sm leading-relaxed mb-4">
            You've used over 100 credits. Upgrade to a premium plan for unlimited conversions,
            priority processing, and more.
          </p>
          <button onClick={onUpgrade} className="btn-primary !px-6 !py-2.5 text-sm flex items-center gap-2">
            <Zap className="w-4 h-4" />
            View Plans
          </button>
        </div>
      </div>
    </div>
  );
}
