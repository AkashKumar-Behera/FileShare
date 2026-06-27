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
} from "lucide-react";

interface MenuItem {
  name: string;
  icon: React.ComponentType<any>;
}

const menuItems: MenuItem[] = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Chats", icon: MessageSquare },
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
}

export default function Sidebar({ activePage, onPageChange, deviceName, isOpen, onClose }: SidebarProps) {
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
                >
                  <Icon className={styles.menuIcon} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.name}</span>
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
                <span className={styles.deviceName}>{deviceName || "LAPTOP-01"}</span>
                <span className={styles.deviceIp}>192.168.1.5</span>
              </div>
            </div>
          </div>

          <div className={styles.storageSection}>
            <div className={styles.storageHeader}>
              <span className={styles.storageTitle}>Storage Used</span>
              <span className={styles.storagePercentage}>12%</span>
            </div>
            <div className={styles.storageHeader} style={{ marginTop: "-4px" }}>
              <span className={styles.storageUsedText}>2.45 GB / 20 GB</span>
            </div>
            <div className={styles.progressBarContainer}>
              <div className={styles.progressBarFill} style={{ width: "12%" }} />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
