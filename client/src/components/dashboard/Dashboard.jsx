import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { creditsAPI, historyAPI } from '../../services/api';
import CreditCard from './CreditCard';
import HistoryList from './HistoryList';
import UpgradePrompt from './UpgradePrompt';
import { FileEdit, Sparkles, ArrowRight } from 'lucide-react';

export default function Dashboard({ onShowPricing }) {
  const { user, refreshProfile } = useAuth();
  const [credits, setCredits] = useState(user?.credits ?? 0);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await historyAPI.getAll();
      setHistory(res.data.history || []);
    } catch {
      // ignore
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
    // Refresh credit balance
    creditsAPI.getBalance().then(res => {
      setCredits(res.data.credits ?? 0);
    }).catch(() => {});
  }, [loadHistory]);

  // Show upgrade prompt every 100 credits consumed
  useEffect(() => {
    const totalUsed = user?.total_credits_used || 0;
    if (totalUsed > 0 && totalUsed % 100 < 10 && user?.credits < 1000) {
      setShowUpgrade(true);
    }
  }, [user]);

  async function handleDeleteHistory(id) {
    try {
      await historyAPI.delete(id);
      setHistory(prev => prev.filter(h => h._id !== id));
    } catch {
      // ignore
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, <span className="text-brand-400">{user?.name?.split(' ')[0] || 'User'}</span>
            </h1>
            <p className="text-surface-400 mt-1">Here's your conversion activity overview.</p>
          </div>
          <Link
            to="/editor"
            className="btn-primary flex items-center gap-2 group"
          >
            <FileEdit className="w-4 h-4" />
            Open Editor
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <CreditCard
            credits={credits}
            totalUsed={user?.total_credits_used || 0}
            onUpgrade={onShowPricing}
          />

          {/* Conversions count */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <FileEdit className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-sm text-surface-400">Total Conversions</span>
            </div>
            <p className="text-3xl font-bold text-white">{history.length}</p>
            <p className="text-xs text-surface-500 mt-1">in the last 3 days</p>
          </div>

          {/* Words converted */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-sm text-surface-400">Words Converted</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {history.reduce((sum, h) => sum + (h.word_count || 0), 0).toLocaleString()}
            </p>
            <p className="text-xs text-surface-500 mt-1">1 credit = 1,500 words</p>
          </div>
        </div>

        {/* Upgrade Prompt */}
        {showUpgrade && (
          <UpgradePrompt
            onUpgrade={() => { setShowUpgrade(false); onShowPricing(); }}
            onDismiss={() => setShowUpgrade(false)}
          />
        )}

        {/* Conversion History */}
        <HistoryList
          history={history}
          loading={historyLoading}
          onDelete={handleDeleteHistory}
        />
      </div>
    </div>
  );
}
