import { useState } from 'react';

interface NavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const navItems = [
  { id: 'hero', label: 'Home' },
  { id: 'console', label: 'Live Console' },
  { id: 'how', label: 'How It Works' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'impact', label: 'Impact' },
  { id: 'project', label: 'Project' },
];

export default function Navbar({ activeSection, setActiveSection }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl"
      style={{ backgroundColor: 'rgba(20, 19, 43, 0.85)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Wordmark */}
          <button
            onClick={() => setActiveSection('hero')}
            className="flex items-center gap-2.5 group"
          >
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-bright))' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14132B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="font-display font-bold text-base tracking-tight" style={{ color: 'var(--gold)' }}>
              UPI Rakshak
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className="px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150"
                style={{
                  color: activeSection === item.id ? 'var(--gold)' : 'var(--muted)',
                  backgroundColor: activeSection === item.id ? 'rgba(232, 163, 61, 0.08)' : 'transparent',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2"
            style={{ color: 'var(--muted)' }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobileOpen ? (
                <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
              ) : (
                <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ backgroundColor: 'var(--ink-1)', borderBottom: '1px solid var(--border)' }}>
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id); setMobileOpen(false); }}
                className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium"
                style={{
                  color: activeSection === item.id ? 'var(--gold)' : 'var(--muted)',
                  backgroundColor: activeSection === item.id ? 'rgba(232, 163, 61, 0.08)' : 'transparent',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
