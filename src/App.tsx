import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hero from './components/Hero';
import AgentDemo from './components/AgentDemo';
import Architecture from './components/Architecture';
import Impact from './components/Impact';
import Navbar from './components/Navbar';

export default function App() {
  const [activeSection, setActiveSection] = useState('hero');

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeSection === 'hero' && <Hero onExplore={() => setActiveSection('demo')} />}
            {activeSection === 'demo' && <AgentDemo />}
            {activeSection === 'architecture' && <Architecture />}
            {activeSection === 'impact' && <Impact />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
