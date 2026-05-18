import { X, Check, Sparkles, Zap, Crown, Building2, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { plansAPI } from '../../services/api';

const PLANS = [
  {
    id: 'payg',
    name: 'Pay-As-You-Go',
    price: '$1',
    period: 'per 1,000 words',
    icon: <CreditCard className="w-6 h-6" />,
    color: 'from-blue-500 to-cyan-500',
    features: ['No commitment', 'Pay only for what you use', '1,000 words per $1', 'Instant activation'],
    popular: false,
  },
  {
    id: '7day',
    name: '7 Days',
    price: '$3',
    period: 'for 7 days',
    icon: <Zap className="w-6 h-6" />,
    color: 'from-emerald-500 to-teal-500',
    features: ['Unlimited conversions', '7-day access', 'Priority processing', 'All export formats'],
    popular: false,
  },
  {
    id: '1month',
    name: '1 Month',
    price: '$5',
    period: 'per month',
    icon: <Sparkles className="w-6 h-6" />,
    color: 'from-brand-500 to-violet-500',
    features: ['Unlimited conversions', '30-day access', 'Priority processing', 'Extended history (30 days)', 'Custom page setups'],
    popular: true,
  },
  {
    id: '1year',
    name: '1 Year',
    price: '$20',
    period: 'per year',
    icon: <Crown className="w-6 h-6" />,
    color: 'from-amber-500 to-orange-500',
    features: ['Unlimited conversions', '365-day access', 'Priority processing', 'Extended history (30 days)', 'Custom page setups', 'Save $40 vs monthly'],
    popular: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    icon: <Building2 className="w-6 h-6" />,
    color: 'from-rose-500 to-pink-500',
    features: ['Unlimited everything', 'Team management', 'API access', 'Custom integrations', 'Dedicated support', 'SLA guarantee'],
    popular: false,
  },
];

export default function PricingModal({ onClose }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubscribe(planId) {
    if (planId === 'enterprise') {
      // Open contact form or email
      window.open('mailto:support@ai2word.com?subject=Enterprise Plan Inquiry', '_blank');
      return;
    }

    setLoading(true);
    setSelectedPlan(planId);
    try {
      await plansAPI.subscribe(planId);
      // TODO: Integrate local payment gateway here
      alert('Payment gateway integration pending. Plan selected: ' + planId);
    } catch (err) {
      console.error('Subscription error:', err);
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-surface-900 border border-white/10 rounded-2xl shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-surface-900/95 backdrop-blur-xl border-b border-white/5 p-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Upgrade Your Plan</h2>
            <p className="text-surface-400 text-sm mt-1">Choose the plan that works best for you.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-5 h-5 text-surface-400" />
          </button>
        </div>

        {/* Plans grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative glass-card p-6 flex flex-col transition-all duration-300 hover:border-white/20 hover:bg-white/10 ${
                  plan.popular ? 'border-brand-500/30 bg-brand-500/5' : ''
                } ${plan.id === 'enterprise' ? 'md:col-span-2 lg:col-span-1' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-brand-500 to-violet-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-glow">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                  {plan.icon}
                </div>

                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>

                <div className="mt-2 mb-4">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-surface-400 text-sm ml-1">/ {plan.period}</span>
                </div>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-surface-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading && selectedPlan === plan.id}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    plan.popular
                      ? 'btn-primary'
                      : plan.id === 'enterprise'
                        ? 'btn-secondary'
                        : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20'
                  }`}
                >
                  {loading && selectedPlan === plan.id
                    ? 'Processing...'
                    : plan.id === 'enterprise'
                      ? 'Contact Sales'
                      : 'Choose Plan'}
                </button>
              </div>
            ))}
          </div>

          {/* Free tier note */}
          <div className="text-center mt-8 pb-2">
            <p className="text-surface-500 text-sm">
              Free tier: <span className="text-surface-300 font-medium">1,000 credits</span> included with every new account.
              1 credit = 1,500 words converted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
