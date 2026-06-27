'use client';
import React, { useRef } from 'react';
import { useAppStore } from '../store';
import { Download, Upload, CheckCircle, AlertCircle, Play, Pause, X } from 'lucide-react';
import { Device } from '../types';

interface TransferManagerProps {
  sendFile: (device: Device, file: File) => void;
  targetDevice: Device | null;
}

export default function TransferManager({ sendFile, targetDevice }: TransferManagerProps) {
  const { transfers, selfDevice } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSec: number) => {
    return `${formatSize(bytesPerSec)}/s`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && targetDevice) {
      Array.from(e.target.files).forEach((file) => {
        sendFile(targetDevice, file);
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && targetDevice) {
      Array.from(e.dataTransfer.files).forEach((file) => {
        sendFile(targetDevice, file);
      });
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-md">
      {/* Top Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50 px-6 py-4">
        <h3 className="font-semibold text-white">File Transfer Manager</h3>
        <p className="text-xs text-zinc-400">Share files and folders directly via WebRTC DataChannels</p>
      </div>

      {/* Drag & Drop Zone */}
      {targetDevice ? (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="m-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-950/20 p-8 text-center hover:bg-zinc-950/40 transition-all cursor-pointer group"
        >
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-500 group-hover:scale-110 transition-all">
            <Upload className="h-6 w-6" />
          </div>
          <h4 className="mt-4 font-semibold text-zinc-300">
            Drag & drop files to send to <span className="text-indigo-400">{targetDevice.username}</span>
          </h4>
          <p className="mt-1 text-xs text-zinc-500">Or click to select files from device storage</p>
        </div>
      ) : (
        <div className="m-6 rounded-2xl border border-zinc-800 bg-zinc-950/20 p-8 text-center">
          <p className="text-sm text-zinc-500">Select an online device from the list to start sharing files</p>
        </div>
      )}

      {/* Transfer History List */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">Transfers</h4>
        
        {transfers.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-center">
            <p className="text-sm text-zinc-500">No recent transfers</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transfers.map((tx) => {
              const isOutgoing = tx.sender_device.device_id === selfDevice?.device_id;
              
              return (
                <div
                  key={tx.transfer_id}
                  className="rounded-2xl border border-zinc-800/80 bg-zinc-950/20 p-4 transition-all hover:bg-zinc-950/40"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl ${
                        tx.status === 'completed'
                          ? 'bg-green-600/10 text-green-500'
                          : tx.status === 'failed'
                          ? 'bg-red-600/10 text-red-500'
                          : 'bg-indigo-600/10 text-indigo-500'
                      }`}>
                        {isOutgoing ? <Upload className="h-5 w-5" /> : <Download className="h-5 w-5" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-zinc-200 text-sm max-w-[200px] truncate">{tx.file_name}</h4>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {formatSize(tx.file_size)} • {isOutgoing ? 'To' : 'From'} {isOutgoing ? tx.receiver_device.username : tx.sender_device.username}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        tx.status === 'completed'
                          ? 'bg-green-600/10 text-green-400'
                          : tx.status === 'transferring'
                          ? 'bg-indigo-600/10 text-indigo-400'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {tx.status}
                      </span>
                      {tx.status === 'transferring' && tx.eta !== null && (
                        <p className="text-[10px] text-zinc-500 mt-1">ETA: {tx.eta}s</p>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar & Details */}
                  <div className="mt-3">
                    <div className="relative h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          tx.status === 'completed'
                            ? 'bg-green-600'
                            : tx.status === 'failed'
                            ? 'bg-red-600'
                            : 'bg-indigo-600'
                        }`}
                        style={{ width: `${tx.progress}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between mt-2 text-[10px] text-zinc-500">
                      <span>{Math.round(tx.progress)}%</span>
                      {tx.status === 'transferring' && (
                        <span>{formatSpeed(tx.speed)}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
