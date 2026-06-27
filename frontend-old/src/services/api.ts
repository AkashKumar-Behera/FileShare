import { Device, Chat, Message, Transfer, CallSession, DeviceSettings } from '../types';

const getBaseUrl = () => {
  return '/api';
};

export const apiService = {
  async registerDevice(data: {
    device_id: string;
    username: string;
    device_name: string;
    avatar: string;
    device_type: string;
  }): Promise<Device> {
    const res = await fetch(`${getBaseUrl()}/devices/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Registration failed');
    return res.json();
  },

  async fetchOnlineDevices(excludeId?: string): Promise<Device[]> {
    const url = excludeId
      ? `${getBaseUrl()}/devices/online_devices/?exclude_id=${excludeId}`
      : `${getBaseUrl()}/devices/online_devices/`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch devices');
    return res.json();
  },

  async fetchChats(deviceId: string): Promise<Chat[]> {
    const res = await fetch(`${getBaseUrl()}/chats/device_chats/?device_id=${deviceId}`);
    if (!res.ok) throw new Error('Failed to fetch chats');
    return res.json();
  },

  async fetchMessages(chatId: number): Promise<Message[]> {
    const res = await fetch(`${getBaseUrl()}/chats/${chatId}/messages/`);
    if (!res.ok) throw new Error('Failed to fetch messages');
    return res.json();
  },

  async createTransfer(data: {
    transfer_id: string;
    sender_id: string;
    receiver_id: string;
    file_name: string;
    file_size: number;
    file_type: string;
    status: string;
  }): Promise<Transfer> {
    const { sender_id, receiver_id, ...rest } = data;
    const res = await fetch(`${getBaseUrl()}/transfers/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...rest,
        sender_device_id: sender_id,
        receiver_device_id: receiver_id,
      }),
    });
    if (!res.ok) throw new Error('Failed to create transfer log');
    return res.json();
  },

  async updateTransfer(id: number, data: Partial<Transfer>): Promise<Transfer> {
    const res = await fetch(`${getBaseUrl()}/transfers/${id}/update_progress/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update transfer');
    return res.json();
  },

  async fetchSettings(deviceId: string): Promise<DeviceSettings> {
    const res = await fetch(`${getBaseUrl()}/settings/device_settings/?device_id=${deviceId}`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async updateSettings(deviceId: string, data: Partial<DeviceSettings>): Promise<DeviceSettings> {
    const res = await fetch(`${getBaseUrl()}/settings/device_settings/?device_id=${deviceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  async createCallSession(data: {
    session_id: string;
    caller_id: string;
    callee_id: string;
    call_type: string;
    status: string;
  }): Promise<CallSession> {
    const { caller_id, callee_id, ...rest } = data;
    const res = await fetch(`${getBaseUrl()}/calls/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...rest,
        caller_device_id: caller_id,
        callee_device_id: callee_id,
      }),
    });
    if (!res.ok) throw new Error('Failed to log call session');
    return res.json();
  },

  async updateCallSession(id: number, status: string): Promise<CallSession> {
    const res = await fetch(`${getBaseUrl()}/calls/${id}/update_status/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update call status');
    return res.json();
  },

  async getOrCreateDirectChat(senderId: string, receiverId: string): Promise<Chat> {
    const res = await fetch(`${getBaseUrl()}/chats/get_or_create_direct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender_id: senderId, receiver_id: receiverId }),
    });
    if (!res.ok) throw new Error('Failed to load or create direct chat');
    return res.json();
  }
};
