import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { speakWarning, stopSpeaking } from '../lib/voice';

interface ScamOverlayProps {
  visible: boolean;
  message: string;
  variant?: 'whatsapp' | 'rakshak';
  onTap?: () => void;
  onDismiss?: () => void;
}

/**
 * Fixed-position notification overlay mimicking Android system alert.
 * Two variants: 'whatsapp' (fake incoming notification) and 'rakshak' (red warning).
 */
export default function ScamOverlay({ 
  visible, 
  message, 
  variant = 'rakshak',
  onTap, 
  onDismiss 
}: ScamOverlayProps) {
  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (visible && variant === 'whatsapp') {
      const timer = setTimeout(() => {
        onDismiss?.();
      }, 1500);
      return () => clearTimeout(timer);
    }
    if (visible && variant === 'rakshak') {
      speakWarning('Rakshak Alert! Yeh message fraud ho sakta hai. Savdhan rahein.');
      const timer = setTimeout(() => {
        stopSpeaking();
        onDismiss?.();
      }, 5000);
      return () => {
        clearTimeout(timer);
        stopSpeaking();
      };
    }
  }, [visible, variant, onDismiss]);

  const truncated = message.length > 80 ? message.slice(0, 77) + '…' : message;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={onTap}
          className="fixed top-0 left-0 right-0 z-[9999] cursor-pointer"
          role="alert"
          aria-live="assertive"
        >
          {variant === 'whatsapp' ? (
            // Fake WhatsApp notification
            <div
              className="mx-auto max-w-md mt-2 rounded-2xl overflow-hidden shadow-2xl"
              style={{
                background: 'linear-gradient(180deg, #075E54 0%, #128C7E 100%)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              }}
            >
              <div className="px-4 py-2 flex items-center gap-2" style={{ backgroundColor: '#075E54' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span className="text-white text-xs font-semibold">WhatsApp</span>
                <span className="text-white/60 text-xs ml-auto">now</span>
              </div>
              <div className="px-4 py-3" style={{ backgroundColor: '#128C7E' }}>
                <p className="text-white text-sm font-medium mb-1">Unknown sender</p>
                <p className="text-white/90 text-xs leading-relaxed">{truncated}</p>
              </div>
            </div>
          ) : (
            // Rakshak red warning overlay
            <motion.div
              animate={{
                boxShadow: [
                  '0 4px 20px rgba(225, 85, 74, 0.3)',
                  '0 4px 30px rgba(225, 85, 74, 0.6)',
                  '0 4px 20px rgba(225, 85, 74, 0.3)',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="relative"
              style={{
                background: 'linear-gradient(135deg, #E1554A 0%, #B91C1C 100%)',
              }}
            >
              {/* Dismiss button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  stopSpeaking();
                  onDismiss?.();
                }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                aria-label="Dismiss"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              <div className="px-4 py-3 flex items-start gap-3">
                {/* Warning icon */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="flex-shrink-0"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </motion.div>

                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm mb-0.5">
                    ⚠️ Rakshak Alert: Fraud ho sakta hai!
                  </p>
                  <p className="text-white/90 text-xs leading-relaxed">
                    {truncated}
                  </p>
                  <p className="text-white/70 text-[10px] mt-1">
                    Tap to see full analysis
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
