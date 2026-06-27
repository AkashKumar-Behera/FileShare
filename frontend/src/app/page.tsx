"use client";

import React, { useState, useMemo } from "react";
import styles from "./page.module.css";
import Sidebar from "../components/Sidebar";
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
  MoreHorizontal
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
  type: "zip" | "image" | "pptx" | "txt" | "pdf";
}

interface MyFileItem {
  id: string;
  name: string;
  type: "Folder" | "PPTX" | "JPG" | "PNG" | "MP4" | "TXT" | "PDF" | "RAR" | "ZIP" | "MP3";
  size: string; // "—" for folder
  dateModified: string;
  filesCount?: number; // for folder only
}

interface ReceivedFileItem {
  id: string;
  fileName: string;
  device: string;
  ip: string;
  type: "ZIP" | "JPG" | "PPTX" | "TXT" | "PDF" | "MP4" | "RAR" | "PNG";
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
  fileCard?: {
    name: string;
    size: string;
    type: string;
  };
  imagesCard?: {
    count: number;
    urls: string[];
  };
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

  // Scan state
  const [isScanning, setIsScanning] = useState(false);
  const [activeChat, setActiveChat] = useState<string>("Artemis-PC");
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});

  // Typing effect states
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isTypingLocal, setIsTypingLocal] = useState(false);

  // Message scroll anchor ref
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

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
            time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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

  // Mock State Data

  // Mock State Data
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([
    { id: "act-1", type: "sent", fileName: "Final_Project.zip", device: "Artemis-PC", time: "10:31 AM", size: "25.6 MB" },
    { id: "act-2", type: "received", fileName: "Photos_Trip", device: "Lab-PC-03", time: "10:28 AM", size: "18.3 MB" },
    { id: "act-3", type: "sent", fileName: "Presentation.pptx", device: "Android-Phone", time: "Yesterday", size: "18.7 MB" },
    { id: "act-4", type: "received", fileName: "Notes.txt", device: "DESKTOP-05", time: "2 days ago", size: "2.1 KB" },
    { id: "act-5", type: "sent", fileName: "Report.pdf", device: "Lab-PC-03", time: "2 days ago", size: "1.2 MB" },
  ]);

  const [recentFiles, setRecentFiles] = useState<RecentFileItem[]>([
    { id: "rf-1", fileName: "Final_Project.zip", size: "25.6 MB", time: "10:31 AM", type: "zip" },
    { id: "rf-2", fileName: "Photos_Trip", size: "18.3 MB", time: "10:28 AM", type: "image" },
    { id: "rf-3", fileName: "Presentation.pptx", size: "18.7 MB", time: "Yesterday", type: "pptx" },
    { id: "rf-4", fileName: "Notes.txt", size: "2.1 KB", time: "2 days ago", type: "txt" },
    { id: "rf-5", fileName: "Report.pdf", size: "1.2 MB", time: "2 days ago", type: "pdf" },
  ]);

  const [myFiles, setMyFiles] = useState<MyFileItem[]>([
    { id: "mf-1", name: "Project-Work", type: "Folder", size: "—", dateModified: "Today 10:30 AM", filesCount: 18 },
    { id: "mf-2", name: "Presentation.pptx", type: "PPTX", size: "18.7 MB", dateModified: "Yesterday 5:45 PM" },
    { id: "mf-3", name: "Photos_Trip.jpg", type: "JPG", size: "18.3 MB", dateModified: "Yesterday 10:28 AM" },
    { id: "mf-4", name: "Birthday_Video.mp4", type: "MP4", size: "55.3 MB", dateModified: "2 days ago 7:22 PM" },
    { id: "mf-5", name: "Notes.txt", type: "TXT", size: "2.1 KB", dateModified: "2 days ago 9:15 PM" },
    { id: "mf-6", name: "Report.pdf", type: "PDF", size: "1.2 MB", dateModified: "2 days ago 8:40 PM" },
    { id: "mf-7", name: "Documents.rar", type: "RAR", size: "32.4 MB", dateModified: "3 days ago 6:10 PM" },
    { id: "mf-8", name: "Final_Project.zip", type: "ZIP", size: "25.6 MB", dateModified: "3 days ago 10:31 AM" },
    { id: "mf-9", name: "Favorite_Song.mp3", type: "MP3", size: "6.8 MB", dateModified: "4 days ago 4:15 PM" }
  ]);

  const [receivedFiles, setReceivedFiles] = useState<ReceivedFileItem[]>([
    { id: "rc-1", fileName: "Final_Project.zip", device: "Artemis-PC", ip: "192.168.1.2", type: "ZIP", size: "25.6 MB", timeReceived: "Today 10:31 AM", status: "New" },
    { id: "rc-2", fileName: "Photos_Trip", device: "Lab-PC-03", ip: "192.168.1.3", type: "JPG", size: "18.3 MB", timeReceived: "Today 10:28 AM", status: "New" },
    { id: "rc-3", fileName: "Presentation.pptx", device: "Android-Phone", ip: "192.168.1.8", type: "PPTX", size: "18.7 MB", timeReceived: "Yesterday 5:45 PM", status: "Downloaded" },
    { id: "rc-4", fileName: "Notes.txt", device: "DESKTOP-05", ip: "192.168.1.10", type: "TXT", size: "2.1 KB", timeReceived: "2 days ago 9:15 PM", status: "Downloaded" },
    { id: "rc-5", fileName: "Report.pdf", device: "Lab-PC-03", ip: "192.168.1.3", type: "PDF", size: "1.2 MB", timeReceived: "2 days ago 8:40 PM", status: "Downloaded" },
    { id: "rc-6", fileName: "Birthday_Video.mp4", device: "Android-Phone", ip: "192.168.1.8", type: "MP4", size: "55.3 MB", timeReceived: "3 days ago 7:22 PM", status: "Downloaded" },
    { id: "rc-7", fileName: "Documents.rar", device: "Artemis-PC", ip: "192.168.1.2", type: "RAR", size: "32.4 MB", timeReceived: "3 days ago 6:10 PM", status: "Downloaded" },
    { id: "rc-8", fileName: "Screenshot_2024.png", device: "DESKTOP-05", ip: "192.168.1.10", type: "PNG", size: "1.6 MB", timeReceived: "4 days ago 11:05 AM", status: "Downloaded" },
  ]);

  const [transfers, setTransfers] = useState<TransferItem[]>([
    {
      id: "tr-1",
      fileName: "Presentation.pptx",
      device: "Android-Phone",
      ip: "192.168.1.8",
      size: "18.7 MB",
      progressPercent: 65,
      progressDetail: "12.2 MB / 18.7 MB",
      speed: "2.4 MB/s",
      timeLeft: "00:00:03",
      status: "Transferring",
      direction: "send",
      type: "pptx"
    },
    {
      id: "tr-2",
      fileName: "Birthday_Video.mp4",
      device: "Lab-PC-03",
      ip: "192.168.1.3",
      size: "55.3 MB",
      progressPercent: 28,
      progressDetail: "15.6 MB / 55.3 MB",
      speed: "1.8 MB/s",
      timeLeft: "00:00:22",
      status: "Transferring",
      direction: "send",
      type: "mp4"
    },
    {
      id: "tr-3",
      fileName: "Final_Project.zip",
      device: "Artemis-PC",
      ip: "192.168.1.2",
      size: "25.6 MB",
      progressPercent: 100,
      progressDetail: "25.6 MB / 25.6 MB",
      speed: "0.0 MB/s",
      timeLeft: "00:00:00",
      status: "Completed",
      direction: "send",
      completedOn: "Today 10:31 AM",
      type: "zip"
    },
    {
      id: "tr-4",
      fileName: "Photos_Trip",
      device: "Lab-PC-03",
      ip: "192.168.1.3",
      size: "18.3 MB",
      progressPercent: 100,
      progressDetail: "18.3 MB / 18.3 MB",
      speed: "0.0 MB/s",
      timeLeft: "00:00:00",
      status: "Completed",
      direction: "receive",
      completedOn: "Today 10:28 AM",
      type: "image"
    },
    {
      id: "tr-5",
      fileName: "Notes.txt",
      device: "DESKTOP-05",
      ip: "192.168.1.10",
      size: "2.1 KB",
      progressPercent: 100,
      progressDetail: "2.1 KB / 2.1 KB",
      speed: "0.0 MB/s",
      timeLeft: "00:00:00",
      status: "Completed",
      direction: "receive",
      completedOn: "2 days ago 9:15 PM",
      type: "txt"
    },
    {
      id: "tr-6",
      fileName: "Report.pdf",
      device: "Lab-PC-03",
      ip: "192.168.1.3",
      size: "1.2 MB",
      progressPercent: 100,
      progressDetail: "1.2 MB / 1.2 MB",
      speed: "0.0 MB/s",
      timeLeft: "00:00:00",
      status: "Completed",
      direction: "send",
      completedOn: "2 days ago 8:40 PM",
      type: "pdf"
    },
    {
      id: "tr-7",
      fileName: "Broken_Archive.rar",
      device: "Artemis-PC",
      ip: "192.168.1.2",
      size: "45.0 MB",
      progressPercent: 42,
      progressDetail: "18.9 MB / 45.0 MB",
      speed: "0.0 MB/s",
      timeLeft: "--:--:--",
      status: "Failed",
      direction: "send",
      failedOn: "3 days ago 2:10 PM",
      type: "rar"
    }
  ]);

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
  // RENDER VIEW: Transfers UI (ui (4).jpeg)
  // ----------------------------------------------------
  const renderTransfers = () => {
    return (
      <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {/* Header Section */}
        <div className={styles.pageHeader}>
          <div className={styles.titleArea}>
            <h1>Transfers</h1>
            <span className={styles.subtitle}>Monitor your file transfers in real-time.</span>
          </div>
          <div className={styles.headerControls}>
            <div className={styles.subSearchWrapper}>
              <Search className={styles.subSearchIcon} />
              <input
                type="text"
                placeholder="Search transfers..."
                className={styles.subSearchInput}
                value={transfersSearch}
                onChange={e => setTransfersSearch(e.target.value)}
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
              <ArrowUp size={16} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left", gap: "2px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Total Transfers</span>
              <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-family-outfit)" }}>24</span>
              <span style={{ fontSize: "11px", color: "var(--success)", fontWeight: 600 }}>↑ 8% <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>this week</span></span>
            </div>
          </div>

          <div className={styles.quickActionCard} style={{ flexDirection: "row", justifyContent: "flex-start", padding: "16px 20px", cursor: "default" }}>
            <div className={styles.actionIconWrapper} style={{ borderRadius: "10px", backgroundColor: "rgba(59, 130, 246, 0.08)", color: "var(--info)" }}>
              <ArrowDown size={16} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left", gap: "2px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Completed</span>
              <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-family-outfit)" }}>18</span>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>75% success rate</span>
            </div>
          </div>

          <div className={styles.quickActionCard} style={{ flexDirection: "row", justifyContent: "flex-start", padding: "16px 20px", cursor: "default" }}>
            <div className={styles.actionIconWrapper} style={{ borderRadius: "10px", backgroundColor: "rgba(94, 92, 230, 0.08)", color: "var(--primary-muted)" }}>
              <Clock size={16} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left", gap: "2px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>In Progress</span>
              <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-family-outfit)" }}>2</span>
              <span style={{ fontSize: "11px", color: "var(--primary)" }}>2 active transfers</span>
            </div>
          </div>

          <div className={styles.quickActionCard} style={{ flexDirection: "row", justifyContent: "flex-start", padding: "16px 20px", cursor: "default" }}>
            <div className={styles.actionIconWrapper} style={{ borderRadius: "10px", backgroundColor: "var(--danger-light)", color: "var(--danger)" }}>
              <XCircle size={16} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left", gap: "2px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Failed</span>
              <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--danger)", fontFamily: "var(--font-family-outfit)" }}>1</span>
              <span style={{ fontSize: "11px", color: "var(--danger)", fontWeight: 600 }}>View details</span>
            </div>
          </div>
        </div>

        {/* Tab Filters */}
        <div className={styles.tabsContainer}>
          {["All Transfers", "In Progress", "Completed", "Failed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setTransfersTab(tab)}
              className={`${styles.tab} ${transfersTab === tab ? styles.activeTab : ""}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Sub-Section: In Progress Transfers */}
        {(transfersTab === "All Transfers" || transfersTab === "In Progress") && (
          <div className={styles.tableSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>In Progress Transfers ({filteredTransfersInProgress.length})</span>
            </div>
            <div className={styles.tableCard}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>To (Device)</th>
                    <th>Size</th>
                    <th>Progress</th>
                    <th>Speed</th>
                    <th>Time Left</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransfersInProgress.map((item) => {
                    const { icon: IconComponent, className } = getFileIconComponent(item.type);
                    return (
                      <tr key={item.id}>
                        <td>
                          <div className={styles.fileCell}>
                            <div className={`${styles.fileIconWrapper} ${className}`}>
                              <IconComponent size={18} />
                            </div>
                            <div className={styles.fileDetails}>
                              <span className={styles.fileName}>{item.fileName}</span>
                              <span className={styles.fileMeta}>To {item.device}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className={styles.deviceCell}>
                            <Laptop className={styles.deviceCellIcon} size={16} />
                            <div className={styles.deviceCellInfo}>
                              <span className={styles.deviceCellName}>{item.device}</span>
                              <span className={styles.deviceCellIp}>{item.ip}</span>
                            </div>
                          </div>
                        </td>
                        <td>{item.size}</td>
                        <td>
                          <div className={styles.progressCell}>
                            <div className={styles.progressHeader}>
                              <span className={styles.progressPercent}>{item.progressPercent}%</span>
                              <span className={styles.progressDetail}>{item.progressDetail}</span>
                            </div>
                            <div className={styles.progressBarTrack}>
                              <div
                                className={styles.progressBarFill}
                                style={{ width: `${item.progressPercent}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>{item.speed}</td>
                        <td>{item.timeLeft}</td>
                        <td>
                          <span
                            className={`${styles.badge} ${
                              item.status === "Transferring"
                                ? styles.transferringBadge
                                : styles.newBadge /* Paused is shown green/teal */
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actionsWrapper}>
                            <button
                              className={styles.actionButton}
                              title={item.status === "Transferring" ? "Pause" : "Resume"}
                              onClick={() => handleTogglePauseTransfer(item.id)}
                            >
                              {item.status === "Transferring" ? <Pause size={14} /> : <Play size={14} />}
                            </button>
                            <button
                              className={`${styles.actionButton} ${styles.actionButtonDanger}`}
                              title="Cancel"
                              onClick={() => handleCancelTransfer(item.id)}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredTransfersInProgress.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ padding: "32px", textAlign: "center", color: "var(--text-secondary)" }}>
                        No active transfers.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sub-Section: Completed & Failed Transfers */}
        {(transfersTab === "All Transfers" || transfersTab === "Completed" || transfersTab === "Failed") && (
          <div className={styles.tableSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>
                {transfersTab === "Completed" ? "Completed Transfers" : transfersTab === "Failed" ? "Failed Transfers" : "Completed & Failed Transfers"} (
                {filteredTransfersCompleted.length + filteredTransfersFailed.length})
              </span>
              <button className={styles.sectionLink} onClick={() => {}}>View All</button>
            </div>
            <div className={styles.tableCard}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>To/From (Device)</th>
                    <th>Size</th>
                    <th>Finished On</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...filteredTransfersCompleted, ...filteredTransfersFailed].map((item) => {
                    const { icon: IconComponent, className } = getFileIconComponent(item.type);
                    return (
                      <tr key={item.id}>
                        <td>
                          <div className={styles.fileCell}>
                            <div className={`${styles.fileIconWrapper} ${className}`}>
                              <IconComponent size={18} />
                            </div>
                            <div className={styles.fileDetails}>
                              <span className={styles.fileName}>{item.fileName}</span>
                              <span className={styles.fileMeta}>
                                {item.direction === "send" ? "Sent to" : "Received from"} {item.device}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className={styles.deviceCell}>
                            <Laptop className={styles.deviceCellIcon} size={16} />
                            <div className={styles.deviceCellInfo}>
                              <span className={styles.deviceCellName}>{item.device}</span>
                              <span className={styles.deviceCellIp}>{item.ip}</span>
                            </div>
                          </div>
                        </td>
                        <td>{item.size}</td>
                        <td>{item.completedOn || item.failedOn || "—"}</td>
                        <td>
                          <span
                            className={`${styles.badge} ${
                              item.status === "Completed" ? styles.completedBadge : styles.failedBadge
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actionsWrapper}>
                            {item.status === "Completed" && (
                              <button className={styles.actionButton} title="Open Folder"><FolderOpen size={14} /></button>
                            )}
                            <button
                              className={`${styles.actionButton} ${styles.actionButtonDanger}`}
                              title="Delete"
                              onClick={() => handleCancelTransfer(item.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredTransfersCompleted.length === 0 && filteredTransfersFailed.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "var(--text-secondary)" }}>
                        No history matching selection.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className={styles.tableFooter}>
                <span className={styles.footerText}>
                  Showing 1 to {filteredTransfersCompleted.length + filteredTransfersFailed.length} of {transfers.length} entries
                </span>
                <button className={styles.sectionLink} onClick={() => {}}>View All Completed</button>
              </div>
            </div>
          </div>
        )}

        {/* Tip Bar */}
        {showTip && (
          <div className={styles.tipBar}>
            <div className={styles.tipContent}>
              <Info className={styles.tipIcon} size={20} />
              <span className={styles.tipText}>
                <strong>Transfer Tip:</strong> Keep devices on the same network for faster transfer speeds and better stability.
              </span>
            </div>
            <button className={styles.closeTipButton} onClick={() => setShowTip(false)}>
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    );
  };

  // ----------------------------------------------------
  // RENDER VIEW: Chats UI (ui 4.jpeg)
  // ----------------------------------------------------
  const renderChats = () => {
    const activeMessages = chatMessages[activeChat] || [];
    const activeDeviceObj = nearbyDevices.find(d => d.name === activeChat) || { name: activeChat, status: "online", ip: "192.168.1.1" };

    return (
      <div className={`${styles.chatContainer} animate-fade-in`}>
        {/* Left Sub-sidebar (Devices & Recent Chats) */}
        <div className={styles.chatSidebar}>
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
        <div className={styles.chatPanel}>
          {/* Header */}
          <div className={styles.chatPanelHeader}>
            <div className={styles.chatPanelHeaderLeft}>
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
                
                {/* File Attachment Card */}
                {msg.fileCard && (
                  <div className={styles.chatFileCard}>
                    <div className={styles.chatFileHeader}>
                      <div className={`${styles.fileIconWrapper} ${styles.zipIcon}`} style={{ width: "32px", height: "32px", borderRadius: "6px" }}>
                        <FolderArchive size={16} />
                      </div>
                      <div className={styles.chatFileDetails}>
                        <span className={styles.chatFileName}>{msg.fileCard.name}</span>
                        <span className={styles.chatFileSize}>{msg.fileCard.size}</span>
                      </div>
                    </div>
                    <button className={styles.chatFileDownloadBtn}>
                      <ArrowDown size={14} />
                      <span>Download</span>
                    </button>
                  </div>
                )}

                {/* Images Attachment Card */}
                {msg.imagesCard && (
                  <div className={styles.chatImagesCard}>
                    <div className={styles.chatImagesGrid}>
                      {msg.imagesCard.urls.map((url, i) => (
                        <div key={i} className={styles.chatImageWrapper}>
                          <img src={url} alt={`attachment-${i}`} className={styles.chatImageThumb} />
                        </div>
                      ))}
                    </div>
                    <div className={styles.chatImagesFooter}>
                      <span className={styles.chatImagesCount}>{msg.imagesCard.count} Images</span>
                      <button className={styles.chatImagesDownloadAll}>Download All</button>
                    </div>
                  </div>
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
              <button className={styles.chatInputIcon} title="Attach File">
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

            {/* Bottom Active Transfers Widget inside Chats */}
            <div className={styles.chatActiveTransfersWidget}>
              <div className={styles.chatActiveTransfersHeader}>
                <Activity size={14} />
                <span>Active Transfers (1)</span>
              </div>
              <div className={styles.chatActiveTransfersRow}>
                <div className={styles.chatActiveTransfersLeft}>
                  <div className={`${styles.fileIconWrapper} ${styles.pptxIcon}`} style={{ width: "32px", height: "32px", borderRadius: "6px" }}>
                    <FileText size={16} />
                  </div>
                  <div className={styles.chatActiveTransfersMeta}>
                    <span className={styles.chatActiveTransfersName}>Presentation.pptx</span>
                    <span className={styles.chatActiveTransfersSize}>18.7 MB</span>
                  </div>
                </div>

                <div className={styles.chatActiveTransfersProgress}>
                  <span>65%</span>
                  <div className={styles.chatActiveTransfersBarWrapper}>
                    <div className={styles.chatActiveTransfersBarFill} style={{ width: "65%" }} />
                  </div>
                  <span className={styles.chatActiveTransfersSpeed}>12.2 MB / 18.7 MB</span>
                </div>

                <span className={styles.chatActiveTransfersSpeed} style={{ fontWeight: 600 }}>2.4 MB/s</span>

                <div className={styles.chatActiveTransfersActions}>
                  <button className={styles.actionButton} style={{ width: "28px", height: "28px" }} title="Pause">
                    <Pause size={12} />
                  </button>
                  <button className={styles.actionButton} style={{ width: "28px", height: "28px" }} title="Cancel">
                    <X size={12} />
                  </button>
                </div>
              </div>
              
              <button className={styles.chatActiveTransfersLink} onClick={() => setActivePage("Transfers")}>
                <span>View All Transfers</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>
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

  // Active view router dispatcher
  const renderActiveScreen = () => {
    switch (activePage) {
      case "Dashboard":
        return renderDashboard();
      case "Chats":
        return renderChats();
      case "My Files":
        return renderMyFiles();
      case "Received":
        return renderReceived();
      case "Transfers":
        return renderTransfers();
      case "Devices":
        return renderDevices();
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
        />
        <div className={styles.contentWrapper}>
          {renderActiveScreen()}
        </div>
      </main>

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
