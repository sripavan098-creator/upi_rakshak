import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserPreferences } from '../../auth/hooks';
import { OnboardingLayout } from './OnboardingLayout';

export function Step2Permissions() {
  const navigate = useNavigate();
  const { updatePreferences } = useUserPreferences();
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [overlayEnabled, setOverlayEnabled] = useState(true);
  const [notificationMonitoring, setNotificationMonitoring] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await updatePreferences({
      voice_enabled: voiceEnabled,
      haptics_enabled: hapticsEnabled,
      overlay_enabled: overlayEnabled,
      notification_monitoring: notificationMonitoring,
    });

    navigate('/onboarding/step-3');
  };

  const permissions = [
    {
      id: 'notifications',
      icon: '🔔',
      title: 'Notification Access',
      description: 'Read WhatsApp/SMS messages to detect fraud in real-time',
      checked: notificationMonitoring,
      onChange: setNotificationMonitoring,
    },
    {
      id: 'overlay',
      icon: '🛡️',
      title: 'Overlay Permission',
      description: 'Show warning banners over other apps when fraud is detected',
      checked: overlayEnabled,
      onChange: setOverlayEnabled,
    },
    {
      id: 'voice',
      icon: '🔊',
      title: 'Voice Alerts',
      description: 'Speak warnings aloud in your preferred language',
      checked: voiceEnabled,
      onChange: setVoiceEnabled,
    },
    {
      id: 'haptics',
      icon: '📳',
      title: 'Haptic Feedback',
      description: 'Vibrate on threat detection for immediate awareness',
      checked: hapticsEnabled,
      onChange: setHapticsEnabled,
    },
  ];

  return (
    <OnboardingLayout currentStep={2} totalSteps={3}>
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-white mb-2">Configure your protection</h1>
        <p className="text-slate-400 mb-8">Choose how Rakshak alerts you to threats</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {permissions.map((perm) => (
            <label
              key={perm.id}
              className="flex items-start gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors"
            >
              <input
                type="checkbox"
                checked={perm.checked}
                onChange={(e) => perm.onChange(e.target.checked)}
                className="mt-1 w-5 h-5 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{perm.icon}</span>
                  <h3 className="font-semibold text-white">{perm.title}</h3>
                </div>
                <p className="text-sm text-slate-400">{perm.description}</p>
              </div>
            </label>
          ))}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </OnboardingLayout>
  );
}
