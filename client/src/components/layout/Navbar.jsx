import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LogOut, User, LayoutDashboard, FileEdit, CreditCard, ChevronDown, Sparkles,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Navbar({ onShowPricing }) {
  const { isAuthenticated, user, logOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleLogout() {
    await logOut();
    navigate('/');
  }

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-surface-900/80 backdrop-blur-xl border-b border-white/5 px-6 py-3 flex justify-between items-center shrink-0 relative z-50">
      {/* Logo */}
      <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
        <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-glow transition-shadow duration-300">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">
          AI<span className="text-brand-400">2</span>Word
        </span>
      </Link>

      {/* Right side */}
      {isAuthenticated ? (
        <div className="flex items-center gap-2">
          {/* Nav Links */}
          <Link
            to="/dashboard"
            className={`btn-ghost flex items-center gap-2 text-sm ${isActive('/dashboard') ? 'text-white bg-white/10' : ''}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden md:inline">Dashboard</span>
          </Link>
          <Link
            to="/editor"
            className={`btn-ghost flex items-center gap-2 text-sm ${isActive('/editor') ? 'text-white bg-white/10' : ''}`}
          >
            <FileEdit className="w-4 h-4" />
            <span className="hidden md:inline">Editor</span>
          </Link>
          <button onClick={onShowPricing} className="btn-ghost flex items-center gap-2 text-sm">
            <CreditCard className="w-4 h-4" />
            <span className="hidden md:inline">Pricing</span>
          </button>

          {/* Credit badge */}
          {user && (
            <div className="hidden md:flex items-center gap-1.5 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold px-3 py-1.5 rounded-full ml-1">
              <Sparkles className="w-3.5 h-3.5" />
              {(user.credits ?? 0).toLocaleString()} credits
            </div>
          )}

          {/* Profile dropdown */}
          <div ref={menuRef} className="relative ml-2">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-2 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="hidden md:block text-sm font-medium text-white max-w-[120px] truncate">
                {user?.name || 'User'}
              </span>
              <ChevronDown className={`w-4 h-4 text-surface-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-surface-800 border border-white/10 rounded-xl shadow-2xl py-2 animate-slide-down z-50">
                <div className="px-4 py-2 border-b border-white/5">
                  <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                  <p className="text-xs text-surface-400 truncate">{user?.email}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profile & Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-sm">Log In</Link>
          <Link to="/signup" className="btn-primary text-sm !px-5 !py-2.5">Sign Up</Link>
        </div>
      )}
    </nav>
  );
}
