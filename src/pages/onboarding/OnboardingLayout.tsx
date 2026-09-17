import { ReactNode } from 'react';

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
}

export function OnboardingLayout({ children, currentStep, totalSteps }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-navy-dark to-navy">
      {/* Progress bar */}
      <div className="w-full bg-slate-800">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-slate-400">
              {Math.round((currentStep / totalSteps) * 100)}% complete
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}
