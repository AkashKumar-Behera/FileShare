'use client';
import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Device } from '../types';
import { useWebRTC } from '../hooks/useWebRTC';
import ChatPanel from './ChatPanel';
import TransferManager from './TransferManager';
import SettingsPanel from './SettingsPanel';
import CallOverlay from './CallOverlay';
import { Users, MessageSquare, ArrowLeftRight, Settings, Radio } from 'lucide-react';

export default function Dashboard() {
  const { selfDevice, onlineDevices, socketConnected } = useAppStore();
  const [activeTab, setActiveTab] = useState<'devices' | 'chat' | 'transfer' | 'settings'>('devices');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const { startCall, acceptCall, rejectCall, sendFile } = useWebRTC();

  const handleSelectDevice = (device: Device) => {
    setSelectedDevice(device);
    setActiveTab('chat');
  };

  const startFileShare = (device: Device) => {
    setSelectedDevice(device);
    setActiveTab('transfer');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      
      {/* Sidebar Navigation */}
      <div className="flex w-20 flex-col items-center border-r border-zinc-900 bg-zinc-950 py-8 gap-8">
        {/* App Logo */}
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/10 text-2xl text-indigo-500 shadow-inner">
          ⚡
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-1 flex-col gap-4 justify-center">
          {[
            { id: 'devices', icon: Users, label: 'Devices' },
            { id: 'chat', icon: MessageSquare, label: 'Chat' },
            { id: 'transfer', icon: ArrowLeftRight, label: 'Share' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="absolute left-16 rounded-lg bg-zinc-900 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap shadow-md pointer-events-none">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Status Indicator */}
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
          socketConnected ? 'bg-green-600/10 text-green-500' : 'bg-red-600/10 text-red-500'
        }`}>
          <Radio className={`h-4 w-4 ${socketConnected ? 'animate-pulse' : ''}`} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden p-6 gap-6">
        
        {/* Device Explorer Sidebar */}
        <div className="flex w-80 flex-col overflow-hidden rounded-3xl border border-zinc-900 bg-zinc-900/10 backdrop-blur-md p-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
            <div>
              <h2 className="font-bold text-lg text-white">Nearby Devices</h2>
              <p className="text-xs text-zinc-500">Auto-discovered on LAN</p>
            </div>
            <span className="inline-flex h-6 items-center rounded-full bg-indigo-600/10 px-2.5 text-xs font-semibold text-indigo-400">
              {onlineDevices.length} online
            </span>
          </div>

          <div className="flex-1 overflow-y-auto mt-4 space-y-2">
            {onlineDevices.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center p-4">
                <span className="text-3xl opacity-40">📡</span>
                <h4 className="mt-3 font-semibold text-zinc-400 text-sm">Searching...</h4>
                <p className="mt-1 text-xs text-zinc-500">Make sure other devices have FlashShare open on the same Wi-Fi</p>
              </div>
            ) : (
              onlineDevices.map((device) => {
                const isSelected = selectedDevice?.device_id === device.device_id;
                return (
                  <div
                    key={device.device_id}
                    onClick={() => handleSelectDevice(device)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600/50 bg-indigo-600/5 shadow-md shadow-indigo-500/5'
                        : 'border-transparent bg-zinc-900/40 hover:bg-zinc-900/70 hover:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{device.avatar}</span>
                      <div>
                        <h4 className="font-semibold text-zinc-200 text-sm">{device.username}</h4>
                        <p className="text-xs text-zinc-500 mt-0.5">{device.device_name} • {device.ip_address}</p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startFileShare(device);
                      }}
                      className="rounded-lg bg-zinc-800/80 hover:bg-zinc-700 p-1.5 text-zinc-400 hover:text-white transition-all text-xs"
                    >
                      Share
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Dynamic Tab Pane */}
        <div className="flex flex-1 overflow-hidden">
          {activeTab === 'devices' && (
            <div className="flex flex-1 flex-col items-center justify-center text-center rounded-3xl border border-zinc-900 bg-zinc-900/10 backdrop-blur-md p-8">
              <span className="text-6xl">📡</span>
              <h2 className="mt-6 text-2xl font-bold tracking-tight text-white">Local Discovery Mode</h2>
              <p className="mt-2 text-sm text-zinc-400 max-w-md">
                FlashShare is actively broadcasting this device as <span className="text-indigo-400 font-semibold">{selfDevice?.device_name}</span>. Click on any nearby device in the sidebar to start a real-time chat, share WebRTC media calls, or send files.
              </p>
            </div>
          )}

          {activeTab === 'chat' && (
            selectedDevice ? (
              <ChatPanel remoteDevice={selectedDevice} startCall={startCall} />
            ) : (
              <div className="flex flex-1 items-center justify-center text-center rounded-3xl border border-zinc-900 bg-zinc-900/10 backdrop-blur-md">
                <p className="text-sm text-zinc-500">Select a device from the sidebar to chat</p>
              </div>
            )
          )}

          {activeTab === 'transfer' && (
            <TransferManager sendFile={sendFile} targetDevice={selectedDevice} />
          )}

          {activeTab === 'settings' && <SettingsPanel />}
        </div>
      </div>

      {/* Voice/Video Call Overlay */}
      <CallOverlay rejectCall={rejectCall} acceptCall={acceptCall} />
    </div>
  );
}
