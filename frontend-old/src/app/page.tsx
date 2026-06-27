'use client';
import React from 'react';
import { useAppStore } from '../store';
import DeviceRegistration from '../components/DeviceRegistration';
import Dashboard from '../components/Dashboard';
import { useSocket } from '../hooks/useSocket';

export default function Home() {
  const { selfDevice } = useAppStore();

  // Initialize Socket hook (it only connects when selfDevice is present)
  useSocket();

  if (!selfDevice) {
    return <DeviceRegistration />;
  }

  return <Dashboard />;
}
