import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from './OnboardingLayout';

export function Step3Ready() {
  const navigate = useNavigate();

  return (
    <OnboardingLayout currentStep={3} totalSteps={3}>
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full mb-6 animate-pulse">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-white mb-4">You're protected.</h1>
        <p className="text-xl text-slate-300 mb-8">
          Rakshak is now monitoring your messages and payments.
        </p>

        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-emerald-400 mb-2">What happens next?</h2>
          <ul className="text-left text-slate-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">✓</span>
              <span>Real-time fraud detection on all your messages</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">✓</span>
              <span>Instant warnings in your preferred language</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">✓</span>
              <span>Cash flow forecasting to prevent financial stress</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">✓</span>
              <span>Loan comparison to avoid predatory lending</span>
            </li>
          </ul>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-lg transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </OnboardingLayout>
  );
}
