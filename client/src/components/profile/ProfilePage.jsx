import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import { User, Mail, Phone, Briefcase, Globe, Save, Loader2, Settings, Shield } from 'lucide-react';

const COUNTRIES = [
  'Bangladesh', 'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Japan', 'South Korea', 'China', 'Pakistan', 'Nepal',
  'Sri Lanka', 'Malaysia', 'Singapore', 'UAE', 'Saudi Arabia', 'Other',
];

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [tab, setTab] = useState('profile');

  const [profile, setProfile] = useState({
    name: '', phone: '', occupation: '', gender: '', country: '',
  });
  const [pageSetup, setPageSetup] = useState({
    font_family: "'Times New Roman', 'bangla', serif",
    font_size_pt: 12,
    margin_top_in: 0.5, margin_bottom_in: 0.5,
    margin_left_in: 0.5, margin_right_in: 0.5,
    border_style: 'none', border_width_px: 1, border_color: '#000000',
    header_color: '#003366',
    hr_enabled: true, hr_width: '100%', hr_height: 1, hr_color: '#000000', hr_align: 'center',
    math_align: 'center',
    space_before_pt: 0, space_after_pt: 0,
    line_spacing: 1,
    column_count: 1,
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        phone: user.phone || '',
        occupation: user.occupation || '',
        gender: user.gender || '',
        country: user.country || '',
      });
      if (user.page_setup) {
        setPageSetup(prev => ({ ...prev, ...user.page_setup }));
      }
    }
  }, [user]);

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSaving(true); setMessage('');
    try {
      await authAPI.updateProfile(profile);
      await refreshProfile();
      setMessage('Profile updated successfully!');
    } catch (err) {
      setMessage('Failed to save profile.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  }

  async function handleSavePageSetup(e) {
    e.preventDefault();
    setSaving(true); setMessage('');
    try {
      await authAPI.savePageSetup(pageSetup);
      await refreshProfile();
      setMessage('Page setup saved! These will be your default settings.');
    } catch (err) {
      setMessage('Failed to save page setup.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  }

  function setPS(key, val) {
    setPageSetup(prev => ({ ...prev, [key]: val }));
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-surface-400 mb-8">Manage your profile and default document settings.</p>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-8">
          <button
            onClick={() => setTab('profile')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
              tab === 'profile' ? 'bg-white/10 text-white' : 'text-surface-400 hover:text-surface-200'
            }`}
          >
            <User className="w-4 h-4" />
            Profile
          </button>
          <button
            onClick={() => setTab('pagesetup')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
              tab === 'pagesetup' ? 'bg-white/10 text-white' : 'text-surface-400 hover:text-surface-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            Page Setup
          </button>
        </div>

        {/* Success/Error message */}
        {message && (
          <div className={`mb-6 px-4 py-3 rounded-xl text-sm animate-fade-in ${
            message.includes('success') || message.includes('saved')
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {message}
          </div>
        )}

        {/* Profile Tab */}
        {tab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="glass-card p-6 space-y-5">
            {/* Email (read-only) */}
            <div>
              <label className="input-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input type="email" value={user?.email || ''} disabled
                  className="input-field !pl-11 opacity-60 cursor-not-allowed" />
              </div>
              <p className="text-xs text-surface-500 mt-1 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Email cannot be changed for security reasons.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                  <input type="text" value={profile.name} onChange={e => setProfile(p => ({...p, name: e.target.value}))}
                    className="input-field !pl-11" />
                </div>
              </div>
              <div>
                <label className="input-label">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                  <input type="tel" value={profile.phone} onChange={e => setProfile(p => ({...p, phone: e.target.value}))}
                    className="input-field !pl-11" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Occupation</label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                  <input type="text" value={profile.occupation}
                    onChange={e => setProfile(p => ({...p, occupation: e.target.value}))}
                    className="input-field !pl-11" />
                </div>
              </div>
              <div>
                <label className="input-label">Gender</label>
                <select value={profile.gender} onChange={e => setProfile(p => ({...p, gender: e.target.value}))}
                  className="select-field">
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="input-label">Country</label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 z-10" />
                <select value={profile.country} onChange={e => setProfile(p => ({...p, country: e.target.value}))}
                  className="select-field !pl-11">
                  <option value="">Select...</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Profile
            </button>
          </form>
        )}

        {/* Page Setup Tab */}
        {tab === 'pagesetup' && (
          <form onSubmit={handleSavePageSetup} className="glass-card p-6 space-y-6">
            <p className="text-sm text-surface-400 bg-brand-500/5 border border-brand-500/10 rounded-xl px-4 py-3">
              These settings will be used as your default page setup every time you open the editor.
            </p>

            {/* Margins */}
            <div>
              <h4 className="text-sm font-semibold text-surface-300 mb-3">Default Margins (inches)</h4>
              <div className="grid grid-cols-4 gap-3">
                {[['margin_top_in', 'Top'], ['margin_bottom_in', 'Bottom'], ['margin_left_in', 'Left'], ['margin_right_in', 'Right']].map(([key, label]) => (
                  <div key={key}>
                    <label className="input-label">{label}</label>
                    <input type="number" step="0.1" value={pageSetup[key]}
                      onChange={e => setPS(key, parseFloat(e.target.value) || 0.5)}
                      className="input-field text-center" />
                  </div>
                ))}
              </div>
            </div>

            {/* Font & Size */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Default Font Size (pt)</label>
                <input type="number" value={pageSetup.font_size_pt}
                  onChange={e => setPS('font_size_pt', parseFloat(e.target.value) || 12)}
                  className="input-field" />
              </div>
              <div>
                <label className="input-label">Line Spacing</label>
                <input type="number" step="0.1" value={pageSetup.line_spacing}
                  onChange={e => setPS('line_spacing', parseFloat(e.target.value) || 1)}
                  className="input-field" />
              </div>
            </div>

            {/* Paper Size / Math Align */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Math Alignment</label>
                <select value={pageSetup.math_align} onChange={e => setPS('math_align', e.target.value)} className="select-field">
                  <option value="center">Center</option>
                  <option value="left">Left</option>
                </select>
              </div>
              <div>
                <label className="input-label">Heading Color</label>
                <input type="color" value={pageSetup.header_color} onChange={e => setPS('header_color', e.target.value)}
                  className="w-full h-11 rounded-xl border border-white/10 cursor-pointer bg-transparent p-1" />
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Page Setup
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
