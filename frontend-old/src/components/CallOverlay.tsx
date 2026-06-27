'use client';
import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Maximize } from 'lucide-react';

interface CallOverlayProps {
  rejectCall: () => void;
  acceptCall: (offerPayload?: any) => void;
}

export default function CallOverlay({ rejectCall, acceptCall }: CallOverlayProps) {
  const { activeCall, settings } = useAppStore();
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (activeCall?.localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = activeCall.localStream;
    }
  }, [activeCall?.localStream]);

  useEffect(() => {
    if (activeCall?.remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = activeCall.remoteStream;
    }
  }, [activeCall?.remoteStream]);

  if (!activeCall) return null;

  const isVideo = activeCall.call_type === 'video' || activeCall.call_type === 'screen';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-md">
      <div className="relative flex h-full max-h-[600px] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl">
        
        {/* Calling Header Info */}
        <div className="absolute left-6 top-6 z-10 flex items-center gap-3 rounded-2xl bg-zinc-950/60 px-4 py-3 backdrop-blur-md">
          <span className="text-3xl">{activeCall.remoteDevice.avatar}</span>
          <div>
            <h4 className="text-sm font-semibold text-white">{activeCall.remoteDevice.username}</h4>
            <p className="text-xs text-zinc-400">
              {activeCall.status === 'ringing'
                ? activeCall.isOutgoing
                  ? 'Calling...'
                  : 'Incoming Call...'
                : 'In Call'}
            </p>
          </div>
        </div>

        {/* Video Screens */}
        <div className="flex flex-1 items-center justify-center bg-zinc-950">
          {isVideo ? (
            <div className="relative h-full w-full">
              {/* Remote Video */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="h-full w-full object-cover"
              />

              {/* Local PiP Video */}
              <div className="absolute bottom-6 right-6 h-36 w-48 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-lg">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-indigo-600/10 text-6xl animate-pulse">
                {activeCall.remoteDevice.avatar}
              </div>
              <h3 className="text-xl font-bold text-white">{activeCall.remoteDevice.username}</h3>
              <p className="text-sm text-zinc-400">Voice call active</p>
            </div>
          )}
        </div>

        {/* Call Controls */}
        <div className="flex items-center justify-center gap-6 bg-zinc-950 py-6 border-t border-zinc-900">
          {activeCall.status === 'ringing' && !activeCall.isOutgoing ? (
            <>
              <button
                onClick={() => acceptCall()}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/20 transition-all hover:scale-105"
              >
                <Phone className="h-6 w-6" />
              </button>
              <button
                onClick={rejectCall}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20 transition-all hover:scale-105"
              >
                <PhoneOff className="h-6 w-6" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={rejectCall}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20 transition-all hover:scale-105"
              >
                <PhoneOff className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
