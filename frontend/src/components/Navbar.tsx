"use client";

import React from "react";
import styles from "./Navbar.module.css";
import { Search, ChevronDown, Menu, Tv, Play } from "lucide-react";
import { SkiperThemeToggleButton, useSkiperThemeToggle } from "./SkiperThemeToggle";

interface NavbarProps {
  username: string;
  deviceName: string;
  userCustomAvatar?: string;
  onEditProfile: () => void;
  onToggleSidebar: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isChatActive?: boolean;
  activeScreenPresenter?: { active: boolean; presenter_name?: string; presenter_device_id?: string };
  isSharingScreen?: boolean;
  onStartScreenShare?: () => void;
  onWatchScreen?: () => void;
}

export default function Navbar({ 
  username, 
  deviceName, 
  userCustomAvatar, 
  onEditProfile, 
  onToggleSidebar, 
  darkMode, 
  onToggleDarkMode, 
  isChatActive,
  activeScreenPresenter,
  isSharingScreen,
  onStartScreenShare,
  onWatchScreen
}: NavbarProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { isDark, toggleTheme } = useSkiperThemeToggle((nextDark) => {
    onToggleDarkMode();
  });

  const isLiveActive = activeScreenPresenter?.active;

  return (
    <header className={`${styles.navbar} ${isChatActive ? styles.mobileChatActiveHidden : ""}`}>

      {/* Mobile Sidebar Hamburger Toggle */}
      <button
        onClick={onToggleSidebar}
        className={styles.menuToggle}
        title="Toggle Menu"
        aria-label="Toggle Menu"
      >
        <Menu size={22} />
      </button>

      {/* Search Input Box */}
      <div className={styles.searchWrapper}>
        <Search className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search files and chats..."
        />
      </div>

      {/* Right Controls & Profile */}
      <div className={styles.rightSection} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Screen Share Action / Status Button */}
        {isLiveActive ? (
          <button
            type="button"
            onClick={onWatchScreen}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "20px",
              backgroundColor: "#EF4444",
              color: "#FFFFFF",
              border: "none",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 0 12px rgba(239, 68, 68, 0.4)",
              animation: "pulse 2s infinite"
            }}
          >
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#FFF" }} />
            <span>LIVE: {activeScreenPresenter?.presenter_name}</span>
            <Play size={12} style={{ fill: "#FFF" }} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onStartScreenShare}
            title="Start Screen Share (Desktop Only)"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "8px",
              backgroundColor: "rgba(108, 99, 255, 0.12)",
              color: "var(--primary)",
              border: "1px solid var(--primary)",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <Tv size={15} />
            <span className={styles.hideMobileText}>Share Screen</span>
          </button>
        )}

        {/* Skiper26 Animated Theme Toggle Button */}
        <SkiperThemeToggleButton onClick={toggleTheme} isDark={darkMode} />

        {/* Profile Dropdown Widget */}
        <div className={styles.profileWrapper} onClick={onEditProfile} title="Edit Device/Username">
          <div className={styles.avatarContainer}>
            <div className={styles.avatar} style={{ overflow: "hidden" }}>
              {mounted && userCustomAvatar ? (
                <img src={userCustomAvatar} alt={username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span>{username ? username.charAt(0).toUpperCase() : "Y"}</span>
              )}
            </div>
            <div className={styles.onlineStatus} />
          </div>
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>{username || "You"}</span>
            <span className={styles.profileDevice}>{deviceName || "LAPTOP-01"}</span>
          </div>
          <ChevronDown className={styles.chevron} />
        </div>
      </div>
    </header>
  );
}

