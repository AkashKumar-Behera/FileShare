import { useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { useSocket } from './useSocket';
import { apiService } from '../services/api';
import { Device, Transfer } from '../types';

const CHUNK_SIZE = 16384; // 16KB WebRTC chunk size for compatibility

export const useWebRTC = () => {
  const { send, addListener, removeListener } = useSocket();
  const { 
    selfDevice, 
    activeCall, 
    setCall, 
    updateCallStatus, 
    setLocalStream, 
    setRemoteStream, 
    addTransfer, 
    updateTransferProgress,
    settings
  } = useAppStore();

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  
  // File receiving buffer
  const receiveBufferRef = useRef<ArrayBuffer[]>([]);
  const receivedSizeRef = useRef<number>(0);
  const currentTransferRef = useRef<Transfer | null>(null);

  // Configuration for ICE Servers (offline LAN setup - no cloud/internet)
  // We use standard local link-local configurations or host-only candidates
  const configuration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }, // STUN is included just in case, but LAN direct IP routing is preferred offline
    ],
  };

  useEffect(() => {
    const handleSignaling = async (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type !== 'signal') return;

      const { sender_id, sub_type, call_type, data: signalPayload } = data;

      if (call_type === 'file') {
        if (sub_type === 'offer') {
          await handleFileOffer(sender_id, signalPayload);
        } else if (sub_type === 'answer') {
          await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(signalPayload));
        } else if (sub_type === 'candidate') {
          if (signalPayload) {
            await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(signalPayload));
          }
        }
      } else if (call_type === 'voice' || call_type === 'video' || call_type === 'screen') {
        if (sub_type === 'offer') {
          await handleCallOffer(sender_id, call_type, signalPayload);
        } else if (sub_type === 'answer') {
          await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(signalPayload));
        } else if (sub_type === 'candidate') {
          if (signalPayload) {
            await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(signalPayload));
          }
        }
      }
    };

    addListener(handleSignaling);
    return () => {
      removeListener(handleSignaling);
      cleanupCall();
    };
  }, [selfDevice, activeCall]);

  // Clean call context
  const cleanupCall = () => {
    if (activeCall?.localStream) {
      activeCall.localStream.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setCall(null);
  };

  // --- Voice / Video Call Functions ---
  const initPeerConnection = (remoteDevice: Device, callType: 'voice' | 'video' | 'screen') => {
    const pc = new RTCPeerConnection(configuration);
    peerConnectionRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        send({
          type: 'signal',
          target_id: remoteDevice.device_id,
          sub_type: 'candidate',
          call_type: callType,
          data: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    return pc;
  };

  const startCall = async (remoteDevice: Device, callType: 'voice' | 'video' | 'screen') => {
    if (!selfDevice) return;

    // Log callsession in DB
    const session_id = `${selfDevice.device_id}_${remoteDevice.device_id}_${Date.now()}`;
    const dbCall = await apiService.createCallSession({
      session_id,
      caller_id: selfDevice.device_id,
      callee_id: remoteDevice.device_id,
      call_type: callType,
      status: 'ringing',
    });

    setCall({
      session_id,
      remoteDevice,
      call_type: callType,
      isOutgoing: true,
      status: 'ringing',
      db_id: dbCall.id
    });

    const pc = initPeerConnection(remoteDevice, callType);

    // Get Local Stream
    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: callType === 'video' ? { width: 1280, height: 720 } : false,
      };
      
      let localStream: MediaStream;
      if (callType === 'screen') {
        localStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      } else {
        localStream = await navigator.mediaDevices.getUserMedia(constraints);
      }

      setLocalStream(localStream);
      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
    } catch (err) {
      console.error('Failed to access media devices', err);
      cleanupCall();
      return;
    }

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    send({
      type: 'signal',
      target_id: remoteDevice.device_id,
      sub_type: 'offer',
      call_type: callType,
      data: offer,
    });
  };

  const handleCallOffer = async (senderId: string, callType: 'voice' | 'video' | 'screen', offerPayload: any) => {
    const list = useAppStore.getState().onlineDevices;
    const caller = list.find((d) => d.device_id === senderId);
    if (!caller) return;

    // Auto accept call or trigger UI ringing state
    const session_id = `${senderId}_${selfDevice?.device_id}_${Date.now()}`;

    setCall({
      session_id,
      remoteDevice: caller,
      call_type: callType,
      isOutgoing: false,
      status: 'ringing',
    });

    // Play ringing sound or notification
    if (settings.auto_accept) {
      await acceptCall(caller, callType, offerPayload);
    }
  };

  const acceptCall = async (caller: Device, callType: 'voice' | 'video' | 'screen', offerPayload?: any) => {
    if (!activeCall) return;

    const pc = initPeerConnection(caller, callType);

    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: callType === 'video' ? { width: 1280, height: 720 } : false,
      };
      
      let localStream: MediaStream;
      if (callType === 'screen') {
        localStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      } else {
        localStream = await navigator.mediaDevices.getUserMedia(constraints);
      }
      setLocalStream(localStream);
      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
    } catch (err) {
      console.error('Failed to accept call: media access error', err);
      rejectCall();
      return;
    }

    if (offerPayload) {
      await pc.setRemoteDescription(new RTCSessionDescription(offerPayload));
    }
    
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    send({
      type: 'signal',
      target_id: caller.device_id,
      sub_type: 'answer',
      call_type: callType,
      data: answer,
    });

    updateCallStatus('connected');
    if (activeCall.db_id) {
      await apiService.updateCallSession(activeCall.db_id, 'connected');
    }
  };

  const rejectCall = async () => {
    if (activeCall) {
      send({
        type: 'signal',
        target_id: activeCall.remoteDevice.device_id,
        sub_type: 'answer',
        call_type: activeCall.call_type,
        data: null, // Indicates rejection
      });
      if (activeCall.db_id) {
        await apiService.updateCallSession(activeCall.db_id, 'rejected');
      }
    }
    cleanupCall();
  };

  // --- WebRTC DataChannel File Sharing Functions ---
  const sendFile = async (remoteDevice: Device, file: File) => {
    if (!selfDevice) return;

    const transfer_id = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const txLog = await apiService.createTransfer({
      transfer_id,
      sender_id: selfDevice.device_id,
      receiver_id: remoteDevice.device_id,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type || 'application/octet-stream',
      status: 'pending',
    });

    const transferObj: Transfer = {
      id: txLog.id,
      transfer_id,
      sender_device: selfDevice,
      receiver_device: remoteDevice,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      status: 'pending',
      progress: 0,
      speed: 0,
      eta: null,
    };

    addTransfer(transferObj);

    const pc = new RTCPeerConnection(configuration);
    peerConnectionRef.current = pc;

    const channel = pc.createDataChannel('fileTransfer');
    dataChannelRef.current = channel;
    channel.binaryType = 'arraybuffer';

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        send({
          type: 'signal',
          target_id: remoteDevice.device_id,
          sub_type: 'candidate',
          call_type: 'file',
          data: event.candidate,
        });
      }
    };

    channel.onopen = () => {
      console.log('Data channel open, starting transfer of: ', file.name);
      updateTransferProgress(transfer_id, 0, 'transferring', 0, null);
      apiService.updateTransfer(txLog.id!, { status: 'transferring' });
      transmitFileChunks(file, channel, transfer_id, txLog.id!);
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    send({
      type: 'signal',
      target_id: remoteDevice.device_id,
      sub_type: 'offer',
      call_type: 'file',
      data: {
        offer,
        transfer_id,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
      },
    });
  };

  const transmitFileChunks = (file: File, channel: RTCDataChannel, transferId: string, dbId: number) => {
    const fileReader = new FileReader();
    let offset = 0;
    const startTime = Date.now();

    const readSlice = () => {
      const slice = file.slice(offset, offset + CHUNK_SIZE);
      fileReader.readAsArrayBuffer(slice);
    };

    fileReader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      
      // Handle buffer overflow backpressure
      if (channel.bufferedAmount > 16000000) { // 16MB buffer limit
        setTimeout(readSlice, 50);
        return;
      }

      channel.send(buffer);
      offset += buffer.byteLength;

      const progress = Math.min((offset / file.size) * 100, 100);
      const elapsed = (Date.now() - startTime) / 1000;
      const speed = offset / (elapsed || 0.1); // Bytes per second
      const remainingBytes = file.size - offset;
      const eta = speed > 0 ? Math.ceil(remainingBytes / speed) : null;

      updateTransferProgress(transferId, progress, progress >= 100 ? 'completed' : 'transferring', speed, eta);

      if (offset < file.size) {
        readSlice();
      } else {
        console.log('File successfully fully transmitted!');
        apiService.updateTransfer(dbId, { status: 'completed', progress: 100 });
        channel.close();
      }
    };

    readSlice();
  };

  const handleFileOffer = async (senderId: string, payload: any) => {
    const { offer, transfer_id, file_name, file_size, file_type } = payload;
    const list = useAppStore.getState().onlineDevices;
    const sender = list.find((d) => d.device_id === senderId);
    if (!sender || !selfDevice) return;

    // Create DB log on receiver side
    const txLog = await apiService.createTransfer({
      transfer_id,
      sender_id: sender.device_id,
      receiver_id: selfDevice.device_id,
      file_name,
      file_size,
      file_type,
      status: 'transferring',
    });

    const transferObj: Transfer = {
      id: txLog.id,
      transfer_id,
      sender_device: sender,
      receiver_device: selfDevice,
      file_name,
      file_size,
      file_type,
      status: 'transferring',
      progress: 0,
      speed: 0,
      eta: null,
    };

    addTransfer(transferObj);
    currentTransferRef.current = transferObj;

    const pc = new RTCPeerConnection(configuration);
    peerConnectionRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        send({
          type: 'signal',
          target_id: senderId,
          sub_type: 'candidate',
          call_type: 'file',
          data: event.candidate,
        });
      }
    };

    pc.ondatachannel = (event) => {
      const channel = event.channel;
      dataChannelRef.current = channel;
      channel.binaryType = 'arraybuffer';
      
      receiveBufferRef.current = [];
      receivedSizeRef.current = 0;
      const startTime = Date.now();

      channel.onmessage = (e) => {
        const buffer = e.data as ArrayBuffer;
        receiveBufferRef.current.push(buffer);
        receivedSizeRef.current += buffer.byteLength;

        const progress = Math.min((receivedSizeRef.current / file_size) * 100, 100);
        const elapsed = (Date.now() - startTime) / 1000;
        const speed = receivedSizeRef.current / (elapsed || 0.1);
        const remainingBytes = file_size - receivedSizeRef.current;
        const eta = speed > 0 ? Math.ceil(remainingBytes / speed) : null;

        updateTransferProgress(transfer_id, progress, progress >= 100 ? 'completed' : 'transferring', speed, eta);

        if (receivedSizeRef.current >= file_size) {
          // Re-assemble file
          const receivedBlob = new Blob(receiveBufferRef.current, { type: file_type });
          const url = URL.createObjectURL(receivedBlob);
          
          // Trigger download
          const a = document.createElement('a');
          a.href = url;
          a.download = file_name;
          a.click();
          URL.revokeObjectURL(url);
          
          apiService.updateTransfer(txLog.id!, { status: 'completed', progress: 100 });
          channel.close();
          currentTransferRef.current = null;
        }
      };
    };

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    send({
      type: 'signal',
      target_id: senderId,
      sub_type: 'answer',
      call_type: 'file',
      data: answer,
    });
  };

  return {
    startCall,
    acceptCall: (offerPayload: any) => {
      if (activeCall) acceptCall(activeCall.remoteDevice, activeCall.call_type, offerPayload);
    },
    rejectCall,
    sendFile,
    cleanupCall,
  };
};
