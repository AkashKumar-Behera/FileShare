'use client';
import React from 'react';
import { useAppStore } from '../store';
import { apiService } from '../services/api';
import { Settings, Shield, Bell, Moon, Sliders } from 'lucide-react';

export default function SettingsPanel() {
  const { selfDevice, settings, updateSettings } = useAppStore();

  const handleToggleAutoAccept = async () => {
    if (!selfDevice) return;
    const newAutoAccept = !settings.auto_accept;
    updateSettings({ auto_accept: newAutoAccept });
    try {
      await apiService.updateSettings(selfDevice.device_id, { auto_accept: newAutoAccept });
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleNotifications = async () => {
    if (!selfDevice) return;
    const newNotifications = !settings.notifications_enabled;
    updateSettings({ notifications_enabled: newNotifications });
    try {
      await apiService.updateSettings(selfDevice.device_id, { notifications_enabled: newNotifications });
    } catch (err) {
      console.error(err);
    }
  };

  const handleThemeChange = async (theme: string) => {
    if (!selfDevice) return;
    updateSettings({ theme });
    try {
      await apiService.updateSettings(selfDevice.device_id, { theme });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-md">
      <div className="border-b border-zinc-800 bg-zinc-900/50 px-6 py-4">
        <h3 className="font-semibold text-white">Application Settings</h3>
        <p className="text-xs text-zinc-400">Configure your local client and preferences</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Profile Card */}
        {selfDevice && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/20 p-5 flex items-center gap-4">
            <span className="text-5xl">{selfDevice.avatar}</span>
            <div>
              <h4 className="font-bold text-white text-base">{selfDevice.device_name}</h4>
              <p className="text-xs text-zinc-400 mt-0.5">Username: {selfDevice.username}</p>
              <p className="text-[10px] text-zinc-500 font-mono mt-1">ID: {selfDevice.device_id}</p>
            </div>
          </div>
        )}

        {/* General Preferences */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5" /> General
          </h4>

          {/* Theme Selection */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/10">
            <div>
              <h5 className="font-semibold text-zinc-200 text-sm">Color Theme</h5>
              <p className="text-xs text-zinc-500 mt-0.5">Choose your preferred style</p>
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              {['light', 'dark', 'system'].map((t) => (
                <button
                  key={t}
                  onClick={() => handleThemeChange(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    settings.theme === t
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* LAN Transfer Settings */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" /> Security & Transfers
          </h4>

          {/* Auto Accept */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/10">
            <div>
              <h5 className="font-semibold text-zinc-200 text-sm">Auto Accept Calls</h5>
              <p className="text-xs text-zinc-500 mt-0.5">Directly answer calls without ringing dialogs</p>
            </div>
            <button
              onClick={handleToggleAutoAccept}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                settings.auto_accept ? 'bg-indigo-600' : 'bg-zinc-800'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.auto_accept ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5" /> Alerts & Notifications
          </h4>

          {/* Enable Notifications */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/10">
            <div>
              <h5 className="font-semibold text-zinc-200 text-sm">Desktop Notifications</h5>
              <p className="text-xs text-zinc-500 mt-0.5">Show notifications on file or call events</p>
            </div>
            <button
              onClick={handleToggleNotifications}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                settings.notifications_enabled ? 'bg-indigo-600' : 'bg-zinc-800'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.notifications_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
