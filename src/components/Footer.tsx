interface FooterProps {
  setActiveSection: (section: string) => void;
}

export default function Footer({ setActiveSection }: FooterProps) {
  return (
    <footer style={{ backgroundColor: 'var(--ink-1)', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-bright))' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#14132B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <span className="font-display font-bold text-sm" style={{ color: 'var(--gold)' }}>
                UPI Rakshak
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
              Your financial safety guardian. Built for the Agentic AI Hackathon — FinTech & Commerce domain.
            </p>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="font-display font-semibold text-xs mb-3" style={{ color: 'var(--parchment)' }}>
              Navigate
            </h4>
            <ul className="space-y-1.5">
              {[
                { id: 'hero', label: 'Home' },
                { id: 'console', label: 'Live Console' },
                { id: 'how', label: 'How It Works' },
                { id: 'architecture', label: 'Architecture' },
                { id: 'impact', label: 'Impact' },
                { id: 'project', label: 'Project Overview' },
              ].map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className="text-xs hover:underline"
                    style={{ color: 'var(--muted)' }}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Documentation */}
          <div>
            <h4 className="font-display font-semibold text-xs mb-3" style={{ color: 'var(--parchment)' }}>
              Documentation
            </h4>
            <ul className="space-y-1.5">
              {[
                'README.md',
                'BRIEF.md',
                'ARCHITECTURE.md',
                'DESIGN.md',
                'docs/RESEARCH_NOTES.md',
                'PROJECT_OVERVIEW.md',
              ].map((doc) => (
                <li key={doc}>
                  <span className="text-xs font-mono" style={{ color: 'var(--muted-2)' }}>
                    {doc}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-[10px]" style={{ color: 'var(--muted-2)' }}>
            Stage 1 hackathon proof-of-concept. No live user base, no measured outcomes — mechanisms stated as hypotheses to test.
          </p>
          <p className="text-[10px]" style={{ color: 'var(--muted-2)' }}>
            Built with React, TypeScript, Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}
