import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { validateEmailDomain } from '../../utils/emailValidator';
import {
  Sparkles, Mail, Lock, Eye, EyeOff, Loader2,
  User, Phone, Briefcase, Globe,
} from 'lucide-react';

const COUNTRIES = [
  'Bangladesh', 'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Japan', 'South Korea', 'China', 'Pakistan', 'Nepal',
  'Sri Lanka', 'Malaysia', 'Singapore', 'UAE', 'Saudi Arabia', 'Other',
];

export default function SignupPage() {
  const { signUp, signInWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', occupation: '', gender: '', country: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Validations
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const emailCheck = validateEmailDomain(form.email);
    if (!emailCheck.valid) {
      setError(emailCheck.reason);
      return;
    }

    setLoading(true);
    try {
      await signUp({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        occupation: form.occupation,
        gender: form.gender,
        country: form.country,
      });
      navigate('/dashboard');
    } catch (err) {
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') setError('An account with this email already exists.');
      else if (code === 'auth/weak-password') setError('Password is too weak. Use at least 6 characters.');
      else setError(err?.response?.data?.error || err.message || 'Sign-up failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign-in failed.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full flex items-center justify-center px-4 py-8 overflow-y-auto relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-600/10 rounded-full blur-[180px] pointer-events-none" />

      <div className="w-full max-w-lg relative animate-slide-up">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Create your account</h1>
          <p className="text-surface-400 mt-2">Get 1,000 free credits to start</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </button>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-surface-500 uppercase tracking-wider">or register with email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-4 animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="input-label">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input name="name" type="text" required value={form.name} onChange={handleChange}
                  placeholder="John Doe" className="input-field !pl-11" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="input-label">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input name="email" type="email" required value={form.email} onChange={handleChange}
                  placeholder="you@gmail.com" className="input-field !pl-11" />
              </div>
            </div>

            {/* Password row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                  <input name="password" type={showPassword ? 'text' : 'password'} required minLength={6}
                    value={form.password} onChange={handleChange}
                    placeholder="••••••" className="input-field !pl-11 !pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="input-label">Confirm Password *</label>
                <input name="confirmPassword" type="password" required value={form.confirmPassword}
                  onChange={handleChange} placeholder="••••••" className="input-field" />
              </div>
            </div>

            {/* Phone + Occupation */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                  <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                    placeholder="+880..." className="input-field !pl-11" />
                </div>
              </div>
              <div>
                <label className="input-label">Occupation</label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                  <input name="occupation" type="text" value={form.occupation} onChange={handleChange}
                    placeholder="Teacher, Student..." className="input-field !pl-11" />
                </div>
              </div>
            </div>

            {/* Gender + Country */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange} className="select-field">
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="input-label">Country</label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 z-10" />
                  <select name="country" value={form.country} onChange={handleChange} className="select-field !pl-11">
                    <option value="">Select...</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 !py-3.5 !text-base mt-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-surface-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
