import { useEffect, useState } from 'react';
import Rakshak, { isNativeAvailable } from '../lib/rakshakNative';
import { analyzeMessage, type ThreatAnalysis } from '../lib/rulesEngine';

export interface UseRakshakListenerResult {
  lastAnalysis: ThreatAnalysis | null;
  isListening: boolean;
  permissionGranted: boolean;
  requestPermissions: () => Promise<void>;
  analysisHistory: Array<{ title: string; text: string; analysis: ThreatAnalysis; timestamp: number }>;
}

export function useRakshakListener(): UseRakshakListenerResult {
  const [lastAnalysis, setLastAnalysis] = useState<ThreatAnalysis | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<
    Array<{ title: string; text: string; analysis: ThreatAnalysis; timestamp: number }>
  >([]);

  useEffect(() => {
    if (!isNativeAvailable()) {
      return;
    }

    let cleanup: (() => void) | undefined;

    const setup = async () => {
      // Check permissions
      const [notifAccess, overlayAccess] = await Promise.all([
        Rakshak.isNotificationAccessGranted(),
        Rakshak.isOverlayGranted(),
      ]);

      const granted = notifAccess.granted && overlayAccess.granted;
      setPermissionGranted(granted);

      if (granted) {
        // Start listening
        await Rakshak.startListening();
        setIsListening(true);

        // Listen for notifications
        const listener = await Rakshak.addListener('onNotification', (data) => {
          const { title, text } = data;
          const analysis = analyzeMessage(title, text);

          setLastAnalysis(analysis);
          setAnalysisHistory((prev) => [
            { title, text, analysis, timestamp: Date.now() },
            ...prev.slice(0, 9), // Keep last 10
          ]);

          // Show overlay if HIGH or MEDIUM
          if (analysis.level === 'HIGH' || analysis.level === 'MEDIUM') {
            Rakshak.showOverlay({
              message: analysis.reasons[0]?.en || text,
              level: analysis.level,
              officialRoute: analysis.officialRoute?.en,
            });
          }
        });

        cleanup = () => {
          listener.remove();
          Rakshak.stopListening();
        };
      }
    };

    setup();

    return () => {
      cleanup?.();
    };
  }, []);

  const requestPermissions = async () => {
    if (!isNativeAvailable()) return;

    await Rakshak.requestNotificationAccess();
    await Rakshak.requestOverlayPermission();

    // Re-check permissions after user grants them
    setTimeout(async () => {
      const [notifAccess, overlayAccess] = await Promise.all([
        Rakshak.isNotificationAccessGranted(),
        Rakshak.isOverlayGranted(),
      ]);
      setPermissionGranted(notifAccess.granted && overlayAccess.granted);
    }, 1000);
  };

  return {
    lastAnalysis,
    isListening,
    permissionGranted,
    requestPermissions,
    analysisHistory,
  };
}
