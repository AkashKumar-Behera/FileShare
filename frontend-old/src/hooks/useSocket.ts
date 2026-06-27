import { useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { Message } from '../types';

let socketInstance: WebSocket | null = null;
const eventListeners = new Set<(event: MessageEvent) => void>();

export const useSocket = () => {
  const { selfDevice, setSocketConnected, addMessage, setCall, updateCallStatus, setOnlineDevices } = useAppStore();
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!selfDevice) return;

    if (!socketInstance) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.hostname}:8000/ws/communication/${selfDevice.device_id}/`;
      
      const socket = new WebSocket(wsUrl);
      socketInstance = socket;
      socketRef.current = socket;

      socket.onopen = () => {
        setSocketConnected(true);
        console.log('WebSocket connected');
      };

      socket.onclose = () => {
        setSocketConnected(false);
        socketInstance = null;
        console.log('WebSocket disconnected');
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'presence') {
          // Trigger device refetch
          fetchOnlineDevices();
        } else if (data.type === 'chat_message') {
          addMessage(data.message.chat_id, data.message);
        } else if (data.type === 'signal') {
          // Handled by WebRTC hooks
        }

        // Notify raw listeners (like the WebRTC handlers)
        eventListeners.forEach((listener) => listener(event));
      };
    } else {
      socketRef.current = socketInstance;
    }

    const fetchOnlineDevices = async () => {
      try {
        const { apiService } = await import('../services/api');
        const list = await apiService.fetchOnlineDevices(selfDevice.device_id);
        setOnlineDevices(list);
      } catch (err) {
        console.error('Error fetching online devices', err);
      }
    };

    fetchOnlineDevices();
    const interval = setInterval(fetchOnlineDevices, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [selfDevice]);

  const send = (data: any) => {
    const ws = socketRef.current || socketInstance;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not open. Message queued or ignored.');
    }
  };

  const addListener = (listener: (event: MessageEvent) => void) => {
    eventListeners.add(listener);
  };

  const removeListener = (listener: (event: MessageEvent) => void) => {
    eventListeners.delete(listener);
  };

  return {
    send,
    addListener,
    removeListener,
    isConnected: socketRef.current?.readyState === WebSocket.OPEN,
  };
};
