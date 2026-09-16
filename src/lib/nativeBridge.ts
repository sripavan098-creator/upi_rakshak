export type RakshakNativeEvent = {
  source: string;
  title: string;
  message: string;
  score: number;
  critical: boolean;
  reasons: string[];
  receivedAt: number;
};

type NativeEventHandler = (event: RakshakNativeEvent) => void;

export function onRakshakNativeEvent(handler: NativeEventHandler): () => void {
  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<RakshakNativeEvent>;
    if (customEvent.detail) {
      handler(customEvent.detail);
    }
  };

  window.addEventListener("rakshak:native", listener);

  return () => {
    window.removeEventListener("rakshak:native", listener);
  };
}

declare global {
  interface Window {
    RakshakNative?: {
      log: (message: string) => void;
      openOverlaySettings: () => void;
      openNotificationAccessSettings: () => void;
    };
  }
}

export function openOverlaySettings() {
  window.RakshakNative?.openOverlaySettings();
}

export function openNotificationAccessSettings() {
  window.RakshakNative?.openNotificationAccessSettings();
}

export function simulateScam() {
  const demoEvent: RakshakNativeEvent = {
    source: "com.whatsapp",
    title: "Unknown Number",
    message:
      "URGENT: Your UPI account will be blocked. Pay ₹499 to helpdesk@upi to verify KYC immediately.",
    score: 94,
    critical: true,
    reasons: [
      "Urgency language detected",
      "UPI ID present",
      "Money amount requested",
      "Payment trap phrase detected",
    ],
    receivedAt: Date.now(),
  };

  window.dispatchEvent(
    new CustomEvent("rakshak:native", {
      detail: demoEvent,
    })
  );
}
