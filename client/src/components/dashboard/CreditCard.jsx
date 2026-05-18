import { Sparkles, TrendingUp } from 'lucide-react';

export default function CreditCard({ credits, totalUsed, onUpgrade }) {
  const maxCredits = 1000;
  const percentage = Math.min(100, (credits / maxCredits) * 100);
  const isLow = credits < 200;
  const isCritical = credits < 50;

  return (
    <div className="glass-card p-6 relative overflow-hidden">
      {/* Subtle gradient accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-brand-500/10 to-transparent rounded-bl-full pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-brand-400" />
          </div>
          <span className="text-sm text-surface-400">Credit Balance</span>
        </div>
        {isLow && (
          <button
            onClick={onUpgrade}
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 px-3 py-1.5 rounded-full transition-colors"
          >
            Upgrade
          </button>
        )}
      </div>

      <p className={`text-3xl font-bold ${isCritical ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-white'}`}>
        {credits.toLocaleString()}
      </p>

      {/* Progress bar */}
      <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isCritical ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-gradient-to-r from-brand-500 to-brand-400'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-surface-500">{credits} / {maxCredits} remaining</span>
        <div className="flex items-center gap-1 text-xs text-surface-500">
          <TrendingUp className="w-3 h-3" />
          {totalUsed.toLocaleString()} used
        </div>
      </div>
    </div>
  );
}
