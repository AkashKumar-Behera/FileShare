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
}

export default function BottomNav({ activePage, onPageChange }: BottomNavProps) {
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

        return (
          <button
            key={tab.name}
            type="button"
            onClick={() => onPageChange(tab.name)}
            className={`${styles.navItem} ${isActive ? styles.activeItem : ""}`}
          >
            <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
            <span className={styles.navLabel}>{tab.label || tab.name}</span>
            {isActive && <div className={styles.activeTopBar} />}
          </button>
        );
      })}
    </nav>
  );
}
