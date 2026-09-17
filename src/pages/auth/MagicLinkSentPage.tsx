import { Link, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';

export function MagicLinkSentPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || 'your email';

  return (
    <AuthLayout>
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-full mb-4">
          <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
        <p className="text-slate-400 mb-6">
          We sent a magic link to <strong className="text-white">{email}</strong>
        </p>
        <p className="text-sm text-slate-500 mb-6">
          Click the link in the email to sign in. The link will expire in 24 hours.
        </p>
        <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
          Return to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
