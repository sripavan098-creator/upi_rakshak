import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { LanguageProvider } from './i18n/LanguageContext';

// Auth pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { MagicLinkSentPage } from './pages/auth/MagicLinkSentPage';

// Onboarding
import { Step1Profile } from './pages/onboarding/Step1Profile';
import { Step2Permissions } from './pages/onboarding/Step2Permissions';
import { Step3Ready } from './pages/onboarding/Step3Ready';

// Dashboard
import { DashboardPage } from './pages/dashboard/DashboardPage';

// Public pages
import TheNoticeLanding from './components/TheNoticeLanding';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<TheNoticeLanding />} />
            
            {/* Auth routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/magic-link-sent" element={<MagicLinkSentPage />} />
            
            {/* Onboarding routes */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Navigate to="/onboarding/step-1" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/step-1"
              element={
                <ProtectedRoute>
                  <Step1Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/step-2"
              element={
                <ProtectedRoute>
                  <Step2Permissions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/step-3"
              element={
                <ProtectedRoute>
                  <Step3Ready />
                </ProtectedRoute>
              }
            />
            
            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requireOnboarding>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            
            {/* Placeholder routes for existing components */}
            <Route
              path="/console"
              element={
                <ProtectedRoute requireOnboarding>
                  <div className="min-h-screen bg-navy-dark p-8">
                    <h1 className="text-3xl font-bold text-white mb-4">Console</h1>
                    <p className="text-slate-400">Message analysis console coming soon...</p>
                  </div>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/cash-flow"
              element={
                <ProtectedRoute requireOnboarding>
                  <div className="min-h-screen bg-navy-dark p-8">
                    <h1 className="text-3xl font-bold text-white mb-4">Cash Flow</h1>
                    <p className="text-slate-400">Cash flow forecasting coming soon...</p>
                  </div>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/loans"
              element={
                <ProtectedRoute requireOnboarding>
                  <div className="min-h-screen bg-navy-dark p-8">
                    <h1 className="text-3xl font-bold text-white mb-4">Loans</h1>
                    <p className="text-slate-400">Loan comparison coming soon...</p>
                  </div>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/settings"
              element={
                <ProtectedRoute requireOnboarding>
                  <div className="min-h-screen bg-navy-dark p-8">
                    <h1 className="text-3xl font-bold text-white mb-4">Settings</h1>
                    <p className="text-slate-400">Settings page coming soon...</p>
                  </div>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/history"
              element={
                <ProtectedRoute requireOnboarding>
                  <div className="min-h-screen bg-navy-dark p-8">
                    <h1 className="text-3xl font-bold text-white mb-4">Scan History</h1>
                    <p className="text-slate-400">Scan history coming soon...</p>
                  </div>
                </ProtectedRoute>
              }
            />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
