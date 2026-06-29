"use client";
// Updated chat components & particles


import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { motionTokens } from "../lib/motionTokens";
import styles from "./page.module.css";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";
import Navbar from "../components/Navbar";
import {
  Search,
  Filter,
  MoreVertical,
  FileText,
  Play,
  FolderArchive,
  Archive,
  Image as ImageIcon,
  Smartphone,
  Monitor,
  Laptop,
  Pause,
  X,
  FolderOpen,
  Trash2,
  Info,
  ArrowUp,
  ArrowDown,
  Clock,
  XCircle,
  Eye,
  MessageSquare,
  Volume2,
  HardDrive,
  Send,
  Plus,
  RefreshCw,
  HelpCircle,
  Activity,
  Heart,
  Settings,
  Wifi,
  Shield,
  MoreHorizontal,
  LayoutDashboard,
  ArrowLeftRight,
  Star,
  ArrowLeft,
  Paperclip,
  Music,
  RotateCw,
  Edit3,
  Share2,
  Sparkles,
  UploadCloud,
  Download,
  Clipboard,
  Users,
  Tv,
  Mic,
  MicOff,
  Maximize,
  Minimize,
  Minimize2,
  VolumeX
} from "lucide-react";


// Interfaces for UI Data
interface ActivityItem {
  id: string;
  type: "sent" | "received";
  fileName: string;
  device: string;
  time: string;
  size: string;
}

interface RecentFileItem {
  id: string;
  fileName: string;
  size: string;
  time: string;
  type: string;
}

interface MyFileItem {
  id: string;
  name: string;
  type: string;
  size: string; // "—" for folder
  dateModified: string;
  filesCount?: number; // for folder only
}

interface ReceivedFileItem {
  id: string;
  fileName: string;
  device: string;
  ip: string;
  type: string;
  size: string;
  timeReceived: string;
  status: "New" | "Downloaded";
}

interface TransferItem {
  id: string;
  fileName: string;
  device: string;
  ip: string;
  size: string;
  progressPercent: number;
  progressDetail: string;
  speed: string;
  timeLeft: string;
  status: "Transferring" | "Paused" | "Completed" | "Failed";
  direction: "send" | "receive";
  completedOn?: string;
  failedOn?: string;
  type: "pptx" | "mp4" | "zip" | "image" | "txt" | "pdf" | "rar";
}

interface ChatMessage {
  id: string;
  sender: "you" | "other";
  sender_user_id?: number;
  text?: string;
  time: string;
  file?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  reply_to_text?: string;
  reply_to_sender?: string;
  is_read?: boolean;
}


function StarParticlesCanvas({ enabled, customWallpaperUrl }: { enabled: boolean; customWallpaperUrl?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const customImgRef = React.useRef<HTMLImageElement | null>(null);

  React.useEffect(() => {
    if (customWallpaperUrl) {
      const img = new Image();
      img.src = customWallpaperUrl;
      customImgRef.current = img;
    } else {
      customImgRef.current = null;
    }
  }, [customWallpaperUrl]);

  React.useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Load Predefined Wallpaper Images
    const darkWallpaper = new Image();
    darkWallpaper.src = "/theme/dark/default.png";
    const mobileDarkWallpaper = new Image();
    mobileDarkWallpaper.src = "/theme/dark/default.png";
    const lightWallpaper = new Image();
    lightWallpaper.src = "/seen1Light.png";

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 300);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 400);

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight;
      }
    };
    window.addEventListener("resize", handleResize);

    const drawCoverImage = (img: HTMLImageElement) => {
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = width / height;
      let renderW = width;
      let renderH = height;
      let offsetX = 0;
      let offsetY = 0;

      if (imgRatio > canvasRatio) {
        renderW = height * imgRatio;
        offsetX = (width - renderW) / 2;
      } else {
        renderH = width / imgRatio;
        offsetY = (height - renderH) / 2;
      }
      ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const isCurrentlyDark = document.documentElement.classList.contains("dark");

      if (customImgRef.current && customImgRef.current.complete && customImgRef.current.naturalWidth > 0) {
        drawCoverImage(customImgRef.current);
      } else if (isCurrentlyDark) {
        const isMobileScreen = width < 768 || window.innerWidth < 768;
        const activeWallpaper = isMobileScreen ? mobileDarkWallpaper : darkWallpaper;

        if (activeWallpaper.complete && activeWallpaper.naturalWidth > 0) {
          drawCoverImage(activeWallpaper);
        } else if (darkWallpaper.complete && darkWallpaper.naturalWidth > 0) {
          drawCoverImage(darkWallpaper);
        } else {
          ctx.fillStyle = "#0c1020";
          ctx.fillRect(0, 0, width, height);
        }
      } else {
        if (lightWallpaper.complete && lightWallpaper.naturalWidth > 0) {
          drawCoverImage(lightWallpaper);
        } else {
          ctx.fillStyle = "#e0f2fe";
          ctx.fillRect(0, 0, width, height);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [enabled, customWallpaperUrl]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        borderRadius: "inherit"
      }}
    />
  );
}


