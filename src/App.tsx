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
import { onRakshakNativeEvent, type RakshakNativeEvent } from './lib/nativeBridge';
import { useRakshakListener } from './hooks/useRakshakListener';
import { isNativeAvailable } from './lib/rakshakNative';

export default function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [voiceResult, setVoiceResult] = useState<ThreatAnalysis | null>(null);
  const [nativeEvent, setNativeEvent] = useState<RakshakNativeEvent | null>(null);

  // Use the native listener hook
  const { lastAnalysis, isListening, permissionGranted, requestPermissions } = useRakshakListener();

  // Run rule tests on mount
  useEffect(() => {
    runRuleTests();
  }, []);

  // Listen for native Android events (legacy bridge)
  useEffect(() => {
    const unsubscribe = onRakshakNativeEvent((event) => {
      setNativeEvent(event);
      if (event.critical) {
        speakWarning('Rakshak Alert! Fraud detected. Do not pay.');
      }
    });
    return unsubscribe;
  }, []);

  const handleVoiceQuery = (transcript: string) => {
    const analysis = analyzeMessage('', transcript);
    setVoiceResult(analysis);
    speakWarning(analysis.suggestedAction);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--ink)', color: 'var(--parchment)' }}>
      <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />
      
      {/* Native permission banner */}
      {isNativeAvailable() && (
        <div
          className="px-4 py-3 text-sm"
          style={{
            backgroundColor: !permissionGranted ? 'rgba(232, 163, 61, 0.15)' : 'rgba(63, 167, 150, 0.15)',
            borderBottom: `1px solid ${!permissionGranted ? 'var(--gold)' : 'var(--safe)'}`,
            color: !permissionGranted ? 'var(--gold)' : 'var(--safe)',
          }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <span>
              {!permissionGranted
                ? '⚠️ Rakshak needs permission to read notifications.'
                : isListening
                ? '🛡️ Rakshak is protecting you in real-time.'
                : 'ℹ️ Rakshak is ready.'}
            </span>
            {!permissionGranted && (
              <button
                onClick={requestPermissions}
                className="px-3 py-1 rounded text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--gold)',
                  color: 'var(--ink)',
                }}
              >
                Grant Permissions
              </button>
            )}
          </div>
        </div>
      )}

      {/* Browser mode banner */}
      {!isNativeAvailable() && (
        <div
          className="px-4 py-2 text-xs text-center"
          style={{
            backgroundColor: 'rgba(124, 120, 163, 0.1)',
            borderBottom: '1px solid var(--border)',
            color: 'var(--muted-2)',
          }}
        >
          ℹ️ Running in browser. Open the Android app for full protection.
        </div>
      )}

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

                  {/* Native Event Detection */}
                  {nativeEvent && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-[14px] p-5 mb-6"
                      style={{
                        backgroundColor: nativeEvent.critical ? 'rgba(225, 85, 74, 0.08)' : 'var(--ink-1)',
                        border: `1px solid ${nativeEvent.critical ? 'rgba(225, 85, 74, 0.3)' : 'var(--border)'}`,
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-display font-bold uppercase tracking-wider" style={{ color: nativeEvent.critical ? 'var(--risk-high)' : 'var(--gold)' }}>
                            🚨 Native Threat Detected
                          </span>
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded"
                            style={{
                              backgroundColor: nativeEvent.critical ? 'rgba(225, 85, 74, 0.15)' : 'rgba(232, 163, 61, 0.15)',
                              color: nativeEvent.critical ? 'var(--risk-high)' : 'var(--risk-med)',
                            }}
                          >
                            Score: {nativeEvent.score}
                          </span>
                        </div>
                        <button
                          onClick={() => setNativeEvent(null)}
                          className="text-xs px-2 py-1 rounded"
                          style={{ backgroundColor: 'var(--ink-2)', color: 'var(--muted)' }}
                        >
                          Dismiss
                        </button>
                      </div>
                      <p className="text-xs mb-2" style={{ color: 'var(--muted-2)' }}>
                        Source: {nativeEvent.source} | {nativeEvent.title}
                      </p>
                      <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--parchment)' }}>
                        {nativeEvent.message}
                      </p>
                      <ul className="space-y-1">
                        {nativeEvent.reasons.map((reason, i) => (
                          <li key={i} className="text-xs flex items-start gap-2" style={{ color: 'var(--muted)' }}>
                            <span className="flex-shrink-0">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
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
