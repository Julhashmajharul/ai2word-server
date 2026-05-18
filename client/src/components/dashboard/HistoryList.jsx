import { Clock, Trash2, FileText, AlertTriangle, Loader2 } from 'lucide-react';

export default function HistoryList({ history, loading, onDelete }) {
  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  function timeRemaining(dateStr) {
    const created = new Date(dateStr).getTime();
    const expiresAt = created + 3 * 24 * 60 * 60 * 1000; // 3 days
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) return 'Expiring soon';
    const hours = Math.floor(remaining / 3600000);
    if (hours < 24) return `${hours}h remaining`;
    const days = Math.floor(hours / 24);
    return `${days}d remaining`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Conversion History</h2>
        <span className="text-sm text-surface-500">{history.length} items</span>
      </div>

      {/* Auto-delete warning */}
      <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/15 rounded-xl px-4 py-3 mb-5">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-400/90 leading-relaxed">
          <strong>Note:</strong> For security and storage optimization, your converted text history
          will be automatically deleted 3 days after creation.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-surface-400 animate-spin" />
        </div>
      ) : history.length === 0 ? (
        <div className="glass-card py-16 text-center">
          <FileText className="w-12 h-12 text-surface-600 mx-auto mb-3" />
          <p className="text-surface-400 font-medium">No conversion history yet</p>
          <p className="text-surface-500 text-sm mt-1">Your converted documents will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item._id}
              className="glass-card p-4 flex items-center gap-4 group hover:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-brand-400" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-white truncate">
                  {item.title || 'Untitled Document'}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-surface-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timeAgo(item.created_at)}
                  </span>
                  <span className="text-xs text-surface-600">•</span>
                  <span className="text-xs text-surface-500">
                    {(item.word_count || 0).toLocaleString()} words
                  </span>
                  <span className="text-xs text-surface-600">•</span>
                  <span className="text-xs text-amber-500/70">
                    {timeRemaining(item.created_at)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="badge-info text-xs">{item.credits_used || 0} cr</span>
                <button
                  onClick={() => onDelete(item._id)}
                  className="p-2 rounded-lg text-surface-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
