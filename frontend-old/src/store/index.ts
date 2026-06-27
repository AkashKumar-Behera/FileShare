import { create } from 'zustand';
import { Device, Chat, Message, Transfer, CallSession, DeviceSettings } from '../types';

export interface CallState {
  session_id: string;
  remoteDevice: Device;
  call_type: 'voice' | 'video' | 'screen';
  isOutgoing: boolean;
  status: 'ringing' | 'connected' | 'disconnected' | 'rejected' | 'missed';
  localStream?: MediaStream;
  remoteStream?: MediaStream;
  db_id?: number;
}

interface AppState {
  selfDevice: Device | null;
  onlineDevices: Device[];
  chats: Chat[];
  activeChat: Chat | null;
  messages: { [chatId: number]: Message[] };
  activeCall: CallState | null;
  transfers: Transfer[];
  settings: DeviceSettings;
  socketConnected: boolean;
  
  setSelfDevice: (device: Device | null) => void;
  setOnlineDevices: (devices: Device[]) => void;
  setChats: (chats: Chat[]) => void;
  setActiveChat: (chat: Chat | null) => void;
  setMessages: (chatId: number, messages: Message[]) => void;
  addMessage: (chatId: number, message: Message) => void;
  setCall: (call: CallState | null) => void;
  updateCallStatus: (status: CallState['status']) => void;
  setLocalStream: (stream: MediaStream) => void;
  setRemoteStream: (stream: MediaStream) => void;
  addTransfer: (transfer: Transfer) => void;
  updateTransferProgress: (transferId: string, progress: number, status: Transfer['status'], speed: number, eta: number | null) => void;
  updateSettings: (settings: Partial<DeviceSettings>) => void;
  setSocketConnected: (connected: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selfDevice: null,
  onlineDevices: [],
  chats: [],
  activeChat: null,
  messages: {},
  activeCall: null,
  transfers: [],
  settings: {
    theme: 'dark',
    language: 'en',
    downloads_folder: 'Downloads',
    auto_accept: false,
    bandwidth_limit: null,
    notifications_enabled: true,
    privacy_mode: 'public',
  },
  socketConnected: false,

  setSelfDevice: (device) => set({ selfDevice: device }),
  setOnlineDevices: (devices) => set({ onlineDevices: devices }),
  setChats: (chats) => set({ chats }),
  setActiveChat: (chat) => set({ activeChat: chat }),
  setMessages: (chatId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [chatId]: messages },
    })),
  addMessage: (chatId, message) =>
    set((state) => {
      const chatMessages = state.messages[chatId] || [];
      // Avoid duplication
      if (chatMessages.some((m) => m.id === message.id)) return state;
      return {
        messages: { ...state.messages, [chatId]: [...chatMessages, message] },
      };
    }),
  setCall: (call) => set({ activeCall: call }),
  updateCallStatus: (status) =>
    set((state) => ({
      activeCall: state.activeCall ? { ...state.activeCall, status } : null,
    })),
  setLocalStream: (stream) =>
    set((state) => ({
      activeCall: state.activeCall ? { ...state.activeCall, localStream: stream } : null,
    })),
  setRemoteStream: (stream) =>
    set((state) => ({
      activeCall: state.activeCall ? { ...state.activeCall, remoteStream: stream } : null,
    })),
  addTransfer: (transfer) =>
    set((state) => ({
      transfers: [transfer, ...state.transfers.filter((t) => t.transfer_id !== transfer.transfer_id)],
    })),
  updateTransferProgress: (transferId, progress, status, speed, eta) =>
    set((state) => ({
      transfers: state.transfers.map((t) =>
        t.transfer_id === transferId
          ? { ...t, progress, status, speed, eta }
          : t
      ),
    })),
  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),
  setSocketConnected: (connected) => set({ socketConnected: connected }),
}));
