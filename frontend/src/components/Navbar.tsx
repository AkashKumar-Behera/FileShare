"use client";

import React, { useState, useEffect } from "react";
import styles from "./Navbar.module.css";
import { Search, Moon, Sun, ChevronDown } from "lucide-react";

interface NavbarProps {
  username: string;
  deviceName: string;
  onEditProfile: () => void;
}

export default function Navbar({ username, deviceName, onEditProfile }: NavbarProps) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check if user has dark mode set or system preference
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <header className={styles.navbar}>
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
        {/* Theme Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className={styles.themeToggle}
          title="Toggle Dark Mode"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

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
