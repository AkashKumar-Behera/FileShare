'use client';
import React, { useState } from 'react';
import { useAppStore } from '../store';
import { apiService } from '../services/api';

const AVATARS = ['🦊', '🐱', '🐼', '🐨', '🐸', '🦁', '🦖', '🦈'];
const DEVICE_TYPES = ['desktop', 'mobile', 'tablet'] as const;

export default function DeviceRegistration() {
  const { setSelfDevice } = useAppStore();
  const [username, setUsername] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [avatar, setAvatar] = useState('🦊');
  const [deviceType, setDeviceType] = useState<'desktop' | 'mobile' | 'tablet'>('desktop');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-generate device name if blank
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      let detectedType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
      let name = 'Web Client';

      if (userAgent.includes('mobi')) {
        detectedType = 'mobile';
        name = 'Mobile Device';
      } else if (userAgent.includes('tablet') || userAgent.includes('ipad')) {
        detectedType = 'tablet';
        name = 'Tablet Device';
      } else if (userAgent.includes('macintosh')) {
        name = 'Macbook';
      } else if (userAgent.includes('windows')) {
        name = 'Windows PC';
      } else if (userAgent.includes('linux')) {
        name = 'Linux PC';
      }

      setDeviceType(detectedType);
      setDeviceName(name);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !deviceName.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    // Generate a persistent local device ID if none exists
    let device_id = localStorage.getItem('flashshare_device_id');
    if (!device_id) {
      device_id = 'dev_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      localStorage.setItem('flashshare_device_id', device_id);
    }

    try {
      const device = await apiService.registerDevice({
        device_id,
        username,
        device_name: deviceName,
        avatar,
        device_type: deviceType,
      });
      setSelfDevice(device);
    } catch (err) {
      setError('Connection failed. Make sure Django server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-2xl shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/10 text-4xl text-indigo-500 shadow-inner">
            ⚡
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">Welcome to FlashShare</h2>
          <p className="mt-1 text-sm text-zinc-400">Set up your device profile to connect with peers on the LAN</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-xl bg-red-950/40 border border-red-900/50 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">Choose Avatar</label>
            <div className="mt-2 grid grid-cols-8 gap-2">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setAvatar(av)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-all ${
                    avatar === av
                      ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-500/20'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. John Doe"
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="device-name" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Device Name
              </label>
              <input
                id="device-name"
                type="text"
                required
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="e.g. My laptop"
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 focus:outline-none disabled:opacity-50"
            >
              {loading ? 'Initializing...' : 'Get Started'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
