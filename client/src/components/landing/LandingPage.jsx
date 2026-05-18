import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles, FileText, Languages, Download, ArrowRight, Zap, Shield, Globe } from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="h-full overflow-y-auto">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-6 overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-500/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-brand-700/15 rounded-full blur-[128px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-[200px]" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium px-4 py-2 rounded-full mb-8">
            <Sparkles className="w-4 h-4" />
            Professional Document Converter
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight">
            Transform Markdown into{' '}
            <span className="bg-gradient-to-r from-brand-400 via-brand-300 to-brand-500 bg-clip-text text-transparent">
              Professional Documents
            </span>
          </h1>

          <p className="text-lg md:text-xl text-surface-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The ultimate editor for teachers, students, and professionals. Write in Markdown,
            render complex Math equations, and export to PDF or MS Word with perfect Bangla font support.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? '/editor' : '/signup'}
              className="btn-primary text-lg !px-10 !py-4 flex items-center gap-2 group"
            >
              Start Writing
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            {!isAuthenticated && (
              <Link to="/login" className="btn-secondary text-lg !px-10 !py-4">
                Log In
              </Link>
            )}
          </div>

          {/* Social proof */}
          <p className="mt-8 text-sm text-surface-500">
            <span className="text-brand-400 font-semibold">1,000 free credits</span> — no credit card required
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything you need</h2>
          <p className="text-surface-400 text-lg">Powerful features built for academic and professional documents.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <FileText className="w-6 h-6" />,
              title: 'MathJax Equations',
              desc: 'Perfectly render complex mathematical equations and formulas with real-time preview.',
              gradient: 'from-blue-500 to-cyan-500',
            },
            {
              icon: <Languages className="w-6 h-6" />,
              title: 'Bangla Font Support',
              desc: 'Built-in support for Kalpurush, SolaimanLipi, and Siyam Rupali with ligature preservation.',
              gradient: 'from-emerald-500 to-teal-500',
            },
            {
              icon: <Download className="w-6 h-6" />,
              title: 'PDF & Word Export',
              desc: 'Export formatted documents to print-ready PDF or fully editable MS Word files.',
              gradient: 'from-violet-500 to-purple-500',
            },
            {
              icon: <Zap className="w-6 h-6" />,
              title: 'Real-time Preview',
              desc: 'See your document render live as you type with a Google Docs-like canvas.',
              gradient: 'from-amber-500 to-orange-500',
            },
            {
              icon: <Shield className="w-6 h-6" />,
              title: 'Secure & Private',
              desc: 'Your documents are processed securely and conversion history auto-deletes after 3 days.',
              gradient: 'from-rose-500 to-pink-500',
            },
            {
              icon: <Globe className="w-6 h-6" />,
              title: 'Page Customization',
              desc: 'Full control over fonts, margins, borders, headings, math alignment, and spacing.',
              gradient: 'from-indigo-500 to-blue-500',
            },
          ].map(({ icon, title, desc, gradient }, i) => (
            <div
              key={i}
              className="glass-card-hover p-8 group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
              <p className="text-surface-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-surface-500 text-sm">
        <p>© 2026 AI2Word. Built for educators and professionals.</p>
      </footer>
    </div>
  );
}
