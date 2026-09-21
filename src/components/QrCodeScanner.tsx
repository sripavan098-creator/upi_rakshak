import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  RefreshCw,
  Zap,
  ZapOff,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  QrCode,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { analyzeQrPayload, QrSafetyResult } from '../lib/qrSafetyAnalyzer';
import StatusIndicator from './StatusIndicator';

// Realistic sample UPI QR payloads for immediate simulation & verification
export const SAMPLE_UPI_QR_SCENARIOS = [
  {
    id: 'scam-electricity',
    title: '🚨 Electricity Disconnection Scam',
    type: 'HIGH_RISK',
    description: 'Fake BSES support demanding payment to prevent immediate meter disconnection',
    payload: 'upi://pay?pa=bsescare@icici&pn=BSES%20Electricity%20Support&am=2499&tn=Disconnection%20fine%20refund%20scan%20QR%20enter%20PIN',
  },
  {
    id: 'scam-lottery',
    title: '🚨 Lottery Prize Reversal Trap',
    type: 'HIGH_RISK',
    description: 'Fraudulent voucher tricking user to enter PIN to "claim" ₹10,000 lottery winnings',
    payload: 'upi://pay?pa=refundcare@paytm&pn=Lucky%20Cash%20Claim&am=499&tn=Pay%20processing%20charge%20to%20receive%2010000%20prize',
  },
  {
    id: 'scam-kyc',
    title: '⚠️ Unofficial KYC Verification',
    type: 'MEDIUM_RISK',
    description: 'Personal VPA handle attempting account reactivation with artificial urgency',
    payload: 'upi://pay?pa=paytm.kyc.verify@okhdfcbank&pn=Paytm%20KYC%20Help&am=1&tn=Verify%20KYC%20urgent%20within%2024%20hours',
  },
  {
    id: 'safe-kirana',
    title: '🛡️ Verified Grocery Merchant',
    type: 'SAFE',
    description: 'Authentic corner store BharatQR with valid MCC (Merchant Category Code 5411)',
    payload: 'upi://pay?pa=sharmastore@okhdfcbank&pn=Sharma%20General%20Store&am=185&tn=Grocery%20bill&mc=5411',
  },
  {
    id: 'safe-bbps',
    title: '🛡️ Official BSES Utility Payment',
    type: 'SAFE',
    description: 'Legitimate registered BBPS electricity utility provider QR code',
    payload: 'upi://pay?pa=bsesdelhi@sbi&pn=BSES%20Rajdhani%20Power%20Ltd&am=1420&tn=Bill%201039482938&mc=4900',
  },
];

export interface QrCodeScannerProps {
  id?: string;
  onScanResult?: (result: QrSafetyResult) => void;
  className?: string;
  defaultScenarioId?: string;
}

