"use client";

import React, { useState, useMemo } from "react";
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
  ArrowLeft
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
  text?: string;
  time: string;
  file?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
}

export default function Home() {
  const [activePage, setActivePage] = useState<string>("Dashboard");
  const [showTip, setShowTip] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Devices tab state, search state, and list data
  const [devicesTab, setDevicesTab] = useState<string>("All Devices");
  const [devicesSearch, setDevicesSearch] = useState<string>("");
  const [devicesList, setDevicesList] = useState([
    { name: "Artemis-PC", ip: "192.168.1.2", type: "Windows", lastSeen: "Just now", status: "Online" },
    { name: "Lab-PC-03", ip: "192.168.1.3", type: "Windows", lastSeen: "1 min ago", status: "Online" },
    { name: "Android-Phone", ip: "192.168.1.8", type: "Android", lastSeen: "2 min ago", status: "Online" },
    { name: "iPhone-14", ip: "192.168.1.12", type: "iOS", lastSeen: "5 min ago", status: "Online" },
    { name: "DESKTOP-05", ip: "192.168.1.10", type: "Windows", lastSeen: "2 hours ago", status: "Offline" },
    { name: "Old-Android", ip: "192.168.1.15", type: "Android", lastSeen: "1 day ago", status: "Offline" }
  ]);

  // Helper to dynamically get API base depending on hostname (e.g. localhost vs network IP)
  const getApiUrl = (path: string) => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      return `http://${hostname}:8000/api${path}`;
    }
    return `http://localhost:8000/api${path}`;
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
  // Favorites View States (ui 11.png and ui 12.png)
  const [favoritesSearch, setFavoritesSearch] = useState("");
  const [favoritesTab, setFavoritesTab] = useState<string>("All");
  // Scan state
  const [isScanning, setIsScanning] = useState(false);
  const [activeChat, setActiveChat] = useState<string>("");
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});

  // Typing effect states
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isTypingLocal, setIsTypingLocal] = useState(false);

  // Message scroll anchor ref
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [chatMessages, activeChat]);

  const [nearbyDevices, setNearbyDevices] = useState<{ name: string; ip: string; status: string }[]>([]);
  const [recentChats, setRecentChats] = useState<{ name: string; time: string; lastMsg?: string }[]>([]);

  // Client-side initialization & self-registration
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      let savedId = localStorage.getItem("deviceId");
      if (!savedId) {
        savedId = "device-" + Math.random().toString(36).substring(2, 11);
        localStorage.setItem("deviceId", savedId);
      }
      setDeviceId(savedId);

      let savedUser = localStorage.getItem("username");
      if (!savedUser) {
        savedUser = "You";
        localStorage.setItem("username", savedUser);
      }
      setUsername(savedUser);
      setEditUsernameInput(savedUser);

      let savedDevice = localStorage.getItem("deviceName");
      if (!savedDevice) {
        savedDevice = "LAPTOP-01";
        localStorage.setItem("deviceName", savedDevice);
      }
      setDeviceName(savedDevice);
      setEditDeviceNameInput(savedDevice);

      let savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        setSettingsDarkMode(true);
        document.documentElement.classList.add("dark");
      } else {
        setSettingsDarkMode(false);
        document.documentElement.classList.remove("dark");
      }

      // Register device on backend
      fetch(getApiUrl("/devices/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_id: savedId,
          username: savedUser,
          device_name: savedDevice,
          device_type: "desktop",
          avatar: "avatar_1"
        })
      })
      .then(res => {
        if (!res.ok) throw new Error("Backend response error");
        return res.json();
      })
      .then(data => {
        console.log("Registered self on backend:", data);
        handleRefreshDevices(savedId);
        loadRecentChats(savedId);
        loadRealTransfers(savedId);
      })
      .catch(err => {
        console.warn("Django backend offline, running in mock LAN mode:", err);
      });
    }
  }, []);

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
        const mapped = data.map(d => {
          const displayName = (d.username && d.username.trim() !== "" && d.username !== "You") ? d.username : d.device_name;
          return {
            name: displayName,
            ip: d.ip_address || "192.168.1.1",
            status: d.is_online ? "online" : "offline"
          };
        });
        
        setNearbyDevices(mapped);
        if (mapped.length > 0 && (!activeChat || activeChat === "Artemis-PC")) {
          setActiveChat(mapped[0].name);
        }
        loadRecentChats(targetId);
        setTimeout(() => setIsScanning(false), 800); // Small animation buffer
      })
      .catch(err => {
        console.error("Discovery API request failed:", err);
        setIsScanning(false);
      });
  };

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
          const other = chat.participants.find((p: any) => p.device_id !== targetId);
          const name = other ? other.device_name : (chat.name || "Group Chat");
          const time = chat.last_message ? new Date(chat.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "New Chat";
          return {
            name: name,
            time: time,
            lastMsg: chat.last_message ? chat.last_message.text : ""
          };
        });
        setRecentChats(formatted);
      })
      .catch(err => console.error("Recent chats fetch error:", err));
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
          const isSender = t.sender_details?.device_id === targetId;
          const partner = isSender ? t.receiver_details : t.sender_details;
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
      .catch(err => console.error("Transfers fetch error:", err));
  };


  // Sync profile edits with Django
  const handleSaveProfile = () => {
    const finalUser = editUsernameInput.trim() || "You";
    const finalDevice = editDeviceNameInput.trim() || "LAPTOP-01";

    setUsername(finalUser);
    setDeviceName(finalDevice);
    localStorage.setItem("username", finalUser);
    localStorage.setItem("deviceName", finalDevice);
    setIsEditModalOpen(false);

    fetch(getApiUrl("/devices/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        device_id: deviceId,
        username: finalUser,
        device_name: finalDevice,
        device_type: "desktop",
        avatar: "avatar_1"
      })
    })
    .then(res => res.json())
    .then(() => {
      handleRefreshDevices();
    })
    .catch(err => console.error("Failed to sync profile:", err));
  };

  // Sync refs for WebSocket closures
  React.useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  React.useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  // Load chat session dynamically from Django
  React.useEffect(() => {
    if (!deviceId || activeChat === "Project-Group" || !activeChat) {
      setActiveChatId(null);
      return;
    }

    fetch(getApiUrl("/devices/online_devices"))
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: any[]) => {
        const targetDevice = data.find(d => {
          const displayName = (d.username && d.username.trim() !== "" && d.username !== "You") ? d.username : d.device_name;
          return displayName === activeChat;
        });

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
            setActiveChatId(chatObj.id);
            // Fetch initial messages
            fetch(getApiUrl(`/chats/${chatObj.id}/messages`))
              .then(res => res.json())
              .then((msgData: any[]) => {
                const formatted = msgData.map(m => ({
                  id: String(m.id),
                  sender: m.sender_device_id === deviceId ? "you" as const : "other" as const,
                  text: m.text,
                  time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }));
                setChatMessages(prev => ({
                  ...prev,
                  [activeChat]: formatted
                }));
              });
          });
        }
      })
      .catch(err => {
        // Silent catch
      });
  }, [activeChat, deviceId]);

  // WebSocket manager for real-time messages & presence status updates
  React.useEffect(() => {
    if (!deviceId) return;

    const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${hostname}:8000/ws/communication/${deviceId}/`;

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
          const formattedMsg = {
            id: String(msg.id),
            sender: msg.sender_id === deviceId ? ("you" as const) : ("other" as const),
            text: msg.text,
            time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            file: msg.file,
            file_name: msg.file_name,
            file_size: msg.file_size,
            file_type: msg.file_type
          };

          if (activeChatIdRef.current === msg.chat_id) {
            setChatMessages(prev => {
              const currentMessages = prev[activeChatRef.current] || [];
              if (currentMessages.some(m => m.id === formattedMsg.id)) return prev;
              return {
                ...prev,
                [activeChatRef.current]: [...currentMessages, formattedMsg]
              };
            });
          }
          loadRecentChats();
        } else if (data.type === "typing") {
          if (data.sender_id !== deviceId) {
            fetch(getApiUrl("/devices/online_devices"))
              .then(res => res.json())
              .then((devicesList: any[]) => {
                const typingUserObj = devicesList.find(d => d.device_id === data.sender_id);
                if (typingUserObj) {
                  const displayName = (typingUserObj.username && typingUserObj.username.trim() !== "" && typingUserObj.username !== "You") ? typingUserObj.username : typingUserObj.device_name;
                  if (activeChatRef.current === displayName) {
                    if (data.is_typing) {
                      setTypingUsers([displayName]);
                    } else {
                      setTypingUsers([]);
                    }
                  }
                }
              });
          }
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
            avatar: "avatar_1"
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
          const formatted = msgData.map(m => ({
            id: String(m.id),
            sender: m.sender_device_id === deviceId ? "you" as const : "other" as const,
            text: m.text,
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            file: m.file,
            file_name: m.file_name,
            file_size: m.file_size,
            file_type: m.file_type
          }));
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

  // Handle local typing triggers over WebSocket
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    
    if (activeChatId) {
      fetch(getApiUrl("/devices/online_devices"))
        .then(res => res.json())
        .then((devicesList: any[]) => {
          const targetDevice = devicesList.find(d => {
            const displayName = (d.username && d.username.trim() !== "" && d.username !== "You") ? d.username : d.device_name;
            return displayName === activeChat;
          });

          if (targetDevice && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            if (!isTypingLocal) {
              setIsTypingLocal(true);
              wsRef.current.send(JSON.stringify({
                type: "typing",
                target_id: targetDevice.device_id,
                is_typing: true
              }));
            }
          }
        });
    }
  };

  // Reset typing indicators
  React.useEffect(() => {
    const clearTyping = () => {
      if (isTypingLocal && activeChatId) {
        setIsTypingLocal(false);
        fetch(getApiUrl("/devices/online_devices"))
          .then(res => res.json())
          .then((devicesList: any[]) => {
            const targetDevice = devicesList.find(d => {
              const displayName = (d.username && d.username.trim() !== "" && d.username !== "You") ? d.username : d.device_name;
              return displayName === activeChat;
            });
            if (targetDevice && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({
                type: "typing",
                target_id: targetDevice.device_id,
                is_typing: false
              }));
            }
          });
      }
    };

    if (!messageInput.trim() && isTypingLocal) {
      clearTyping();
    }

    const delayDebounceFn = setTimeout(() => {
      clearTyping();
    }, 3000);

    return () => clearTimeout(delayDebounceFn);
  }, [messageInput, isTypingLocal, activeChatId, activeChat]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    const inputVal = messageInput;
    setMessageInput("");

    fetch(getApiUrl("/devices/online_devices"))
      .then(res => res.json())
      .then((data: any[]) => {
        const targetDevice = data.find(d => {
          const displayName = (d.username && d.username.trim() !== "" && d.username !== "You") ? d.username : d.device_name;
          return displayName === activeChat;
        });

        if (targetDevice) {
          // If WebSocket is open, send via WebSocket instantly
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: "chat_message",
              target_id: targetDevice.device_id,
              chat_id: activeChatId,
              text: inputVal
            }));
          } else {
            // Fallback to HTTP POST
            fetch(getApiUrl(`/chats/${activeChatId}/send_message`), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sender_id: deviceId,
                text: inputVal
              })
            })
            .then(res => res.json())
            .then(() => {
              fetch(getApiUrl(`/chats/${activeChatId}/messages`))
                .then(r => r.json())
                .then((msgData: any[]) => {
                  const formatted = msgData.map(m => ({
                    id: String(m.id),
                    sender: m.sender_device_id === deviceId ? "you" as const : "other" as const,
                    text: m.text,
                    time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }));
                  setChatMessages(prev => ({
                    ...prev,
                    [activeChat]: formatted
                  }));
                });
            });
          }
        }
      });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeChatId) return;

    fetch(getApiUrl("/devices/online_devices"))
      .then(res => res.json())
      .then((data: any[]) => {
        const targetDevice = data.find(d => {
          const displayName = (d.username && d.username.trim() !== "" && d.username !== "You") ? d.username : d.device_name;
          return displayName === activeChat;
        });

        if (targetDevice) {
          const formData = new FormData();
          formData.append("sender_id", deviceId);
          Array.from(files).forEach(file => {
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
          .then(msgs => {
            console.log("Uploaded successfully:", msgs);
            // Refresh messages list
            fetch(getApiUrl(`/chats/${activeChatId}/messages`))
              .then(r => r.json())
              .then((msgData: any[]) => {
                const formatted = msgData.map(m => ({
                  id: String(m.id),
                  sender: m.sender_device_id === deviceId ? "you" as const : "other" as const,
                  text: m.text,
                  time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  file: m.file,
                  file_name: m.file_name,
                  file_size: m.file_size,
                  file_type: m.file_type
                }));
                setChatMessages(prev => ({
                  ...prev,
                  [activeChat]: formatted
                }));
              });
          })
          .catch(err => {
            console.error("Upload error:", err);
            alert("File upload failed!");
          });
        }
      });
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

    // Derived myFiles
    const my = transfers
      .filter(t => t.direction === "send" && t.status === "Completed")
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
  const storageUsed = 2.45;
  const storagePercentage = Math.round((storageUsed / storageTotal) * 100);

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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" }}>
            {/* Total Files Card */}
            <div className={styles.quickActionCard} style={{ flexDirection: "row", justifyContent: "flex-start", padding: "20px 24px", cursor: "default" }}>
              <div className={styles.actionIconWrapper} style={{ width: "48px", height: "48px", borderRadius: "12px" }}>
                <FolderOpen size={20} strokeWidth={2.5} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", textAlign: "left", gap: "4px" }}>
                <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>Total Files</span>
                <span style={{ fontSize: "26px", fontWeight: 700, fontFamily: "var(--font-family-outfit)", color: "var(--text-primary)", lineHeight: 1.1 }}>128</span>
                <span style={{ fontSize: "12px", color: "var(--success)", fontWeight: 600 }}>↑ 12% <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>from last week</span></span>
              </div>
            </div>

            {/* Total Transfers Card */}
            <div className={styles.quickActionCard} style={{ flexDirection: "row", justifyContent: "flex-start", padding: "20px 24px", cursor: "pointer" }} onClick={() => setActivePage("Transfers")}>
              <div className={styles.actionIconWrapper} style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "rgba(94, 92, 230, 0.08)" }}>
                <Activity size={20} strokeWidth={2.5} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", textAlign: "left", gap: "4px" }}>
                <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>Total Transfers</span>
                <span style={{ fontSize: "26px", fontWeight: 700, fontFamily: "var(--font-family-outfit)", color: "var(--text-primary)", lineHeight: 1.1 }}>24</span>
                <span style={{ fontSize: "12px", color: "var(--success)", fontWeight: 600 }}>↑ 8% <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>from last week</span></span>
              </div>
            </div>

            {/* Storage Card */}
            <div className={styles.quickActionCard} style={{ flexDirection: "row", justifyContent: "flex-start", padding: "20px 24px", cursor: "default" }}>
              <div className={styles.actionIconWrapper} style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "rgba(59, 130, 246, 0.08)", color: "var(--info)" }}>
                <HardDrive size={20} strokeWidth={2.5} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", textAlign: "left", gap: "4px" }}>
                <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>Storage Used</span>
                <span style={{ fontSize: "26px", fontWeight: 700, fontFamily: "var(--font-family-outfit)", color: "var(--text-primary)", lineHeight: 1.1 }}>2.45 GB</span>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>of 20 GB used</span>
              </div>
            </div>

            {/* Connected Devices Card */}
            <div className={styles.quickActionCard} style={{ flexDirection: "row", justifyContent: "flex-start", padding: "20px 24px", cursor: "default" }}>
              <div className={styles.actionIconWrapper} style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "rgba(94, 92, 230, 0.08)", color: "var(--primary)" }}>
                <Laptop size={20} strokeWidth={2.5} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", textAlign: "left", gap: "4px" }}>
                <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>Connected Devices</span>
                <span style={{ fontSize: "26px", fontWeight: 700, fontFamily: "var(--font-family-outfit)", color: "var(--text-primary)", lineHeight: 1.1 }}>4</span>
                <span style={{ fontSize: "12px", color: "var(--success)", fontWeight: 600 }}>2 online</span>
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
                const { icon: IconComponent, className } = getFileIconComponent(file.type);
                return (
                  <div key={file.id} className={styles.listItem}>
                    <div className={styles.itemLeft}>
                      <div className={`${styles.fileIconWrapper} ${className}`} style={{ width: "32px", height: "32px", borderRadius: "6px" }}>
                        <IconComponent size={16} />
                      </div>
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
              <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-family-outfit)" }}>156</span>
              <span style={{ fontSize: "11px", color: "var(--success)", fontWeight: 600 }}>↑ 10 <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>this week</span></span>
            </div>
          </div>

          {/* Total Size Card */}
          <div className={styles.quickActionCard} style={{ flexDirection: "row", justifyContent: "flex-start", padding: "16px 20px", cursor: "default" }}>
            <div className={styles.actionIconWrapper} style={{ borderRadius: "10px", backgroundColor: "rgba(59, 130, 246, 0.08)", color: "var(--info)" }}>
              <HardDrive size={16} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left", gap: "2px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Total Size</span>
              <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-family-outfit)" }}>2.45 GB</span>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>of 20 GB used</span>
            </div>
          </div>

          {/* Images Card */}
          <div className={styles.quickActionCard} style={{ flexDirection: "row", justifyContent: "flex-start", padding: "16px 20px", cursor: "default" }}>
            <div className={styles.actionIconWrapper} style={{ borderRadius: "10px", backgroundColor: "rgba(16, 185, 129, 0.08)", color: "var(--success)" }}>
              <ImageIcon size={16} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left", gap: "2px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Images</span>
              <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-family-outfit)" }}>68</span>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>43% of total files</span>
            </div>
          </div>

          {/* Folders Card */}
          <div className={styles.quickActionCard} style={{ flexDirection: "row", justifyContent: "flex-start", padding: "16px 20px", cursor: "default" }}>
            <div className={styles.actionIconWrapper} style={{ borderRadius: "10px", backgroundColor: "rgba(245, 158, 11, 0.08)", color: "var(--warning)" }}>
              <FolderOpen size={16} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left", gap: "2px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Folders</span>
              <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-family-outfit)" }}>18</span>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>12% of total files</span>
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
                  const { icon: IconComponent, className } = getFileIconComponent(file.type);
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
                          <div className={`${styles.fileIconWrapper} ${className}`}>
                            <IconComponent size={18} />
                          </div>
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
                              <button className={styles.actionButton} title="View"><Eye size={14} /></button>
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
                  const { icon: IconComponent, className } = getFileIconComponent(file.type);
                  return (
                    <tr key={file.id}>
                      <td>
                        <div className={styles.fileCell}>
                          <div className={`${styles.fileIconWrapper} ${className}`}>
                            <IconComponent size={18} />
                          </div>
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
                          <button className={styles.actionButton} title="View"><Eye size={14} /></button>
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

    // Filter based on Pill Category (All, In Progress, Completed, Failed)
    const finalFiltered = subTabFiltered.filter(t => {
      if (transfersTab === "All Transfers" || transfersTab === "All") return true;
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
            const { icon: IconComponent, className } = getFileIconComponent(item.type);
            const isCompleted = item.status === "Completed";
            const isFailed = item.status === "Failed";
            const isPaused = item.status === "Paused";

            return (
              <div key={item.id} className={styles.transferCard}>
                {/* File Icon */}
                <div className={`${styles.fileIconWrapper} ${className}`} style={{ width: "44px", height: "44px", borderRadius: "10px", flexShrink: 0 }}>
                  <IconComponent size={20} />
                </div>

                {/* Details */}
                <div className={styles.transferInfo}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className={styles.transferName}>{item.fileName}</span>
                    <span className={styles.transferDeviceMeta} style={{ fontWeight: 600 }}>{item.size}</span>
                  </div>
                  <span className={styles.transferDeviceMeta}>{item.device} &bull; {item.ip}</span>

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
      <div className={`${styles.chatContainer} ${hasActiveChat ? styles.chatContainerActive : ""} animate-fade-in`}>
        {/* Left Sub-sidebar (Devices & Recent Chats) */}
        <div className={`${styles.chatSidebar} ${hasActiveChat ? styles.chatSidebarHiddenMobile : ""}`}>
          <div className={styles.chatSidebarHeader}>
            <span className={styles.chatSidebarTitle}>Nearby Devices</span>
            <button
              className={styles.actionButton}
              title="Refresh Devices"
              onClick={() => handleRefreshDevices()}
              disabled={isScanning}
            >
              <RefreshCw
                size={14}
                style={isScanning ? { animation: "spin 1s linear infinite" } : {}}
              />
            </button>
          </div>
          
          <div className={styles.chatSidebarScroll}>
            {/* Nearby Devices Section */}
            <div className={styles.chatSidebarSection}>
              {nearbyDevices.map((device, index) => (
                <button
                  key={`${device.name}-${device.ip}-${index}`}
                  type="button"
                  className={`${styles.chatDeviceItem} ${activeChat === device.name ? styles.chatDeviceActive : ""}`}
                  onClick={() => setActiveChat(device.name)}
                >
                  <div className={styles.chatDeviceLeft}>
                    <span className={`${styles.chatDeviceDot} ${device.status === "online" ? styles.chatDeviceOnline : styles.chatDeviceOffline}`} />
                    <div className={styles.chatDeviceDetails}>
                      <span className={styles.chatDeviceName}>{device.name}</span>
                      <span className={styles.chatDeviceIp}>{device.ip}</span>
                    </div>
                  </div>
                  {device.status === "offline" && (
                    <span className={styles.chatDeviceRight}>Offline</span>
                  )}
                </button>
              ))}
            </div>

            {/* Recent Chats Section */}
            <div className={styles.chatSidebarSection} style={{ marginTop: "12px" }}>
              <span className={styles.chatSidebarSecTitle}>Recent Chats</span>
              {recentChats.map((chat, index) => (
                <button
                  key={`${chat.name}-${index}`}
                  type="button"
                  className={`${styles.chatDeviceItem} ${activeChat === chat.name ? styles.chatDeviceActive : ""}`}
                  onClick={() => setActiveChat(chat.name)}
                >
                  <div className={styles.chatDeviceLeft}>
                    <MessageSquare size={16} className={styles.deviceCellIcon} />
                    <div className={styles.chatDeviceDetails}>
                      <span className={styles.chatDeviceName}>{chat.name}</span>
                    </div>
                  </div>
                  <span className={styles.chatDeviceRight}>{chat.time}</span>
                </button>
              ))}
              {recentChats.length === 0 && (
                <div style={{ padding: "12px", fontSize: "12px", color: "var(--text-secondary)", textAlign: "center" }}>
                  No recent chats
                </div>
              )}
            </div>
          </div>

          <button className={styles.startNewChatBtn}>
            <Plus size={16} />
            <span>Start New Chat</span>
          </button>
        </div>

        {/* Right Chat Panel */}
        <div className={`${styles.chatPanel} ${!hasActiveChat ? styles.chatPanelHiddenMobile : ""}`}>
          {hasActiveChat ? (
            <>
              {/* Header */}
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
                  <div className={styles.chatPanelAvatar}>
                    <Laptop size={18} />
                  </div>
              <div className={styles.chatPanelInfo}>
                <span className={styles.chatPanelName}>{activeChat}</span>
                <span className={styles.chatPanelStatus}>
                  {typingUsers.includes(activeChat) ? (
                    <span style={{ color: "var(--primary)", fontWeight: "600" }}>typing...</span>
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
              <button className={styles.controlButton} title="More"><MoreVertical size={16} /></button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className={styles.chatPanelBody}>
            <span className={styles.chatDaySeparator}>Today</span>

            {activeMessages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.chatBubble} ${
                  msg.sender === "you" ? styles.chatBubbleOutgoing : styles.chatBubbleIncoming
                }`}
              >
                {msg.text && <span>{msg.text}</span>}
                
                {/* Real File Attachment Card */}
                {msg.file && (
                  (() => {
                    const isImg = msg.file_type?.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(msg.file_name || "");
                    const isVideo = msg.file_type?.startsWith("video/") || /\.(mp4|mov|m4v|avi|mkv|webm)$/i.test(msg.file_name || "");
                    const isAudio = msg.file_type?.startsWith("audio/") || /\.(mp3|wav|ogg|m4a|aac)$/i.test(msg.file_name || "");
                    const fileUrl = msg.file.startsWith("http") ? msg.file : `http://${window.location.hostname}:8000${msg.file}`;
                    
                    if (isImg) {
                      return (
                        <div style={{ marginTop: "8px", maxWidth: "320px", borderRadius: "8px", overflow: "hidden" }}>
                          <img 
                            src={fileUrl} 
                            alt={msg.file_name} 
                            style={{ width: "100%", height: "auto", maxHeight: "240px", objectFit: "cover", cursor: "pointer" }}
                            onClick={() => window.open(fileUrl, "_blank")}
                          />
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", backgroundColor: "rgba(0,0,0,0.05)" }}>
                            <span style={{ fontSize: "11px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "200px" }}>{msg.file_name}</span>
                            <a href={fileUrl} download={msg.file_name} className={styles.downloadBtn} style={{ fontSize: "11px", padding: "2px 6px", textDecoration: "none" }}>
                              <ArrowDown size={12} /> Download
                            </a>
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
                  {msg.time} {msg.sender === "you" && " ✓✓"}
                </span>
              </div>
            ))}
            {/* Scroll Anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input & Action Panel */}
          <div className={styles.chatPanelFooter}>
            {typingUsers.length > 0 && (
              <div className={styles.chatTypingIndicator}>
                <div className={styles.chatTypingDots}>
                  <span />
                  <span />
                  <span />
                </div>
                <span className={styles.chatTypingText}>
                  {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
                </span>
              </div>
            )}
            <div className={styles.chatInputWrapper}>
              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
              <button 
                type="button" 
                className={styles.chatInputIcon} 
                onClick={() => fileInputRef.current?.click()} 
                title="Attach Files"
              >
                <Plus size={20} />
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                className={styles.chatInputField}
                value={messageInput}
                onChange={handleInputChange}
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

    const osIcon = (type: string) => {
      switch (type.toLowerCase()) {
        case "windows":
          return <Laptop size={16} style={{ color: "#0078d7" }} />;
        case "android":
          return <Smartphone size={16} style={{ color: "#3ddc84" }} />;
        case "ios":
          return <Smartphone size={16} style={{ color: "#a2aaad" }} />;
        default:
          return <Monitor size={16} style={{ color: "var(--text-secondary)" }} />;
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
                              {osIcon(device.type)}
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
                              {osIcon(device.type)}
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
  // RENDER VIEW: Favorites UI (ui 11.png and ui 12.png)
  // ----------------------------------------------------
  const renderFavorites = () => {
    // Premium mock favorites lists
    const favDevices = [
      { name: "Artemis-PC", ip: "192.168.1.2", type: "Windows", lastSeen: "Just now", status: "Online" },
      { name: "Android-Phone", ip: "192.168.1.8", type: "Android", lastSeen: "2 min ago", status: "Online" }
    ];

    const favFiles = [
      { name: "Final_Project.zip", type: "ZIP", size: "25.6 MB", date: "Today 10:31 AM" },
      { name: "Presentation.pptx", type: "PPTX", size: "18.7 MB", date: "Yesterday 5:45 PM" }
    ];

    const favChats = [
      { name: "Lab-PC-03", lastMsg: "See you tomorrow!", time: "10:28 AM", unread: 2 },
      { name: "iPhone-14", lastMsg: "File received, thanks!", time: "Yesterday", unread: 0 }
    ];

    // Filter by search query
    const filteredDevices = favDevices.filter(d => 
      d.name.toLowerCase().includes(favoritesSearch.toLowerCase()) || 
      d.ip.toLowerCase().includes(favoritesSearch.toLowerCase())
    );

    const filteredFiles = favFiles.filter(f => 
      f.name.toLowerCase().includes(favoritesSearch.toLowerCase())
    );

    const filteredChats = favChats.filter(c => 
      c.name.toLowerCase().includes(favoritesSearch.toLowerCase()) || 
      c.lastMsg.toLowerCase().includes(favoritesSearch.toLowerCase())
    );

    const showAll = favoritesTab === "All";
    const showDevices = favoritesTab === "Devices" || showAll;
    const showFiles = favoritesTab === "Files" || showAll;
    const showChats = favoritesTab === "Chats" || showAll;

    return (
      <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Header Section */}
        <div className={styles.pageHeader}>
          <div className={styles.titleArea}>
            <h1 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Star size={24} style={{ fill: "var(--primary)", color: "var(--primary)" }} />
              Favorites
            </h1>
            <span className={styles.subtitle}>Quick access to your preferred devices, files, and chats.</span>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", width: "100%", justifyContent: "space-between" }}>
            <div className={styles.transfersSubTabs} style={{ margin: 0 }}>
              {["All", "Devices", "Files", "Chats"].map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFavoritesTab(tab)}
                  className={`${styles.transfersTabBtn} ${favoritesTab === tab ? styles.transfersTabBtnActive : ""}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className={styles.transfersSearchWrapper} style={{ maxWidth: "320px", width: "100%" }}>
              <Search size={16} className={styles.transfersSearchIcon} />
              <input
                type="text"
                placeholder="Search favorites..."
                className={styles.transfersSearchInput}
                value={favoritesSearch}
                onChange={(e) => setFavoritesSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Favourites Grid */}
        <div className={styles.favoritesGrid}>
          {/* Favourites Devices */}
          {showDevices && (
            <div className={styles.favoritesColumn}>
              <div className={styles.favoritesSectionHeader}>
                <Monitor size={18} style={{ color: "var(--primary)" }} />
                <span className={styles.favoritesSectionTitle}>Favourite Devices ({filteredDevices.length})</span>
              </div>
              {filteredDevices.map((d, i) => (
                <div key={i} className={styles.favoriteItemCard} onClick={() => {
                  setActivePage("Chats");
                  setActiveChat(d.name);
                }} style={{ cursor: "pointer" }}>
                  <div className={styles.settingsAvatarWrapper} style={{ width: "40px", height: "40px", fontSize: "14px" }}>
                    {d.name.charAt(0)}
                  </div>
                  <div className={styles.favoriteItemInfo}>
                    <span className={styles.favoriteItemTitle}>{d.name}</span>
                    <span className={styles.favoriteItemSubtitle}>{d.ip} &bull; {d.status}</span>
                  </div>
                  <div className={styles.favoriteBadge}>{d.type}</div>
                </div>
              ))}
              {filteredDevices.length === 0 && (
                <div style={{ padding: "16px", textAlign: "center", color: "var(--text-secondary)", fontSize: "12px" }}>
                  No favourite devices found.
                </div>
              )}
            </div>
          )}

          {/* Favourites Files */}
          {showFiles && (
            <div className={styles.favoritesColumn}>
              <div className={styles.favoritesSectionHeader}>
                <FileText size={18} style={{ color: "var(--primary)" }} />
                <span className={styles.favoritesSectionTitle}>Favourite Files ({filteredFiles.length})</span>
              </div>
              {filteredFiles.map((f, i) => (
                <div key={i} className={styles.favoriteItemCard}>
                  <div className={styles.fileIconContainer} style={{ width: "36px", height: "36px" }}>
                    <FolderArchive size={16} />
                  </div>
                  <div className={styles.favoriteItemInfo}>
                    <span className={styles.favoriteItemTitle}>{f.name}</span>
                    <span className={styles.favoriteItemSubtitle}>{f.size} &bull; {f.date}</span>
                  </div>
                  <div className={styles.favoriteBadge}>{f.type}</div>
                </div>
              ))}
              {filteredFiles.length === 0 && (
                <div style={{ padding: "16px", textAlign: "center", color: "var(--text-secondary)", fontSize: "12px" }}>
                  No favourite files found.
                </div>
              )}
            </div>
          )}

          {/* Favourites Chats */}
          {showChats && (
            <div className={styles.favoritesColumn}>
              <div className={styles.favoritesSectionHeader}>
                <MessageSquare size={18} style={{ color: "var(--primary)" }} />
                <span className={styles.favoritesSectionTitle}>Favourite Chats ({filteredChats.length})</span>
              </div>
              {filteredChats.map((c, i) => (
                <div key={i} className={styles.favoriteItemCard} onClick={() => {
                  setActivePage("Chats");
                  setActiveChat(c.name);
                }} style={{ cursor: "pointer" }}>
                  <div className={styles.settingsAvatarWrapper} style={{ width: "40px", height: "40px", fontSize: "14px", backgroundColor: "rgba(59, 130, 246, 0.1)", color: "var(--info)", borderColor: "var(--info)" }}>
                    {c.name.charAt(0)}
                  </div>
                  <div className={styles.favoriteItemInfo}>
                    <span className={styles.favoriteItemTitle}>{c.name}</span>
                    <span className={styles.favoriteItemSubtitle} style={{ fontWeight: c.unread > 0 ? "600" : "400" }}>{c.lastMsg}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                    <span style={{ fontSize: "10px", color: "var(--text-secondary)" }}>{c.time}</span>
                    {c.unread > 0 && (
                      <div className={styles.chatActiveTransfersBarFill} style={{ width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "white", fontWeight: "700" }}>
                        {c.unread}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {filteredChats.length === 0 && (
                <div style={{ padding: "16px", textAlign: "center", color: "var(--text-secondary)", fontSize: "12px" }}>
                  No favourite chats found.
                </div>
              )}
            </div>
          )}
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
                <span className={styles.settingsProfileDevice}>{deviceName}</span>
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

  // Active view router dispatcher
  const renderActiveScreen = () => {
    switch (activePage) {
      case "Dashboard":
        return renderDashboard();
      case "Chats":
        return renderChats();
      case "My Files":
        return renderMyFiles();
      case "Transfers":
        return renderTransfers();
      case "Devices":
        return renderDevices();
      case "Settings":
        return renderSettings();
      default:
        return renderPlaceholderScreen(activePage);
    }
  };

  return (
    <div className={styles.container}>
      {/* Sidebar Layout */}
      <Sidebar 
        activePage={activePage} 
        onPageChange={setActivePage} 
        deviceName={deviceName} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Container Layout */}
      <main className={styles.mainContent}>
        <Navbar
          username={username}
          deviceName={deviceName}
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
          {/* Mobile Category Quick-Access Pills (Matches ui 8.png) */}
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
          {renderActiveScreen()}
        </div>
      </main>

      <BottomNav 
        activePage={activePage} 
        onPageChange={setActivePage} 
        onPlusClick={() => {
          handleRefreshDevices();
          setIsScanning(true);
        }} 
      />

      {/* Profile & Device Edit Modal */}
      {isEditModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <span className={styles.modalTitle}>Edit Profile Settings</span>
            
            <div className={styles.modalFormGroup}>
              <label className={styles.modalLabel}>Username</label>
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
    </div>
  );
}
