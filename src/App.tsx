import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Console from './components/Console';
import HowItWorks from './components/HowItWorks';
import Architecture from './components/Architecture';
import Impact from './components/Impact';
import ProjectOverview from './components/ProjectOverview';
import Footer from './components/Footer';
import DemoAttackButton from './components/DemoAttackButton';
import VoiceQuery from './components/VoiceQuery';
import CashFlowDashboard from './components/CashFlowDashboard';
import { analyzeMessage, runRuleTests, type ThreatAnalysis } from './lib/rulesEngine';
import { speakWarning } from './lib/voice';

export default function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [voiceResult, setVoiceResult] = useState<ThreatAnalysis | null>(null);

  // Run rule tests on mount
  useEffect(() => {
    runRuleTests();
  }, []);

  const handleVoiceQuery = (transcript: string) => {
    const analysis = analyzeMessage('', transcript);
    setVoiceResult(analysis);
    speakWarning(analysis.suggestedAction);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--ink)', color: 'var(--parchment)' }}>
      <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {activeSection === 'hero' && (
              <>
                <Hero onExplore={() => setActiveSection('console')} />
                
                {/* Demo controls section */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                  {/* Hackathon Demo Controls */}
                  <DemoAttackButton />

                  {/* Voice Query */}
                  <div className="mb-6">
                    <VoiceQuery onQuery={handleVoiceQuery} />
                  </div>

                  {/* Voice query result */}
                  {voiceResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-[14px] p-5 mb-6"
                      style={{ backgroundColor: 'var(--ink-1)', border: '1px solid var(--border)' }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-display font-bold uppercase tracking-wider" style={{ color: 'var(--gold)' }}>
                          Analysis Result
                        </span>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: voiceResult.level === 'HIGH' ? 'rgba(225, 85, 74, 0.15)' :
                                           voiceResult.level === 'MEDIUM' ? 'rgba(232, 163, 61, 0.15)' :
                                           'rgba(63, 167, 150, 0.15)',
                            color: voiceResult.level === 'HIGH' ? 'var(--risk-high)' :
                                   voiceResult.level === 'MEDIUM' ? 'var(--risk-med)' :
                                   'var(--safe)',
                          }}
                        >
                          {voiceResult.level}
                        </span>
                      </div>
                      <ul className="space-y-1.5 mb-3">
                        {voiceResult.reasons.map((reason, i) => (
                          <li key={i} className="text-xs leading-relaxed flex items-start gap-2" style={{ color: 'var(--muted)' }}>
                            <span className="flex-shrink-0 mt-0.5">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs font-medium mb-1" style={{ color: 'var(--parchment)' }}>
                        {voiceResult.suggestedAction}
                      </p>
                      {voiceResult.officialRoute && (
                        <p className="text-xs" style={{ color: 'var(--safe)' }}>
                          ✓ {voiceResult.officialRoute}
                        </p>
                      )}
                    </motion.div>
                  )}

                  {/* Cash Flow Dashboard */}
                  <CashFlowDashboard />
                </section>
              </>
            )}
            {activeSection === 'console' && <Console />}
            {activeSection === 'how' && <HowItWorks />}
            {activeSection === 'architecture' && <Architecture />}
            {activeSection === 'impact' && <Impact />}
            {activeSection === 'project' && <ProjectOverview />}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer setActiveSection={setActiveSection} />
    </div>
  );
}
