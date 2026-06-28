"use client";

import React from "react";
import styles from "./Sidebar.module.css";
import {
  LayoutDashboard,
  MessageSquare,
  Folder,
  Download,
  Upload,
  ArrowLeftRight,
  Star,
  Laptop,
  Settings,
  X,
  Tv,
} from "lucide-react";

interface MenuItem {
  name: string;
  icon: React.ComponentType<any>;
}

const menuItems: MenuItem[] = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Chats", icon: MessageSquare },
  { name: "Screen Share", icon: Tv },
  { name: "My Files", icon: Folder },
  { name: "Transfers", icon: ArrowLeftRight },
  { name: "Favorites", icon: Star },
  { name: "Devices", icon: Laptop },
  { name: "Settings", icon: Settings },
];

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
  deviceName: string;
  isOpen: boolean;
  onClose: () => void;
  storageUsed?: string;
  storagePercent?: number;
  deviceIp?: string;
  unreadChatCount?: number;
}

export default function Sidebar({ activePage, onPageChange, deviceName, isOpen, onClose, storageUsed = "0 MB", storagePercent = 1, deviceIp = "192.168.1.5", unreadChatCount = 0 }: SidebarProps) {
  return (
    <>
      {/* Backdrop overlay for mobile drawer */}
      <div 
        className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ""}`} 
        onClick={onClose}
      />

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <div className={styles.topSection}>
          {/* Close button for mobile */}
          <button 
            type="button" 
            className={styles.closeButton} 
            onClick={onClose} 
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>

          {/* Logo Section */}
          <div className={styles.logoContainer}>
            {/* Logo using transparency image */}
            <img
              src="/logo-transparent.png"
              alt="FileShare Logo"
              className={styles.logoImage}
            />
            <div className={styles.logoTextContainer}>
              <span className={styles.logoText}>FileShare</span>
              <span className={styles.offlineText}>OFFLINE MODE</span>
            </div>
          </div>

          {/* Menu Navigation */}
          <nav className={styles.menu}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.name === activePage;
              const isChatsItem = item.name === "Chats";
              const hasUnread = isChatsItem && unreadChatCount > 0;

              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    onPageChange(item.name);
                    onClose(); // Automatically close sidebar on selection on mobile
                  }}
                  className={`${styles.menuItem} ${
                    isActive ? styles.activeMenuItem : ""
                  }`}
                  style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative" }}>
                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                      <Icon className={styles.menuIcon} strokeWidth={isActive ? 2.5 : 2} />
                      {hasUnread && (
                        <span 
                          style={{ 
                            position: "absolute", 
                            top: "-2px", 
                            right: "-2px", 
                            width: "8px", 
                            height: "8px", 
                            borderRadius: "50%", 
                            backgroundColor: "#EF4444", 
                            boxShadow: "0 0 8px #EF4444" 
                          }} 
                        />
                      )}
                    </div>
                    <span>{item.name}</span>
                  </div>

                  {hasUnread && (
                    <span 
                      style={{ 
                        backgroundColor: "#EF4444", 
                        color: "#FFFFFF", 
                        fontSize: "10px", 
                        fontWeight: 700, 
                        borderRadius: "10px", 
                        padding: "2px 7px",
                        lineHeight: 1,
                        boxShadow: "0 2px 6px rgba(239, 68, 68, 0.4)"
                      }}
                    >
                      {unreadChatCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Device Info & Storage Card */}
        <div className={styles.deviceCard}>
          <div className={styles.deviceCardHeader}>
            <span className={styles.deviceLabel}>This Device</span>
            <div className={styles.deviceDetails}>
              <div className={styles.deviceIconContainer}>
                <Laptop size={16} strokeWidth={2.5} />
              </div>
              <div className={styles.deviceInfo}>
                <span className={styles.deviceName} suppressHydrationWarning>{deviceName || "LAPTOP-01"}</span>
                <span className={styles.deviceIp} suppressHydrationWarning>{deviceIp}</span>
              </div>
            </div>
          </div>

          <div className={styles.storageSection}>
            <div className={styles.storageHeader}>
              <span className={styles.storageTitle}>Storage Used</span>
              <span className={styles.storagePercentage}>{storagePercent}%</span>
            </div>
            <div className={styles.storageHeader} style={{ marginTop: "-4px" }}>
              <span className={styles.storageUsedText}>{storageUsed} / 20 GB</span>
            </div>
            <div className={styles.progressBarContainer}>
              <div className={styles.progressBarFill} style={{ width: `${Math.max(storagePercent, 2)}%` }} />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