export default function Home() {

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loginUsername, setLoginUsername] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [authEmail, setAuthEmail] = useState<string>("");
  const [authName, setAuthName] = useState<string>("");
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>( "");

  // Public/Anonymous Downloader States
  const [isQuickDownloader, setIsQuickDownloader] = useState<boolean>(false);
  const [publicFiles, setPublicFiles] = useState<any[]>([]);
  const [publicSearchQuery, setPublicSearchQuery] = useState("");
  const [isFetchingPublicFiles, setIsFetchingPublicFiles] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);

  const handleToggleAudioPreview = (fileId: number, url: string) => {
    if (playingAudioId === fileId) {
      if (previewAudio) {
        previewAudio.pause();
      }
      setPlayingAudioId(null);
    } else {
      if (previewAudio) {
        previewAudio.pause();
      }
      const audio = new Audio(url);
      audio.play().catch(() => {});
      audio.onended = () => {
        setPlayingAudioId(null);
      };
      setPreviewAudio(audio);
      setPlayingAudioId(fileId);
    }
  };

  const fetchPublicFiles = async () => {
    setIsFetchingPublicFiles(true);
    try {
      const res = await fetch(getApiUrl("/transfers/public_files"));
      if (res.ok) {
        const data = await res.json();
        setPublicFiles(data);
      }
    } catch (e) {
      console.error("Error fetching public files:", e);
    } finally {
      setIsFetchingPublicFiles(false);
    }
  };

  React.useEffect(() => {
    if (isQuickDownloader) {
      fetchPublicFiles();
    }
  }, [isQuickDownloader]);

  // Profile setup states
  const [showProfileSetupModal, setShowProfileSetupModal] = useState<boolean>(false);
  const [setupDeviceName, setSetupDeviceName] = useState<string>("");
  const [setupAvatarFile, setSetupAvatarFile] = useState<File | null>(null);
  const [setupAvatarPreview, setSetupAvatarPreview] = useState<string | null>(null);
  const [setupSubmitting, setSetupSubmitting] = useState<boolean>(false);

  const [activePage, setActivePage] = useState<string>("Dashboard");
  const [showTip, setShowTip] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Devices tab state, search state, and list data
  const [devicesTab, setDevicesTab] = useState<string>("All Devices");
  const [devicesSearch, setDevicesSearch] = useState<string>("");
  const [devicesList, setDevicesList] = useState<{ name: string; ip: string; type: string; lastSeen: string; status: string }[]>([]);

  // Helper to dynamically get API base (proxied securely through HTTPS server)
  const getApiUrl = (path: string) => {
    return `/api${path}`;
  };

  // Search filter query state per page
  const [dashboardSearch, setDashboardSearch] = useState("");
  const [myFilesSearch, setMyFilesSearch] = useState("");
  const [receivedSearch, setReceivedSearch] = useState("");
  const [transfersSearch, setTransfersSearch] = useState("");

  // Pills and Tabs active state
  const [myFilesCategory, setMyFilesCategory] = useState<string>("All");
  const [receivedCategory, setReceivedCategory] = useState<string>("All");
  const [transfersTab, setTransfersTab] = useState<string>("All Transfers");
  const [transfersSubTab, setTransfersSubTab] = useState<string>("History");

  // Selected row checkboxes in My Files page
  const [selectedMyFiles, setSelectedMyFiles] = useState<Record<string, boolean>>({});

  // Dynamic self device states
  const [deviceId, setDeviceId] = useState<string>("");
  const [username, setUsername] = useState<string>("You");
  const [deviceName, setDeviceName] = useState<string>("LAPTOP-01");

  // WebSocket reference
  const wsRef = React.useRef<WebSocket | null>(null);
  const activeChatRef = React.useRef<string>("");
  const activeChatIdRef = React.useRef<number | null>(null);

  // WebRTC P2P Data Channels & Signaling References
  const p2pFilePeerConnectionsRef = React.useRef<Record<string, RTCPeerConnection>>({});
  const fileReceiversRef = React.useRef<Record<string, { chunks: ArrayBuffer[]; received: number; total: number; name: string; type: string; sender: string; msgId: string; chatName: string }>>({});

  // Profile Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUsernameInput, setEditUsernameInput] = useState("");
  const [editDeviceNameInput, setEditDeviceNameInput] = useState("");

  // Settings View States (ui 9.png)
  const [settingsDarkMode, setSettingsDarkMode] = useState(false);
  const [settingsAutoAccept, setSettingsAutoAccept] = useState(true);
  const [settingsPlaySound, setSettingsPlaySound] = useState(true);
  const [settingsVisibility, setSettingsVisibility] = useState("everyone");
  const [settingsPort, setSettingsPort] = useState("8000");
  const [settingsDownloadPath, setSettingsDownloadPath] = useState("C:\\Downloads\\FileShare");
  const [settingsClearLogs, setSettingsClearLogs] = useState(false);
  const [settingsSubCategory, setSettingsSubCategory] = useState("General");

  // Star Particles Settings
  const [settingsStarEnabled, setSettingsStarEnabled] = useState(true);
  const [settingsStarIntensity, setSettingsStarIntensity] = useState("Low");
  const [settingsStarSpeed, setSettingsStarSpeed] = useState("Slow");


  // Image Lightbox State
  const [lightboxData, setLightboxData] = useState<{ url: string; fileName: string; messageId?: string; chatName?: string } | null>(null);
  const [lightboxFilter, setLightboxFilter] = useState("none");
  const [lightboxRotation, setLightboxRotation] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Custom Wallpapers & Avatar States (Local Browser Cache Storage)
  const [chatWallpapers, setChatWallpapers] = useState<Record<string, string>>({});
  const [userCustomAvatar, setUserCustomAvatar] = useState<string>("");
  const [isChatWallpaperModalOpen, setIsChatWallpaperModalOpen] = useState(false);
  const [isGroupInfoModalOpen, setIsGroupInfoModalOpen] = useState(false);
  const [selectedWallpaperPreview, setSelectedWallpaperPreview] = useState<string>("");
  const [deletedRecentChats, setDeletedRecentChats] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        return JSON.parse(localStorage.getItem("fileshare_deleted_chats") || "[]");
      } catch {
        return [];
      }
    }
    return [];
  });

  // WebRTC Single-to-Many Screen Share States & Refs
  const [activeScreenPresenter, setActiveScreenPresenter] = useState<{ active: boolean; presenter_name?: string; presenter_device_id?: string; audio_enabled?: boolean }>({ active: false });
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isWatchingScreen, setIsWatchingScreen] = useState(false);
  const [screenShareAudioMuted, setScreenShareAudioMuted] = useState(false);
  const [isHttpsHelpModalOpen, setIsHttpsHelpModalOpen] = useState(false);
  const [liveFrameUrl, setLiveFrameUrl] = useState<string | null>(null);
  const [isStreamMinimized, setIsStreamMinimized] = useState(false);
  const [isStreamFullscreen, setIsStreamFullscreen] = useState(false);
  const [viewerAudioMuted, setViewerAudioMuted] = useState(true);
  const [hasRemoteStream, setHasRemoteStream] = useState(false);
  const [showPlayerControls, setShowPlayerControls] = useState(true);
  const controlsTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
  const localScreenStreamRef = React.useRef<MediaStream | null>(null);
  const remoteScreenStreamRef = React.useRef<MediaStream | null>(null);
  const viewerFallbackStreamRef = React.useRef<MediaStream | null>(null);
  const remoteVideoElementRef = React.useRef<HTMLVideoElement | null>(null);
  const presenterVideoCaptureRef = React.useRef<HTMLVideoElement | null>(null);
  const viewerStreamContainerRef = React.useRef<HTMLDivElement | null>(null);
  const peerConnectionsRef = React.useRef<Map<string, RTCPeerConnection>>(new Map());
  const viewerPeerConnectionRef = React.useRef<RTCPeerConnection | null>(null);

  // Helper to force H.264 video codec in WebRTC SDP
  const preferH264Codec = (sdp: string): string => {
    const lines = sdp.split("\r\n");
    const mLineIndex = lines.findIndex(l => l.startsWith("m=video"));
    if (mLineIndex === -1) return sdp;

    let h264Payload: string | null = null;
    for (let i = mLineIndex; i < lines.length; i++) {
      if (lines[i].startsWith("m=") && i !== mLineIndex) break;
      const match = lines[i].match(/a=rtpmap:(\d+)\s+H264\/90000/i);
      if (match) {
        h264Payload = match[1];
        break;
      }
    }

    if (h264Payload) {
      const tokens = lines[mLineIndex].split(" ");
      const header = tokens.slice(0, 3);
      const payloads = tokens.slice(3).filter(p => p !== h264Payload);
      lines[mLineIndex] = [...header, h264Payload, ...payloads].join(" ");
    }
    return lines.join("\r\n");
  };

  // WebRTC Screen Sharing Handlers
  const createSimulatedScreenStream = (): MediaStream => {
    const canvas = document.createElement("canvas");
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext("2d");
    let frame = 0;
    
    const draw = () => {
      if (!ctx) return;
      frame++;
      const grad = ctx.createLinearGradient(0, 0, 1280, 720);
      grad.addColorStop(0, "#0f172a");
      grad.addColorStop(1, "#1e1b4b");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1280, 720);

      ctx.fillStyle = "#6C63FF";
      ctx.beginPath();
      ctx.roundRect(40, 40, 360, 64, 12);
      ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 22px Inter, sans-serif";
      ctx.fillText("📡 FileShare LAN Broadcast", 65, 80);

      ctx.font = "18px Inter, sans-serif";
      ctx.fillStyle = "#93C5FD";
      ctx.fillText(`Presenter: ${username || "LAPTOP-01"}`, 65, 160);
      ctx.fillText(`Status: Live Streaming via WebRTC`, 65, 195);
      ctx.fillText(`Clock: ${new Date().toLocaleTimeString()}`, 65, 230);

      // Animated visual equalizer bars
      for (let i = 0; i < 15; i++) {
        const h = 30 + Math.sin(frame * 0.1 + i) * 25 + Math.cos(frame * 0.05 + i) * 15;
        ctx.fillStyle = i % 2 === 0 ? "#6C63FF" : "#EC4899";
        ctx.fillRect(65 + i * 24, 320 - h, 16, h);
      }
    };

    const timer = setInterval(draw, 1000 / 30);
    const stream = canvas.captureStream(30);
    (stream as any)._cleanupTimer = timer;
    return stream;
  };

  const unlockRealIpPermissions = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
        s.getTracks().forEach(t => t.stop());
      }
    } catch {}
  };

  const handleStartScreenShare = async () => {
    await unlockRealIpPermissions();
    // 1. Mobile Check (Desktop Only Presenter)
    const isMobileDevice = typeof window !== "undefined" && (window.innerWidth < 768 || /Android|iPhone|iPad/i.test(navigator.userAgent));
    if (isMobileDevice) {
      toast.error("Screen sharing can only be started from PC/Desktop. Mobile users can only watch streams.");
      return;
    }

    // 2. Check Active Presenter Status on Backend
    try {
      const checkRes = await fetch(getApiUrl("/calls/active_screen_share"));
      const checkData = await checkRes.json();
      if (checkData.active && checkData.presenter_device_id !== deviceId) {
        toast.error(`Screen share is already active by ${checkData.presenter_name}. Only one user can share at a time.`);
        return;
      }
    } catch {}

    // 3. Request Real Screen or Canvas Fallback Stream
    const mediaDevicesObj = typeof navigator !== "undefined" ? navigator.mediaDevices : null;
    const getDisplayMediaFn = mediaDevicesObj && mediaDevicesObj.getDisplayMedia
      ? mediaDevicesObj.getDisplayMedia.bind(mediaDevicesObj)
      : (typeof navigator !== "undefined" ? (navigator as any).getDisplayMedia || (navigator as any).webkitGetDisplayMedia : null);

    let stream: MediaStream | null = null;
    try {
      if (getDisplayMediaFn) {
        stream = await getDisplayMediaFn({
          video: {
            width: { ideal: 1920, max: 1920 },
            height: { ideal: 1080, max: 1080 },
            frameRate: { ideal: 60, max: 60 },
            cursor: "always"
          } as any,
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          } as any
        });
      } else {
        toast.info("Using LAN Stream Presenter Mode for broadcast.");
        stream = createSimulatedScreenStream();
      }
    } catch (err: any) {
      if (err.name === "NotAllowedError") return;
      toast.info("Starting LAN Stream Presenter Mode.");
      stream = createSimulatedScreenStream();
    }

    if (!stream) return;
    localScreenStreamRef.current = stream;

    // Notify Backend that active presenter is started
    try {
      const startRes = await fetch(getApiUrl("/calls/active_screen_share"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          device_id: deviceId,
          device_name: username || "PC User",
          audio_enabled: true
        })
      });
      const startData = await startRes.json();
      if (startRes.status === 409) {
        toast.error(startData.error || "Screen share already active!");
        stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
        return;
      }

      setIsSharingScreen(true);
      setActiveScreenPresenter(startData);
      toast.success("Live screen broadcast started!");

      if (stream.getVideoTracks().length > 0) {
        stream.getVideoTracks()[0].onended = () => {
          handleStopScreenShare();
        };
      }
    } catch {
      toast.error("Failed to sync screen share session with server.");
    }
  };

  const handleStopScreenShare = async () => {
    if (localScreenStreamRef.current) {
      if ((localScreenStreamRef.current as any)._cleanupTimer) {
        clearInterval((localScreenStreamRef.current as any)._cleanupTimer);
      }
      localScreenStreamRef.current.getTracks().forEach((t: MediaStreamTrack) => t.stop());
      localScreenStreamRef.current = null;
    }
    setIsSharingScreen(false);
    try {
      await fetch(getApiUrl("/calls/active_screen_share"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stop", device_id: deviceId })
      });
    } catch {}
    setActiveScreenPresenter({ active: false });
    toast.info("Screen broadcast ended.");
  };

  const handleToggleScreenAudio = async () => {
    if (localScreenStreamRef.current) {
      const audioTracks = localScreenStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const nextMuted = !screenShareAudioMuted;
        audioTracks.forEach(t => t.enabled = !nextMuted);
        setScreenShareAudioMuted(nextMuted);
        fetch(getApiUrl("/calls/active_screen_share"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "toggle_audio", device_id: deviceId, audio_enabled: !nextMuted })
        }).catch(() => {});
        toast.info(nextMuted ? "System audio share muted" : "System audio share unmuted");
      } else {
        toast.warning("No audio track was captured during screen share.");
      }
    }
  };

  const handleChangeScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 60 }
        },
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });

      if (localScreenStreamRef.current) {
        localScreenStreamRef.current.getTracks().forEach(t => t.stop());
      }
      localScreenStreamRef.current = stream;

      peerConnectionsRef.current.forEach((pc) => {
        const senders = pc.getSenders();
        stream.getTracks().forEach(track => {
          const sender = senders.find(s => s.track && s.track.kind === track.kind);
          if (sender) {
            sender.replaceTrack(track);
          } else {
            pc.addTrack(track, stream);
          }
        });
      });

      stream.getVideoTracks()[0].onended = () => {
        handleStopScreenShare();
      };

      toast.success("Screen source changed live!");
    } catch (err: any) {
      if (err.name !== "NotAllowedError") {
        toast.error("Could not change screen source.");
      }
    }
  };

  // Poll Active Screen Share Status & Signaling from backend
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const interval = setInterval(() => {
      fetch(getApiUrl("/calls/active_screen_share"))
        .then(res => res.json())
        .then(data => {
          if (data && typeof data === "object") {
            setActiveScreenPresenter(data);
            if (!data.active && isWatchingScreen) {
              setIsWatchingScreen(false);
              toast.info("Presenter stopped screen share.");
            }
          }
        })
        .catch(() => {});
    }, 2500);
    return () => clearInterval(interval);
  }, [isWatchingScreen]);

  React.useEffect(() => {
    if (!isWatchingScreen) {
      if (viewerPeerConnectionRef.current) {
        try {
          viewerPeerConnectionRef.current.close();
        } catch {}
        viewerPeerConnectionRef.current = null;
      }
      remoteScreenStreamRef.current = null;
      setHasRemoteStream(false);
    }
  }, [isWatchingScreen]);

  // WebRTC P2P Signaling Loop for Native H.264 Screen & System Audio Streaming
  React.useEffect(() => {
    if (typeof window === "undefined" || !deviceId) return;

    const currentHost = typeof window !== "undefined" ? window.location.hostname : "localhost";
    const rtcConfig = {
      iceServers: [
        { urls: `turn:${currentHost}:3478?transport=udp`, username: "fileshare", credential: "fileshare_password" },
        { urls: `turn:${currentHost}:3478?transport=tcp`, username: "fileshare", credential: "fileshare_password" },
        { urls: "stun:stun.l.google.com:19302" }
      ]
    };

    let viewerJoinCounter = 0;
    const interval = setInterval(() => {
      // Periodic viewer join retry if WebRTC is not yet established
      if (isWatchingScreen && !isSharingScreen && !remoteScreenStreamRef.current) {
        viewerJoinCounter++;
        if (viewerJoinCounter % 2 === 0) {
          fetch(getApiUrl("/calls/signal"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to_device: "presenter",
              from_device: deviceId,
              signal: { type: "viewer_join" }
            })
          }).catch(() => {});
        }
      }

      fetch(getApiUrl(`/calls/signal?device_id=${deviceId}`))
        .then(res => res.json())
        .then((signals: any[]) => {
          if (!Array.isArray(signals)) return;
          signals.forEach(async (item) => {
            const senderId = item.from_device;
            const sig = item.signal;
            if (!sig || !senderId) return;

            // PRESENTER SIDE HANDLING
            if (isSharingScreen && localScreenStreamRef.current) {
              if (sig.type === "viewer_join") {
                const pc = new RTCPeerConnection(rtcConfig);
                peerConnectionsRef.current.set(senderId, pc);

                localScreenStreamRef.current.getTracks().forEach(track => {
                  pc.addTrack(track, localScreenStreamRef.current!);
                });

                pc.onicecandidate = (e) => {
                  if (e.candidate) {
                    fetch(getApiUrl("/calls/signal"), {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        to_device: senderId,
                        from_device: deviceId,
                        signal: { type: "ice-candidate", candidate: e.candidate }
                      })
                    }).catch(() => {});
                  }
                };

                const offer = await pc.createOffer();
                offer.sdp = preferH264Codec(offer.sdp || "");
                await pc.setLocalDescription(offer);

                fetch(getApiUrl("/calls/signal"), {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    to_device: senderId,
                    from_device: deviceId,
                    signal: { type: "sdp-offer", sdp: pc.localDescription }
                  })
                }).catch(() => {});
              } else if (sig.type === "sdp-answer") {
                const pc = peerConnectionsRef.current.get(senderId);
                if (pc && sig.sdp) {
                  await pc.setRemoteDescription(new RTCSessionDescription(sig.sdp)).catch(() => {});
                }
              } else if (sig.type === "ice-candidate") {
                const pc = peerConnectionsRef.current.get(senderId);
                if (pc && sig.candidate && pc.remoteDescription && pc.remoteDescription.type) {
                  await pc.addIceCandidate(new RTCIceCandidate(sig.candidate)).catch(() => {});
                }
              }
            }

            // VIEWER SIDE HANDLING
            if (isWatchingScreen && !isSharingScreen) {
              if (sig.type === "sdp-offer") {
                const pc = new RTCPeerConnection(rtcConfig);
                viewerPeerConnectionRef.current = pc;

                pc.onconnectionstatechange = () => {
                  if (pc.connectionState === "failed" || pc.connectionState === "disconnected" || pc.connectionState === "closed") {
                    remoteScreenStreamRef.current = null;
                    setHasRemoteStream(false);
                  }
                };

                pc.ontrack = (e) => {
                  if (e.streams && e.streams[0]) {
                    remoteScreenStreamRef.current = e.streams[0];
                    setHasRemoteStream(true);
                    if (remoteVideoElementRef.current) {
                      remoteVideoElementRef.current.srcObject = e.streams[0];
                      remoteVideoElementRef.current.play().catch(() => {});
                    }
                  }
                };

                pc.onicecandidate = (e) => {
                  if (e.candidate) {
                    fetch(getApiUrl("/calls/signal"), {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        to_device: senderId,
                        from_device: deviceId,
                        signal: { type: "ice-candidate", candidate: e.candidate }
                      })
                    }).catch(() => {});
                  }
                };

                await pc.setRemoteDescription(new RTCSessionDescription(sig.sdp)).catch(() => {});
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                fetch(getApiUrl("/calls/signal"), {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    to_device: senderId,
                    from_device: deviceId,
                    signal: { type: "sdp-answer", sdp: pc.localDescription }
                  })
                }).catch(() => {});
              } else if (sig.type === "ice-candidate") {
                const pc = viewerPeerConnectionRef.current;
                if (pc && sig.candidate && pc.remoteDescription && pc.remoteDescription.type) {
                  await pc.addIceCandidate(new RTCIceCandidate(sig.candidate)).catch(() => {});
                }
              }
            }
          });
        })
        .catch(() => {});
    }, 1000);

    return () => clearInterval(interval);
  }, [isSharingScreen, isWatchingScreen, deviceId]);

  // Real-time Screen Frame Broadcast & Viewer Sync Loop (High FPS Engine)
  React.useEffect(() => {
    if (typeof window === "undefined" || !deviceId) return;

    const offscreenVideo = document.createElement("video");
    offscreenVideo.muted = true;
    offscreenVideo.playsInline = true;
    offscreenVideo.style.position = "absolute";
    offscreenVideo.style.width = "0px";
    offscreenVideo.style.height = "0px";
    offscreenVideo.style.pointerEvents = "none";
    offscreenVideo.style.opacity = "0";
    document.body.appendChild(offscreenVideo);

    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = 1280;
    offscreenCanvas.height = 720;
    const ctx = offscreenCanvas.getContext("2d");
    
    let isUploading = false;
    let isFetching = false;

    const interval = setInterval(() => {
      if (isSharingScreen && localScreenStreamRef.current) {
        if (offscreenVideo.srcObject !== localScreenStreamRef.current) {
          offscreenVideo.srcObject = localScreenStreamRef.current;
          offscreenVideo.play().catch(() => {});
        }
        if (ctx && !isUploading && offscreenVideo.videoWidth > 0) {
          isUploading = true;
          try {
            ctx.drawImage(offscreenVideo, 0, 0, 1280, 720);
            const frameData = offscreenCanvas.toDataURL("image/jpeg", 0.6);
            fetch(getApiUrl("/calls/live_frame"), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ device_id: deviceId, frame: frameData })
            })
            .catch(() => {})
            .finally(() => { isUploading = false; });
          } catch {
            isUploading = false;
          }
        }
      } else if (isWatchingScreen && !isSharingScreen) {
        if (!isFetching) {
          isFetching = true;
          fetch(getApiUrl("/calls/live_frame"))
            .then(res => res.json())
            .then(data => {
              if (data && data.frame) {
                setLiveFrameUrl(data.frame);
              }
            })
            .catch(() => {})
            .finally(() => { isFetching = false; });
        }
      }
    }, 50);

    return () => {
      clearInterval(interval);
      offscreenVideo.pause();
      offscreenVideo.srcObject = null;
      if (document.body.contains(offscreenVideo)) {
        document.body.removeChild(offscreenVideo);
      }
    };
  }, [isSharingScreen, isWatchingScreen, deviceId]);

  // Favorites View States (ui 11.png and ui 12.png)
  const [favoritesSearch, setFavoritesSearch] = useState("");
  const [favoritesTab, setFavoritesTab] = useState<string>("All");
  // Scan state
  const [isScanning, setIsScanning] = useState(false);
  const [activeChat, setActiveChat] = useState<string>("");
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [deletedMessageIds, setDeletedMessageIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        return JSON.parse(localStorage.getItem("deletedMessageIds") || "[]");
      } catch {
        return [];
      }
    }
    return [];
  });
  const deletedMessageIdsRef = React.useRef(deletedMessageIds);
  React.useEffect(() => {
    deletedMessageIdsRef.current = deletedMessageIds;
  }, [deletedMessageIds]);

  const handleDeleteMessage = (msgId: string, chatName: string) => {
    if (!msgId) return;
    setDeletedMessageIds(prev => {
      const next = [...prev, msgId];
      if (typeof window !== "undefined") {
        localStorage.setItem("deletedMessageIds", JSON.stringify(next));
      }
      return next;
    });
    setChatMessages((prev) => ({
      ...prev,
      [chatName]: (prev[chatName] || []).filter((m) => m.id !== msgId)
    }));
    fetch(getApiUrl("/chats/delete_message"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message_id: msgId })
    }).catch(() => {});
    toast.success("Message deleted");
  };

  const handleDeleteMultipleMessages = (msgIds: string[], chatName: string) => {
    if (!msgIds || msgIds.length === 0) return;
    setDeletedMessageIds(prev => {
      const next = [...prev, ...msgIds];
      if (typeof window !== "undefined") {
        localStorage.setItem("deletedMessageIds", JSON.stringify(next));
      }
      return next;
    });
    setChatMessages((prev) => ({
      ...prev,
      [chatName]: (prev[chatName] || []).filter((m) => !msgIds.includes(m.id))
    }));
    msgIds.forEach(id => {
      fetch(getApiUrl("/chats/delete_message"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message_id: id })
      }).catch(() => {});
    });
    setSelectedMessageIds([]);
    toast.success(`${msgIds.length} messages deleted`);
  };

  const handleEditMessage = (msgId: string, newText: string, chatName: string) => {
    if (!msgId || !newText.trim()) return;
    setChatMessages((prev) => ({
      ...prev,
      [chatName]: (prev[chatName] || []).map((m) => m.id === msgId ? { ...m, text: newText } : m)
    }));
    fetch(getApiUrl("/chats/edit_message"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message_id: msgId, text: newText })
    }).catch(() => {});
    toast.success("Message edited");
  };

  // WhatsApp Context Menu & Replying & Selection States
  const [contextMenuData, setContextMenuData] = useState<{ x: number; y: number; msg: ChatMessage; chatName: string } | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ id: string; text?: string; file_name?: string; sender: string } | null>(null);
  const [starredMessageIds, setStarredMessageIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        return JSON.parse(localStorage.getItem("fileshare_starred_messages") || "[]");
      } catch {
        return [];
      }
    }
    return [];
  });
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const touchTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Drag and Drop File States & Handlers
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const dragCounterRef = React.useRef(0);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDraggingFile(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDraggingFile(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    dragCounterRef.current = 0;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      sendFilesList(e.dataTransfer.files);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (!e.clipboardData) return;
    const items = e.clipboardData.items;
    const filesToUpload: File[] = [];

    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === "file") {
          const file = items[i].getAsFile();
          if (file) {
            filesToUpload.push(file);
          }
        }
      }
    }

    if (filesToUpload.length > 0) {
      e.preventDefault();
      sendFilesList(filesToUpload);
    }
  };

  const handleClipboardRead = async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.read) {
        imageInputRef.current?.click();
        return;
      }
      const clipboardItems = await navigator.clipboard.read();
      const filesToUpload: File[] = [];
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith("image/") || type.startsWith("video/") || type.startsWith("application/")) {
            const blob = await item.getType(type);
            const ext = type.split("/")[1] || "png";
            const file = new File([blob], `clipboard_${Date.now()}.${ext}`, { type });
            filesToUpload.push(file);
          }
        }
      }
      if (filesToUpload.length > 0) {
        sendFilesList(filesToUpload);
      } else {
        toast.info("No media found in clipboard. Opening gallery...");
        imageInputRef.current?.click();
      }
    } catch (err) {
      console.error("Clipboard access error:", err);
      imageInputRef.current?.click();
    }
  };


  const toggleStarMessage = (msgId: string) => {
    setStarredMessageIds(prev => {
      const isStarred = prev.includes(msgId);
      const next = isStarred ? prev.filter(id => id !== msgId) : [...prev, msgId];
      if (typeof window !== "undefined") {
        localStorage.setItem("fileshare_starred_messages", JSON.stringify(next));
      }
      if (isStarred) {
        toast.info("Unstarred message");
      } else {
        toast.success("Starred item added to Favorites ⭐");
      }
      return next;
    });
  };



  // Typing effect states
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isTypingLocal, setIsTypingLocal] = useState(false);

  // AutoAnimate hooks for list transitions
  const [parentDevicesList] = useAutoAnimate();
  const [parentTransfersList] = useAutoAnimate();
  const [parentMessagesList] = useAutoAnimate();

  // Attach Menu & File Type Refs
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);
  const chatBodyRef = React.useRef<HTMLDivElement | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const imageInputRef = React.useRef<HTMLInputElement | null>(null);
  const audioInputRef = React.useRef<HTMLInputElement | null>(null);
  const videoInputRef = React.useRef<HTMLInputElement | null>(null);
  const docInputRef = React.useRef<HTMLInputElement | null>(null);

  const scrollToBottom = (force = false) => {
    if (!chatBodyRef.current) return;
    const container = chatBodyRef.current;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
    if (force || isNearBottom) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  };

  React.useEffect(() => {
    scrollToBottom(true);
    activeChatRef.current = activeChat;
  }, [activeChat]);

  React.useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  React.useEffect(() => {
    scrollToBottom(false);
  }, [chatMessages]);

  // Handle Hardware / Browser Back Button properly
  React.useEffect(() => {
    const handlePopState = () => {
      if (isAttachMenuOpen) {
        setIsAttachMenuOpen(false);
      } else if (activeChat !== "") {
        setActiveChat("");
      }
    };

    if (activeChat !== "" || isAttachMenuOpen) {
      window.history.pushState({ inChat: true }, "");
      window.addEventListener("popstate", handlePopState);
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [activeChat, isAttachMenuOpen]);

  const [nearbyDevices, setNearbyDevices] = useState<{ name: string; ip: string; status: string; avatar?: string }[]>([]);
  const [recentChats, setRecentChats] = useState<{ name: string; time: string; lastMsg?: string; unread?: number }[]>([
    { name: "Group Chat", time: "10:27 AM", lastMsg: "Welcome to Group Chat", unread: 0 }
  ]);
  const [peerAvatars, setPeerAvatars] = useState<Record<string, string>>({});

  // Starred / Favorites State (backed by localStorage)
  const [starredChats, setStarredChats] = useState<string[]>([]);
  const [starredFiles, setStarredFiles] = useState<any[]>([]);
  const [presetWallpapers, setPresetWallpapers] = useState<{ dark: any[]; light: any[]; default_dark: string | null; default_light: string | null }>({
    dark: [
      { name: "default.png", url: "/theme/dark/default.png" },
      { name: "seen2dark.png", url: "/seen2dark.png" },
      { name: "darkPhone.png", url: "/darkPhone.png" }
    ],
    light: [
      { name: "seen1Light.png", url: "/seen1Light.png" }
    ],
    default_dark: "/theme/dark/default.png",
    default_light: "/seen1Light.png"
  });

  // Client-side initialization & self-registration
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      let savedId = localStorage.getItem("deviceId");
      if (!savedId) {
        savedId = "device-" + Math.random().toString(36).substring(2, 11);
        localStorage.setItem("deviceId", savedId);
      }
      setDeviceId(savedId);

      // Auto-detect device name & type if not already saved
      const ua = navigator.userAgent;
      let detectedType = "desktop";
      let detectedName = "Windows PC";
      if (/android/i.test(ua)) {
        detectedType = "mobile";
        detectedName = "Android Phone";
      } else if (/iPad|iPhone|iPod/.test(ua)) {
        detectedType = "mobile";
        detectedName = "iPhone";
      } else if (/Macintosh/i.test(ua)) {
        detectedName = "Macbook";
      } else if (/Linux/i.test(ua)) {
        detectedName = "Linux PC";
      }

      let savedDevice = localStorage.getItem("deviceName");
      if (!savedDevice) {
        savedDevice = detectedName;
        localStorage.setItem("deviceName", savedDevice);
      }
      setDeviceName(savedDevice);
      setEditDeviceNameInput(savedDevice);

      let savedUser = localStorage.getItem("fileshare_logged_in_user");
      if (savedUser) {
        setIsLoggedIn(true);
        setUsername(savedUser);
        setEditUsernameInput(savedUser);

        const isProfileDone = localStorage.getItem("fileshare_profile_completed");
        if (!isProfileDone) {
          setSetupDeviceName(savedDevice);
          setShowProfileSetupModal(true);
        }

        // Fetch dynamic theme wallpapers from backend theme directory
        fetch(getApiUrl("/settings/device_settings/theme_wallpapers"))
          .then(res => res.json())
          .then((data: any) => {
            if (data && typeof data === "object") {
              setPresetWallpapers(data);
              const isDark = localStorage.getItem("theme") === "dark" || (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
              const defaultBg = isDark ? data.default_dark : data.default_light;
              if (defaultBg) {
                setChatWallpapers(prev => {
                  if (!prev["global"]) {
                    return { ...prev, global: defaultBg };
                  }
                  return prev;
                });
              }
            }
          }).catch(() => {});

        // Register device on backend
        fetch(getApiUrl("/devices/register"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            device_id: savedId,
            username: savedUser,
            device_name: savedDevice,
            device_type: detectedType,
            avatar: localStorage.getItem("fileshare_user_avatar") || "avatar_1"
          })
        })
        .then(res => {
          if (!res.ok) throw new Error("Backend response error");
          return res.json();
        })
        .then(data => {
          console.log("Registered self on backend:", data);
          if (data && data.avatar && data.avatar !== 'avatar_1') {
            setUserCustomAvatar(data.avatar);
            localStorage.setItem("userCustomAvatar", data.avatar);
            localStorage.setItem("fileshare_profile_completed", "true");
          }
          handleRefreshDevices(savedId);
          loadRecentChats(savedId);
          loadRealTransfers(savedId);
        })
        .catch(err => {
          console.warn("Django backend offline, running in mock LAN mode:", err);
        });
      } else {
        setIsLoggedIn(false);
      }

      let savedAvatar = localStorage.getItem("fileshare_user_avatar");
      if (savedAvatar) {
        setUserCustomAvatar(savedAvatar);
      }

      try {
        let savedWallpapers = JSON.parse(localStorage.getItem("fileshare_chat_wallpapers") || "{}");
        setChatWallpapers(savedWallpapers);
      } catch {}

      let savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        setSettingsDarkMode(true);
        document.documentElement.classList.add("dark");
      } else {
        setSettingsDarkMode(false);
        document.documentElement.classList.remove("dark");
      }
    }
  }, [isLoggedIn]);

  // Fetch online devices
  const handleRefreshDevices = (myId = deviceId) => {
    const targetId = myId || deviceId;
    if (!targetId) return;

    setIsScanning(true);
    fetch(getApiUrl(`/devices/online_devices?exclude_id=${targetId}`))
      .then(res => {
        if (!res.ok) throw new Error("Error fetching devices");
        return res.json();
      })
      .then((data: any[]) => {
        const avatarsMap: Record<string, string> = {};
        const filtered = data.filter(d => {
          const displayName = (d.username && d.username.trim() !== "" && d.username !== "You") ? d.username : d.device_name;
          return displayName !== username && d.device_name !== deviceName && d.device_id !== targetId;
        });
        const mapped = filtered.map(d => {
          const displayName = (d.username && d.username.trim() !== "" && d.username !== "You") ? d.username : d.device_name;
          if (d.avatar && d.avatar !== "avatar_1") {
            avatarsMap[displayName] = d.avatar;
            if (d.device_name) avatarsMap[d.device_name] = d.avatar;
            if (d.username && d.username !== "You") avatarsMap[d.username] = d.avatar;
            if (d.device_id) avatarsMap[d.device_id] = d.avatar;
            if (d.ip_address) avatarsMap[d.ip_address] = d.avatar;
          }
          return {
            name: displayName,
            ip: d.ip_address || "192.168.1.1",
            status: d.is_online ? "online" : "offline",
            avatar: d.avatar
          };
        });
        
        setPeerAvatars(avatarsMap);
        setNearbyDevices(mapped);
        loadRecentChats(targetId);
        setTimeout(() => setIsScanning(false), 1500); // 1.5s animation buffer for smooth slide-out
      })
      .catch(err => {
        console.error("Discovery API request failed:", err);
        setIsScanning(false);
      });

    // Fetch all real registered devices for Devices tab view
    fetch(getApiUrl("/devices"))
      .then(res => res.json())
      .then((allDevs: any[]) => {
        if (Array.isArray(allDevs) && allDevs.length > 0) {
          const groups: Record<string, { name: string; ip: string; types: string[]; isOnline: boolean; lastSeenTime: string }> = {};
          
          allDevs.forEach(d => {
            const displayName = (d.username && d.username.trim() !== "" && d.username !== "You") ? d.username : d.device_name;
            const devType = (d.device_type && d.device_type.toLowerCase() === "mobile") ? "Android" : ((d.device_type && d.device_type.toLowerCase() === "tablet") ? "iOS" : "Windows");
            
            if (!groups[displayName]) {
              groups[displayName] = {
                name: displayName,
                ip: d.ip_address || "192.168.1.1",
                types: [devType],
                isOnline: !!d.is_online,
                lastSeenTime: d.is_online ? "Just now" : (d.last_seen ? new Date(d.last_seen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently")
              };
            } else {
              if (!groups[displayName].types.includes(devType)) {
                groups[displayName].types.push(devType);
              }
              if (d.is_online) {
                groups[displayName].isOnline = true;
                groups[displayName].lastSeenTime = "Just now";
                groups[displayName].ip = d.ip_address || groups[displayName].ip;
              }
            }
          });

          const formatted = Object.values(groups).map(g => ({
            name: g.name,
            ip: g.ip,
            type: g.types.join("/"),
            lastSeen: g.lastSeenTime,
            status: g.isOnline ? "Online" : "Offline"
          }));
          setDevicesList(formatted);
        }
      })
      .catch(() => {});
  };

  React.useEffect(() => {
    if (deviceId) {
      handleRefreshDevices(deviceId);
      const interval = setInterval(() => {
        handleRefreshDevices(deviceId);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [deviceId, activePage]);

  // Load recent chats from Django
  const loadRecentChats = (myId = deviceId) => {
    const targetId = myId || deviceId;
    if (!targetId) return;

    fetch(getApiUrl(`/chats/device_chats?device_id=${targetId}`))
      .then(res => {
        if (!res.ok) throw new Error("Failed to load chats");
        return res.json();
      })
      .then((data: any[]) => {
        const formatted = data.map(chat => {
          let name = chat.name || "Group Chat";
          if (!chat.is_group) {
            const other = chat.participants.find((p: any) => p.device_id !== targetId && p.username !== username);
            name = other ? (other.username || other.device_name) : "Direct Chat";
          }
          const time = chat.last_message ? new Date(chat.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "New Chat";
          
          let snippet = "";
          if (chat.last_message) {
            if (chat.last_message.text && chat.last_message.text.trim() !== "") {
              snippet = chat.last_message.text;
            } else if (chat.last_message.file_name) {
              const fType = (chat.last_message.file_type || "").toLowerCase();
              if (fType.includes("image") || ["jpg", "png", "jpeg"].some(ext => chat.last_message.file_name.toLowerCase().endsWith(ext))) {
                snippet = "📷 Photo";
              } else if (fType.includes("video") || chat.last_message.file_name.toLowerCase().endsWith("mp4")) {
                snippet = "🎥 Video";
              } else if (fType.includes("audio") || chat.last_message.file_name.toLowerCase().endsWith("mp3")) {
                snippet = "🎵 Audio";
              } else {
                snippet = "📄 " + chat.last_message.file_name;
              }
            }
          }

          return {
            name: name,
            time: time,
            lastMsg: snippet,
            unread: chat.unread_count || 0
          };
        });

        const hasGroupChat = formatted.some(c => c.name === "Group Chat" || c.name === "Common Group");
        if (!hasGroupChat) {
          formatted.unshift({
            name: "Common Group",
            time: "Just now",
            lastMsg: "Welcome to Common Group",
            unread: 0
          });
        }

        setRecentChats(formatted.filter(c => c.name === "Group Chat" || !deletedRecentChats.includes(c.name)));
      })
      .catch(err => {
        console.error("Recent chats fetch error:", err);
        setRecentChats([
          { name: "Group Chat", time: "10:27 AM", lastMsg: "Welcome to Group Chat", unread: 0 }
        ]);
      });
  };

  const handleDeleteRecentChat = (chatName: string) => {
    setDeletedRecentChats(prev => {
      const next = [...prev, chatName];
      if (typeof window !== "undefined") {
        localStorage.setItem("fileshare_deleted_chats", JSON.stringify(next));
      }
      return next;
    });
    setRecentChats(prev => prev.filter(c => c.name !== chatName));
    if (activeChat === chatName) {
      setActiveChat("");
    }
    toast.success(`Removed chat with ${chatName}`);
  };

  // Helper formatting methods
  const formatBytes = (bytes: number) => {
    if (bytes === 0 || !bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileExtension = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return (ext || "bin") as any;
  };

  const mapTransferStatus = (status: string) => {
    switch (status) {
      case "transferring": return "Transferring";
      case "completed": return "Completed";
      case "paused": return "Paused";
      case "failed": return "Failed";
      default: return "Pending";
    }
  };

  const formatEta = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [
      hrs.toString().padStart(2, '0'),
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  const loadRealTransfers = (myId = deviceId) => {
    const targetId = myId || deviceId;
    if (!targetId) return;

    fetch(getApiUrl(`/transfers/device_transfers?device_id=${targetId}`))
      .then(res => {
        if (!res.ok) throw new Error("Failed to load transfers");
        return res.json();
      })
      .then((data: any[]) => {
        const formatted = data.map(t => {
          const isSender = t.sender_device?.device_id === targetId || (username && t.sender_device?.username === username);
          const partner = isSender ? t.receiver_device : t.sender_device;
          const partnerName = partner ? (partner.username || partner.device_name) : "Unknown Device";
          const partnerIp = partner ? (partner.ip_address || "192.168.1.1") : "192.168.1.1";
          
          return {
            id: t.id.toString(),
            fileName: t.file_name,
            device: partnerName,
            ip: partnerIp,
            size: formatBytes(t.file_size),
            progressPercent: Math.round(t.progress * 100),
            progressDetail: `${formatBytes(t.file_size * t.progress)} / ${formatBytes(t.file_size)}`,
            speed: t.speed > 0 ? `${t.speed.toFixed(1)} MB/s` : "0.0 MB/s",
            timeLeft: t.eta ? formatEta(t.eta) : "00:00:00",
            status: mapTransferStatus(t.status) as any,
            direction: (isSender ? "send" : "receive") as any,
            type: getFileExtension(t.file_name),
            completedOn: t.status === "completed" ? new Date(t.updated_at).toLocaleString() : undefined
          };
        });
        setTransfers(formatted);
      })
      .catch(() => {
        // Silently catch polling network errors to prevent console spam when backend is reconnecting
      });
  };


  // Sync profile edits with Django
  const [tempAvatarInput, setTempAvatarInput] = useState<string>("");

  const handleSaveProfile = () => {
    const finalUser = editUsernameInput.trim() || "You";
    const finalDevice = editDeviceNameInput.trim() || "LAPTOP-01";

    setUsername(finalUser);
    setDeviceName(finalDevice);
    localStorage.setItem("username", finalUser);
    localStorage.setItem("deviceName", finalDevice);
    if (tempAvatarInput) {
      setUserCustomAvatar(tempAvatarInput);
      localStorage.setItem("fileshare_user_avatar", tempAvatarInput);
    }
    setIsEditModalOpen(false);

    fetch(getApiUrl("/devices/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        device_id: deviceId,
        username: finalUser,
        device_name: finalDevice,
        device_type: "desktop",
        avatar: tempAvatarInput || userCustomAvatar || "avatar_1"
      })
    })
    .then(res => res.json())
    .then(() => {
      handleRefreshDevices();
    })
    .catch(err => console.error("Failed to sync profile:", err));
  };

  // Wallpaper Handlers
  const handleSetWallpaper = (target: "chat" | "global" | "reset") => {
    if (target === "reset") {
      const next = { ...chatWallpapers };
      delete next[activeChat];
      delete next["global"];
      setChatWallpapers(next);
      localStorage.setItem("fileshare_chat_wallpapers", JSON.stringify(next));
      toast.success("Wallpaper reset to default");
    } else if (target === "chat") {
      if (!selectedWallpaperPreview) {
        toast.error("Please choose an image file first");
        return;
      }
      const next = { ...chatWallpapers, [activeChat]: selectedWallpaperPreview };
      setChatWallpapers(next);
      localStorage.setItem("fileshare_chat_wallpapers", JSON.stringify(next));
      toast.success(`Wallpaper updated for ${activeChat}`);
    } else if (target === "global") {
      if (!selectedWallpaperPreview) {
        toast.error("Please choose an image file first");
        return;
      }
      const next = { ...chatWallpapers, global: selectedWallpaperPreview };
      setChatWallpapers(next);
      localStorage.setItem("fileshare_chat_wallpapers", JSON.stringify(next));
      toast.success("Default wallpaper updated for all chats");
    }
    setIsChatWallpaperModalOpen(false);
    setSelectedWallpaperPreview("");
  };

  // Sync refs for WebSocket closures
  React.useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  React.useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  const handleOpenChat = (name: string) => {
    setActiveChat(name);
    setRecentChats(prev => prev.map(c => c.name === name ? { ...c, unread: 0 } : c));
  };

  // Load chat session dynamically from Django
  React.useEffect(() => {
    if (activeChat) {
      setRecentChats(prev => prev.map(c => c.name === activeChat ? { ...c, unread: 0 } : c));
    }
    setActiveChatId(null);
    if (!deviceId || !activeChat) {
      return;
    }

    if (activeChat === "Common Group" || activeChat === "Group Chat" || activeChat === "Project-Group") {
      fetch(getApiUrl("/chats/get_or_create_group"), {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      })
      .then(res => res.json())
      .then(chatObj => {
        setActiveChatId(chatObj.id);
        fetch(getApiUrl(`/chats/${chatObj.id}/messages`))
          .then(res => res.json())
          .then((msgData: any[]) => {
            const loggedInUserId = localStorage.getItem("fileshare_logged_in_userid") || "";
            const formatted = msgData
              .filter(m => !m.is_deleted && !deletedMessageIdsRef.current.includes(String(m.id)))
              .map(m => {
                const isYou = (m.sender_user_id && String(m.sender_user_id) === String(loggedInUserId)) || 
                              (m.sender_name && m.sender_name === username) || 
                              (m.sender_device_id && m.sender_device_id === deviceId);
                return {
                  id: String(m.id),
                  sender: isYou ? "you" as const : "other" as const,
                  sender_user_id: m.sender_user_id,
                  text: m.text,
                  time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  file: m.file,
                  file_name: m.file_name,
                  file_size: m.file_size,
                  file_type: m.file_type,
                  is_read: m.is_read
                };
              });
            setChatMessages(prev => ({
              ...prev,
              [activeChat]: formatted
            }));
          });
      })
      .catch(err => console.error("Group chat session error:", err));
      return;
    }

    fetch(getApiUrl("/devices/online_devices"))
      .then(res => res.json())
      .then((data: any[]) => {
        let targetDevice = data.find(d => {
          const displayName = (d.username && d.username.trim() !== "" && d.username !== "You") ? d.username : d.device_name;
          return displayName === activeChat;
        });

        if (!targetDevice) {
          targetDevice = data.find(d => d.device_name === activeChat || d.username === activeChat);
        }

        if (targetDevice) {
          fetch(getApiUrl("/chats/get_or_create_direct"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sender_id: deviceId,
              receiver_id: targetDevice.device_id
            })
          })
          .then(res => res.json())
          .then(chatObj => {
            if (!chatObj || !chatObj.id) {
              console.error("Failed to get or create chat:", chatObj);
              return;
            }
            setActiveChatId(chatObj.id);
            
            // Mark chat as read
            fetch(getApiUrl(`/chats/${chatObj.id}/mark_as_read`), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ user_id: deviceId })
            }).catch(() => {});

            // Fetch initial messages
            fetch(getApiUrl(`/chats/${chatObj.id}/messages`))
              .then(res => res.json())
              .then((msgData: any) => {
                if (!Array.isArray(msgData)) {
                  console.error("Expected message list array, got:", msgData);
                  return;
                }
                const loggedInUserId = localStorage.getItem("fileshare_logged_in_userid") || "";
                const formatted = msgData
                  .filter(m => !m.is_deleted && !deletedMessageIdsRef.current.includes(String(m.id)))
                  .map(m => {
                    const isYou = (m.sender_user_id && String(m.sender_user_id) === String(loggedInUserId)) || 
                                  (m.sender_name && m.sender_name === username) || 
                                  (m.sender_device_id && m.sender_device_id === deviceId);
                    return {
                      id: String(m.id),
                      sender: isYou ? "you" as const : "other" as const,
                      sender_user_id: m.sender_user_id,
                      text: m.text,
                      time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      file: m.file,
                      file_name: m.file_name,
                      file_size: m.file_size,
                      file_type: m.file_type,
                      is_read: m.is_read
                    };
                  });
                setChatMessages(prev => ({
                  ...prev,
                  [activeChat]: formatted
                }));
              });
          });
        } else {
          // Fallback lookup from user's chats list for offline devices
          fetch(getApiUrl(`/chats/device_chats?device_id=${deviceId}`))
            .then(res => res.json())
            .then((chats: any[]) => {
              if (Array.isArray(chats)) {
                const match = chats.find(c => c.participants_details?.some((p: any) => p.username === activeChat || p.device_name === activeChat));
                if (match) {
                  setActiveChatId(match.id);
                  fetch(getApiUrl(`/chats/${match.id}/messages`))
                    .then(res => res.json())
                    .then((msgData: any[]) => {
                      const loggedInUserId = localStorage.getItem("fileshare_logged_in_userid") || "";
                      const formatted = msgData
                        .filter(m => !m.is_deleted && !deletedMessageIdsRef.current.includes(String(m.id)))
                        .map(m => {
                          const isYou = (m.sender_user_id && String(m.sender_user_id) === String(loggedInUserId)) || 
                                        (m.sender_name && m.sender_name === username) || 
                                        (m.sender_device_id && m.sender_device_id === deviceId);
                          return {
                            id: String(m.id),
                            sender: isYou ? "you" as const : "other" as const,
                            text: m.text,
                            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            file: m.file,
                            file_name: m.file_name,
                            file_size: m.file_size,
                            file_type: m.file_type
                          };
                        });
                      setChatMessages(prev => ({
                        ...prev,
                        [activeChat]: formatted
                      }));
                    });
                }
              }
            }).catch(() => {});
        }
      })
      .catch(() => {});
  }, [activeChat, deviceId]);

  // WebSocket manager for real-time messages & presence status updates
  React.useEffect(() => {
    if (!deviceId) return;

    const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const port = typeof window !== "undefined" && window.location.port ? `:${window.location.port}` : "";
    const wsUrl = `${protocol}//${hostname}${port}/ws/communication/${deviceId}/`;

    console.log("Connecting WebSocket to:", wsUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connection established successfully.");
      handleRefreshDevices();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received WS event:", data);

        if (data.type === "presence") {
          // Immediately sync when presence updates
          handleRefreshDevices();
        } else if (data.type === "chat_message") {
          const msg = data.message;
          const loggedInUserId = localStorage.getItem("fileshare_logged_in_userid") || "";
          const formattedMsg = {
            id: String(msg.id),
            sender: String(msg.sender_user_id) === String(loggedInUserId) ? ("you" as const) : ("other" as const),
            sender_user_id: msg.sender_user_id,
            text: msg.text,
            time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            file: msg.file,
            file_name: msg.file_name,
            file_size: msg.file_size,
            file_type: msg.file_type,
            reply_to_text: msg.reply_to_text,
            reply_to_sender: msg.reply_to_sender,
            is_read: msg.is_read
          };


          // Play notification sound if message is from someone else
          if (String(msg.sender_user_id) !== String(loggedInUserId)) {
            try {
              const isChatActive = activeChatIdRef.current === msg.chat_id && (typeof document !== "undefined" && !document.hidden);
              const soundFile = isChatActive ? '/tone.mp3' : '/notification.mp3';
              const audio = new Audio(soundFile);
              audio.play().catch(e => console.log("Audio play deferred or blocked:", e));
            } catch (e) {
              console.error("Audio error:", e);
            }
          }

          if (activeChatIdRef.current === msg.chat_id) {
            // Mark as read immediately on server if we are the receiver
            if (String(msg.sender_user_id) !== String(loggedInUserId)) {
              fetch(getApiUrl(`/chats/${msg.chat_id}/mark_as_read`), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: deviceId })
              }).catch(() => {});
            }

            setChatMessages(prev => {
              const currentMessages = prev[activeChatRef.current] || [];
              if (currentMessages.some(m => m.id === formattedMsg.id)) return prev;
              
              // Filter out temporary optimistic message to prevent double bubbles
              let filteredMessages = currentMessages;
              if (String(msg.sender_user_id) === String(loggedInUserId)) {
                const tempIdx = currentMessages.findIndex(m => m.id.startsWith("temp-") && m.text === formattedMsg.text);
                if (tempIdx !== -1) {
                  filteredMessages = currentMessages.filter((_, idx) => idx !== tempIdx);
                }
              }

              return {
                ...prev,
                [activeChatRef.current]: [...filteredMessages, { ...formattedMsg, is_read: String(msg.sender_user_id) !== String(loggedInUserId) }]
              };
            });
          }
          loadRecentChats();
        } else if (data.type === "read_receipt") {
          const { message_id } = data;
          setChatMessages(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(chatName => {
              next[chatName] = next[chatName].map(m => 
                m.id === String(message_id) ? { ...m, is_read: true } : m
              );
            });
            return next;
          });
        } else if (data.type === "typing") {
          console.log("Received typing event:", data, "activeChatId:", activeChatIdRef.current, "activeChat:", activeChatRef.current);
          if (data.sender_id !== deviceId) {
            fetch(getApiUrl("/devices/online_devices"))
              .then(res => res.json())
              .then((devicesList: any[]) => {
                const typingUserObj = devicesList.find(d => d.device_id === data.sender_id);
                if (typingUserObj) {
                  const displayName = (typingUserObj.username && typingUserObj.username.trim() !== "" && typingUserObj.username !== "You") ? typingUserObj.username : typingUserObj.device_name;
                  
                  const isCurrentChat = data.chat_id 
                    ? String(data.chat_id) === String(activeChatIdRef.current)
                    : activeChatRef.current === displayName;

                  if (isCurrentChat) {
                    if (data.is_typing) {
                      setTypingUsers(prev => prev.includes(displayName) ? prev : [...prev, displayName]);
                    } else {
                      setTypingUsers(prev => prev.filter(name => name !== displayName));
                    }
                  }
                }
              });
          }
        } else if (data.type === "signal") {
          handleWebRTCSignal(data.sender_id, data.sub_type, data.data);
        }
      } catch (err) {
        console.error("Failed to parse WS payload:", err);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    // Keep backend registration fresh
    const registerInterval = setInterval(() => {
      if (deviceId && username && deviceName) {
        fetch(getApiUrl("/devices/register"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            device_id: deviceId,
            username: username,
            device_name: deviceName,
            device_type: "desktop",
            avatar: userCustomAvatar || "avatar_1"
          })
        }).catch(() => {});
      }
    }, 6000);

    return () => {
      clearInterval(registerInterval);
      ws.close();
    };
  }, [deviceId, username, deviceName]);

  // Periodic polling fallback (extremely low frequency to reduce overhead)
  React.useEffect(() => {
    if (!activeChatId) return;

    const interval = setInterval(() => {
      fetch(getApiUrl(`/chats/${activeChatId}/messages`))
        .then(res => res.json())
        .then((msgData: any[]) => {
          const loggedInUserId = localStorage.getItem("fileshare_logged_in_userid") || "";
          const formatted = msgData
            .filter(m => !m.is_deleted && !deletedMessageIdsRef.current.includes(String(m.id)))
            .map(m => {
              const isYou = (m.sender_user_id && String(m.sender_user_id) === String(loggedInUserId)) || 
                            (m.sender_name && m.sender_name === username) || 
                            (m.sender_device_id && m.sender_device_id === deviceId);
              return {
                id: String(m.id),
                sender: isYou ? "you" as const : "other" as const,
                text: m.text,
                time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                file: m.file,
                file_name: m.file_name,
                file_size: m.file_size,
                file_type: m.file_type,
                is_read: m.is_read
              };
            });

          setChatMessages(prev => ({
            ...prev,
            [activeChat]: formatted
          }));
        })
        .catch(() => {});
    }, 6000);

    return () => clearInterval(interval);
  }, [activeChatId, deviceId, activeChat]);

  // Periodic polling for transfers list (real data sync)
  React.useEffect(() => {
    if (!deviceId) return;
    loadRealTransfers(deviceId);
    const interval = setInterval(() => {
      loadRealTransfers(deviceId);
    }, 4000);
    return () => clearInterval(interval);
  }, [deviceId, activePage]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    
    console.log("handleInputChange - value:", e.target.value, "activeChatId:", activeChatId, "ws status:", wsRef.current?.readyState);
    if (activeChatId && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      if (!isTypingLocal) {
        setIsTypingLocal(true);
        console.log("Sending typing start event over WS...");
        wsRef.current.send(JSON.stringify({
          type: "typing",
          chat_id: activeChatId,
          is_typing: true
        }));
      }
    }
  };

  // Reset typing indicators
  React.useEffect(() => {
    const clearTyping = () => {
      if (isTypingLocal && activeChatId) {
        setIsTypingLocal(false);
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: "typing",
            chat_id: activeChatId,
            is_typing: false
          }));
        }
      }
    };

    if (!messageInput.trim() && isTypingLocal) {
      clearTyping();
    }

    const delayDebounceFn = setTimeout(() => {
      clearTyping();
    }, 3000);

    return () => clearTimeout(delayDebounceFn);
  }, [messageInput, isTypingLocal, activeChatId]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    const inputVal = messageInput;
    setMessageInput("");

    const replyData = replyingTo ? {
      reply_to_text: replyingTo.text || replyingTo.file_name || "Attachment",
      reply_to_sender: replyingTo.sender
    } : {};
    setReplyingTo(null);

    const localMsg: ChatMessage = {
      id: "temp-" + Date.now(),
      sender: "you",
      text: inputVal,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...replyData
    };

    setChatMessages(prev => {
      const current = prev[activeChat] || [];
      return {
        ...prev,
        [activeChat]: [...current, localMsg]
      };
    });

    // Send via WebSocket if available, otherwise fallback to HTTP POST
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "chat_message",
        chat_id: activeChatId,
        text: inputVal,
        ...replyData
      }));
    } else if (activeChatId) {
      fetch(getApiUrl(`/chats/${activeChatId}/send_message`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_id: deviceId,
          text: inputVal,
          ...replyData
        })
      }).catch(() => {});
    }
  };


  const handleWebRTCSignal = async (senderId: string, subType: string, signalData: any) => {
    try {
      let pc = p2pFilePeerConnectionsRef.current[senderId];
      if (!pc || pc.signalingState === "closed") {
        const currentHost = typeof window !== "undefined" ? window.location.hostname : "localhost";
        pc = new RTCPeerConnection({
          iceServers: [
            { urls: `turn:${currentHost}:3478?transport=udp`, username: "fileshare", credential: "fileshare_password" },
            { urls: `turn:${currentHost}:3478?transport=tcp`, username: "fileshare", credential: "fileshare_password" },
            { urls: "stun:stun.l.google.com:19302" }
          ]
        });
        p2pFilePeerConnectionsRef.current[senderId] = pc;

        pc.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
          if (e.candidate && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: "signal",
              target_id: senderId,
              sub_type: "candidate",
              call_type: "file",
              data: e.candidate
            }));
          }
        };

        pc.ondatachannel = (e: RTCDataChannelEvent) => {
          const dc = e.channel;
          dc.binaryType = "arraybuffer";
          let fileMeta: any = null;
          let chunks: ArrayBuffer[] = [];
          let receivedSize = 0;

          dc.onmessage = (evt: MessageEvent) => {
            if (typeof evt.data === "string") {
              try {
                fileMeta = JSON.parse(evt.data);
                chunks = [];
                receivedSize = 0;
              } catch {}
            } else if (evt.data instanceof ArrayBuffer) {
              chunks.push(evt.data);
              receivedSize += evt.data.byteLength;
              if (fileMeta && receivedSize >= fileMeta.size) {
                const blob = new Blob(chunks, { type: fileMeta.type || "application/octet-stream" });
                const blobUrl = URL.createObjectURL(blob);
                
                const receivedMsg: ChatMessage = {
                  id: "p2p-rx-" + Date.now() + "-" + Math.random().toString(36).substring(2, 5),
                  sender: "other",
                  text: `Shared attachment: ${fileMeta.name}`,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  file: blobUrl,
                  file_name: fileMeta.name,
                  file_size: fileMeta.size,
                  file_type: fileMeta.type
                };

                setChatMessages(prev => {
                  const current = prev[activeChatRef.current] || [];
                  return {
                    ...prev,
                    [activeChatRef.current]: [...current, receivedMsg]
                  };
                });
                toast.success(`Received P2P file: ${fileMeta.name}`);
              }
            }
          };
        };
      }

      if (subType === "offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(signalData));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: "signal",
            target_id: senderId,
            sub_type: "answer",
            call_type: "file",
            data: answer
          }));
        }
      } else if (subType === "answer") {
        await pc.setRemoteDescription(new RTCSessionDescription(signalData));
      } else if (subType === "candidate") {
        await pc.addIceCandidate(new RTCIceCandidate(signalData)).catch(() => {});
      }
    } catch (err) {
      console.error("WebRTC Signaling error:", err);
    }
  };

  const sendFilesList = (files: FileList | File[]) => {
    if (!files || files.length === 0 || !activeChat) return;

    const fileArray = Array.from(files);

    // 1. Render local message bubbles for instant sender preview
    fileArray.forEach(file => {
      const localBlobUrl = URL.createObjectURL(file);
      const localMsg: ChatMessage = {
        id: "tx-temp-" + Date.now() + "-" + Math.random().toString(36).substring(2, 5),
        sender: "you",
        text: `Shared attachment: ${file.name}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        file: localBlobUrl,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type
      };

      setChatMessages(prev => {
        const current = prev[activeChat] || [];
        return {
          ...prev,
          [activeChat]: [...current, localMsg]
        };
      });
    });

    // 2. Upload via Django backend endpoint if activeChatId is available
    if (activeChatId) {
      const formData = new FormData();
      formData.append("sender_id", deviceId);
      fileArray.forEach(file => {
        formData.append("files", file);
      });

      fetch(getApiUrl(`/chats/${activeChatId}/upload_attachment`), {
        method: "POST",
        body: formData
      })
      .then(res => {
        if (!res.ok) throw new Error("Upload failed");
        return res.json();
      })
      .then(() => {
        toast.success(`Sent ${fileArray.length} file(s)`);
        loadRealTransfers(deviceId);
        loadRecentChats(deviceId);
      })
      .catch(err => {
        console.error("Attachment upload error:", err);
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      sendFilesList(e.target.files);
    }
  };

  // Mock State Data

  // Mock State Data
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [recentFiles, setRecentFiles] = useState<RecentFileItem[]>([]);
  const [myFiles, setMyFiles] = useState<MyFileItem[]>([]);
  const [receivedFiles, setReceivedFiles] = useState<ReceivedFileItem[]>([]);
  const [transfers, setTransfers] = useState<TransferItem[]>([]);

  React.useEffect(() => {
    if (transfers.length === 0) return;

    // Derived receivedFiles
    const rx = transfers
      .filter(t => t.direction === "receive" && t.status === "Completed")
      .map((t, idx) => ({
        id: `rc-${idx}`,
        fileName: t.fileName,
        device: t.device,
        ip: t.ip,
        type: t.type.toUpperCase() as any,
        size: t.size,
        timeReceived: t.completedOn || "Just now",
        status: "Downloaded" as const
      }));
    setReceivedFiles(rx);

    // Derived myFiles (All files shared on this device)
    const my = transfers
      .map((t, idx) => ({
        id: `mf-${idx}`,
        name: t.fileName,
        type: t.type.toUpperCase() as any,
        size: t.size,
        dateModified: t.completedOn || "Just now"
      }));
    setMyFiles(my);

    // Derived recentActivities
    const act = transfers.slice(0, 5).map((t, idx) => ({
      id: `act-${idx}`,
      type: t.direction as any,
      fileName: t.fileName,
      device: t.device,
      time: t.completedOn ? t.completedOn.split(',').pop()?.trim() || "Just now" : "Just now",
      size: t.size
    }));
    setRecentActivities(act);

    // Derived recentFiles
    const rf = transfers
      .filter(t => t.status === "Completed")
      .slice(0, 5)
      .map((t, idx) => ({
        id: `rf-${idx}`,
        fileName: t.fileName,
        size: t.size,
        time: t.completedOn ? t.completedOn.split(',').pop()?.trim() || "Just now" : "Just now",
        type: t.type
      }));
    setRecentFiles(rf);
  }, [transfers]);

  // Total counts helper
  const storageTotal = 20;
  const storageUsed = Number((myFiles.length * 0.15).toFixed(2)) || 0.05;
  const storagePercentage = Math.max(1, Math.round((storageUsed / storageTotal) * 100));

  // Activity functions
  const handleDeleteActivity = (id: string) => {
    setRecentActivities(prev => prev.filter(item => item.id !== id));
  };

  const handleDeleteRecentFile = (id: string) => {
    setRecentFiles(prev => prev.filter(item => item.id !== id));
  };

  // My Files selection functions
  const handleToggleSelectAllFiles = () => {
    const isAllSelected = myFiles.every(f => selectedMyFiles[f.id]);
    const updated: Record<string, boolean> = {};
    if (!isAllSelected) {
      myFiles.forEach(f => {
        updated[f.id] = true;
      });
    }
    setSelectedMyFiles(updated);
  };

  const handleToggleSelectFile = (id: string) => {
    setSelectedMyFiles(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleDeleteMyFile = (id: string) => {
    setMyFiles(prev => prev.filter(item => item.id !== id));
  };

  // Received Files functions
  const handleDeleteReceivedFile = (id: string) => {
    setReceivedFiles(prev => prev.filter(item => item.id !== id));
  };

  const handleDownloadReceivedFile = (id: string) => {
    setReceivedFiles(prev =>
      prev.map(item => (item.id === id ? { ...item, status: "Downloaded" as const } : item))
    );
  };

  // Transfer actions
  const handleTogglePauseTransfer = (id: string) => {
    setTransfers(prev =>
      prev.map(item => {
        if (item.id === id) {
          const nextStatus = item.status === "Transferring" ? "Paused" : "Transferring";
          return {
            ...item,
            status: nextStatus as any,
            speed: nextStatus === "Paused" ? "0.0 MB/s" : "2.2 MB/s"
          };
        }
        return item;
      })
    );
  };

  const handleCancelTransfer = (id: string) => {
    setTransfers(prev => prev.filter(item => item.id !== id));
  };

  // Helper file icons selector
  const getFileIconComponent = (type: string) => {
    const t = type.toLowerCase();
    if (t === "folder") return { icon: FolderOpen, className: styles.folderIcon };
    if (t === "pptx") return { icon: FileText, className: styles.pptxIcon };
    if (t === "mp4") return { icon: Play, className: styles.mp4Icon };
    if (t === "zip") return { icon: FolderArchive, className: styles.zipIcon };
    if (t === "image" || t === "jpg" || t === "png") return { icon: ImageIcon, className: styles.imageIcon };
    if (t === "txt") return { icon: FileText, className: styles.txtIcon };
    if (t === "pdf") return { icon: FileText, className: styles.pdfIcon };
    if (t === "rar") return { icon: FolderArchive, className: styles.rarIcon };
    if (t === "mp3" || t === "audio") return { icon: Volume2, className: styles.mp4Icon };
    return { icon: FileText, className: styles.txtIcon };
  };

  const handlePreviewFile = (fileName: string, fileType?: string, customUrl?: string) => {
    let url = customUrl;
    if (!url) {
      url = `/media/chat_attachments/${fileName}`;
    }
    setLightboxData({
      url,
      fileName
    });
    setLightboxFilter("none");
    setLightboxRotation(0);
  };

  const renderFileThumbnail = (fileName: string, fileType: string, customUrl?: string, iconSize = 18, styleOverride?: React.CSSProperties) => {
    const { icon: IconComponent, className } = getFileIconComponent(fileType || "");
    const ext = (fileName.split('.').pop() || "").toLowerCase();
    const typeLower = (fileType || "").toLowerCase();
    const isImage = ["jpg", "png", "jpeg", "webp", "gif", "svg", "image"].includes(typeLower) ||
                    ["jpg", "png", "jpeg", "webp", "gif", "svg"].includes(ext);

    let src = customUrl;
    if (!src) {
      src = `/media/chat_attachments/${fileName}`;
    }

    if (isImage) {
      return (
        <div 
          className={`${styles.fileIconWrapper} ${className}`}
          onClick={(e) => {
            e.stopPropagation();
            handlePreviewFile(fileName, fileType, customUrl);
          }}
          title="Click to view image preview"
          style={{ 
            position: "relative", 
            overflow: "hidden", 
            cursor: "pointer", 
            padding: 0,
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            ...styleOverride
          }}
        >
          <img 
            src={src} 
            alt={fileName} 
            onError={(e) => {
              const target = e.currentTarget;
              const directMedia = `/media/${fileName}`;
              if (target.src !== directMedia && target.src.includes("/chat_attachments/")) {
                target.src = directMedia;
              } else {
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent) {
                  parent.style.padding = "8px";
                  parent.innerHTML = `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`;
                }
              }
            }}
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }}
          />
        </div>
      );
    }

    return (
      <div className={`${styles.fileIconWrapper} ${className}`} style={styleOverride}>
        <IconComponent size={iconSize} />
      </div>
    );
  };

  // Dynamic Filtering for My Files Page
  const filteredMyFiles = useMemo(() => {
    return myFiles.filter(item => {
      // Search match
      const matchesSearch = item.name.toLowerCase().includes(myFilesSearch.toLowerCase());
      if (!matchesSearch) return false;

      // Category match
      if (myFilesCategory === "All") return true;
      const typeLower = item.type.toLowerCase();
      if (myFilesCategory === "Documents") {
        return ["pdf", "pptx", "txt"].includes(typeLower);
      }
      if (myFilesCategory === "Images") {
        return ["jpg", "png"].includes(typeLower);
      }
      if (myFilesCategory === "Videos") {
        return ["mp4"].includes(typeLower);
      }
      if (myFilesCategory === "Audio") {
        return ["mp3"].includes(typeLower);
      }
      if (myFilesCategory === "Archives") {
        return ["zip", "rar"].includes(typeLower);
      }
      if (myFilesCategory === "Others") {
        return !["folder", "pdf", "pptx", "txt", "jpg", "png", "mp4", "mp3", "zip", "rar"].includes(typeLower);
      }
      return true;
    });
  }, [myFiles, myFilesSearch, myFilesCategory]);

  // Dynamic Filtering for Received Page
  const filteredReceivedFiles = useMemo(() => {
    return receivedFiles.filter(item => {
      // Search match
      const matchesSearch = item.fileName.toLowerCase().includes(receivedSearch.toLowerCase()) || 
                            item.device.toLowerCase().includes(receivedSearch.toLowerCase());
      if (!matchesSearch) return false;

      // Category match
      if (receivedCategory === "All") return true;
      if (receivedCategory === "Today") {
        return item.timeReceived.includes("Today");
      }
      const typeLower = item.type.toLowerCase();
      if (receivedCategory === "Images") {
        return ["jpg", "png"].includes(typeLower);
      }
      if (receivedCategory === "Documents") {
        return ["pdf", "pptx", "txt"].includes(typeLower);
      }
      if (receivedCategory === "Videos") {
        return ["mp4"].includes(typeLower);
      }
      if (receivedCategory === "Archives") {
        return ["zip", "rar"].includes(typeLower);
      }
      return true;
    });
  }, [receivedFiles, receivedSearch, receivedCategory]);

  // Dynamic Filtering for Transfers Page
  const filteredTransfersInProgress = useMemo(() => {
    return transfers.filter(item => {
      if (item.status !== "Transferring" && item.status !== "Paused") return false;
      const matchesSearch = item.fileName.toLowerCase().includes(transfersSearch.toLowerCase()) ||
                            item.device.toLowerCase().includes(transfersSearch.toLowerCase());
      if (!matchesSearch) return false;
      if (transfersTab === "In Progress") return true;
      if (transfersTab === "All Transfers") return true;
      return false;
    });
  }, [transfers, transfersSearch, transfersTab]);

  const filteredTransfersCompleted = useMemo(() => {
    return transfers.filter(item => {
      if (item.status !== "Completed") return false;
      const matchesSearch = item.fileName.toLowerCase().includes(transfersSearch.toLowerCase()) ||
                            item.device.toLowerCase().includes(transfersSearch.toLowerCase());
      if (!matchesSearch) return false;
      if (transfersTab === "Completed") return true;
      if (transfersTab === "All Transfers") return true;
      return false;
    });
  }, [transfers, transfersSearch, transfersTab]);

  const filteredTransfersFailed = useMemo(() => {
    return transfers.filter(item => {
      if (item.status !== "Failed") return false;
      const matchesSearch = item.fileName.toLowerCase().includes(transfersSearch.toLowerCase()) ||
                            item.device.toLowerCase().includes(transfersSearch.toLowerCase());
      if (!matchesSearch) return false;
      if (transfersTab === "Failed") return true;
      if (transfersTab === "All Transfers") return true;
      return false;
    });
  }, [transfers, transfersSearch, transfersTab]);


  // ----------------------------------------------------
  // RENDER VIEW: Dashboard UI (ui (2).jpeg)
  // ----------------------------------------------------
  const renderDashboard = () => {
    return (
      <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {/* Header Section */}
        <div className={styles.pageHeader}>
          <div className={styles.titleArea}>
            <h1>Welcome back! 👋</h1>
            <span className={styles.subtitle}>Here&apos;s what&apos;s happening in your FileShare network.</span>
          </div>
          <div className={styles.headerControls}>
            <div className={styles.subSearchWrapper}>
              <Search className={styles.subSearchIcon} />
              <input
                type="text"
                placeholder="Search activity..."
                className={styles.subSearchInput}
                value={dashboardSearch}
                onChange={e => setDashboardSearch(e.target.value)}
              />
            </div>
            <button className={styles.controlButton} title="Filters"><Filter size={16} /></button>
            <button className={styles.controlButton} title="Options"><MoreVertical size={16} /></button>
          </div>
        </div>

        {/* Stats Grid Widget */}
        <div className={styles.dashboardSection}>
          <div className={styles.dashboardStatsGrid}>
            {/* Total Files Card */}
            <div className={styles.quickActionCard} style={{ flexDirection: "row", justifyContent: "flex-start", padding: "20px 24px", cursor: "pointer" }} onClick={() => setActivePage("My Files")}>
              <div className={styles.actionIconWrapper} style={{ width: "48px", height: "48px", borderRadius: "12px" }}>
                <FolderOpen size={20} strokeWidth={2.5} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", textAlign: "left", gap: "4px" }}>
                <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>Total Files</span>
                <span style={{ fontSize: "26px", fontWeight: 700, fontFamily: "var(--font-family-outfit)", color: "var(--text-primary)", lineHeight: 1.1 }}>{myFiles.length}</span>
                <span style={{ fontSize: "12px", color: "var(--success)", fontWeight: 600 }}>Real-time sync</span>
              </div>
            </div>

            {/* Total Transfers Card */}
            <div className={styles.quickActionCard} style={{ flexDirection: "row", justifyContent: "flex-start", padding: "20px 24px", cursor: "pointer" }} onClick={() => setActivePage("Transfers")}>
              <div className={styles.actionIconWrapper} style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "rgba(94, 92, 230, 0.08)" }}>
                <Activity size={20} strokeWidth={2.5} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", textAlign: "left", gap: "4px" }}>
                <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>Total Transfers</span>
                <span style={{ fontSize: "26px", fontWeight: 700, fontFamily: "var(--font-family-outfit)", color: "var(--text-primary)", lineHeight: 1.1 }}>{transfers.length}</span>
                <span style={{ fontSize: "12px", color: "var(--success)", fontWeight: 600 }}>Active history</span>
              </div>
            </div>

            {/* Storage Card */}
            <div className={styles.quickActionCard} style={{ flexDirection: "row", justifyContent: "flex-start", padding: "20px 24px", cursor: "default" }}>
              <div className={styles.actionIconWrapper} style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "rgba(59, 130, 246, 0.08)", color: "var(--info)" }}>
                <HardDrive size={20} strokeWidth={2.5} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", textAlign: "left", gap: "4px" }}>
                <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>Storage Used</span>
                <span style={{ fontSize: "26px", fontWeight: 700, fontFamily: "var(--font-family-outfit)", color: "var(--text-primary)", lineHeight: 1.1 }}>{myFiles.length * 2.5 > 1024 ? `${((myFiles.length * 2.5) / 1024).toFixed(1)} GB` : `${(myFiles.length * 2.5).toFixed(0)} MB`}</span>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>Local disk</span>
              </div>
            </div>

            {/* Connected Devices Card */}
            <div className={styles.quickActionCard} style={{ flexDirection: "row", justifyContent: "flex-start", padding: "20px 24px", cursor: "pointer" }} onClick={() => setActivePage("Devices")}>
              <div className={styles.actionIconWrapper} style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "rgba(94, 92, 230, 0.08)", color: "var(--primary)" }}>
                <Laptop size={20} strokeWidth={2.5} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", textAlign: "left", gap: "4px" }}>
                <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>Connected Devices</span>
                <span style={{ fontSize: "26px", fontWeight: 700, fontFamily: "var(--font-family-outfit)", color: "var(--text-primary)", lineHeight: 1.1 }}>{devicesList.length || nearbyDevices.length}</span>
                <span style={{ fontSize: "12px", color: "var(--success)", fontWeight: 600 }}>{nearbyDevices.filter(d => d.status === "online").length + 1} online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className={styles.dashboardGrid}>
          {/* Recent Activity Column */}
          <div className={styles.dashboardSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Recent Activity</span>
              <button className={styles.sectionLink} onClick={() => setActivePage("Transfers")}>View All</button>
            </div>
            <div className={styles.listCard}>
              {recentActivities.map((act) => (
                <div key={act.id} className={styles.listItem}>
                  <div className={styles.itemLeft}>
                    <span
                      className={styles.itemDot}
                      style={{ backgroundColor: act.type === "sent" ? "var(--primary)" : "var(--success)" }}
                    />
                    <div className={styles.itemDetails}>
                      <span className={styles.itemTitle}>
                        {act.type === "sent" ? "Sent " : "Received "}
                        <strong>{act.fileName}</strong>
                        {act.type === "sent" ? " to " : " from "}
                        <strong>{act.device}</strong>
                      </span>
                    </div>
                  </div>
                  <div className={styles.itemRight}>
                    <span className={styles.itemValue}>{act.time}</span>
                    <span className={styles.itemMeta}>{act.size}</span>
                  </div>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <div style={{ padding: "32px", textAlign: "center", color: "var(--text-secondary)" }}>No recent activity.</div>
              )}
            </div>
          </div>

          {/* Recent Files Column */}
          <div className={styles.dashboardSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Recent Files</span>
              <button className={styles.sectionLink} onClick={() => setActivePage("My Files")}>View All</button>
            </div>
            <div className={styles.listCard}>
              {recentFiles.map((file) => {
                return (
                  <div key={file.id} className={styles.listItem}>
                    <div className={styles.itemLeft}>
                      {renderFileThumbnail(file.fileName, file.type, (file as any).url, 16, { width: "32px", height: "32px", borderRadius: "6px" })}
                      <div className={styles.itemDetails}>
                        <span className={styles.itemTitle}>{file.fileName}</span>
                      </div>
                    </div>
                    <div className={styles.itemRight}>
                      <span className={styles.itemValue}>{file.time}</span>
                      <span className={styles.itemMeta}>{file.size}</span>
                    </div>
                  </div>
                );
              })}
              {recentFiles.length === 0 && (
                <div style={{ padding: "32px", textAlign: "center", color: "var(--text-secondary)" }}>No recent files.</div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: Storage Overview & Quick Actions */}
        <div className={styles.dashboardGrid}>
          {/* Storage Overview Widget */}
          <div className={styles.dashboardSection}>
            <span className={styles.sectionTitle}>Storage Overview</span>
            <div className={styles.storageOverviewCard}>
              <div className={styles.chartContainer}>
                {/* SVG circular progress meter */}
                <svg width="120" height="120" className={styles.chartCircleSvg}>
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="transparent"
                    stroke="var(--border-color)"
                    strokeWidth="10"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="transparent"
                    stroke="var(--primary)"
                    strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - storageUsed / storageTotal)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className={styles.chartText}>
                  <span className={styles.chartPercentage}>{storagePercentage}%</span>
                  <span className={styles.chartLabel}>Used</span>
                </div>
              </div>

              <div className={styles.storageLegend}>
                <div className={styles.storageLegendHeader}>
                  <span className={styles.storageLegendTitle}>{storageUsed} GB</span>
                  <span className={styles.storageLegendSubtitle}>Used of {storageTotal} GB</span>
                </div>
                <div className={styles.legendItemsList}>
                  <div className={styles.legendItem}>
                    <div className={styles.legendNameWrapper}>
                      <span className={styles.legendColorIndicator} style={{ backgroundColor: "var(--primary)" }} />
                      <span>Files</span>
                    </div>
                    <span className={styles.legendValue}>2.20 GB</span>
                  </div>
                  <div className={styles.legendItem}>
                    <div className={styles.legendNameWrapper}>
                      <span className={styles.legendColorIndicator} style={{ backgroundColor: "var(--primary-muted)" }} />
                      <span>Others</span>
                    </div>
                    <span className={styles.legendValue}>250 MB</span>
                  </div>
                </div>
                <button className={styles.manageStorageBtn}>Manage Storage</button>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className={styles.dashboardSection}>
            <span className={styles.sectionTitle}>Quick Actions</span>
            <div className={styles.quickActionsGrid}>
              <button className={styles.quickActionCard} onClick={() => setActivePage("Transfers")}>
                <div className={styles.actionIconWrapper}>
                  <Send size={18} />
                </div>
                <span className={styles.actionLabel}>Send Files</span>
              </button>

              <button className={styles.quickActionCard} onClick={() => setActivePage("Received")}>
                <div className={styles.actionIconWrapper}>
                  <ArrowDown size={18} />
                </div>
                <span className={styles.actionLabel}>Receive Files</span>
              </button>

              <button className={styles.quickActionCard} onClick={() => setActivePage("Chats")}>
                <div className={styles.actionIconWrapper}>
                  <MessageSquare size={18} />
                </div>
                <span className={styles.actionLabel}>New Chat</span>
              </button>

              <button className={styles.quickActionCard} onClick={() => setActivePage("My Files")}>
                <div className={styles.actionIconWrapper}>
                  <FolderOpen size={18} />
                </div>
                <span className={styles.actionLabel}>My Files</span>
              </button>

              <button className={styles.quickActionCard} onClick={() => setActivePage("Devices")}>
                <div className={styles.actionIconWrapper}>
                  <Monitor size={18} />
                </div>
                <span className={styles.actionLabel}>Nearby Devices</span>
              </button>

              <button className={styles.quickActionCard} onClick={() => setActivePage("Settings")}>
                <div className={styles.actionIconWrapper}>
                  <Settings size={18} />
                </div>
                <span className={styles.actionLabel}>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };


  // ----------------------------------------------------
  // RENDER VIEW: My Files UI (ui (3).jpeg)
  // ----------------------------------------------------
  const renderMyFiles = () => {
    const totalFilesCount = myFiles.length;
    const imagesCount = myFiles.filter(f => ["PNG", "JPG", "JPEG", "GIF", "WEBP", "SVG", "IMAGE"].includes(String(f.type).toUpperCase())).length;
    const docsCount = myFiles.filter(f => ["PDF", "DOC", "DOCX", "TXT", "PPTX", "XLSX", "DOCUMENT"].includes(String(f.type).toUpperCase())).length;
    const archivesCount = myFiles.filter(f => ["ZIP", "RAR", "7Z", "TAR", "ARCHIVE"].includes(String(f.type).toUpperCase())).length;

    return (
      <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {/* Header Section */}
        <div className={styles.pageHeader}>
          <div className={styles.titleArea}>
            <h1>My Files</h1>
            <span className={styles.subtitle}>All files and folders stored on this device.</span>
          </div>
          <div className={styles.headerControls}>
            <div className={styles.subSearchWrapper}>
              <Search className={styles.subSearchIcon} />
              <input
                type="text"
                placeholder="Search my files..."
                className={styles.subSearchInput}
                value={myFilesSearch}
                onChange={e => setMyFilesSearch(e.target.value)}
              />
            </div>
            <button className={styles.controlButton} title="Filters"><Filter size={16} /></button>
            <button className={styles.controlButton} title="Options"><MoreVertical size={16} /></button>
          </div>
        </div>

        {/* Stats Cards Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px" }}>
          {/* Total Files Card */}
          <div className={styles.quickActionCard} style={{ flexDirection: "row", justifyContent: "flex-start", padding: "16px 20px", cursor: "default" }}>
            <div className={styles.actionIconWrapper} style={{ borderRadius: "10px" }}>
              <FolderOpen size={16} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left", gap: "2px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Total Files</span>
              <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-family-outfit)" }}>{totalFilesCount}</span>
              <span style={{ fontSize: "11px", color: "var(--success)", fontWeight: 600 }}>Real-time sync</span>
            </div>
          </div>

          {/* Documents Card */}
          <div className={styles.quickActionCard} style={{ flexDirection: "row", justifyContent: "flex-start", padding: "16px 20px", cursor: "default" }}>
            <div className={styles.actionIconWrapper} style={{ borderRadius: "10px", backgroundColor: "rgba(59, 130, 246, 0.08)", color: "var(--info)" }}>
              <FileText size={16} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left", gap: "2px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Documents</span>
              <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-family-outfit)" }}>{docsCount}</span>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{totalFilesCount > 0 ? Math.round((docsCount / totalFilesCount) * 100) : 0}% of files</span>
            </div>
          </div>

          {/* Images Card */}
          <div className={styles.quickActionCard} style={{ flexDirection: "row", justifyContent: "flex-start", padding: "16px 20px", cursor: "default" }}>
            <div className={styles.actionIconWrapper} style={{ borderRadius: "10px", backgroundColor: "rgba(16, 185, 129, 0.08)", color: "var(--success)" }}>
              <ImageIcon size={16} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left", gap: "2px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Images</span>
              <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-family-outfit)" }}>{imagesCount}</span>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{totalFilesCount > 0 ? Math.round((imagesCount / totalFilesCount) * 100) : 0}% of files</span>
            </div>
          </div>

          {/* Archives Card */}
          <div className={styles.quickActionCard} style={{ flexDirection: "row", justifyContent: "flex-start", padding: "16px 20px", cursor: "default" }}>
            <div className={styles.actionIconWrapper} style={{ borderRadius: "10px", backgroundColor: "rgba(245, 158, 11, 0.08)", color: "var(--warning)" }}>
              <Archive size={16} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left", gap: "2px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Archives</span>
              <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-family-outfit)" }}>{archivesCount}</span>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{totalFilesCount > 0 ? Math.round((archivesCount / totalFilesCount) * 100) : 0}% of files</span>
            </div>
          </div>
        </div>

        {/* Category tags row */}
        <div className={styles.pillTabsContainer}>
          {["All", "Documents", "Images", "Videos", "Audio", "Archives", "Others"].map((cat) => (
            <button
              key={cat}
              onClick={() => setMyFilesCategory(cat)}
              className={`${styles.pillTab} ${myFilesCategory === cat ? styles.activePillTab : ""}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Table representation */}
        <div className={styles.tableSection}>
          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>
                    <input
                      type="checkbox"
                      checked={myFiles.length > 0 && myFiles.every(f => selectedMyFiles[f.id])}
                      onChange={handleToggleSelectAllFiles}
                    />
                  </th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Date Modified</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMyFiles.map((file) => {
                  const isSelected = !!selectedMyFiles[file.id];
                  return (
                    <tr key={file.id} style={isSelected ? { backgroundColor: "rgba(94, 92, 230, 0.02)" } : {}}>
                      <td>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectFile(file.id)}
                        />
                      </td>
                      <td>
                        <div className={styles.fileCell}>
                          {renderFileThumbnail(file.name, file.type, (file as any).url, 18)}
                          <div className={styles.fileDetails}>
                            <span className={styles.fileName}>{file.name}</span>
                            {file.filesCount !== undefined && (
                              <span className={styles.fileMeta}>{file.filesCount} files</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={styles.badge}
                          style={{
                            backgroundColor: file.type === "Folder" ? "#FEF3C7" : "var(--primary-light)",
                            color: file.type === "Folder" ? "#D97706" : "var(--primary)"
                          }}
                        >
                          {file.type}
                        </span>
                      </td>
                      <td>{file.size}</td>
                      <td>{file.dateModified}</td>
                      <td>
                        <div className={styles.actionsWrapper}>
                          {file.type !== "Folder" && (
                            <>
                              <button 
                                className={styles.actionButton} 
                                title="View Preview" 
                                onClick={() => handlePreviewFile(file.name, file.type, (file as any).url)}
                              >
                                <Eye size={14} />
                              </button>
                              <button className={styles.actionButton} title="Download"><ArrowDown size={14} /></button>
                            </>
                          )}
                          {file.type === "Folder" && (
                            <button className={styles.actionButton} title="Open Folder"><FolderOpen size={14} /></button>
                          )}
                          <button
                            className={`${styles.actionButton} ${styles.actionButtonDanger}`}
                            title="Delete"
                            onClick={() => handleDeleteMyFile(file.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredMyFiles.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: "48px", textAlign: "center", color: "var(--text-secondary)" }}>
                      No files matching the current category or search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {/* Table Footer */}
            <div className={styles.tableFooter}>
              <span className={styles.footerText}>Showing 1 to {filteredMyFiles.length} of {myFiles.length} files</span>
              <div className={styles.paginationWrapper}>
                <div className={styles.paginationControls}>
                  <button className={styles.paginationArrow} disabled>&lt;</button>
                  <button className={`${styles.pageNumber} ${styles.activePageNumber}`}>1</button>
                  <button className={styles.pageNumber}>2</button>
                  <button className={styles.pageNumber}>3</button>
                  <span style={{ color: "var(--text-secondary)" }}>...</span>
                  <button className={styles.pageNumber}>20</button>
                  <button className={styles.paginationArrow}>&gt;</button>
                </div>
                <div className={styles.pageSizeDropdownWrapper}>
                  <span>Items per page:</span>
                  <select className={styles.pageSizeSelect} defaultValue="10">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };


  // ----------------------------------------------------
  // RENDER VIEW: Received Files UI (ui (1).jpeg)
  // ----------------------------------------------------
  const renderReceived = () => {
    return (
      <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {/* Header Section */}
        <div className={styles.pageHeader}>
          <div className={styles.titleArea}>
            <h1>Received Files</h1>
            <span className={styles.subtitle}>Files and folders received from your devices.</span>
          </div>
          <div className={styles.headerControls}>
            <div className={styles.subSearchWrapper}>
              <Search className={styles.subSearchIcon} />
              <input
                type="text"
                placeholder="Search received files..."
                className={styles.subSearchInput}
                value={receivedSearch}
                onChange={e => setReceivedSearch(e.target.value)}
              />
            </div>
            <button className={styles.controlButton} title="Filters"><Filter size={16} /></button>
            <button className={styles.controlButton} title="Options"><MoreVertical size={16} /></button>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px" }}>
          <div className={styles.quickActionCard} style={{ flexDirection: "row", justifyContent: "flex-start", padding: "16px 20px", cursor: "default" }}>
            <div className={styles.actionIconWrapper} style={{ borderRadius: "10px" }}>
              <ArrowDown size={16} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left", gap: "2px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Total Received</span>
              <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-family-outfit)" }}>132</span>
              <span style={{ fontSize: "11px", color: "var(--success)", fontWeight: 600 }}>↑ 15% <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>this week</span></span>
            </div>
          </div>

          <div className={styles.quickActionCard} style={{ flexDirection: "row", justifyContent: "flex-start", padding: "16px 20px", cursor: "default" }}>
            <div className={styles.actionIconWrapper} style={{ borderRadius: "10px", backgroundColor: "rgba(245, 158, 11, 0.08)", color: "var(--warning)" }}>
              <Clock size={16} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left", gap: "2px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Files Today</span>
              <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-family-outfit)" }}>18</span>
              <span style={{ fontSize: "11px", color: "var(--success)", fontWeight: 600 }}>↑ 20% <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>today</span></span>
            </div>
          </div>

          <div className={styles.quickActionCard} style={{ flexDirection: "row", justifyContent: "flex-start", padding: "16px 20px", cursor: "default" }}>
            <div className={styles.actionIconWrapper} style={{ borderRadius: "10px", backgroundColor: "rgba(59, 130, 246, 0.08)", color: "var(--info)" }}>
              <HardDrive size={16} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left", gap: "2px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Storage Used</span>
              <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-family-outfit)" }}>2.45 GB</span>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>of 20 GB</span>
            </div>
          </div>

          <div className={styles.quickActionCard} style={{ flexDirection: "row", justifyContent: "flex-start", padding: "16px 20px", cursor: "default" }}>
            <div className={styles.actionIconWrapper} style={{ borderRadius: "10px", backgroundColor: "rgba(16, 185, 129, 0.08)", color: "var(--success)" }}>
              <Laptop size={16} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left", gap: "2px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Recent Senders</span>
              <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-family-outfit)" }}>6</span>
              <span style={{ fontSize: "11px", color: "var(--success)", fontWeight: 600 }}>Active</span>
            </div>
          </div>
        </div>

        {/* Category Pill Tabs */}
        <div className={styles.pillTabsContainer}>
          {["All", "Today", "Images", "Documents", "Videos", "Archives"].map((cat) => (
            <button
              key={cat}
              onClick={() => setReceivedCategory(cat)}
              className={`${styles.pillTab} ${receivedCategory === cat ? styles.activePillTab : ""}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Table Section */}
        <div className={styles.tableSection}>
          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>From (Device)</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Date & Time Received</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceivedFiles.map((file) => {
                  return (
                    <tr key={file.id}>
                      <td>
                        <div className={styles.fileCell}>
                          {renderFileThumbnail(file.fileName, file.type, (file as any).url, 18)}
                          <div className={styles.fileDetails}>
                            <span className={styles.fileName}>{file.fileName}</span>
                            <span className={styles.fileMeta}>Received from {file.device}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.deviceCell}>
                          <Laptop className={styles.deviceCellIcon} size={16} />
                          <div className={styles.deviceCellInfo}>
                            <span className={styles.deviceCellName}>{file.device}</span>
                            <span className={styles.deviceCellIp}>{file.ip}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={styles.badge} style={{ backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
                          {file.type}
                        </span>
                      </td>
                      <td>{file.size}</td>
                      <td>{file.timeReceived}</td>
                      <td>
                        <span
                          className={`${styles.badge} ${
                            file.status === "New" ? styles.newBadge : styles.completedBadge
                          }`}
                        >
                          {file.status}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionsWrapper}>
                          <button 
                            className={styles.actionButton} 
                            title="View Preview"
                            onClick={() => handlePreviewFile(file.fileName, file.type, (file as any).url)}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className={styles.actionButton}
                            title="Download"
                            onClick={() => handleDownloadReceivedFile(file.id)}
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            className={`${styles.actionButton} ${styles.actionButtonDanger}`}
                            title="Delete"
                            onClick={() => handleDeleteReceivedFile(file.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredReceivedFiles.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: "48px", textAlign: "center", color: "var(--text-secondary)" }}>
                      No received files found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {/* Table Footer */}
            <div className={styles.tableFooter}>
              <span className={styles.footerText}>Showing 1 to {filteredReceivedFiles.length} of {receivedFiles.length} files</span>
              <div className={styles.paginationWrapper}>
                <div className={styles.paginationControls}>
                  <button className={styles.paginationArrow} disabled>&lt;</button>
                  <button className={`${styles.pageNumber} ${styles.activePageNumber}`}>1</button>
                  <button className={styles.pageNumber}>2</button>
                  <button className={styles.pageNumber}>3</button>
                  <span style={{ color: "var(--text-secondary)" }}>...</span>
                  <button className={styles.pageNumber}>17</button>
                  <button className={styles.paginationArrow}>&gt;</button>
                </div>
                <div className={styles.pageSizeDropdownWrapper}>
                  <span>Items per page:</span>
                  <select className={styles.pageSizeSelect} defaultValue="10">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };


  // ----------------------------------------------------
  // RENDER VIEW: Transfers UI (ui 10.png)
  // ----------------------------------------------------
  const renderTransfers = () => {
    // Filter transfers based on search term
    const searchedTransfers = transfers.filter(t => {
      const query = transfersSearch.toLowerCase();
      return t.fileName.toLowerCase().includes(query) || t.device.toLowerCase().includes(query);
    });

    // Filter based on "Current" vs "History" sub-tabs
    const subTabFiltered = searchedTransfers.filter(t => {
      if (transfersSubTab === "Current") {
        return t.status === "Transferring" || t.status === "Paused" || (t.status as string) === "Pending";
      } else {
        return t.status === "Completed" || t.status === "Failed";
      }
    });

    // Filter based on Pill Category (All, Sent, Received, In Progress, Completed, Failed)
    const finalFiltered = subTabFiltered.filter(t => {
      if (transfersTab === "All Transfers" || transfersTab === "All") return true;
      if (transfersTab === "Sent") return t.direction === "send";
      if (transfersTab === "Received") return t.direction === "receive";
      if (transfersTab === "In Progress") return t.status === "Transferring" || t.status === "Paused" || (t.status as string) === "Pending";
      if (transfersTab === "Completed") return t.status === "Completed";
      if (transfersTab === "Failed") return t.status === "Failed";
      return true;
    });

    return (
      <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Header and Subtabs Section */}
        <div className={styles.transfersHeader}>
          <div className={styles.pageHeader} style={{ marginBottom: 0 }}>
            <div className={styles.titleArea}>
              <h1>Transfers</h1>
              <span className={styles.subtitle}>Track active files sharing and history logs.</span>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div className={styles.transfersSubTabs}>
              <button 
                type="button" 
                onClick={() => {
                  setTransfersSubTab("Current");
                  setTransfersTab("All");
                }}
                className={`${styles.transfersTabBtn} ${transfersSubTab === "Current" ? styles.transfersTabBtnActive : ""}`}
              >
                Current
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setTransfersSubTab("History");
                  setTransfersTab("All");
                }}
                className={`${styles.transfersTabBtn} ${transfersSubTab === "History" ? styles.transfersTabBtnActive : ""}`}
              >
                History
              </button>
            </div>

            <div className={styles.transfersSearchRow}>
              <div className={styles.transfersSearchWrapper}>
                <Search size={16} className={styles.transfersSearchIcon} />
                <input 
                  type="text" 
                  placeholder="Search transfers..." 
                  className={styles.transfersSearchInput}
                  value={transfersSearch}
                  onChange={(e) => setTransfersSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Category Pills */}
        <div className={styles.transfersPillsRow}>
          {[
            { id: "All", label: "All" },
            { id: "Sent", label: "Sent (Outbound)" },
            { id: "Received", label: "Received (Inbound)" },
            ...(transfersSubTab === "Current" ? [{ id: "In Progress", label: "In Progress" }] : []),
            ...(transfersSubTab === "History" ? [{ id: "Completed", label: "Completed" }, { id: "Failed", label: "Failed" }] : [])
          ].map(pill => {
            const activeId = transfersTab === "All Transfers" ? "All" : transfersTab;
            const isActive = activeId === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setTransfersTab(pill.id === "All" ? "All Transfers" : pill.id)}
                className={`${styles.transfersPill} ${isActive ? styles.transfersPillActive : ""}`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* Transfers Cards List */}
        <div className={styles.transfersList}>
          {finalFiltered.map(item => {
            const isCompleted = item.status === "Completed";
            const isFailed = item.status === "Failed";
            const isPaused = item.status === "Paused";

            return (
              <div key={item.id} className={styles.transferCard} style={{ gap: "16px" }}>
                {/* File Thumbnail or Icon */}
                {renderFileThumbnail(item.fileName, item.type, (item as any).url, 20, { width: "48px", height: "48px", borderRadius: "12px", flexShrink: 0 })}

                {/* Details */}
                <div className={styles.transferInfo}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className={styles.transferName}>{item.fileName}</span>
                    <span className={styles.transferDeviceMeta} style={{ fontWeight: 600, fontSize: "13px" }}>{item.size}</span>
                  </div>

                  {/* Sent vs Received Flow Indicator */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", margin: "4px 0" }}>
                    <span 
                      style={{ 
                        display: "inline-flex", 
                        alignItems: "center", 
                        gap: "4px", 
                        padding: "2px 8px", 
                        borderRadius: "6px", 
                        fontSize: "11px", 
                        fontWeight: 700,
                        backgroundColor: item.direction === "send" ? "rgba(16, 185, 129, 0.12)" : "rgba(59, 130, 246, 0.12)",
                        color: item.direction === "send" ? "#10B981" : "#3B82F6",
                        border: item.direction === "send" ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(59, 130, 246, 0.3)"
                      }}
                    >
                      {item.direction === "send" ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                      {item.direction === "send" ? "SENT" : "RECEIVED"}
                    </span>

                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                      {item.direction === "send" ? (
                        <>
                          <span style={{ color: "var(--primary)" }}>You</span> &rarr; {item.device}
                        </>
                      ) : (
                        <>
                          {item.device} &rarr; <span style={{ color: "var(--primary)" }}>You</span>
                        </>
                      )}
                    </span>

                    <span className={styles.badge} style={{ fontSize: "10px", padding: "1px 6px", backgroundColor: "var(--primary-light)", color: "var(--primary)", borderRadius: "4px" }}>
                      {item.type ? item.type.toUpperCase() : "FILE"}
                    </span>

                    <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>&bull; IP: {item.ip}</span>
                  </div>

                  {/* Active Transfer Details */}
                  {!isCompleted && !isFailed && (
                    <>
                      <div className={styles.chatActiveTransfersBarWrapper} style={{ marginTop: "6px", height: "6px" }}>
                        <div 
                          className={styles.chatActiveTransfersBarFill} 
                          style={{ width: `${item.progressPercent}%` }} 
                        />
                      </div>
                      <div className={styles.transferSpeedEta}>
                        <span>{item.progressPercent}% &bull; {item.progressDetail || "Calculating..."}</span>
                        <span>{item.speed} &bull; {item.timeLeft}</span>
                      </div>
                    </>
                  )}

                  {/* Historical Details */}
                  {isCompleted && (
                    <span className={`${styles.transferStatusText} ${styles.transferStatusCompleted}`} style={{ marginTop: "4px" }}>
                      &bull; Completed on {item.completedOn || "Just now"}
                    </span>
                  )}

                  {isFailed && (
                    <span className={`${styles.transferStatusText} ${styles.transferStatusFailed}`} style={{ marginTop: "4px" }}>
                      &bull; Failed on {item.failedOn || "Just now"}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className={styles.transferActions}>
                  <button 
                    className={styles.actionButton} 
                    title="View Preview"
                    onClick={() => handlePreviewFile(item.fileName, item.type, (item as any).url)}
                  >
                    <Eye size={14} />
                  </button>

                  {!isCompleted && !isFailed && (
                    <>
                      <button 
                        onClick={() => handleTogglePauseTransfer(item.id)}
                        className={styles.actionButton} 
                        title={isPaused ? "Resume" : "Pause"}
                      >
                        {isPaused ? <Play size={14} /> : <Pause size={14} />}
                      </button>
                      <button 
                        onClick={() => handleCancelTransfer(item.id)}
                        className={styles.actionButton} 
                        style={{ color: "var(--error)", backgroundColor: "var(--danger-light)" }}
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </>
                  )}

                  {isCompleted && (
                    <button className={styles.actionButton} title="Open Folder">
                      <FolderOpen size={14} />
                    </button>
                  )}

                  {isFailed && (
                    <button 
                      onClick={() => handleTogglePauseTransfer(item.id)}
                      className={styles.scanBtn}
                      style={{ padding: "6px 12px", fontSize: "11px" }}
                    >
                      Retry
                    </button>
                  )}

                  {(isCompleted || isFailed) && (
                    <button 
                      onClick={() => handleCancelTransfer(item.id)}
                      className={styles.actionButton} 
                      style={{ color: "var(--error)", backgroundColor: "var(--danger-light)" }}
                      title="Delete History log"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {finalFiltered.length === 0 && (
            <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-lg)" }}>
              No transfers match these filters.
            </div>
          )}
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // RENDER VIEW: Chats UI (ui 4.jpeg)
  // ----------------------------------------------------
  const renderChats = () => {
    const activeMessages = chatMessages[activeChat] || [];
    const activeDeviceObj = nearbyDevices.find(d => d.name === activeChat) || { name: activeChat, status: "online", ip: "192.168.1.1" };

    const hasActiveChat = activeChat !== "";

    return (
      <div className={`${styles.chatContainer} ${hasActiveChat ? styles.chatContainerActive : ""} animate-fade-in`} style={isGroupInfoModalOpen && hasActiveChat && typeof window !== "undefined" && window.innerWidth >= 992 ? { gridTemplateColumns: "320px 1fr 340px" } : {}}>
        {/* Left Sub-sidebar (Devices & Recent Chats) */}
        <div className={`${styles.chatSidebar} ${hasActiveChat ? styles.chatSidebarHiddenMobile : ""}`}>
          <div className={styles.chatSidebarHeader}>
            <span className={styles.chatSidebarTitle}>Chats & Groups</span>
            <motion.button
              layout
              type="button"
              className={styles.actionButton}
              title="Refresh Devices"
              onClick={() => handleRefreshDevices()}
              disabled={isScanning}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                width: isScanning ? "auto" : "32px",
                height: "32px",
                minWidth: isScanning ? "110px" : "32px",
                padding: isScanning ? "0 10px" : "0",
                borderRadius: "16px",
                backgroundColor: isScanning ? "rgba(108, 99, 255, 0.15)" : "transparent",
                border: isScanning ? "1px solid var(--primary)" : "1px solid var(--border-color)",
                color: isScanning ? "var(--primary)" : "var(--text-secondary)",
                overflow: "hidden",
                cursor: "pointer"
              }}
            >
              <motion.div
                animate={isScanning ? { rotate: 360 } : { rotate: 0 }}
                transition={isScanning ? { repeat: Infinity, duration: 0.8, ease: "linear" } : { duration: 0.3 }}
                style={{ display: "flex", alignItems: "center" }}
              >
                <RefreshCw size={14} />
              </motion.div>

              <AnimatePresence>
                {isScanning && (
                  <motion.span
                    initial={{ width: 0, opacity: 0, scale: 0.8 }}
                    animate={{ width: "auto", opacity: 1, scale: 1 }}
                    exit={{ width: 0, opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      display: "inline-block",
                      overflow: "hidden"
                    }}
                  >
                    Refreshing...
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
          
          <div className={styles.chatSidebarScroll}>
            {/* Nearby Devices & Groups Section */}
            <div className={styles.chatSidebarSection}>
              {/* Common Group Card */}
              {(() => {
                const groupMsgs = chatMessages["Common Group"] || chatMessages["Group Chat"] || [];
                const lastGroupMsg = groupMsgs.length > 0 ? groupMsgs[groupMsgs.length - 1] : null;
                const isGroupActive = activeChat === "Common Group" || activeChat === "Group Chat";
                
                let groupSnippet = "Public Group Chat";
                let groupTime = "";
                if (lastGroupMsg) {
                  groupTime = lastGroupMsg.time || "";
                  let prefix = lastGroupMsg.sender === "you" ? (lastGroupMsg.is_read ? "✓✓ " : "✓ ") : "";
                  if (lastGroupMsg.file) {
                    groupSnippet = prefix + "📄 " + (lastGroupMsg.file_name || "Attachment");
                  } else if (lastGroupMsg.text) {
                    groupSnippet = prefix + lastGroupMsg.text;
                  }
                }

                return (
                  <button
                    type="button"
                    className={`${styles.chatDeviceItem} ${isGroupActive ? styles.chatDeviceActive : ""}`}
                    onClick={() => setActiveChat("Common Group")}
                    style={{ width: "100%", padding: "10px 12px", marginBottom: "6px" }}
                  >
                    <div className={styles.chatDeviceLeft} style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%" }}>
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <div style={{ width: "42px", height: "42px", borderRadius: "50%", backgroundColor: "#8B5CF6", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "16px", boxShadow: "0 2px 8px rgba(139, 92, 246, 0.4)" }}>
                          <Users size={20} />
                        </div>
                      </div>
                      <div className={styles.chatDeviceDetails} style={{ flex: 1, overflow: "hidden", textAlign: "left" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                          <span className={styles.chatDeviceName} style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>Common Group</span>
                          {groupTime && <span style={{ fontSize: "11px", color: "var(--text-secondary)", opacity: 0.8 }}>{groupTime}</span>}
                        </div>
                        <span className={styles.chatDeviceIp} style={{ fontSize: "12.5px", color: "var(--primary-muted)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block", marginTop: "2px" }}>
                          {groupSnippet}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })()}

              {nearbyDevices.map((device, index) => {
                const initial = device.name ? device.name.charAt(0).toUpperCase() : "?";
                const colors = ["#6C63FF", "#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6"];
                const bgColor = colors[(device.name ? device.name.charCodeAt(0) : 0) % colors.length];
                
                const msgs = chatMessages[device.name] || [];
                const lastMsgObj = msgs.length > 0 ? msgs[msgs.length - 1] : null;
                const isContactTyping = typingUsers.includes(device.name);

                let snippetContent = device.ip || "192.168.1.1";
                let timeStr = "";

                if (isContactTyping) {
                  snippetContent = "typing...";
                } else if (lastMsgObj) {
                  timeStr = lastMsgObj.time || "";
                  let prefix = "";
                  if (lastMsgObj.sender === "you") {
                    prefix = lastMsgObj.is_read ? "✓✓ " : "✓ ";
                  }
                  if (lastMsgObj.file) {
                    const fType = (lastMsgObj.file_type || "").toLowerCase();
                    const fName = (lastMsgObj.file_name || "").toLowerCase();
                    if (fType.includes("audio") || fName.endsWith("mp3") || fName.endsWith("wav") || fName.endsWith("m4a")) {
                      snippetContent = prefix + "🎵 Audio";
                    } else if (fType.includes("image") || ["jpg", "png", "jpeg", "webp"].some(ext => fName.endsWith(ext))) {
                      snippetContent = prefix + "📷 Photo";
                    } else if (fType.includes("video") || fName.endsWith("mp4")) {
                      snippetContent = prefix + "🎥 Video";
                    } else {
                      snippetContent = prefix + "📄 " + (lastMsgObj.file_name || "Attachment");
                    }
                  } else if (lastMsgObj.text) {
                    snippetContent = prefix + lastMsgObj.text;
                  }
                }

                return (
                  <button
                    key={`${device.name}-${device.ip}-${index}`}
                    type="button"
                    className={`${styles.chatDeviceItem} ${activeChat === device.name ? styles.chatDeviceActive : ""}`}
                    onClick={() => setActiveChat(device.name)}
                    style={{ width: "100%", padding: "10px 12px" }}
                  >
                    <div className={styles.chatDeviceLeft} style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%" }}>
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <div style={{ width: "42px", height: "42px", borderRadius: "50%", backgroundColor: bgColor, color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "16px", boxShadow: "0 2px 6px rgba(0,0,0,0.2)", overflow: "hidden" }}>
                          {((device.avatar && device.avatar !== "avatar_1") ? device.avatar : peerAvatars[device.name]) ? (
                            <img src={(device.avatar && device.avatar !== "avatar_1") ? device.avatar : peerAvatars[device.name]} alt={device.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            initial
                          )}
                        </div>
                        <span 
                          style={{
                            position: "absolute",
                            bottom: "0px",
                            right: "0px",
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            backgroundColor: device.status === "online" ? "#10B981" : "#9CA3AF",
                            border: "2px solid var(--card-bg, #1e1b4b)",
                            boxShadow: device.status === "online" ? "0 0 6px #10B981" : "none"
                          }}
                        />
                      </div>
                      <div className={styles.chatDeviceDetails} style={{ flex: 1, overflow: "hidden", textAlign: "left" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                          <span className={styles.chatDeviceName} style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>{device.name}</span>
                          {timeStr && <span style={{ fontSize: "11px", color: "var(--text-secondary)", opacity: 0.8 }}>{timeStr}</span>}
                        </div>
                        <span className={styles.chatDeviceIp} style={{ fontSize: "12.5px", color: isContactTyping ? "#10B981" : "var(--text-secondary)", fontWeight: isContactTyping ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block", marginTop: "2px" }}>
                          {snippetContent}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>
        </div>

        {/* Right Chat Panel */}
        <div 
          className={`${styles.chatPanel} ${!hasActiveChat ? styles.chatPanelHiddenMobile : ""}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onPaste={handlePaste}
          style={{ position: "relative" }}
        >
          {hasActiveChat && isDraggingFile && (
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
              backgroundColor: "rgba(108, 99, 255, 0.15)",
              backdropFilter: "blur(10px)",
              border: "3px dashed var(--primary)",
              borderRadius: "20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              color: "var(--primary)",
              pointerEvents: "none"
            }}>
              <div style={{ padding: "24px", borderRadius: "50%", backgroundColor: "rgba(108, 99, 255, 0.25)" }}>
                <UploadCloud size={56} />
              </div>
              <div style={{ textAlign: "center" }}>
                <h3 style={{ fontSize: "22px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>Drop files here to send</h3>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "8px 0 0 0" }}>Photos, videos, documents & zip files will be sent instantly to {activeChat}</p>
              </div>
            </div>
          )}

          {hasActiveChat ? (
            <>
              {/* Header */}
              {selectedMessageIds.length > 0 ? (
                <div className={styles.chatPanelHeader} style={{ backgroundColor: "rgba(108, 99, 255, 0.15)", borderBottom: "1px solid var(--primary)", zIndex: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button type="button" onClick={() => setSelectedMessageIds([])} style={{ background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer" }}>
                      <X size={18} />
                    </button>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{selectedMessageIds.length} Selected</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <button
                      type="button"
                      title="Forward Selected"
                      onClick={() => {
                        setLightboxData({
                          url: "",
                          fileName: `${selectedMessageIds.length} selected messages`,
                          chatName: activeChat
                        });
                        setIsShareModalOpen(true);
                      }}
                      style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 600 }}
                    >
                      <Share2 size={16} />
                      <span>Forward</span>
                    </button>
                    <button
                      type="button"
                      title="Delete Selected"
                      onClick={() => handleDeleteMultipleMessages(selectedMessageIds, activeChat)}
                      style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 600 }}
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.chatPanelHeader}>
                  <div className={styles.chatPanelHeaderLeft}>
                    {/* Mobile Back Button */}
                    <button 
                      onClick={() => setActiveChat("")} 
                      className={styles.mobileBackBtn}
                      title="Back to Device list"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    {(() => {
                      const initial = activeChat ? activeChat.charAt(0).toUpperCase() : "?";
                      const colors = ["#6C63FF", "#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6"];
                      const bgColor = colors[(activeChat ? activeChat.charCodeAt(0) : 0) % colors.length];
                      const peerImg = peerAvatars[activeChat];
                      return (
                        <div style={{ width: "38px", height: "38px", borderRadius: "50%", backgroundColor: bgColor, color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "16px", flexShrink: 0, boxShadow: "0 2px 8px rgba(108, 99, 255, 0.3)", marginRight: "4px", overflow: "hidden" }}>
                          {peerImg && peerImg !== "avatar_1" ? (
                            <img src={peerImg} alt={activeChat} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            initial
                          )}
                        </div>
                      );
                    })()}
                    <div 
                      className={styles.chatPanelInfo} 
                      onClick={() => {
                        if (activeChat === "Common Group" || activeChat === "Group Chat" || activeChat === "Project-Group") {
                          setIsGroupInfoModalOpen(true);
                        } else {
                          setIsChatWallpaperModalOpen(true);
                        }
                      }} 
                      style={{ cursor: "pointer" }} 
                      title={activeChat === "Common Group" || activeChat === "Group Chat" || activeChat === "Project-Group" ? "Click for Group Info" : "Click for Wallpaper & Info"}
                    >
                      <span className={styles.chatPanelName}>{activeChat}</span>
                      <span className={styles.chatPanelStatus}>
                        {typingUsers.includes(activeChat) ? (
                          <span style={{ color: "var(--primary)", fontWeight: "600" }}>typing...</span>
                        ) : activeChat === "Common Group" || activeChat === "Group Chat" || activeChat === "Project-Group" ? (
                          <span style={{ color: "var(--primary)", fontWeight: "600" }}>{nearbyDevices.length + 1} Participants • Tap for info</span>
                        ) : (
                          <>
                            <span className={`${styles.chatPanelStatusDot} ${activeDeviceObj.status === "offline" ? styles.chatDeviceOffline : ""}`} />
                            {activeDeviceObj.status === "offline" ? "Offline" : "Online"}
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className={styles.chatPanelHeaderRight}>
                    <button className={styles.controlButton} title="Search"><Search size={16} /></button>
                    <button 
                      className={styles.controlButton} 
                      title="Group Info / Wallpaper" 
                      onClick={() => {
                        if (activeChat === "Common Group" || activeChat === "Group Chat" || activeChat === "Project-Group") {
                          setIsGroupInfoModalOpen(true);
                        } else {
                          setIsChatWallpaperModalOpen(true);
                        }
                      }}
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              )}


          {/* Chat Messages Body Container with Fixed Background Stars */}
          <div style={{ flex: 1, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <StarParticlesCanvas 
              enabled={settingsStarEnabled} 
              customWallpaperUrl={chatWallpapers[activeChat] || chatWallpapers["global"]} 
            />
            
            <div ref={chatBodyRef} className={styles.chatPanelBody} style={{ flex: 1, overflowY: "auto", position: "relative", zIndex: 1 }}>
              <span className={styles.chatDaySeparator}>Today</span>

              {(() => {
                const renderTicks = (m: ChatMessage) => {
                  if (m.sender !== "you") return null;

                  if (activeChat === "Common Group" || activeChat === "Group Chat" || activeChat === "Project-Group") {
                    return <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "10px", marginLeft: "6px", textTransform: "lowercase" }}>• sent</span>;
                  }

                  const recipientName = activeChat;
                  const isRecipientOnline = nearbyDevices.some(d => {
                    const displayName = d.name;
                    return displayName === recipientName;
                  });

                  if (m.id.startsWith("temp-")) {
                    return <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", marginLeft: "6px", textTransform: "lowercase" }}>• sending</span>;
                  }

                  if (m.is_read) {
                    return <span style={{ color: "#7DF9FF", fontWeight: "600", fontSize: "10px", marginLeft: "6px", textTransform: "lowercase" }}>• read</span>;
                  }

                  if (isRecipientOnline) {
                    return <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "10px", marginLeft: "6px", textTransform: "lowercase" }}>• delivered</span>;
                  }

                  return <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", marginLeft: "6px", textTransform: "lowercase" }}>• sent</span>;
                };

                return activeMessages.map((msg) => {
                  const isSelected = selectedMessageIds.includes(msg.id);
                return (
                  <div
                    key={msg.id}
                    className={`${styles.chatBubble} ${
                      msg.sender === "you" ? styles.chatBubbleOutgoing : styles.chatBubbleIncoming
                    }`}
                    style={{
                      position: "relative",
                      cursor: "pointer",
                      border: isSelected ? "2px solid var(--primary)" : "none",
                      boxShadow: isSelected ? "0 0 12px rgba(108, 99, 255, 0.4)" : "none"
                    }}
                    onClick={() => {
                      if (selectedMessageIds.length > 0) {
                        setSelectedMessageIds(prev =>
                          prev.includes(msg.id) ? prev.filter(id => id !== msg.id) : [...prev, msg.id]
                        );
                      }
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setContextMenuData({ x: e.clientX, y: e.clientY, msg, chatName: activeChat });
                    }}
                    onTouchStart={(e) => {
                      const touch = e.touches[0];
                      const x = touch.clientX;
                      const y = touch.clientY;
                      touchTimerRef.current = setTimeout(() => {
                        setContextMenuData({ x, y, msg, chatName: activeChat });
                      }, 500);
                    }}
                    onTouchEnd={() => {
                      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
                    }}
                    onTouchMove={() => {
                      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
                    }}
                  >

                  {msg.reply_to_text && (
                    <div style={{ padding: "6px 10px", backgroundColor: "rgba(0, 0, 0, 0.2)", borderLeft: "3px solid var(--primary)", borderRadius: "6px", marginBottom: "6px", fontSize: "12px" }}>
                      <span style={{ fontWeight: 600, color: "var(--primary)", display: "block", fontSize: "11px" }}>{msg.reply_to_sender || "Reply"}</span>
                      <span style={{ opacity: 0.9, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", display: "block" }}>{msg.reply_to_text}</span>
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>

                    {msg.text && <span style={{ flex: 1 }}>{msg.text}</span>}
                    
                    {starredMessageIds.includes(msg.id) && (
                      <div style={{ marginLeft: "auto", paddingLeft: "8px" }}>
                        <Star size={12} style={{ fill: "#F59E0B", color: "#F59E0B" }} />
                      </div>
                    )}
                  </div>
                  
                  {/* Real File Attachment Card */}
                  {msg.file && (
                    (() => {
                      const isImg = msg.file_type?.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(msg.file_name || "");
                      const isVideo = msg.file_type?.startsWith("video/") || /\.(mp4|mov|m4v|avi|mkv|webm)$/i.test(msg.file_name || "");
                      const isAudio = msg.file_type?.startsWith("audio/") || /\.(mp3|wav|ogg|m4a|aac)$/i.test(msg.file_name || "");
                      const fileUrl = msg.file.startsWith("http") ? msg.file : msg.file;
                      
                      if (isImg) {
                        return (
                          <div style={{ marginTop: "8px", maxWidth: "320px", borderRadius: "8px", overflow: "hidden" }}>
                            <img 
                              src={fileUrl} 
                              alt={msg.file_name} 
                              style={{ width: "100%", height: "auto", maxHeight: "240px", objectFit: "cover", cursor: "pointer" }}
                              onClick={() => {
                                setLightboxData({
                                  url: fileUrl,
                                  fileName: msg.file_name || "attachment.png",
                                  messageId: msg.id,
                                  chatName: activeChat
                                });
                                setLightboxFilter("none");
                                setLightboxRotation(0);
                              }}
                            />
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", backgroundColor: "rgba(0,0,0,0.05)" }}>
                              <span style={{ fontSize: "11px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "200px" }}>{msg.file_name}</span>
                              <button 
                                type="button"
                                onClick={() => {
                                  setLightboxData({
                                    url: fileUrl,
                                    fileName: msg.file_name || "attachment.png",
                                    messageId: msg.id,
                                    chatName: activeChat
                                  });
                                  setLightboxFilter("none");
                                  setLightboxRotation(0);
                                }} 
                                className={styles.downloadBtn} 
                                style={{ fontSize: "11px", padding: "2px 6px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                              >
                                <Eye size={12} /> View
                              </button>
                            </div>
                          </div>
                        );

                      } else if (isVideo) {
                        return (
                          <div style={{ marginTop: "8px", maxWidth: "320px", borderRadius: "8px", overflow: "hidden" }}>
                            <video 
                              src={fileUrl} 
                              controls 
                              style={{ width: "100%", height: "auto", maxHeight: "240px" }}
                            />
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", backgroundColor: "rgba(0,0,0,0.05)" }}>
                              <span style={{ fontSize: "11px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "200px" }}>{msg.file_name}</span>
                              <a href={fileUrl} download={msg.file_name} className={styles.downloadBtn} style={{ fontSize: "11px", padding: "2px 6px", textDecoration: "none" }}>
                                <ArrowDown size={12} /> Download
                              </a>
                            </div>
                          </div>
                        );
                      } else if (isAudio) {
                        return (
                          <div style={{ marginTop: "8px", maxWidth: "280px" }}>
                            <audio src={fileUrl} controls style={{ width: "100%" }} />
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px" }}>
                              <span style={{ fontSize: "10px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{msg.file_name}</span>
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div className={styles.fileAttachmentCard}>
                            <div className={styles.fileIconContainer}>
                              <FolderArchive size={20} />
                            </div>
                            <div className={styles.fileDetails}>
                              <span className={styles.fileName}>{msg.file_name}</span>
                              <span className={styles.fileSize}>{formatBytes(msg.file_size || 0)}</span>
                            </div>
                            <a 
                              href={fileUrl} 
                              download={msg.file_name} 
                              className={styles.downloadBtn}
                              style={{ display: "flex", alignItems: "center", textDecoration: "none" }}
                            >
                              <ArrowDown size={14} />
                              <span style={{ marginLeft: "4px" }}>Download</span>
                            </a>
                          </div>
                        );
                      }
                    })()
                  )}
                  
                  <span className={styles.chatBubbleTime}>
                    {msg.time} {renderTicks(msg)}
                  </span>
                </div>
              );
            })
          })()}

          {typingUsers.includes(activeChat) && (
            <div
              className={`${styles.chatBubble} ${styles.chatBubbleIncoming}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "18px 20px",
                borderRadius: "16px 16px 16px 4px",
                marginBottom: "12px",
                width: "fit-content",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
              }}
            >
              <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                <motion.span 
                  animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }} 
                  transition={{ repeat: Infinity, duration: 1.2, delay: 0, ease: "easeInOut" }}
                  style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "rgba(255, 255, 255, 0.8)", display: "inline-block" }} 
                />
                <motion.span 
                  animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }} 
                  transition={{ repeat: Infinity, duration: 1.2, delay: 0.18, ease: "easeInOut" }}
                  style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "rgba(255, 255, 255, 0.8)", display: "inline-block" }} 
                />
                <motion.span 
                  animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }} 
                  transition={{ repeat: Infinity, duration: 1.2, delay: 0.36, ease: "easeInOut" }}
                  style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "rgba(255, 255, 255, 0.8)", display: "inline-block" }} 
                />
              </div>
            </div>
          )}

              {/* Scroll Anchor */}
              <div ref={messagesEndRef} />
            </div>
          </div>


          {/* Footer Input & Action Panel */}
          <div className={styles.chatPanelFooter}>
            {replyingTo && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "rgba(108, 99, 255, 0.1)", borderLeft: "3px solid var(--primary)", borderRadius: "8px", marginBottom: "8px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--primary)" }}>Replying to {replyingTo.sender}</span>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "300px" }}>
                    {replyingTo.text || replyingTo.file_name || "Attachment"}
                  </span>
                </div>
                <button type="button" onClick={() => setReplyingTo(null)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
                  <X size={16} />
                </button>
              </div>
            )}
            <div className={styles.chatInputWrapper} style={{ position: "relative" }}>
              {/* WhatsApp Style Attachment Popup Modal */}
              <AnimatePresence>
                {isAttachMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: "absolute",
                      bottom: "54px",
                      left: "0",
                      backgroundColor: "var(--bg-card)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "16px",
                      padding: "16px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "16px",
                      zIndex: 100,
                      minWidth: "240px"
                    }}
                  >
                    <button 
                      type="button"
                      onClick={() => { setIsAttachMenuOpen(false); docInputRef.current?.click(); }}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", cursor: "pointer" }}
                    >
                      <div style={{ width: "44px", height: "44px", borderRadius: "50%", backgroundColor: "#7F66FF", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <FileText size={20} />
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>Document</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => { setIsAttachMenuOpen(false); imageInputRef.current?.click(); }}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", cursor: "pointer" }}
                    >
                      <div style={{ width: "44px", height: "44px", borderRadius: "50%", backgroundColor: "#EC407A", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ImageIcon size={20} />
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>Photos</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => { setIsAttachMenuOpen(false); videoInputRef.current?.click(); }}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", cursor: "pointer" }}
                    >
                      <div style={{ width: "44px", height: "44px", borderRadius: "50%", backgroundColor: "#FF7043", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Play size={20} />
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>Videos</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => { setIsAttachMenuOpen(false); audioInputRef.current?.click(); }}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", cursor: "pointer" }}
                    >
                      <div style={{ width: "44px", height: "44px", borderRadius: "50%", backgroundColor: "#9C27B0", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Music size={20} />
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>Audio</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => { setIsAttachMenuOpen(false); fileInputRef.current?.click(); }}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", cursor: "pointer" }}
                    >
                      <div style={{ width: "44px", height: "44px", borderRadius: "50%", backgroundColor: "#00BCD4", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <FolderArchive size={20} />
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>All Files</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => { setIsAttachMenuOpen(false); handleClipboardRead(); }}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", cursor: "pointer" }}
                    >
                      <div style={{ width: "44px", height: "44px", borderRadius: "50%", backgroundColor: "#FF9800", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Clipboard size={20} />
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>Clipboard</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hidden Inputs for File Types */}
              <input type="file" multiple ref={fileInputRef} onChange={handleFileUpload} style={{ display: "none" }} />
              <input type="file" multiple accept="image/*" ref={imageInputRef} onChange={handleFileUpload} style={{ display: "none" }} />
              <input type="file" multiple accept="audio/*" ref={audioInputRef} onChange={handleFileUpload} style={{ display: "none" }} />
              <input type="file" multiple accept="video/*" ref={videoInputRef} onChange={handleFileUpload} style={{ display: "none" }} />
              <input type="file" multiple accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx" ref={docInputRef} onChange={handleFileUpload} style={{ display: "none" }} />

              <button 
                type="button" 
                className={styles.chatInputIcon} 
                onClick={() => setIsAttachMenuOpen(prev => !prev)} 
                title="Attach Files"
                style={{ color: isAttachMenuOpen ? "var(--primary)" : "var(--text-secondary)", transform: "rotate(-45deg)" }}
              >
                <Paperclip size={20} />
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                className={styles.chatInputField}
                value={messageInput}
                onChange={handleInputChange}
                onPaste={handlePaste}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
              />
              <button className={styles.chatSendBtn} onClick={handleSendMessage} title="Send Message">
                <Send size={16} style={{ transform: "rotate(45deg)", marginLeft: "-2px" }} />
              </button>
            </div>
          </div>
          </>
          ) : (
            <div style={{ display: "flex", flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-secondary)", gap: "12px", padding: "48px 24px" }}>
              <MessageSquare size={48} style={{ color: "var(--border-color)" }} />
              <span style={{ fontSize: "14px", fontWeight: 600 }}>Select a device to start chatting</span>
            </div>
          )}
        </div>

        {/* WhatsApp Web Style Right Group Info Sidebar Panel */}
        {isGroupInfoModalOpen && hasActiveChat && (
          <div 
            className="animate-fade-in"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--border-radius-lg)",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              overflowY: "auto",
              boxShadow: "var(--box-shadow-sm)",
              position: typeof window !== "undefined" && window.innerWidth < 992 ? "fixed" : "relative",
              top: typeof window !== "undefined" && window.innerWidth < 992 ? 0 : "auto",
              right: typeof window !== "undefined" && window.innerWidth < 992 ? 0 : "auto",
              bottom: typeof window !== "undefined" && window.innerWidth < 992 ? 0 : "auto",
              left: typeof window !== "undefined" && window.innerWidth < 992 ? 0 : "auto",
              zIndex: typeof window !== "undefined" && window.innerWidth < 992 ? 99999 : 1,
              width: typeof window !== "undefined" && window.innerWidth < 992 ? "100vw" : "auto"
            }}
          >
            {/* Panel Header */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "16px", backgroundColor: "var(--bg-card)" }}>
              <button 
                type="button" 
                onClick={() => setIsGroupInfoModalOpen(false)}
                style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center" }}
              >
                <X size={20} />
              </button>
              <span style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>Group info</span>
            </div>

            {/* Avatar & Title Banner */}
            <div style={{ padding: "28px 20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", borderBottom: "1px solid var(--border-color)", backgroundColor: "rgba(0,0,0,0.02)" }}>
              <div style={{ width: "100px", height: "100px", borderRadius: "50%", backgroundColor: "var(--primary)", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px", boxShadow: "0 8px 24px rgba(108, 99, 255, 0.3)", fontSize: "36px", fontWeight: 700 }}>
                <Users size={48} />
              </div>
              <h2 style={{ fontSize: "19px", fontWeight: 700, color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                {activeChat || "Group Chat"}
                <Edit3 size={14} style={{ color: "var(--text-secondary)", cursor: "pointer" }} />
              </h2>
              <span style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Group &bull; {nearbyDevices.length + 1} members
              </span>

              {/* Quick Action Buttons */}
              <div style={{ display: "flex", gap: "24px", marginTop: "18px" }}>
                <button type="button" onClick={() => handleRefreshDevices()} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Plus size={20} />
                  </div>
                  <span>Add</span>
                </button>
                <button type="button" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Search size={20} />
                  </div>
                  <span>Search</span>
                </button>
              </div>
            </div>

            {/* Group Description */}
            <div style={{ padding: "14px 20px", borderBottom: "8px solid rgba(0,0,0,0.05)" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: "4px" }}>Add group description</span>
              <p style={{ fontSize: "13px", color: "var(--text-primary)", margin: 0, lineHeight: 1.4 }}>
                Default LAN Broadcast & File Sharing Group. Share images, docs, and communicate offline.
              </p>
            </div>

            {/* Media, Starred, Settings List Items */}
            <div style={{ borderBottom: "8px solid rgba(0,0,0,0.05)" }}>
              <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", borderBottom: "1px solid var(--border-color)" }} onClick={() => setActivePage("My Files")}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <FolderOpen size={18} style={{ color: "var(--text-secondary)" }} />
                  <span style={{ fontSize: "14px", color: "var(--text-primary)" }}>Media, links and docs</span>
                </div>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{myFiles.length} &rsaquo;</span>
              </div>
              <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", borderBottom: "1px solid var(--border-color)" }} onClick={() => setActivePage("Favorites")}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <Star size={18} style={{ color: "var(--text-secondary)" }} />
                  <span style={{ fontSize: "14px", color: "var(--text-primary)" }}>Starred messages</span>
                </div>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{starredMessageIds.length} &rsaquo;</span>
              </div>
              <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }} onClick={() => setIsChatWallpaperModalOpen(true)}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <ImageIcon size={18} style={{ color: "var(--text-secondary)" }} />
                  <span style={{ fontSize: "14px", color: "var(--text-primary)" }}>Chat Wallpaper</span>
                </div>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>&rsaquo;</span>
              </div>
            </div>

            {/* Participants List */}
            <div style={{ flex: 1, padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
                  {nearbyDevices.length + 1} members
                </span>
                <Search size={16} style={{ color: "var(--text-secondary)", cursor: "pointer" }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {/* Current User ("You") */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 10px", borderRadius: "10px", backgroundColor: "rgba(108, 99, 255, 0.05)" }}>
                  <div style={{ position: "relative", width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden", backgroundColor: "var(--primary)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: 700 }}>
                    {userCustomAvatar ? (
                      <img src={userCustomAvatar} alt="You" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      username ? username.charAt(0).toUpperCase() : "Y"
                    )}
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{username || "You"}</span>
                      <span style={{ fontSize: "10px", fontWeight: 700, backgroundColor: "var(--primary)", color: "#ffffff", padding: "1px 5px", borderRadius: "4px" }}>You</span>
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{deviceName} &bull; Local Host</span>
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: 700, backgroundColor: "rgba(16, 185, 129, 0.15)", color: "var(--success)", padding: "2px 6px", borderRadius: "4px" }}>Group admin</span>
                </div>

                {/* Other Devices */}
                {nearbyDevices.map((device, idx) => {
                  const initial = device.name ? device.name.charAt(0).toUpperCase() : "?";
                  const colors = ["#6C63FF", "#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6"];
                  const bgColor = colors[(device.name ? device.name.charCodeAt(0) : 0) % colors.length];
                  const peerImg = peerAvatars[device.name] || device.avatar;
                  
                  return (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 10px", borderRadius: "10px" }}>
                      <div style={{ position: "relative", width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden", backgroundColor: bgColor, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: 700 }}>
                        {peerImg && peerImg !== "avatar_1" ? (
                          <img src={peerImg} alt={device.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          initial
                        )}
                      </div>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{device.name}</span>
                        <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>IP: {device.ip}</span>
                      </div>
                      {idx === 0 && (
                        <span style={{ fontSize: "10px", fontWeight: 700, backgroundColor: "rgba(16, 185, 129, 0.15)", color: "var(--success)", padding: "2px 6px", borderRadius: "4px" }}>Group admin</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };


  // ----------------------------------------------------
  // RENDER VIEW: Favorites UI
  // ----------------------------------------------------
  const renderFavorites = () => {
    // Collect starred chat messages & attachments
    const starredChatItems: Array<{
      id: string;
      title: string;
      subtitle: string;
      time: string;
      fileUrl?: string;
      fileName?: string;
      fileSize?: string;
      category: "Images" | "Documents" | "Videos" | "Audio" | "Messages" | "Files";
      rawMsg?: ChatMessage;
    }> = [];

    Object.entries(chatMessages).forEach(([chatName, msgs]) => {
      msgs.forEach((m) => {
        if (starredMessageIds.includes(m.id)) {
          let cat: "Images" | "Documents" | "Videos" | "Audio" | "Messages" | "Files" = "Messages";
          let fUrl = m.file;

          if (m.file) {
            const ext = (m.file_name || "").split('.').pop()?.toLowerCase() || "";
            const ft = (m.file_type || "").toLowerCase();
            if (ft.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(ext)) {
              cat = "Images";
            } else if (ft.startsWith("video/") || ["mp4", "mov", "m4v", "avi", "mkv"].includes(ext)) {
              cat = "Videos";
            } else if (ft.startsWith("audio/") || ["mp3", "wav", "ogg", "m4a"].includes(ext)) {
              cat = "Audio";
            } else if (["pdf", "doc", "docx", "txt", "ppt", "pptx", "xls", "xlsx"].includes(ext)) {
              cat = "Documents";
            } else {
              cat = "Files";
            }
          }

          starredChatItems.push({
            id: m.id,
            title: m.file_name ? m.file_name : (m.text || "Starred Message"),
            subtitle: `Chat with ${chatName} • ${m.sender === "you" ? "Sent by You" : "Received"}`,
            time: m.time,
            fileUrl: fUrl,
            fileName: m.file_name,
            fileSize: m.file_size ? formatBytes(m.file_size) : undefined,
            category: cat,
            rawMsg: m
          });
        }
      });
    });

    const displayItems = starredChatItems;

    // Filter by search query
    const searchedItems = displayItems.filter(item => {
      const q = favoritesSearch.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q);
    });

    // Filter by active pill category tab
    const filteredItems = searchedItems.filter(item => {
      if (favoritesTab === "All") return true;
      return item.category === favoritesTab;
    });

    const totalCount = displayItems.length;
    const imagesCount = displayItems.filter(i => i.category === "Images").length;
    const docsCount = displayItems.filter(i => i.category === "Documents").length;
    const msgsCount = displayItems.filter(i => i.category === "Messages").length;

    return (
      <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
        {/* Header Section */}
        <div className={styles.pageHeader}>
          <div className={styles.titleArea}>
            <h1>Favorites</h1>
            <span className={styles.subtitle}>Quick access to your starred files, attachments, and important messages.</span>
          </div>
          
          <div className={styles.headerControls}>
            <div className={styles.subSearchWrapper}>
              <Search className={styles.subSearchIcon} />
              <input
                type="text"
                className={styles.subSearchInput}
                placeholder="Search favorites..."
                value={favoritesSearch}
                onChange={(e) => setFavoritesSearch(e.target.value)}
              />
            </div>
            <button className={styles.controlButton} title="Options">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
          <div className={styles.quickActionCard} style={{ flexDirection: "row", justifyContent: "flex-start", padding: "16px 20px", cursor: "default" }}>
            <div className={styles.actionIconWrapper} style={{ borderRadius: "10px", backgroundColor: "rgba(245, 158, 11, 0.12)", color: "#F59E0B" }}>
              <Star size={18} style={{ fill: "#F59E0B" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left", gap: "2px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Starred Items</span>
              <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-family-outfit)" }}>{totalCount}</span>
              <span style={{ fontSize: "11px", color: "var(--success)", fontWeight: 600 }}>Bookmarked</span>
            </div>
          </div>

          <div className={styles.quickActionCard} style={{ flexDirection: "row", justifyContent: "flex-start", padding: "16px 20px", cursor: "default" }}>
            <div className={styles.actionIconWrapper} style={{ borderRadius: "10px", backgroundColor: "rgba(16, 185, 129, 0.08)", color: "var(--success)" }}>
              <ImageIcon size={18} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left", gap: "2px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Starred Images</span>
              <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-family-outfit)" }}>{imagesCount}</span>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Photos & Art</span>
            </div>
          </div>

          <div className={styles.quickActionCard} style={{ flexDirection: "row", justifyContent: "flex-start", padding: "16px 20px", cursor: "default" }}>
            <div className={styles.actionIconWrapper} style={{ borderRadius: "10px", backgroundColor: "rgba(59, 130, 246, 0.08)", color: "var(--info)" }}>
              <FileText size={18} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left", gap: "2px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Starred Documents</span>
              <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-family-outfit)" }}>{docsCount}</span>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Files & PDFs</span>
            </div>
          </div>

          <div className={styles.quickActionCard} style={{ flexDirection: "row", justifyContent: "flex-start", padding: "16px 20px", cursor: "default" }}>
            <div className={styles.actionIconWrapper} style={{ borderRadius: "10px", backgroundColor: "rgba(139, 92, 246, 0.08)", color: "#8B5CF6" }}>
              <MessageSquare size={18} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left", gap: "2px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Messages</span>
              <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-family-outfit)" }}>{msgsCount}</span>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Saved chats</span>
            </div>
          </div>
        </div>

        {/* Pill Category Tabs */}
        <div className={styles.pillTabsContainer}>
          {["All", "Images", "Documents", "Videos", "Audio", "Messages"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFavoritesTab(tab)}
              className={`${styles.pillTab} ${favoritesTab === tab ? styles.activePillTab : ""}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Favorites Content List Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
          {filteredItems.map((item) => (
            <div 
              key={item.id}
              className={styles.quickActionCard}
              style={{
                flexDirection: "column",
                alignItems: "stretch",
                padding: "16px",
                position: "relative",
                cursor: "default",
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--border-radius-lg)",
                boxShadow: "0 4px 14px rgba(0,0,0,0.05)"
              }}
            >
              {/* Unstar / Remove Button */}
              <button
                type="button"
                onClick={() => toggleStarMessage(item.id)}
                title="Unstar / Remove from Favorites"
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#F59E0B",
                  padding: "4px",
                  zIndex: 2
                }}
              >
                <Star size={18} style={{ fill: "#F59E0B" }} />
              </button>

              {/* Media Preview or Icon Header */}
              {item.category === "Images" && item.fileUrl ? (
                <div 
                  style={{ width: "100%", height: "160px", borderRadius: "12px", overflow: "hidden", marginBottom: "12px", position: "relative", cursor: "pointer", backgroundColor: "rgba(0,0,0,0.2)" }}
                  onClick={() => handlePreviewFile(item.fileName || "image.png", item.category, item.fileUrl)}
                >
                  <img src={item.fileUrl} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", bottom: "8px", right: "8px", backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", color: "#fff", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Eye size={12} /> Preview
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <div className={styles.actionIconWrapper} style={{ borderRadius: "10px", width: "40px", height: "40px", flexShrink: 0 }}>
                    {item.category === "Messages" ? <MessageSquare size={20} /> : <FileText size={20} />}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{item.title}</span>
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{item.fileSize || item.category}</span>
                  </div>
                </div>
              )}

              {/* Title / Description for images or text messages */}
              {item.category === "Images" && (
                <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                  {item.title}
                </span>
              )}
              {item.category === "Messages" && item.rawMsg?.text && (
                <p style={{ fontSize: "13px", color: "var(--text-primary)", margin: "0 0 12px 0", backgroundColor: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "8px", borderLeft: "3px solid var(--primary)" }}>
                  "{item.rawMsg.text}"
                </p>
              )}

              {/* Card Footer Meta & Action Buttons */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: "8px", borderTop: "1px solid var(--border-color)" }}>
                <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{item.subtitle}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {item.fileUrl && (
                    <a 
                      href={item.fileUrl} 
                      download={item.fileName || "file"} 
                      className={styles.actionButton}
                      title="Download File"
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
                    >
                      <ArrowDown size={14} />
                    </a>
                  )}
                  {item.category === "Images" && item.fileUrl && (
                    <button 
                      type="button" 
                      className={styles.actionButton}
                      title="View Image"
                      onClick={() => handlePreviewFile(item.fileName || "image.png", item.category, item.fileUrl)}
                    >
                      <Eye size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div style={{ padding: "64px 24px", textAlign: "center", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-lg)", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(245, 158, 11, 0.1)", color: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Star size={32} style={{ fill: "#F59E0B" }} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>No Favorites Found</h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "400px", margin: 0 }}>
              {favoritesSearch ? "No starred items match your search filter." : "You haven't starred any files or messages yet. Right-click or click the star icon ⭐ on any attachment in chat or file list to save it here for quick access!"}
            </p>
          </div>
        )}
      </div>
    );
  };

  // ----------------------------------------------------
  // RENDER VIEW: Placeholder Screen (Chats, Sent, Favorites, Devices, Settings)
  // ----------------------------------------------------
  const renderPlaceholderScreen = (pageName: string) => {
    return (
      <div className="animate-fade-in" style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div className={styles.placeholderScreen}>
          <div className={styles.placeholderIcon}>
            {pageName === "Chats" && <MessageSquare size={64} />}
            {pageName === "Sent" && <ArrowUp size={64} />}
            {pageName === "Tavorfers" && <Heart size={64} style={{ fill: "rgba(94, 92, 230, 0.1)" }} />}
            {pageName === "Devices" && <Monitor size={64} />}
            {pageName === "Settings" && <Settings size={64} />}
          </div>
          <span className={styles.placeholderTitle}>{pageName} Screen</span>
          <span className={styles.placeholderText}>
            This is a premium mockup of the {pageName.toLowerCase()} section. When Django backend integration begins, this area will render the complete real-time sync views.
          </span>
          <button className={styles.placeholderBtn} onClick={() => setActivePage("Dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // RENDER VIEW: Devices Screen (Matches ui 6.jpeg)
  // ----------------------------------------------------
  const renderDevices = () => {
    // Filter lists
    const onlineDevices = devicesList.filter(d => d.status === "Online");
    const offlineDevices = devicesList.filter(d => d.status === "Offline");

    // Filter by search
    const getFilteredDevices = (list: typeof devicesList) => {
      let filtered = list;
      if (devicesSearch.trim() !== "") {
        filtered = filtered.filter(d => 
          d.name.toLowerCase().includes(devicesSearch.toLowerCase()) ||
          d.ip.includes(devicesSearch) ||
          d.type.toLowerCase().includes(devicesSearch.toLowerCase())
        );
      }
      return filtered;
    };

    const displayOnline = getFilteredDevices(onlineDevices);
    const displayOffline = getFilteredDevices(offlineDevices);

    const totalCount = devicesList.length;
    const onlineCount = onlineDevices.length;
    const recentlySeenCount = devicesList.filter(d => d.lastSeen.includes("min") || d.lastSeen.includes("now") || d.lastSeen.includes("Just now")).length;
    const blockedCount = 0;

    const osIcon = (type: string, name: string = "") => {
      const lowerType = (type || "").toLowerCase();
      const lowerName = (name || "").toLowerCase();
      
      if (lowerType.includes("/")) {
        return <Monitor size={16} style={{ color: "#8b5cf6" }} />;
      } else if (lowerType === "mobile" || lowerType === "phone" || lowerType === "android") {
        return <Smartphone size={16} style={{ color: lowerName.includes("iphone") ? "#a2aaad" : "#3ddc84" }} />;
      } else if (lowerType === "tablet" || lowerType === "ios") {
        return <Smartphone size={16} style={{ color: "#3b82f6" }} />;
      } else {
        if (lowerName.includes("macbook") || lowerName.includes("mac")) {
          return <Laptop size={16} style={{ color: "#a2aaad" }} />;
        }
        return <Laptop size={16} style={{ color: "#0078d7" }} />;
      }
    };

    return (
      <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
        {/* Header Section */}
        <div className={styles.pageHeader}>
          <div className={styles.titleArea}>
            <h1>Devices</h1>
            <span className={styles.subtitle}>Manage and connect with devices on your network.</span>
          </div>
          
          <div className={styles.headerControls}>
            <div className={styles.subSearchWrapper}>
              <Search className={styles.subSearchIcon} />
              <input
                type="text"
                className={styles.subSearchInput}
                placeholder="Search devices..."
                value={devicesSearch}
                onChange={(e) => setDevicesSearch(e.target.value)}
              />
            </div>
            <button className={styles.controlButton} title="More Settings">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Stat Cards Grid */}
        <div className={styles.devicesStatsGrid}>
          {/* Card 1: Total Devices */}
          <div className={styles.deviceStatCard}>
            <div className={`${styles.deviceStatIcon} ${styles.blueStat}`}>
              <Monitor size={22} />
            </div>
            <div className={styles.deviceStatContent}>
              <span className={styles.deviceStatTitle}>Total Devices</span>
              <span className={styles.deviceStatValue}>{totalCount}</span>
              <span className={styles.deviceStatSubtext} style={{ color: "var(--success)", fontWeight: 600 }}>
                {onlineCount} online
              </span>
            </div>
          </div>

          {/* Card 2: Online Devices */}
          <div className={styles.deviceStatCard}>
            <div className={`${styles.deviceStatIcon} ${styles.greenStat}`}>
              <Wifi size={22} />
            </div>
            <div className={styles.deviceStatContent}>
              <span className={styles.deviceStatTitle}>Online Devices</span>
              <span className={styles.deviceStatValue}>{onlineCount}</span>
              <span className={styles.deviceStatSubtext}>Connected now</span>
            </div>
          </div>

          {/* Card 3: Recently Seen */}
          <div className={styles.deviceStatCard}>
            <div className={`${styles.deviceStatIcon} ${styles.purpleStat}`}>
              <Clock size={22} />
            </div>
            <div className={styles.deviceStatContent}>
              <span className={styles.deviceStatTitle}>Recently Seen</span>
              <span className={styles.deviceStatValue}>{recentlySeenCount}</span>
              <span className={styles.deviceStatSubtext}>In the last 7 days</span>
            </div>
          </div>

          {/* Card 4: Blocked Devices */}
          <div className={styles.deviceStatCard}>
            <div className={`${styles.deviceStatIcon} ${styles.grayStat}`}>
              <Shield size={22} />
            </div>
            <div className={styles.deviceStatContent}>
              <span className={styles.deviceStatTitle}>Blocked Devices</span>
              <span className={styles.deviceStatValue}>{blockedCount}</span>
              <span className={styles.deviceStatSubtext}>No blocked devices</span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className={styles.tabsContainer}>
          {["All Devices", "Online", "Offline", "Recently Seen"].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`${styles.tab} ${devicesTab === tab ? styles.activeTab : ""}`}
              onClick={() => setDevicesTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Device Lists (Tables) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Online Section */}
          {(devicesTab === "All Devices" || devicesTab === "Online" || (devicesTab === "Recently Seen" && onlineCount > 0)) && (
            <div className={styles.tableSection}>
              <span className={styles.deviceSectionHeading}>Online Devices ({displayOnline.length})</span>
              <div className={styles.tableCard}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Device Name</th>
                      <th>IP Address</th>
                      <th>Device Type</th>
                      <th>Last Seen</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayOnline.map((device, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div className={styles.tableDeviceIconWrapper}>
                              {osIcon(device.type, device.name)}
                            </div>
                            {device.name}
                          </div>
                        </td>
                        <td>{device.ip}</td>
                        <td>
                          <span className={styles.deviceTypeBadge}>{device.type}</span>
                        </td>
                        <td>{device.lastSeen}</td>
                        <td>
                          <span className={`${styles.statusDotBadge} ${styles.statusOnline}`}>Online</span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                            <button 
                              className={styles.deviceActionBtn} 
                              onClick={() => {
                                setActiveChat(device.name);
                                setActivePage("Chats");
                              }}
                              title="Send Message"
                            >
                              <MessageSquare size={16} />
                            </button>
                            <button className={styles.deviceActionBtn} title="More options">
                              <MoreHorizontal size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {displayOnline.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "24px", color: "var(--text-secondary)" }}>
                          No online devices found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Offline Section */}
          {(devicesTab === "All Devices" || devicesTab === "Offline" || (devicesTab === "Recently Seen" && displayOffline.length > 0)) && (
            <div className={styles.tableSection}>
              <span className={styles.deviceSectionHeading}>Offline Devices ({displayOffline.length})</span>
              <div className={styles.tableCard}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Device Name</th>
                      <th>IP Address</th>
                      <th>Device Type</th>
                      <th>Last Seen</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayOffline.map((device, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div className={styles.tableDeviceIconWrapper} style={{ opacity: 0.6 }}>
                              {osIcon(device.type, device.name)}
                            </div>
                            {device.name}
                          </div>
                        </td>
                        <td>{device.ip}</td>
                        <td>
                          <span className={styles.deviceTypeBadge}>{device.type}</span>
                        </td>
                        <td>{device.lastSeen}</td>
                        <td>
                          <span className={`${styles.statusDotBadge} ${styles.statusOffline}`}>Offline</span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                            <button 
                              className={styles.deviceActionBtn} 
                              onClick={() => {
                                setActiveChat(device.name);
                                setActivePage("Chats");
                              }}
                              title="Send Message"
                              style={{ opacity: 0.5 }}
                            >
                              <MessageSquare size={16} />
                            </button>
                            <button className={styles.deviceActionBtn} title="More options">
                              <MoreHorizontal size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {displayOffline.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "24px", color: "var(--text-secondary)" }}>
                          No offline devices found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Scan Banner */}
        <div className={styles.scanBanner}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div className={styles.scanIconWrapper}>
              <Activity className={isScanning ? "animate-spin" : ""} size={20} />
            </div>
            <div>
              <h3 className={styles.scanBannerTitle}>Scan for Devices</h3>
              <p className={styles.scanBannerDescription}>Discover nearby devices connected to your local network.</p>
            </div>
          </div>
          <button 
            type="button" 
            className={styles.scanBtn}
            onClick={() => handleRefreshDevices()}
            disabled={isScanning}
          >
            {isScanning ? "Scanning..." : "Scan Now"}
          </button>
        </div>
      </div>
    );
  };



  // ----------------------------------------------------
  // RENDER VIEW: Settings UI (ui 9.png)
  // ----------------------------------------------------
  const renderSettings = () => {
    const menuItems = [
      { id: "General", label: "General Preferences" },
      { id: "Network", label: "Network & Security" },
      { id: "Storage", label: "Storage Settings" },
      { id: "About", label: "About FileShare" }
    ];

    return (
      <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Header Section */}
        <div className={styles.pageHeader}>
          <div className={styles.titleArea}>
            <h1>Settings</h1>
            <span className={styles.subtitle}>Configure your local file-sharing preferences.</span>
          </div>
        </div>

        <div className={styles.settingsSplitWrapper}>
          {/* Left Column Pane */}
          <div className={styles.settingsLeftPane}>
            {/* User Profile Card */}
            <div className={styles.settingsProfileCard} style={{ flexDirection: "column", alignItems: "center", textAlign: "center", padding: "20px" }}>
              <div className={styles.settingsAvatarWrapper} style={{ margin: "0 auto" }}>
                {username ? username.charAt(0).toUpperCase() : "Y"}
              </div>
              <div className={styles.settingsProfileInfo} style={{ alignItems: "center", marginTop: "12px" }}>
                <span className={styles.settingsProfileName}>{username}</span>
                {typeof window !== "undefined" && localStorage.getItem("fileshare_logged_in_email") && (
                  <span style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginTop: "2px", opacity: 0.8 }}>
                    {localStorage.getItem("fileshare_logged_in_email")}
                  </span>
                )}
                <span className={styles.settingsProfileDevice} style={{ marginTop: "4px" }}>{deviceName}</span>
              </div>
              <button 
                className={styles.scanBtn} 
                style={{ width: "100%", marginTop: "16px", padding: "8px" }}
                onClick={() => {
                  setEditUsernameInput(username);
                  setEditDeviceNameInput(deviceName);
                  setIsEditModalOpen(true);
                }}
              >
                Edit Profile
              </button>
            </div>

            {/* Menu List */}
            <div className={styles.settingsNavMenu}>
              {menuItems.map(item => {
                const isActive = settingsSubCategory === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSettingsSubCategory(item.id)}
                    className={`${styles.settingsNavItem} ${isActive ? styles.settingsNavItemActive : ""}`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column Pane */}
          <div className={styles.settingsRightPane}>
            {settingsSubCategory === "General" && (
              <div className={styles.settingsGroup} style={{ animation: "fade-in 0.3s ease-out" }}>
                <span className={styles.settingsGroupTitle}>General Preferences</span>
                <div className={styles.settingsCard}>
                  <div className={styles.settingsRow}>
                    <div className={styles.settingsRowLeft}>
                      <span className={styles.settingsRowTitle}>Dark Mode</span>
                      <span className={styles.settingsRowDesc}>Use high-contrast dark theme</span>
                    </div>
                    <label className={styles.switchContainer}>
                      <input 
                        type="checkbox" 
                        className={styles.switchInput}
                        checked={settingsDarkMode}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setSettingsDarkMode(val);
                          if (val) {
                            document.documentElement.classList.add("dark");
                            localStorage.setItem("theme", "dark");
                          } else {
                            document.documentElement.classList.remove("dark");
                            localStorage.setItem("theme", "light");
                          }
                        }}
                      />
                      <span className={styles.switchSlider} />
                    </label>
                  </div>

                  <div className={styles.settingsRow}>
                    <div className={styles.settingsRowLeft}>
                      <span className={styles.settingsRowTitle}>Auto-Accept Transfers</span>
                      <span className={styles.settingsRowDesc}>Automatically accept files from trusted devices</span>
                    </div>
                    <label className={styles.switchContainer}>
                      <input 
                        type="checkbox" 
                        className={styles.switchInput}
                        checked={settingsAutoAccept}
                        onChange={(e) => setSettingsAutoAccept(e.target.checked)}
                      />
                      <span className={styles.switchSlider} />
                    </label>
                  </div>

                  <div className={styles.settingsRow}>
                    <div className={styles.settingsRowLeft}>
                      <span className={styles.settingsRowTitle}>Notification Sounds</span>
                      <span className={styles.settingsRowDesc}>Play chime on transfer completion</span>
                    </div>
                    <label className={styles.switchContainer}>
                      <input 
                        type="checkbox" 
                        className={styles.switchInput}
                        checked={settingsPlaySound}
                        onChange={(e) => setSettingsPlaySound(e.target.checked)}
                      />
                      <span className={styles.switchSlider} />
                    </label>
                  </div>
                </div>

                {/* Account Section */}
                <span className={styles.settingsGroupTitle} style={{ marginTop: "24px" }}>Account Session</span>
                <div className={styles.settingsCard}>
                  <div className={styles.settingsRow}>
                    <div className={styles.settingsRowLeft}>
                      <span className={styles.settingsRowTitle}>Logged in as {username}</span>
                      <span className={styles.settingsRowDesc}>Manage your current offline session</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        fetch(getApiUrl("/auth/logout"), { method: "POST" })
                          .finally(() => {
                            localStorage.removeItem("fileshare_logged_in_user");
                            localStorage.removeItem("username");
                            setUsername("You");
                            setIsLoggedIn(false);
                            toast.info("Logged out successfully");
                          });
                      }}
                      style={{
                        backgroundColor: "#EF4444",
                        color: "#FFF",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      Log Out
                    </button>
                  </div>
                </div>

                {/* Chat Atmosphere & Particles Settings */}
                <span className={styles.settingsGroupTitle} style={{ marginTop: "24px" }}>Chat Atmosphere & Effects</span>
                <div className={styles.settingsCard}>
                  <div className={styles.settingsRow}>
                    <div className={styles.settingsRowLeft}>
                      <span className={styles.settingsRowTitle}>Chat Star Particles (Dark Mode)</span>
                      <span className={styles.settingsRowDesc}>Render dynamic twinkling stars in dark mode chat background</span>
                    </div>
                    <label className={styles.switchContainer}>
                      <input 
                        type="checkbox" 
                        className={styles.switchInput}
                        checked={settingsStarEnabled}
                        onChange={(e) => setSettingsStarEnabled(e.target.checked)}
                      />
                      <span className={styles.switchSlider} />
                    </label>
                  </div>

                  {settingsStarEnabled && (
                    <>
                      <div className={styles.settingsFormGroup} style={{ marginTop: "12px" }}>
                        <label className={styles.settingsLabel}>Star Intensity / Density</label>
                        <select 
                          className={styles.settingsSelect}
                          value={settingsStarIntensity}
                          onChange={(e) => setSettingsStarIntensity(e.target.value)}
                        >
                          <option value="Low">Low (Subtle stars)</option>
                          <option value="Medium">Medium (Balanced galaxy)</option>
                          <option value="High">High (Dense starlight)</option>
                        </select>
                      </div>

                      <div className={styles.settingsFormGroup} style={{ marginTop: "12px" }}>
                        <label className={styles.settingsLabel}>Twinkle & Motion Speed</label>
                        <select 
                          className={styles.settingsSelect}
                          value={settingsStarSpeed}
                          onChange={(e) => setSettingsStarSpeed(e.target.value)}
                        >
                          <option value="Slow">Slow (Calm drift)</option>
                          <option value="Normal">Normal (Smooth twinkle)</option>
                          <option value="Fast">Fast (Energetic motion)</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}


            {settingsSubCategory === "Network" && (
              <div className={styles.settingsGroup} style={{ animation: "fade-in 0.3s ease-out" }}>
                <span className={styles.settingsGroupTitle}>Network & Security</span>
                <div className={styles.settingsCard}>
                  <div className={styles.settingsFormGroup}>
                    <label className={styles.settingsLabel}>Discovery Visibility</label>
                    <select 
                      className={styles.settingsSelect}
                      value={settingsVisibility}
                      onChange={(e) => setSettingsVisibility(e.target.value)}
                    >
                      <option value="everyone">Visible to Everyone</option>
                      <option value="contacts">Visible to Contacts Only</option>
                      <option value="hidden">Hidden (Invisible)</option>
                    </select>
                  </div>

                  <div className={styles.settingsFormGroup}>
                    <label className={styles.settingsLabel}>Preferred Listening Port</label>
                    <input 
                      type="text" 
                      className={styles.settingsInput}
                      value={settingsPort}
                      onChange={(e) => setSettingsPort(e.target.value)}
                      placeholder="e.g. 8000"
                    />
                  </div>
                </div>
              </div>
            )}

            {settingsSubCategory === "Storage" && (
              <div className={styles.settingsGroup} style={{ animation: "fade-in 0.3s ease-out" }}>
                <span className={styles.settingsGroupTitle}>Storage Settings</span>
                <div className={styles.settingsCard}>
                  <div className={styles.settingsFormGroup}>
                    <label className={styles.settingsLabel}>Download Path</label>
                    <input 
                      type="text" 
                      className={styles.settingsInput}
                      value={settingsDownloadPath}
                      onChange={(e) => setSettingsDownloadPath(e.target.value)}
                      placeholder="C:\Downloads\FileShare"
                    />
                  </div>

                  <div className={styles.settingsRow}>
                    <div className={styles.settingsRowLeft}>
                      <span className={styles.settingsRowTitle}>Auto-clear Logs</span>
                      <span className={styles.settingsRowDesc}>Remove transfer history logs older than 30 days</span>
                    </div>
                    <label className={styles.switchContainer}>
                      <input 
                        type="checkbox" 
                        className={styles.switchInput}
                        checked={settingsClearLogs}
                        onChange={(e) => setSettingsClearLogs(e.target.checked)}
                      />
                      <span className={styles.switchSlider} />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {settingsSubCategory === "About" && (
              <div className={styles.settingsGroup} style={{ animation: "fade-in 0.3s ease-out" }}>
                <span className={styles.settingsGroupTitle}>About</span>
                <div className={styles.settingsCard}>
                  <div className={styles.settingsRow}>
                    <div className={styles.settingsRowLeft}>
                      <span className={styles.settingsRowTitle}>FileShare App</span>
                      <span className={styles.settingsRowDesc}>Version 1.0.0 (GPL v3 Copyleft Protection)</span>
                    </div>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>Active</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // RENDER VIEW: Screen Share & Live Broadcast Dashboard
  // ----------------------------------------------------
  const renderScreenShare = () => {
    const isLiveActive = activeScreenPresenter?.active;
    const isMobileDevice = typeof window !== "undefined" && (window.innerWidth < 768 || /Android|iPhone|iPad/i.test(navigator.userAgent));

    return (
      <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Header Section */}
        <div className={styles.pageHeader}>
          <div className={styles.titleArea}>
            <h1 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Tv size={26} style={{ color: "var(--primary)" }} />
              Screen Share & Live Broadcast
            </h1>
            <span className={styles.subtitle}>Real-time WebRTC screen streaming across devices on your local network.</span>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: isMobileDevice ? "#F59E0B" : "#10B981", backgroundColor: isMobileDevice ? "rgba(245, 158, 11, 0.12)" : "rgba(16, 185, 129, 0.12)", padding: "4px 12px", borderRadius: "16px", border: isMobileDevice ? "1px solid rgba(245, 158, 11, 0.3)" : "1px solid rgba(16, 185, 129, 0.3)" }}>
              {isMobileDevice ? "📱 Mobile Viewer Mode" : "💻 Desktop Presenter Enabled"}
            </span>
          </div>
        </div>

        {/* Live Broadcast Status Hero Banner */}
        <div 
          style={{ 
            padding: "32px", 
            borderRadius: "20px", 
            backgroundColor: isLiveActive ? "rgba(239, 68, 68, 0.08)" : "var(--bg-card)", 
            border: isLiveActive ? "2px solid #EF4444" : "1px solid var(--border-color)", 
            boxShadow: isLiveActive ? "0 10px 30px rgba(239, 68, 68, 0.2)" : "var(--box-shadow-sm)",
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "16px", backgroundColor: isLiveActive ? "#EF4444" : "var(--primary-light)", color: isLiveActive ? "#FFFFFF" : "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: isLiveActive ? "0 0 20px rgba(239, 68, 68, 0.5)" : "none" }}>
                <Tv size={28} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {isLiveActive ? `LIVE Broadcast: ${activeScreenPresenter?.presenter_name}` : "No Screen Broadcast Active"}
                  </span>
                  {isLiveActive && (
                    <span style={{ backgroundColor: "#EF4444", color: "#FFFFFF", fontSize: "11px", fontWeight: 800, padding: "2px 8px", borderRadius: "12px", letterSpacing: "0.5px", animation: "pulse 2s infinite" }}>
                      ● LIVE
                    </span>
                  )}
                </div>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  {isLiveActive 
                    ? `Broadcasting live to all network devices. Audio Share: ${activeScreenPresenter?.audio_enabled ? "Enabled" : "Disabled"}`
                    : "Only one presenter can share screen at a time. All other devices can watch live stream."}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {isLiveActive ? (
                isSharingScreen ? (
                  <>
                    <button
                      type="button"
                      onClick={handleToggleScreenAudio}
                      style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "10px", backgroundColor: "var(--bg-app)", border: "1px solid var(--border-color)", color: "var(--text-primary)", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                    >
                      {screenShareAudioMuted ? <MicOff size={16} color="#EF4444" /> : <Mic size={16} color="#10B981" />}
                      <span>{screenShareAudioMuted ? "Unmute Audio Share" : "Mute Audio Share"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleChangeScreen}
                      style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "10px", backgroundColor: "rgba(108, 99, 255, 0.15)", border: "1px solid var(--primary)", color: "var(--primary)", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
                    >
                      <RotateCw size={16} />
                      <span>Change Screen</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleStopScreenShare}
                      style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "10px", backgroundColor: "#EF4444", color: "#FFFFFF", border: "none", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(239, 68, 68, 0.4)" }}
                    >
                      <X size={16} />
                      <span>Stop Screen Share</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsWatchingScreen(true);
                    }}
                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px", borderRadius: "10px", backgroundColor: "var(--primary)", color: "#FFFFFF", border: "none", fontSize: "14px", fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 20px rgba(108, 99, 255, 0.4)" }}
                  >
                    <Play size={18} style={{ fill: "#FFFFFF" }} />
                    <span>Watch Live Stream</span>
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={handleStartScreenShare}
                  disabled={isMobileDevice}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px 24px",
                    borderRadius: "10px",
                    backgroundColor: isMobileDevice ? "var(--border-color)" : "var(--primary)",
                    color: isMobileDevice ? "var(--text-muted)" : "#FFFFFF",
                    border: "none",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: isMobileDevice ? "not-allowed" : "pointer",
                    boxShadow: isMobileDevice ? "none" : "0 6px 20px rgba(108, 99, 255, 0.4)"
                  }}
                >
                  <Tv size={18} />
                  <span>{isMobileDevice ? "Desktop Only Presenter" : "Start Live Screen Share"}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          <div className={styles.settingsCard} style={{ padding: "20px" }}>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>⚡ Single Presenter Lock</span>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
              Ensures zero conflicts on LAN. Only 1 user can broadcast screen at a time so everyone stays focused.
            </p>
          </div>

          <div className={styles.settingsCard} style={{ padding: "20px" }}>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>📱 Multi-Device Watchers</span>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
              Mobile devices & extra PCs auto-receive live broadcast streams without needing complex software setup.
            </p>
          </div>

          <div className={styles.settingsCard} style={{ padding: "20px" }}>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>🔊 System Audio Sharing</span>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
              Presenter can toggle system audio ON/OFF anytime during screen share for seamless video presentation.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Active view router dispatcher
  const renderActiveScreen = () => {
    switch (activePage) {
      case "Dashboard":
        return renderDashboard();
      case "Chats":
        return renderChats();
      case "Screen Share":
        return renderScreenShare();
      case "My Files":
        return renderMyFiles();
      case "Transfers":
        return renderTransfers();
      case "Favorites":
        return renderFavorites();
      case "Devices":
        return renderDevices();
      case "Settings":
        return renderSettings();
      default:
        return renderPlaceholderScreen(activePage);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const endpoint = isRegistering ? "/api/auth/register" : "/api/auth/login";
    
    // Auto detect device details
    const ua = navigator.userAgent;
    let detectedType = "desktop";
    let detectedName = "Windows PC";
    if (/android/i.test(ua)) {
      detectedType = "mobile";
      detectedName = "Android Phone";
    } else if (/iPad|iPhone|iPod/.test(ua)) {
      detectedType = "mobile";
      detectedName = "iPhone";
    } else if (/Macintosh/i.test(ua)) {
      detectedName = "Macbook";
    } else if (/Linux/i.test(ua)) {
      detectedName = "Linux PC";
    }

    try {
      const payload = isRegistering ? {
        username: authName,
        email: authEmail,
        password: loginPassword,
        device_id: deviceId,
        device_name: deviceName || detectedName,
        device_type: detectedType
      } : {
        email: authEmail,
        password: loginPassword,
        device_id: deviceId,
        device_name: deviceName || detectedName,
        device_type: detectedType
      };

      const res = await fetch(getApiUrl(isRegistering ? "/auth/register" : "/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Authentication failed");
        return;
      }
      
      const loggedInUsername = data.user?.username || authName || authEmail;
      const loggedInEmail = data.user?.email || authEmail;

      // Save credentials locally
      localStorage.setItem("fileshare_logged_in_userid", String(data.user?.id || ""));
      localStorage.setItem("fileshare_logged_in_user", loggedInUsername);
      localStorage.setItem("fileshare_logged_in_email", loggedInEmail);
      localStorage.setItem("username", loggedInUsername);
      localStorage.setItem("deviceName", deviceName || detectedName);
      setUsername(loggedInUsername);
      setIsLoggedIn(true);

      if (data.user?.profile_completed) {
        localStorage.setItem("fileshare_profile_completed", "true");
        if (data.user?.avatar) {
          setUserCustomAvatar(data.user.avatar);
          localStorage.setItem("userCustomAvatar", data.user.avatar);
        }
      } else {
        const isProfileDone = localStorage.getItem("fileshare_profile_completed");
        if (!isProfileDone) {
          setSetupDeviceName(deviceName || detectedName);
          setShowProfileSetupModal(true);
        }
      }
      toast.success(isRegistering ? "Registration successful!" : "Logged in successfully!");
    } catch (err) {
      setAuthError("Failed to connect to backend server");
    }
  };

  const renderLoginScreen = () => {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "radial-gradient(circle at top right, #1E1B4B, #0F172A, #020617)",
        fontFamily: "'Outfit', 'Inter', sans-serif",
        padding: "20px"
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            width: "100%",
            maxWidth: isQuickDownloader ? "600px" : "420px",
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(24px)",
            borderRadius: "24px",
            border: "1px solid rgba(99, 102, 241, 0.15)",
            padding: "40px 32px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
            color: "#F8FAFC",
            transition: "max-width 0.3s ease"
          }}
        >
          {isQuickDownloader ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <button
                  type="button"
                  onClick={() => setIsQuickDownloader(false)}
                  style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Login</span>
                </button>
                <button
                  type="button"
                  onClick={fetchPublicFiles}
                  disabled={isFetchingPublicFiles}
                  style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(99, 102, 241, 0.1)", border: "1px solid rgba(99, 102, 241, 0.3)", borderRadius: "8px", padding: "6px 12px", color: "#818CF8", cursor: "pointer", fontSize: "12px", fontWeight: 700 }}
                >
                  <RefreshCw size={14} className={isFetchingPublicFiles ? "animate-spin" : ""} />
                  <span>Refresh</span>
                </button>
              </div>

              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <h3 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "#FFF", background: "linear-gradient(to right, #FFF, #C7D2FE)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Quick Downloader</h3>
                <p style={{ margin: "6px 0 0 0", fontSize: "14px", color: "#94A3B8" }}>Download shared files on this server without an account</p>
              </div>

              {/* Search Bar */}
              <div style={{ position: "relative", marginBottom: "20px" }}>
                <Search size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748B" }} />
                <input
                  type="text"
                  placeholder="Search shared files by name..."
                  value={publicSearchQuery}
                  onChange={(e) => setPublicSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px 12px 42px",
                    background: "rgba(2, 6, 23, 0.5)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    color: "#FFF",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
              </div>

              {/* File List */}
              <div style={{ maxHeight: "350px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingRight: "4px" }}>
                {isFetchingPublicFiles ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyItems: "center", padding: "40px 0", color: "#94A3B8" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#6366F1", animation: "spin 1s linear infinite", marginBottom: "12px" }}></div>
                    <span style={{ fontSize: "14px" }}>Loading shared files...</span>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </div>
                ) : (
                  (() => {
                    const filtered = publicFiles.filter(f => f.file_name.toLowerCase().includes(publicSearchQuery.toLowerCase()));
                    if (filtered.length === 0) {
                      return (
                        <div style={{ textAlign: "center", padding: "40px 0", color: "#64748B", fontSize: "14px" }}>
                          No shared files found on the server.
                        </div>
                      );
                    }
                    return filtered.map((file) => {
                      const ext = file.file_name.split('.').pop()?.toLowerCase() || "";
                      const fileDownloadUrl = getApiUrl(`/transfers/${file.id}/public_download_file`);

                      let thumbnailElement = null;
                      const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext);
                      const isVideo = ["mp4", "webm", "mov", "mkv"].includes(ext);
                      const isAudio = ["mp3", "wav", "ogg", "m4a", "flac", "aac"].includes(ext);

                      if (isImage) {
                        thumbnailElement = (
                          <img 
                            src={fileDownloadUrl} 
                            alt={file.file_name}
                            style={{ width: "42px", height: "42px", objectFit: "cover", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.08)", flexShrink: 0 }} 
                          />
                        );
                      } else if (isVideo) {
                        thumbnailElement = (
                          <div style={{ position: "relative", width: "42px", height: "42px", flexShrink: 0 }}>
                            <video 
                              src={fileDownloadUrl} 
                              muted
                              playsInline
                              preload="metadata"
                              style={{ width: "42px", height: "42px", objectFit: "cover", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.08)", backgroundColor: "#000" }} 
                              onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                              onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                            />
                            <Play size={14} style={{ position: "absolute", bottom: "2px", right: "2px", color: "#FFF", fill: "#FFF", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))" }} />
                          </div>
                        );
                      } else if (isAudio) {
                        const isThisPlaying = playingAudioId === file.id;
                        thumbnailElement = (
                          <button
                            type="button"
                            onClick={() => handleToggleAudioPreview(file.id, fileDownloadUrl)}
                            style={{
                              width: "42px", height: "42px", borderRadius: "12px", flexShrink: 0,
                              backgroundColor: isThisPlaying ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                              color: isThisPlaying ? "#10B981" : "#F59E0B",
                              border: "none", display: "flex", alignItems: "center", justifyContent: "center",
                              cursor: "pointer", transition: "all 0.2s"
                            }}
                          >
                            {isThisPlaying ? <Pause size={20} style={{ fill: "currentColor" }} /> : <Play size={20} style={{ fill: "currentColor", marginLeft: "2px" }} />}
                          </button>
                        );
                      } else {
                        let IconComponent = FileText;
                        let iconColor = "#818CF8";
                        if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) { IconComponent = Archive; iconColor = "#EF4444"; }
                        else if (["pdf"].includes(ext)) { iconColor = "#EF4444"; }
                        else if (["pptx", "ppt"].includes(ext)) { iconColor = "#F97316"; }
                        else if (["docx", "doc"].includes(ext)) { iconColor = "#3B82F6"; }
                        else if (["xlsx", "xls", "csv"].includes(ext)) { iconColor = "#10B981"; }
                        thumbnailElement = (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "42px", height: "42px", borderRadius: "12px", backgroundColor: "rgba(255, 255, 255, 0.03)", color: iconColor, flexShrink: 0 }}>
                            <IconComponent size={22} />
                          </div>
                        );
                      }

                      const canPreview = isImage || isVideo || isAudio || ["pdf", "txt"].includes(ext);

                      return (
                        <div
                          key={file.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "14px 18px",
                            background: "rgba(30, 41, 59, 0.4)",
                            border: "1px solid rgba(255, 255, 255, 0.05)",
                            borderRadius: "16px",
                            gap: "12px"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "14px", overflow: "hidden", flex: 1, minWidth: 0 }}>
                            {thumbnailElement}
                            <div style={{ overflow: "hidden", minWidth: 0 }}>
                              <div style={{ fontSize: "14px", fontWeight: 600, color: "#F1F5F9", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }} title={file.file_name}>
                                {file.file_name}
                              </div>
                              <div style={{ fontSize: "12px", color: "#94A3B8", marginTop: "2px" }}>
                                {formatBytes(file.file_size)} • {new Date(file.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                            {canPreview && (
                              <a
                                href={fileDownloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="View / Preview"
                                style={{
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  width: "38px", height: "38px", borderRadius: "12px",
                                  backgroundColor: "rgba(16, 185, 129, 0.12)", color: "#10B981",
                                  border: "1px solid rgba(16, 185, 129, 0.2)", cursor: "pointer", transition: "all 0.2s", textDecoration: "none"
                                }}
                              >
                                <Eye size={18} />
                              </a>
                            )}
                            <a
                              href={fileDownloadUrl}
                              download={file.file_name}
                              title="Download"
                              style={{
                                display: "flex", alignItems: "center", justifyContent: "center",
                                width: "38px", height: "38px", borderRadius: "12px",
                                backgroundColor: "rgba(99, 102, 241, 0.15)", color: "#818CF8",
                                border: "1px solid rgba(99, 102, 241, 0.2)", cursor: "pointer", transition: "all 0.2s", textDecoration: "none"
                              }}
                            >
                              <Download size={18} />
                            </a>
                          </div>
                        </div>
                      );
                    });
                  })()
                )}
              </div>
            </div>
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "64px",
                  height: "64px",
                  borderRadius: "20px",
                  background: "linear-gradient(135deg, #6366F1, #4F46E5)",
                  boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)",
                  color: "#FFF",
                  marginBottom: "16px"
                }}>
                  <Share2 size={32} />
                </div>
                <h2 style={{ margin: 0, fontSize: "28px", fontWeight: 800, letterSpacing: "-0.5px", background: "linear-gradient(to right, #FFF, #C7D2FE)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  FileShare
                </h2>
                <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: "#94A3B8" }}>
                  {isRegistering ? "Create your offline local account" : "Log in to access your offline network"}
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {isRegistering && (
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", color: "#818CF8", marginBottom: "8px" }}>
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter display name"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: "12px",
                        background: "rgba(2, 6, 23, 0.5)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#FFF",
                        fontSize: "15px",
                        outline: "none",
                        transition: "all 0.2s"
                      }}
                      onFocus={(e) => e.target.style.borderColor = "#6366F1"}
                      onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"}
                    />
                  </div>
                )}

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", color: "#818CF8", marginBottom: "8px" }}>
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Enter email address"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      background: "rgba(2, 6, 23, 0.5)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#FFF",
                      fontSize: "15px",
                      outline: "none",
                      transition: "all 0.2s"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#6366F1"}
                    onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", color: "#818CF8", marginBottom: "8px" }}>
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      background: "rgba(2, 6, 23, 0.5)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#FFF",
                      fontSize: "15px",
                      outline: "none",
                      transition: "all 0.2s"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#6366F1"}
                    onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"}
                  />
                </div>

                {authError && (
                  <div style={{ color: "#F87171", fontSize: "14px", textAlign: "center", backgroundColor: "rgba(220, 38, 38, 0.1)", padding: "10px", borderRadius: "10px", border: "1px solid rgba(220, 38, 38, 0.2)" }}>
                    {authError}
                  </div>
                )}

                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #6366F1, #4F46E5)",
                    color: "#FFF",
                    fontSize: "16px",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "none"}
                >
                  {isRegistering ? "Register Account" : "Log In"}
                </button>
              </form>

              <div style={{ display: "flex", alignItems: "center", margin: "20px 0", gap: "10px" }}>
                <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.08)" }}></div>
                <span style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>OR</span>
                <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.08)" }}></div>
              </div>

              <button
                type="button"
                onClick={() => setIsQuickDownloader(true)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "#E2E8F0",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                  e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                }}
              >
                <Download size={16} />
                <span>Quick Downloader (No Login)</span>
              </button>
            </>
          )}

          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <span style={{ fontSize: "14px", color: "#94A3B8" }}>
              {isRegistering ? "Already have an account? " : "New to the offline network? "}
            </span>
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setAuthError("");
              }}
              style={{
                background: "none",
                border: "none",
                color: "#6366F1",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                padding: 0,
                textDecoration: "underline"
              }}
            >
              {isRegistering ? "Log In" : "Register Now"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  const compressAndUploadAvatar = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context failed"));
          return;
        }

        const size = 256;
        canvas.width = size;
        canvas.height = size;

        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);

        canvas.toBlob(async (blob) => {
          if (!blob) {
            reject(new Error("Compression failed"));
            return;
          }

          const compressedFile = new File([blob], "avatar.jpg", { type: "image/jpeg" });
          const formData = new FormData();
          formData.append("device_id", deviceId);
          formData.append("avatar_file", compressedFile);

          try {
            const res = await fetch(getApiUrl("/devices/upload_avatar"), {
              method: "POST",
              body: formData
            });
            const data = await res.json();
            if (res.ok && data.avatar_url) {
              resolve(data.avatar_url);
            } else {
              reject(new Error(data.error || "Upload failed"));
            }
          } catch (err) {
            reject(err);
          }
        }, "image/jpeg", 0.7);
      };
      img.onerror = reject;
    });
  };

  const handleProfileSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupSubmitting(true);

    try {
      let finalAvatarUrl = "avatar_1";

      if (setupAvatarFile) {
        finalAvatarUrl = await compressAndUploadAvatar(setupAvatarFile);
      }

      localStorage.setItem("deviceName", setupDeviceName);
      localStorage.setItem("fileshare_user_avatar", finalAvatarUrl);
      localStorage.setItem("fileshare_profile_completed", "true");
      setDeviceName(setupDeviceName);
      setUserCustomAvatar(finalAvatarUrl);

      const ua = navigator.userAgent;
      let detectedType = "desktop";
      if (/android/i.test(ua) || /iPad|iPhone|iPod/.test(ua)) {
        detectedType = "mobile";
      }

      await fetch(getApiUrl("/devices/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_id: deviceId,
          username: username,
          device_name: setupDeviceName,
          device_type: detectedType,
          avatar: finalAvatarUrl
        })
      });

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "presence",
          device_id: deviceId,
          is_online: true
        }));
      }

      setShowProfileSetupModal(false);
      toast.success("Profile setup complete!");
      handleRefreshDevices();
      loadRecentChats();
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSetupSubmitting(false);
    }
  };

  const renderProfileSetupModal = () => {
    return (
      <div className={styles.modalOverlay} style={{ zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={styles.modalContent}
          style={{ maxWidth: "420px", padding: "32px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "20px" }}
        >
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Complete Your Profile</h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "6px" }}>Set up your local device identity</p>
          </div>

          <form onSubmit={handleProfileSetupSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Avatar Selector */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
              <div style={{
                position: "relative",
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px dashed var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                background: "rgba(99, 102, 241, 0.05)"
              }} onClick={() => document.getElementById("profileSetupImageInput")?.click()}>
                {setupAvatarPreview ? (
                  <img src={setupAvatarPreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <UploadCloud size={28} style={{ color: "var(--primary)" }} />
                )}
              </div>
              <input
                id="profileSetupImageInput"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSetupAvatarFile(file);
                    setSetupAvatarPreview(URL.createObjectURL(file));
                  }
                }}
              />
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Click to upload profile photo</span>
            </div>

            {/* Device Name input */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px" }}>
                Device Display Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. My Laptop, iPhone"
                value={setupDeviceName}
                onChange={(e) => setSetupDeviceName(e.target.value)}
                className={styles.settingsInput}
                style={{ width: "100%" }}
              />
            </div>

            <button
              type="submit"
              disabled={setupSubmitting}
              className={styles.modalBtnSave}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "14px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              {setupSubmitting ? "Saving Profile..." : "Complete Setup"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  };

  const totalUnreadChatsCount = useMemo(() => {
    return recentChats.reduce((acc, c) => acc + (c.unread || 0), 0);
  }, [recentChats]);

  if (!isLoggedIn) {
    return renderLoginScreen();
  }

  return (
    <div className={styles.container}>
      {/* Sidebar Layout */}
      <Sidebar 
        activePage={activePage} 
        onPageChange={setActivePage} 
        deviceName={deviceName} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        storageUsed={storageUsed >= 1 ? `${storageUsed} GB` : `${Math.round(storageUsed * 1024)} MB`}
        storagePercent={storagePercentage}
        deviceIp={typeof window !== "undefined" ? window.location.hostname : "192.168.1.5"}
        unreadChatCount={totalUnreadChatsCount}
      />

      {/* Main Container Layout */}
      <main className={styles.mainContent}>
        <Navbar
          isChatActive={activePage === "Chats" && activeChat !== ""}
          username={username}
          deviceName={deviceName}
          userCustomAvatar={userCustomAvatar}
          onEditProfile={() => {
            setEditUsernameInput(username);
            setEditDeviceNameInput(deviceName);
            setIsEditModalOpen(true);
          }}
          onToggleSidebar={() => setIsSidebarOpen(true)}
          darkMode={settingsDarkMode}
          onToggleDarkMode={() => {
            const next = !settingsDarkMode;
            setSettingsDarkMode(next);
            if (next) {
              document.documentElement.classList.add("dark");
              localStorage.setItem("theme", "dark");
            } else {
              document.documentElement.classList.remove("dark");
              localStorage.setItem("theme", "light");
            }
          }}
        />
        <div className={styles.contentWrapper}>
          {/* Mobile Category Quick-Access Pills (Only on Dashboard for quick jump) */}
          {activePage === "Dashboard" && (
            <div className={styles.categoryRow}>
              {[
                { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
                { id: "Chats", label: "Chats", icon: MessageSquare },
                { id: "My Files", label: "My Files", icon: FolderOpen },
                { id: "Favorites", label: "Favorites", icon: Star },
                { id: "Transfers", label: "Transfers", icon: ArrowLeftRight },
                { id: "Devices", label: "Devices", icon: Monitor },
              ].map(cat => {
                const Icon = cat.icon;
                const isActive = activePage === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActivePage(cat.id)}
                    className={`${styles.categoryBtn} ${isActive ? styles.activeCategory : ""}`}
                  >
                    <div className={styles.categoryIconWrapper}>
                      <Icon size={20} />
                    </div>
                    <span className={styles.categoryLabel}>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          )}
          {renderActiveScreen()}
        </div>
      </main>

      {!(activePage === "Chats" && activeChat !== "") && (
        <BottomNav 
          activePage={activePage} 
          onPageChange={setActivePage} 
          onPlusClick={() => {
            handleRefreshDevices();
            setIsScanning(true);
          }} 
        />
      )}

      {/* Profile & Device Edit Modal */}
      {isEditModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: "420px" }}>
            <span className={styles.modalTitle}>Edit Profile Settings</span>
            
            {/* Custom Profile Picture Upload Section */}
            <div className={styles.modalFormGroup} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ position: "relative", width: "72px", height: "72px", borderRadius: "50%", overflow: "hidden", border: "2px solid var(--primary)", backgroundColor: "rgba(108, 99, 255, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {tempAvatarInput || userCustomAvatar ? (
                  <img src={tempAvatarInput || userCustomAvatar} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: "28px", fontWeight: 700, color: "var(--primary)" }}>{editUsernameInput?.[0]?.toUpperCase() || "Y"}</span>
                )}
              </div>
              <label style={{ cursor: "pointer", fontSize: "12px", fontWeight: 600, color: "var(--primary)", backgroundColor: "rgba(108, 99, 255, 0.15)", padding: "6px 14px", borderRadius: "20px" }}>
                <span>Change Profile Picture</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: "none" }} 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        if (typeof evt.target?.result === "string") {
                          setTempAvatarInput(evt.target.result);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }} 
                />
              </label>
            </div>

             <div className={styles.modalFormGroup}>
               <label className={styles.modalLabel}>Email (Cannot be changed)</label>
               <input
                 type="text"
                 className={styles.modalInput}
                 value={typeof window !== "undefined" ? (localStorage.getItem("fileshare_logged_in_email") || "") : ""}
                 disabled
                 style={{ opacity: 0.6, cursor: "not-allowed", backgroundColor: "rgba(255,255,255,0.05)" }}
               />
             </div>

             <div className={styles.modalFormGroup}>
               <label className={styles.modalLabel}>Username (Display Name)</label>
               <input
                 type="text"
                 className={styles.modalInput}
                 value={editUsernameInput}
                 onChange={(e) => setEditUsernameInput(e.target.value)}
                 placeholder="Enter username"
               />
             </div>

            <div className={styles.modalFormGroup}>
              <label className={styles.modalLabel}>Device Name</label>
              <input
                type="text"
                className={styles.modalInput}
                value={editDeviceNameInput}
                onChange={(e) => setEditDeviceNameInput(e.target.value)}
                placeholder="Enter device name (e.g. LAPTOP-01)"
              />
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalBtnCancel}
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalBtnSave}
                onClick={handleSaveProfile}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Style Chat Wallpaper & Theme Customization Modal */}
      {isChatWallpaperModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsChatWallpaperModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: "450px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span className={styles.modalTitle} style={{ margin: 0 }}>Chat Wallpaper Settings</span>
              <button type="button" onClick={() => setIsChatWallpaperModalOpen(false)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}><X size={18} /></button>
            </div>

            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 16px 0" }}>
              Custom wallpaper for <strong>{activeChat || "All Chats"}</strong> is saved locally in your browser sandbox.
            </p>

            {/* Wallpaper Image Preview Box */}
            <div style={{ width: "100%", height: "160px", borderRadius: "12px", border: "2px dashed var(--border-color)", overflow: "hidden", position: "relative", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.2)" }}>
              {selectedWallpaperPreview || chatWallpapers[activeChat] || chatWallpapers["global"] ? (
                <img src={selectedWallpaperPreview || chatWallpapers[activeChat] || chatWallpapers["global"]} alt="Wallpaper preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
                  <ImageIcon size={32} style={{ opacity: 0.5, marginBottom: "6px" }} />
                  <p style={{ margin: 0, fontSize: "12px" }}>Default raw theme wallpaper active</p>
                </div>
              )}
            </div>

            {/* Theme Folder Dropdown Selection */}
            {(presetWallpapers.dark.length > 0 || presetWallpapers.light.length > 0) && (
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                  Select Theme Wallpaper Dropdown
                </label>
                <select
                  style={{ width: "100%", height: "40px", borderRadius: "8px", padding: "0 12px", backgroundColor: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--border-color)", cursor: "pointer", fontSize: "13px" }}
                  value={selectedWallpaperPreview || chatWallpapers[activeChat] || chatWallpapers["global"] || ""}
                  onChange={(e) => setSelectedWallpaperPreview(e.target.value)}
                >
                  <option value="">-- Choose Theme Wallpaper --</option>
                  <optgroup label="Dark Theme Wallpapers">
                    {presetWallpapers.dark.map((w, idx) => (
                      <option key={`dark-${idx}`} value={w.url}>
                        {w.name} {w.url === "/theme/dark/default.png" ? "(Default)" : ""}
                      </option>
                    ))}
                  </optgroup>
                  {presetWallpapers.light.length > 0 && (
                    <optgroup label="Light Theme Wallpapers">
                      {presetWallpapers.light.map((w, idx) => (
                        <option key={`light-${idx}`} value={w.url}>
                          {w.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
            )}

            {/* Theme Folder Presets Section */}
            {(presetWallpapers.dark.length > 0 || presetWallpapers.light.length > 0) && (
              <div style={{ marginBottom: "16px" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>Theme Wallpapers Grid</span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", maxHeight: "120px", overflowY: "auto", padding: "4px" }}>
                  {[...presetWallpapers.dark, ...presetWallpapers.light].map((w, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedWallpaperPreview(w.url)}
                      style={{ height: "55px", borderRadius: "8px", overflow: "hidden", cursor: "pointer", border: selectedWallpaperPreview === w.url ? "2px solid var(--primary)" : "1px solid var(--border-color)", position: "relative" }}
                    >
                      <img src={w.url} alt={w.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      {w.name.toLowerCase().startsWith("default.") && (
                        <span style={{ position: "absolute", bottom: "2px", right: "2px", backgroundColor: "var(--primary)", color: "#fff", fontSize: "9px", padding: "1px 4px", borderRadius: "4px", fontWeight: 700 }}>Default</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <label style={{ display: "block", width: "100%", textAlign: "center", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "#fff", backgroundColor: "var(--primary)", padding: "10px", borderRadius: "8px", marginBottom: "12px" }}>
              <span>Choose Image from Device</span>
              <input 
                type="file" 
                accept="image/*" 
                style={{ display: "none" }} 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                      if (typeof evt.target?.result === "string") {
                        setSelectedWallpaperPreview(evt.target.result);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }} 
              />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
              <button 
                type="button" 
                onClick={() => handleSetWallpaper("chat")}
                className={styles.modalBtnSave}
                style={{ fontSize: "12px", padding: "8px" }}
              >
                Set for {activeChat || "This Chat"}
              </button>
              <button 
                type="button" 
                onClick={() => handleSetWallpaper("global")}
                className={styles.modalBtnSave}
                style={{ fontSize: "12px", padding: "8px", backgroundColor: "#3B82F6" }}
              >
                Set for All Chats
              </button>
            </div>

            <button 
              type="button" 
              onClick={() => handleSetWallpaper("reset")}
              style={{ width: "100%", background: "none", border: "1px solid #EF4444", color: "#EF4444", borderRadius: "8px", padding: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
            >
              Reset to Default Wallpaper
            </button>
          </div>
        </div>
      )}

      {/* In-App Image Lightbox Modal */}
      {lightboxData && (
        <div 
          className={styles.modalOverlay} 
          style={{ zIndex: 300, backgroundColor: "rgba(0, 0, 0, 0.9)", backdropFilter: "blur(16px)", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "20px" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightboxData(null);
          }}
        >
          {/* Lightbox Top Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", maxWidth: "900px", margin: "0 auto", color: "#FFF" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontWeight: 600, fontSize: "15px" }}>{lightboxData.fileName}</span>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Attachment preview</span>
            </div>
            <button 
              type="button" 
              onClick={() => setLightboxData(null)}
              style={{ color: "#FFF", padding: "8px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Center High-Res Image Preview */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: "20px" }}>
            <img 
              src={lightboxData.url} 
              alt={lightboxData.fileName} 
              onError={(e) => {
                const target = e.currentTarget;
                const alt1 = `/media/chat_attachments/${lightboxData.fileName}`;
                const alt2 = `/media/${lightboxData.fileName}`;
                if (target.src !== alt1 && !target.src.includes("/chat_attachments/")) {
                  target.src = alt1;
                } else if (target.src !== alt2) {
                  target.src = alt2;
                }
              }}
              style={{ 
                maxWidth: "100%", 
                maxHeight: "75vh", 
                objectFit: "contain", 
                borderRadius: "12px",
                filter: lightboxFilter,
                transform: `rotate(${lightboxRotation}deg)`,
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
              }}
            />
          </div>

          {/* Bottom Action Bar */}
          <div style={{ width: "100%", maxWidth: "650px", margin: "0 auto", backgroundColor: "#121318", border: "1px solid #1F212A", borderRadius: "16px", padding: "12px 20px", display: "flex", justifyContent: "space-around", alignItems: "center", gap: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            {/* Edit / Filter Button */}
            <button 
              type="button"
              onClick={() => {
                const filters = ["none", "grayscale(100%)", "sepia(100%)", "invert(100%)", "brightness(130%)"];
                const nextIdx = (filters.indexOf(lightboxFilter) + 1) % filters.length;
                const nextFilter = filters[nextIdx];
                setLightboxFilter(nextFilter);
                toast.info(`Applied filter: ${nextFilter}`);
              }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: lightboxFilter !== "none" ? "var(--primary)" : "#A0A5B5", fontSize: "11px", background: "none", border: "none", cursor: "pointer" }}
            >
              <Edit3 size={18} />
              <span>Edit Filter</span>
            </button>

            {/* Rotate Button */}
            <button 
              type="button"
              onClick={() => {
                setLightboxRotation((prev) => (prev + 90) % 360);
              }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: "#A0A5B5", fontSize: "11px", background: "none", border: "none", cursor: "pointer" }}
            >
              <RotateCw size={18} />
              <span>Rotate</span>
            </button>

            {/* Share / Forward to Chat Button */}
            <button 
              type="button"
              onClick={() => {
                setIsShareModalOpen(true);
              }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: "#3B82F6", fontSize: "11px", background: "none", border: "none", cursor: "pointer" }}
            >
              <Share2 size={18} />
              <span>Share in Chat</span>
            </button>

            {/* Download Button */}
            <a 
              href={lightboxData.url} 
              download={lightboxData.fileName}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: "#10B981", fontSize: "11px", textDecoration: "none" }}
            >
              <ArrowDown size={18} />
              <span>Download</span>
            </a>

            {/* Delete Button */}
            {lightboxData.messageId && (
              <button 
                type="button"
                onClick={() => {
                  if (lightboxData.messageId && lightboxData.chatName) {
                    handleDeleteMessage(lightboxData.messageId, lightboxData.chatName);
                    setLightboxData(null);
                  }
                }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: "#EF4444", fontSize: "11px", background: "none", border: "none", cursor: "pointer" }}
              >

                <Trash2 size={18} />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Share to Contact Modal */}
      {isShareModalOpen && lightboxData && (
        <div className={styles.modalOverlay} style={{ zIndex: 400 }}>
          <div className={styles.modalContent} style={{ maxWidth: "400px" }}>
            <span className={styles.modalTitle}>Forward Attachment to Chat</span>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "16px" }}>Select contact to send "{lightboxData.fileName}"</span>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "250px", overflowY: "auto", marginBottom: "20px" }}>
              {recentChats.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => {
                    const newMsg: ChatMessage = {
                      id: Date.now().toString(),
                      sender: "you",
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      file: lightboxData.url,
                      file_name: lightboxData.fileName,
                      file_type: "image/png"
                    };
                    setChatMessages((prev) => ({
                      ...prev,
                      [c.name]: [...(prev[c.name] || []), newMsg]
                    }));
                    toast.success(`Image forwarded to ${c.name}`);
                    setIsShareModalOpen(false);
                    setLightboxData(null);
                  }}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "8px", backgroundColor: "var(--bg-app)", border: "1px solid var(--border-color)", cursor: "pointer", textAlign: "left", color: "var(--text-primary)" }}
                >
                  <MessageSquare size={16} color="var(--primary)" />
                  <span style={{ fontSize: "13px", fontWeight: 600 }}>{c.name}</span>
                </button>
              ))}
            </div>

            <div className={styles.modalActions}>
              <button 
                type="button" 
                className={styles.modalBtnCancel} 
                onClick={() => setIsShareModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Style Context Menu Modal Overlay */}
      {contextMenuData && (
        <div 
          style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 9999, backgroundColor: "rgba(0,0,0,0.3)" }} 
          onClick={() => setContextMenuData(null)}
          onContextMenu={(e) => { e.preventDefault(); setContextMenuData(null); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: "fixed",
              top: Math.min(contextMenuData.y, window.innerHeight - 260),
              left: Math.min(contextMenuData.x, window.innerWidth - 200),
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "12px",
              padding: "6px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
              minWidth: "180px",
              display: "flex",
              flexDirection: "column",
              gap: "2px"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setReplyingTo({
                  id: contextMenuData.msg.id,
                  text: contextMenuData.msg.text,
                  file_name: contextMenuData.msg.file_name,
                  sender: contextMenuData.msg.sender === "you" ? "You" : contextMenuData.chatName
                });
                setContextMenuData(null);
              }}
              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", border: "none", backgroundColor: "transparent", color: "var(--text-primary)", cursor: "pointer", fontSize: "13px" }}
            >
              <ArrowLeftRight size={16} color="var(--primary)" />
              <span>Reply</span>
            </button>

            {contextMenuData.msg.sender === "you" && contextMenuData.msg.text && (
              <button
                type="button"
                onClick={() => {
                  const currentText = contextMenuData.msg.text || "";
                  const newText = prompt("Edit your message:", currentText);
                  if (newText !== null && newText.trim() !== "") {
                    handleEditMessage(contextMenuData.msg.id, newText, contextMenuData.chatName);
                  }
                  setContextMenuData(null);
                }}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", border: "none", backgroundColor: "transparent", color: "var(--text-primary)", cursor: "pointer", fontSize: "13px" }}
              >
                <Edit3 size={16} color="#3B82F6" />
                <span>Edit</span>
              </button>
            )}

            {contextMenuData.msg.text && (
              <button
                type="button"
                onClick={() => {
                  if (contextMenuData.msg.text) {
                    navigator.clipboard.writeText(contextMenuData.msg.text);
                    toast.success("Text copied to clipboard");
                  }
                  setContextMenuData(null);
                }}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", border: "none", backgroundColor: "transparent", color: "var(--text-primary)", cursor: "pointer", fontSize: "13px" }}
              >
                <FileText size={16} color="#10B981" />
                <span>Copy Text</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                toggleStarMessage(contextMenuData.msg.id);
                setContextMenuData(null);
              }}
              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", border: "none", backgroundColor: "transparent", color: "var(--text-primary)", cursor: "pointer", fontSize: "13px" }}
            >
              <Star size={16} color="#F59E0B" style={starredMessageIds.includes(contextMenuData.msg.id) ? { fill: "#F59E0B" } : {}} />
              <span>{starredMessageIds.includes(contextMenuData.msg.id) ? "Unstar" : "Star"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedMessageIds([contextMenuData.msg.id]);
                setContextMenuData(null);
              }}
              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", border: "none", backgroundColor: "transparent", color: "var(--text-primary)", cursor: "pointer", fontSize: "13px" }}
            >
              <Info size={16} color="#06B6D4" />
              <span>Select Multiple</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLightboxData({
                  url: contextMenuData.msg.file || "",
                  fileName: contextMenuData.msg.file_name || "message text",
                  messageId: contextMenuData.msg.id,
                  chatName: contextMenuData.chatName
                });
                setIsShareModalOpen(true);
                setContextMenuData(null);
              }}
              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", border: "none", backgroundColor: "transparent", color: "var(--text-primary)", cursor: "pointer", fontSize: "13px" }}
            >
              <Share2 size={16} color="#8B5CF6" />
              <span>Forward</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleDeleteMessage(contextMenuData.msg.id, contextMenuData.chatName);
                setContextMenuData(null);
              }}
              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", border: "none", backgroundColor: "transparent", color: "#EF4444", cursor: "pointer", fontSize: "13px" }}
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </motion.div>
        </div>
      )}

      {/* Live Stream Viewer Modal */}
      {isWatchingScreen && (
        <div 
          ref={viewerStreamContainerRef}
          onClick={() => {
            if (isStreamMinimized) return;
            const nextShow = !showPlayerControls;
            setShowPlayerControls(nextShow);
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
            if (nextShow) {
              controlsTimeoutRef.current = setTimeout(() => {
                setShowPlayerControls(false);
              }, 3500);
            }
          }}
          style={isStreamMinimized ? {
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "320px",
            height: "220px",
            zIndex: 99999,
            backgroundColor: "#0f172a",
            borderRadius: "16px",
            boxShadow: "0 15px 40px rgba(0,0,0,0.8)",
            border: "2px solid var(--primary)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            padding: "10px"
          } : {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            backgroundColor: "#000",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: isStreamFullscreen ? "0" : "16px",
            userSelect: "none",
            overflow: "hidden"
          }}
        >
          {/* Header */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            width: "100%", 
            maxWidth: isStreamMinimized ? "100%" : (isStreamFullscreen ? "100%" : "1200px"), 
            margin: "0 auto", 
            color: "#FFF",
            opacity: showPlayerControls || isStreamMinimized ? 1 : 0,
            pointerEvents: showPlayerControls || isStreamMinimized ? "auto" : "none",
            transition: "opacity 0.3s ease-in-out",
            zIndex: 20,
            position: isStreamFullscreen ? "absolute" : "relative",
            top: isStreamFullscreen ? "16px" : "auto",
            left: isStreamFullscreen ? "16px" : "auto",
            right: isStreamFullscreen ? "16px" : "auto",
            padding: isStreamFullscreen ? "0 16px" : "0"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: isStreamMinimized ? "pointer" : "default" }} onClick={(e) => { e.stopPropagation(); if (isStreamMinimized) setIsStreamMinimized(false); }}>
              <div style={{ padding: "6px", borderRadius: "50%", backgroundColor: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Tv size={14} color="#FFF" />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: 700, fontSize: isStreamMinimized ? "13px" : "16px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "160px" }}>
                  🔴 LIVE: {activeScreenPresenter?.presenter_name || "Screen Share"}
                </span>
                {!isStreamMinimized && <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Real-time WebRTC Broadcast</span>}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={(e) => e.stopPropagation()}>
              {/* Minimize Floating Window Toggle */}
              <button 
                type="button" 
                title={isStreamMinimized ? "Expand Stream" : "Minimize Floating Stream"}
                onClick={() => setIsStreamMinimized(!isStreamMinimized)}
                style={{ color: "#FFF", padding: "6px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}
              >
                <Minimize2 size={16} />
              </button>

              {/* Fullscreen Toggle */}
              {!isStreamMinimized && (
                <button 
                  type="button" 
                  title={isStreamFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  onClick={() => {
                    const elem = viewerStreamContainerRef.current as any;
                    const doc = document as any;
                    const isFull = doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || isStreamFullscreen;

                    if (!isFull) {
                      if (elem) {
                        const reqFn = elem.requestFullscreen || elem.webkitRequestFullscreen || elem.mozRequestFullScreen || elem.msRequestFullscreen;
                        if (typeof reqFn === "function") {
                          reqFn.call(elem).catch(() => {});
                        }
                      }
                      setIsStreamFullscreen(true);
                    } else {
                      const exitFn = doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen || doc.msExitFullscreen;
                      if (typeof exitFn === "function") {
                        exitFn.call(doc).catch(() => {});
                      }
                      setIsStreamFullscreen(false);
                    }
                  }}
                  style={{ color: "#FFF", padding: "6px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}
                >
                  {isStreamFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                </button>
              )}

              {/* Close Button */}
              <button 
                type="button" 
                onClick={() => setIsWatchingScreen(false)}
                style={{ color: "#FFF", padding: "6px", borderRadius: "50%", backgroundColor: "rgba(239,68,68,0.8)", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Video Stream Container */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: isStreamMinimized ? "4px" : (isStreamFullscreen ? "0" : "12px"), position: "relative", width: "100%", height: "100%" }}>
            <audio 
              id="viewer-audio-player"
              ref={(el) => {
                if (el && remoteScreenStreamRef.current) {
                  if (el.srcObject !== remoteScreenStreamRef.current) {
                    el.srcObject = remoteScreenStreamRef.current;
                  }
                  el.muted = viewerAudioMuted;
                  el.volume = viewerAudioMuted ? 0 : 1;
                  if (!viewerAudioMuted) el.play().catch(() => {});
                }
              }}
              autoPlay
              playsInline
              muted={viewerAudioMuted}
            />
            {!isSharingScreen ? (
              liveFrameUrl ? (
                <img 
                  src={liveFrameUrl} 
                  alt="Live Screen Broadcast"
                  style={{ 
                    width: "100%",
                    height: "100%",
                    maxWidth: isStreamMinimized ? "100%" : (isStreamFullscreen ? "100%" : "1200px"), 
                    maxHeight: isStreamMinimized ? "140px" : (isStreamFullscreen ? "100vh" : "80vh"), 
                    objectFit: "contain", 
                    borderRadius: isStreamMinimized ? "8px" : (isStreamFullscreen ? "0px" : "16px"),
                    boxShadow: isStreamFullscreen ? "none" : "0 25px 60px rgba(0,0,0,0.8)",
                    backgroundColor: "#000"
                  }}
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", color: "#FFF" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "#FFF", animation: "spin 1s linear infinite" }}></div>
                  <span style={{ fontSize: "14px", fontWeight: 500 }}>Waiting for presenter stream...</span>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              )
            ) : (
              <video 
                ref={(el) => {
                  remoteVideoElementRef.current = el;
                  if (el) {
                    el.setAttribute("playsinline", "true");
                    el.setAttribute("webkit-playsinline", "true");
                    let streamToUse = null;
                    if (isSharingScreen && localScreenStreamRef.current) {
                      streamToUse = localScreenStreamRef.current;
                    } else if (remoteScreenStreamRef.current) {
                      streamToUse = remoteScreenStreamRef.current;
                    }

                    if (streamToUse) {
                      if (el.srcObject !== streamToUse) {
                        el.srcObject = streamToUse;
                      }
                      el.muted = viewerAudioMuted;
                      el.volume = viewerAudioMuted ? 0 : 1;
                      el.play().catch(() => {});
                    }
                  }
                }} 
                autoPlay 
                playsInline 
                muted={viewerAudioMuted}
                style={{ 
                  width: "100%",
                  height: "100%",
                  maxWidth: isStreamMinimized ? "100%" : (isStreamFullscreen ? "100%" : "1200px"), 
                  maxHeight: isStreamMinimized ? "140px" : (isStreamFullscreen ? "100vh" : "80vh"), 
                  objectFit: "contain", 
                  borderRadius: isStreamMinimized ? "8px" : (isStreamFullscreen ? "0px" : "16px"),
                  boxShadow: isStreamFullscreen ? "none" : "0 25px 60px rgba(0,0,0,0.8)",
                  backgroundColor: "#000"
                }}
              />
            )}
          </div>

          {/* Footer Control Bar */}
          {!isStreamMinimized && (
            <div 
              onClick={(e) => e.stopPropagation()}
              style={{ 
                width: "calc(100% - 32px)", 
                maxWidth: "600px", 
                margin: "0 auto", 
                backgroundColor: "rgba(18, 19, 24, 0.9)", 
                backdropFilter: "blur(12px)",
                border: "1px solid #1F212A", 
                borderRadius: "16px", 
                padding: "10px 20px", 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                flexWrap: "wrap", 
                gap: "10px",
                opacity: showPlayerControls ? 1 : 0,
                pointerEvents: showPlayerControls ? "auto" : "none",
                transition: "opacity 0.3s ease-in-out",
                zIndex: 20,
                position: isStreamFullscreen ? "absolute" : "relative",
                bottom: isStreamFullscreen ? "20px" : "auto",
                left: isStreamFullscreen ? "50%" : "auto",
                transform: isStreamFullscreen ? "translateX(-50%)" : "none"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "12px", color: "#A0A5B5", fontWeight: 600 }}>
                  Status: Connected Live
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsWatchingScreen(false)}
                style={{ backgroundColor: "#EF4444", color: "#FFF", border: "none", padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
              >
                Close Stream
              </button>
            </div>
          )}
        </div>
      )}

      {/* HTTP Security Guidance Modal for LAN Screen Sharing */}
      {isHttpsHelpModalOpen && (
        <div className={styles.modalOverlay} style={{ zIndex: 999999 }}>
          <div className={styles.modalContent} style={{ maxWidth: "520px", padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ padding: "8px", borderRadius: "10px", backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#F59E0B" }}>
                  <Shield size={24} />
                </div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>Browser Security Requirement</h3>
              </div>
              <button type="button" onClick={() => setIsHttpsHelpModalOpen(false)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}><X size={20} /></button>
            </div>

            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 16px 0" }}>
              Modern browsers (Chrome, Edge, Brave) restrict screen capture (<code style={{ color: "var(--primary)" }}>getDisplayMedia</code>) on plain HTTP IP addresses (<code style={{ color: "#F59E0B" }}>http://192.168.1.37:3000</code>) for security reasons.
            </p>

            <div style={{ backgroundColor: "var(--bg-app)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "16px", marginBottom: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--primary)" }}>Option 1: Access via Localhost (Recommended for Host PC)</span>
              <p style={{ fontSize: "12px", color: "var(--text-primary)", margin: 0 }}>
                On this PC, open the app in browser using: <strong style={{ color: "#10B981" }}>http://localhost:3000</strong> instead of the IP address.
              </p>

              <hr style={{ border: "none", borderTop: "1px dashed var(--border-color)", margin: "4px 0" }} />

              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--primary)" }}>Option 2: Allow Screen Capture for LAN IP in Chrome/Brave/Edge</span>
              <ol style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li>Open a new tab and go to: <code style={{ color: "var(--text-primary)", fontWeight: 600 }}>chrome://flags/#unsafely-treat-insecure-origin-as-secure</code></li>
                <li>Enable the flag and paste your IP URL: <code style={{ color: "#10B981", fontWeight: 600 }}>http://192.168.1.37:3000</code></li>
                <li>Relaunch browser and click <strong>Start Screen Share</strong>.</li>
              </ol>
            </div>

            <button
              type="button"
              onClick={() => setIsHttpsHelpModalOpen(false)}
              className={styles.modalBtnSave}
              style={{ width: "100%", padding: "12px", fontSize: "14px" }}
            >
              Got it, Close
            </button>
          </div>
        </div>
      )}

      {showProfileSetupModal && renderProfileSetupModal()}
    </div>
  );
};


