import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useProfile } from '../auth/hooks';
import { LanguageSelector } from './LanguageSelector';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/console', label: 'Console' },
    { path: '/cash-flow', label: 'Cash Flow' },
    { path: '/loans', label: 'Loans' },
    { path: '/settings', label: 'Settings' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-navy-dark">
      {/* Top Navigation */}
      <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="font-bold text-white text-lg">UPI Rakshak</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <LanguageSelector />
              
              {/* User Menu */}
              <div className="hidden md:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {profile?.full_name || user?.email}
                  </p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Sign out
                </button>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                    location.pathname === item.path
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © 2026 UPI Rakshak · Built for iQOO Hackathon
            </p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-sm text-slate-500 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="text-sm text-slate-500 hover:text-white transition-colors">
                Terms
              </Link>
              <Link to="/about" className="text-sm text-slate-500 hover:text-white transition-colors">
                About
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
