import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../auth/hooks';
import { OnboardingLayout } from './OnboardingLayout';
import { LANGUAGE_LIST } from '../../i18n/languages';

export function Step1Profile() {
  const { profile, updateProfile } = useProfile();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [preferredLanguage, setPreferredLanguage] = useState(profile?.preferred_language || 'en');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await updateProfile({
      full_name: fullName,
      phone: phone || null,
      preferred_language: preferredLanguage,
    });

    navigate('/onboarding/step-2');
  };

  return (
    <OnboardingLayout currentStep={1} totalSteps={3}>
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-white mb-2">Tell us about yourself</h1>
        <p className="text-slate-400 mb-8">This helps us personalize your experience</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">
              Full Name *
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
              Phone Number (optional)
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="+91 98765 43210"
            />
            <p className="text-xs text-slate-500 mt-1">
              Used for guardian mode emergency contacts
            </p>
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-slate-300 mb-2">
              Preferred Language
            </label>
            <select
              id="language"
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {LANGUAGE_LIST.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeLabel} ({lang.label})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </OnboardingLayout>
  );
}
