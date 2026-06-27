export interface Device {
  device_id: string;
  username: string;
  device_name: string;
  avatar: string;
  ip_address: string | null;
  device_type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  is_online: boolean;
  last_seen: string;
}

export interface Message {
  id: number;
  chat_id: number;
  sender_device_id: string;
  sender_name: string;
  sender_avatar: string;
  text: string;
  emoji?: string;
  reply_to?: number;
  is_read: boolean;
  created_at: string;
}

export interface Chat {
  id: number;
  is_group: boolean;
  name: string | null;
  participants: Device[];
  last_message: Message | null;
  created_at: string;
}

export interface Transfer {
  id?: number;
  transfer_id: string;
  sender_device: Device;
  receiver_device: Device;
  file_name: string;
  file_size: number;
  file_type: string;
  status: 'pending' | 'transferring' | 'completed' | 'paused' | 'cancelled' | 'failed';
  progress: number;
  speed: number;
  eta: number | null;
  sha256?: string;
  created_at?: string;
}

export interface CallSession {
  id?: number;
  session_id: string;
  caller_device: Device;
  callee_device: Device;
  call_type: 'voice' | 'video' | 'screen';
  status: 'ringing' | 'connected' | 'disconnected' | 'rejected' | 'missed';
  created_at?: string;
  ended_at?: string | null;
}

export interface DeviceSettings {
  theme: string;
  language: string;
  downloads_folder: string;
  auto_accept: boolean;
  bandwidth_limit: number | null;
  notifications_enabled: boolean;
  privacy_mode: string;
}