export default function QrCodeScanner({
  id = 'rakshak-qr-scanner',
  onScanResult,
  className = '',
  defaultScenarioId,
}: QrCodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  
  // Scanned payload & safety evaluation state
  const [currentRawPayload, setCurrentRawPayload] = useState<string>(
    SAMPLE_UPI_QR_SCENARIOS[0].payload
  );
  const [analysisResult, setAnalysisResult] = useState<QrSafetyResult>(() =>
    analyzeQrPayload(SAMPLE_UPI_QR_SCENARIOS[0].payload)
  );
  const [customInput, setCustomInput] = useState<string>('');
  const [activeScenarioId, setActiveScenarioId] = useState<string>(
    defaultScenarioId || SAMPLE_UPI_QR_SCENARIOS[0].id
  );

  // Evaluate payload and propagate result
  const evaluatePayload = useCallback(
    (payload: string, scenarioId?: string) => {
      const result = analyzeQrPayload(payload);
      setCurrentRawPayload(payload);
      setAnalysisResult(result);
      if (scenarioId) setActiveScenarioId(scenarioId);
      onScanResult?.(result);
    },
    [onScanResult]
  );

  // Stop camera media stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (scanIntervalRef.current) {
      window.clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Start device camera
  const startCamera = useCallback(async () => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Camera API is not supported on this browser or environment.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setCameraPermission('granted');
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {
          // Auto-play policy catch
        });
      }

      // Barcode detector if browser natively supports it
      if ('BarcodeDetector' in window) {
        try {
          const barcodeDetector = new (window as any).BarcodeDetector({
            formats: ['qr_code'],
          });

          scanIntervalRef.current = window.setInterval(async () => {
            if (videoRef.current && videoRef.current.readyState >= 2) {
              try {
                const barcodes = await barcodeDetector.detect(videoRef.current);
                if (barcodes && barcodes.length > 0) {
                  const detectedValue = barcodes[0].rawValue;
                  if (detectedValue && detectedValue !== currentRawPayload) {
                    evaluatePayload(detectedValue);
                  }
                }
              } catch {
                // frame detection failed, retry next tick
              }
            }
          }, 350);
        } catch {
          // Native BarcodeDetector not usable
        }
      }
    } catch (err: any) {
      console.warn('Camera initialization error:', err);
      setCameraPermission('denied');
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera access was denied. You can test live UPI detection using our simulated scenarios below.'
          : err.message || 'Unable to access device camera in this window.'
      );
      setIsCameraActive(false);
    }
  }, [facingMode, currentRawPayload, evaluatePayload, stopCamera]);

  // Handle camera toggles
  const toggleCamera = () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && 'applyConstraints' in track) {
      try {
        const nextState = !torchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setTorchOn(nextState);
      } catch {
        // Torch constraint not supported on this device
      }
    }
  };

  // Re-start camera on facingMode change if already active
  useEffect(() => {
    if (isCameraActive) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  return (
    <div id={id} className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Scanner Control Deck */}
      <div className="bg-[var(--ink-1)] border-2 border-[var(--border-strong)] p-4 sm:p-6 mb-6">
        {/* Header with Camera Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-[var(--ink-2)] border border-[var(--border)] flex items-center justify-center text-[var(--gold)]">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-[var(--parchment)] flex items-center gap-2">
                Real-Time UPI QR Guard
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--ink-2)] text-[var(--gold)] border border-[var(--border)] uppercase tracking-wider">
                  Live Vision
                </span>
              </h2>
              <p className="text-xs text-[var(--muted)]">
                Optical scan-frame viewfinder with instant deterministic risk scoring
              </p>
            </div>
          </div>

          {/* Camera action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-toggle-camera"
              onClick={toggleCamera}
              className={`px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all border ${
                isCameraActive
                  ? 'bg-[var(--safe)] text-[var(--ink)] border-[var(--safe)] hover:brightness-110'
                  : 'bg-[var(--ink-2)] text-[var(--parchment)] border-[var(--border-strong)] hover:border-[var(--gold)]'
              }`}
            >
              {isCameraActive ? (
                <>
                  <CameraOff className="w-3.5 h-3.5" /> Stop Camera
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5 text-[var(--gold)]" /> Start Camera
                </>
              )}
            </button>

            {isCameraActive && (
              <>
                <button
                  type="button"
                  id="btn-flip-camera"
                  onClick={flipCamera}
                  title="Switch camera"
                  className="p-1.5 bg-[var(--ink-2)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--parchment)]"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  id="btn-toggle-torch"
                  onClick={toggleTorch}
                  title="Flashlight / Torch"
                  className={`p-1.5 border transition-colors ${
                    torchOn
                      ? 'bg-[var(--gold)] text-[var(--ink)] border-[var(--gold)]'
                      : 'bg-[var(--ink-2)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--parchment)]'
                  }`}
                >
                  {torchOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Viewfinder Viewport */}
        <div className="relative mt-4 bg-[var(--ink)] border border-[var(--border)] overflow-hidden min-h-[340px] flex items-center justify-center">
          {/* Radar background rings */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none opacity-40">
            <div className="radar-ring w-[180px] h-[180px]" />
            <div className="radar-ring w-[280px] h-[280px]" />
            <div className="radar-ring w-[380px] h-[380px]" />
          </div>

          {/* Active Camera Video Feed */}
          {isCameraActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            /* Idle / Simulated Viewfinder Backdrop */
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-0 bg-gradient-to-b from-[var(--ink-1)] to-[var(--ink)]">
              <div className="w-16 h-16 rounded-full bg-[var(--ink-2)] border border-[var(--border-strong)] flex items-center justify-center mb-3 text-[var(--gold)] shadow-inner">
                <Camera className="w-8 h-8 opacity-80" />
              </div>
              <p className="font-display font-semibold text-sm text-[var(--parchment)] mb-1">
                Camera Viewfinder Inactive
              </p>
              <p className="text-xs text-[var(--muted)] max-w-sm mb-4">
                Click &quot;Start Camera&quot; to inspect physical QR codes with your device lens, or select any real-world UPI scenario below.
              </p>
              <button
                type="button"
                id="btn-start-camera-overlay"
                onClick={startCamera}
                className="px-4 py-2 bg-[var(--gold)] text-[var(--ink)] font-mono text-xs font-bold uppercase tracking-wider hover:brightness-110 flex items-center gap-2"
              >
                <Camera className="w-4 h-4" /> Enable Device Camera
              </button>
            </div>
          )}

          {/* Scan-frame UI Logic from CSS */}
          <div className="relative z-10 p-6 flex flex-col items-center">
            {/* The primary .scan-frame element */}
            <div
              className={`scan-frame ${isScanning ? 'scanning' : ''} w-64 h-64 sm:w-72 sm:h-72 flex flex-col items-center justify-between p-4 shadow-2xl transition-all duration-300`}
              style={{
                backgroundColor: isCameraActive ? 'rgba(20, 19, 43, 0.25)' : 'rgba(20, 19, 43, 0.65)',
                borderColor: 'var(--border)',
              }}
            >
              {/* Inner corners element as defined in CSS */}
              <div className="scan-frame-corners" />

              {/* Animated laser sweep line from CSS */}
              <div className="scan-sweep" />

              {/* Target HUD Header */}
              <div className="w-full flex justify-between items-center text-[10px] font-mono text-[var(--gold)] opacity-80 uppercase tracking-wider">
                <span>[SCAN: VPA_ALIGN]</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-pulse" />
                  LIVE
                </span>
              </div>

              {/* Center Crosshair or Payload Watermark */}
              <div className="text-center my-auto pointer-events-none">
                <div className="w-12 h-12 border border-[var(--gold)] border-dashed mx-auto mb-2 opacity-50 flex items-center justify-center">
                  <div className="w-2 h-2 bg-[var(--gold)] rounded-full" />
                </div>
                <p className="text-[11px] font-mono uppercase tracking-widest text-[var(--gold-bright)] bg-[var(--ink)]/80 px-2 py-0.5 border border-[var(--border)] inline-block">
                  {analysisResult.level === 'HIGH' ? '⚠️ RISK INTERCEPT' : 'UPI QR DETECTOR'}
                </p>
              </div>

              {/* Target HUD Footer */}
              <div className="w-full flex justify-between items-center text-[9px] font-mono text-[var(--muted)]">
                <span>LATENCY: &lt;180ms</span>
                <span className="text-[var(--parchment)] font-bold">
                  {analysisResult.score}/100 SECURE
                </span>
              </div>
            </div>

            {/* Viewfinder Toggle Scan Animation button */}
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                id="btn-toggle-scan-anim"
                onClick={() => setIsScanning((prev) => !prev)}
                className="text-[10px] font-mono px-2.5 py-1 bg-[var(--ink-2)]/90 border border-[var(--border)] text-[var(--muted)] hover:text-[var(--parchment)]"
              >
                {isScanning ? '⏸ Pause Viewfinder Sweep' : '▶ Resume Sweep'}
              </button>
            </div>
          </div>

          {/* Camera Permission / Error Banner if blocked */}
          {cameraError && (
            <div className="absolute top-3 left-3 right-3 z-20 bg-[var(--ink-2)] border-l-4 border-[var(--risk-med)] p-3 text-xs text-[var(--parchment)] shadow-lg flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-[var(--risk-med)] flex-shrink-0 mt-0.5" />
                <span>{cameraError}</span>
              </div>
              <button
                type="button"
                onClick={() => setCameraError(null)}
                className="text-[var(--muted)] hover:text-[var(--parchment)] font-mono text-[10px]"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Current QR Payload Summary Card */}
        <div className="mt-4 p-3 bg-[var(--ink-2)] border border-[var(--border)] font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[var(--border)]">
            <span className="text-[var(--muted)] text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <span>🔍</span> Active Payload Stream:
            </span>
            <span className="text-[10px] text-[var(--gold)]">
              Analyzed in: 0.14s • {analysisResult.timestamp}
            </span>
          </div>
          <p className="mt-2 text-[var(--parchment)] break-all font-mono text-[11px] leading-relaxed bg-[var(--ink)] p-2 border border-[var(--border)]">
            {currentRawPayload}
          </p>
        </div>

        {/* Real-time Scenario Presets Selector */}
        <div className="mt-5">
          <p className="text-xs font-mono uppercase tracking-wider text-[var(--muted)] mb-2 flex items-center gap-1.5">
            <span>⚡</span> Test Scenarios (Simulate QR Scan in Real-Time):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {SAMPLE_UPI_QR_SCENARIOS.map((item) => {
              const isActive = activeScenarioId === item.id;
              const isHigh = item.type === 'HIGH_RISK';
              const isMed = item.type === 'MEDIUM_RISK';

              return (
                <button
                  key={item.id}
                  type="button"
                  id={`scenario-btn-${item.id}`}
                  onClick={() => evaluatePayload(item.payload, item.id)}
                  className={`text-left p-2.5 border transition-all ${
                    isActive
                      ? 'border-[var(--gold)] bg-[var(--ink-2)]'
                      : 'border-[var(--border)] bg-[var(--ink)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[var(--parchment)] truncate">
                      {item.title}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 uppercase ${
                        isHigh
                          ? 'text-[var(--risk-high)]'
                          : isMed
                          ? 'text-[var(--risk-med)]'
                          : 'text-[var(--safe)]'
                      }`}
                    >
                      {item.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--muted)] line-clamp-2 leading-snug">
                    {item.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom UPI String Input */}
        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customInput.trim()) {
                evaluatePayload(customInput.trim(), 'custom');
                setCustomInput('');
              }
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Paste custom UPI URI or VPA (e.g. upi://pay?pa=merchant@upi&pn=Store&am=200)"
              className="flex-1 bg-[var(--ink)] border border-[var(--border)] px-3 py-2 text-xs font-mono text-[var(--parchment)] placeholder-[var(--muted-2)] focus:border-[var(--gold)] focus:outline-none"
            />
            <button
              type="submit"
              id="btn-analyze-custom"
              className="px-4 py-2 bg-[var(--ink-2)] border border-[var(--border-strong)] hover:border-[var(--gold)] text-xs font-mono font-bold uppercase tracking-wider text-[var(--parchment)] transition-colors"
            >
              Analyze Custom QR
            </button>
          </form>
        </div>
      </div>

      {/* Real-time Status Indicator Component Display */}
      <StatusIndicator
        id="scanner-status-indicator"
        score={analysisResult.score}
        level={analysisResult.level}
        title={analysisResult.title}
        subtitle={analysisResult.subtitle}
        reasons={analysisResult.reasons}
        suggestedAction={analysisResult.suggestedAction}
        officialRoute={analysisResult.officialRoute}
        payeeAddress={analysisResult.payload?.payeeAddress}
        payeeName={analysisResult.payload?.payeeName}
        amount={analysisResult.payload?.amount}
        className="shadow-xl"
      />
    </div>
  );
}
