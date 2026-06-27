"use client";

import React from "react";
import styles from "./Navbar.module.css";
import { Search, ChevronDown, Menu } from "lucide-react";
import { SkiperThemeToggleButton, useSkiperThemeToggle } from "./SkiperThemeToggle";

interface NavbarProps {
  username: string;
  deviceName: string;
  onEditProfile: () => void;
  onToggleSidebar: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isChatActive?: boolean;
}

export default function Navbar({ username, deviceName, onEditProfile, onToggleSidebar, darkMode, onToggleDarkMode, isChatActive }: NavbarProps) {
  const { isDark, toggleTheme } = useSkiperThemeToggle((nextDark) => {
    onToggleDarkMode();
  });

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
      <div className={styles.rightSection}>
        {/* Skiper26 Animated Theme Toggle Button */}
        <SkiperThemeToggleButton onClick={toggleTheme} isDark={darkMode} />

        {/* Profile Dropdown Widget */}
        <div className={styles.profileWrapper} onClick={onEditProfile} title="Edit Device/Username">
          <div className={styles.avatarContainer}>
            <div className={styles.avatar}>
              {/* Short for profile initials/avatar */}
              <span>{username ? username.charAt(0).toUpperCase() : "Y"}</span>
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
