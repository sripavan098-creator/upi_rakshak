import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { AuthLayout } from '../../components/auth/AuthLayout';

export function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUpWithEmail } = useAuth();
  const navigate = useNavigate();

  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return { level: 0, text: '', color: '' };
    if (pwd.length < 8) return { level: 1, text: 'Weak', color: 'text-red-400' };
    if (pwd.length < 12) return { level: 2, text: 'Medium', color: 'text-yellow-400' };
    return { level: 3, text: 'Strong', color: 'text-emerald-400' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);
    const { error } = await signUpWithEmail(email, password, fullName);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/onboarding');
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
        <p className="text-slate-400">Start protecting your digital payments</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">
            Full Name
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
          <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="••••••••"
            required
          />
          {password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full ${
                      i <= passwordStrength.level ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  ></div>
                ))}
              </div>
              <p className={`text-xs mt-1 ${passwordStrength.color}`}>
                {passwordStrength.text}
              </p>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="••••••••"
            required
          />
        </div>

        <div className="flex items-start gap-2">
          <input
            id="terms"
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 w-4 h-4 bg-slate-800 border-slate-700 rounded focus:ring-emerald-500"
          />
          <label htmlFor="terms" className="text-sm text-slate-400">
            I agree to the{' '}
            <Link to="/terms" className="text-emerald-400 hover:text-emerald-300">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-emerald-400 hover:text-emerald-300">
              Privacy Policy
            </Link>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
