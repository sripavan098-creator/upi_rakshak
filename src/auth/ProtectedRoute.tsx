import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useProfile } from './hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export function ProtectedRoute({ children, requireOnboarding = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireOnboarding && profile && !profile.full_name) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
