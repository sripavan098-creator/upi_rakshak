import { registerPlugin } from '@capacitor/core';

export interface RakshakNativePlugin {
  startListening(): Promise<{ status: string }>;
  stopListening(): Promise<void>;
  isNotificationAccessGranted(): Promise<{ granted: boolean }>;
  requestNotificationAccess(): Promise<void>;
  requestOverlayPermission(): Promise<void>;
  isOverlayGranted(): Promise<{ granted: boolean }>;
  showOverlay(options: { message: string; level: string; officialRoute?: string }): Promise<void>;
  hideOverlay(): Promise<void>;
  addListener(
    eventName: 'onNotification',
    listenerFunc: (data: { title: string; text: string }) => void
  ): Promise<any>;
}

const Rakshak = registerPlugin<RakshakNativePlugin>('Rakshak');

export function isNativeAvailable(): boolean {
  return (window as any).Capacitor?.isNativePlatform?.() ?? false;
}

export default Rakshak;
