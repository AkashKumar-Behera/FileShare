'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { useSocket } from '../hooks/useSocket';
import { apiService } from '../services/api';
import { Send, Smile, Paperclip, Phone, Video } from 'lucide-react';
import { Device } from '../types';

interface ChatPanelProps {
  remoteDevice: Device;
  startCall: (device: Device, type: 'voice' | 'video') => void;
}

export default function ChatPanel({ remoteDevice, startCall }: ChatPanelProps) {
  const { selfDevice, messages, addMessage, setMessages } = useAppStore();
  const { send } = useSocket();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [remoteIsTyping, setRemoteIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  
  // Find or create direct chat logic
  const [activeChatId, setActiveChatId] = useState<number | null>(null);

  useEffect(() => {
    const loadChat = async () => {
      if (!selfDevice) return;
      try {
        const directChat = await apiService.getOrCreateDirectChat(selfDevice.device_id, remoteDevice.device_id);
        setActiveChatId(directChat.id);
        const msgs = await apiService.fetchMessages(directChat.id);
        setMessages(directChat.id, msgs);
      } catch (err) {
        console.error('Failed to load or create chat history', err);
      }
    };
    loadChat();
  }, [remoteDevice, selfDevice]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChatId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selfDevice) return;

    send({
      type: 'chat_message',
      target_id: remoteDevice.device_id,
      chat_id: activeChatId,
      text: inputText,
    });

    setInputText('');
    sendTyping(false);
  };

  const sendTyping = (typing: boolean) => {
    if (typing === isTyping) return;
    setIsTyping(typing);
    send({
      type: 'typing',
      target_id: remoteDevice.device_id,
      is_typing: typing,
    });
  };

  const currentMessages = activeChatId ? (messages[activeChatId] || []) : [];

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-md">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{remoteDevice.avatar}</span>
          <div>
            <h3 className="font-semibold text-white">{remoteDevice.username}</h3>
            <p className="text-xs text-zinc-400">
              {remoteDevice.is_online ? 'Online' : 'Offline'} • {remoteDevice.ip_address}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => startCall(remoteDevice, 'voice')}
            disabled={!remoteDevice.is_online}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all disabled:opacity-30"
          >
            <Phone className="h-5 w-5" />
          </button>
          <button
            onClick={() => startCall(remoteDevice, 'video')}
            disabled={!remoteDevice.is_online}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all disabled:opacity-30"
          >
            <Video className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {currentMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="text-4xl opacity-50">👋</span>
            <h4 className="mt-2 font-semibold text-zinc-400">Start a conversation</h4>
            <p className="text-xs text-zinc-500">Messages are sent directly over LAN</p>
          </div>
        ) : (
          currentMessages.map((msg) => {
            const isSelf = msg.sender_device_id === selfDevice?.device_id;
            return (
              <div
                key={msg.id}
                className={`flex w-full ${isSelf ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm shadow-md ${
                    isSelf
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-zinc-800 text-zinc-100 rounded-tl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="mt-1 block text-[10px] text-zinc-400 text-right opacity-80">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSend} className="border-t border-zinc-800 bg-zinc-900/50 p-4">
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              sendTyping(e.target.value.length > 0);
            }}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
