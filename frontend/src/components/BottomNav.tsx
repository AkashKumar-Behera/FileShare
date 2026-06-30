"use client";

import React from "react";
import styles from "./BottomNav.module.css";
import {
  LayoutDashboard,
  MessageSquare,
  FolderOpen,
  ArrowLeftRight,
  Settings
} from "lucide-react";

interface BottomNavProps {
  activePage: string;
  onPageChange: (page: string) => void;
  onPlusClick?: () => void;
  unreadChatCount?: number;
}

export default function BottomNav({ activePage, onPageChange, unreadChatCount = 0 }: BottomNavProps) {
  const tabs = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Chats", icon: MessageSquare },
    { name: "My Files", label: "My Files", icon: FolderOpen },
    { name: "Transfers", label: "Transfers", icon: ArrowLeftRight },
    { name: "Settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className={styles.bottomNav}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activePage === tab.name;
        const isChats = tab.name === "Chats";
        const hasUnread = isChats && unreadChatCount > 0;

        return (
          <button
            key={tab.name}
            type="button"
            onClick={() => onPageChange(tab.name)}
            className={`${styles.navItem} ${isActive ? styles.activeItem : ""}`}
            style={{ position: "relative" }}
          >
            <div style={{ position: "relative", display: "inline-flex" }}>
              <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
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
                    boxShadow: "0 0 6px #EF4444"
                  }}
                />
              )}
            </div>
            <span className={styles.navLabel}>{tab.label || tab.name}</span>
            {isActive && <div className={styles.activeTopBar} />}
          </button>
        );
      })}
    </nav>
  );
}
