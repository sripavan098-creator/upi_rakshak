import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Console from './components/Console';
import HowItWorks from './components/HowItWorks';
import Architecture from './components/Architecture';
import Impact from './components/Impact';

export default function App() {
  const [activeSection, setActiveSection] = useState('hero');

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
            {activeSection === 'hero' && <Hero onExplore={() => setActiveSection('console')} />}
            {activeSection === 'console' && <Console />}
            {activeSection === 'how' && <HowItWorks />}
            {activeSection === 'architecture' && <Architecture />}
            {activeSection === 'impact' && <Impact />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
