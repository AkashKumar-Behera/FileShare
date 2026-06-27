"use client";

import React from "react";
import styles from "./BottomNav.module.css";
import {
  LayoutDashboard,
  MessageSquare,
  Star,
  Settings,
  Plus
} from "lucide-react";

interface BottomNavProps {
  activePage: string;
  onPageChange: (page: string) => void;
  onPlusClick?: () => void;
}

export default function BottomNav({ activePage, onPageChange, onPlusClick }: BottomNavProps) {
  const tabs = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Chats", icon: MessageSquare },
    { name: "Plus", icon: Plus, isPlus: true },
    { name: "Favorites", icon: Star },
    { name: "Settings", icon: Settings },
  ];

  return (
    <nav className={styles.bottomNav}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        
        if (tab.isPlus) {
          return (
            <button
              key={tab.name}
              type="button"
              onClick={onPlusClick}
              className={styles.plusButton}
              aria-label="Quick scan / action"
            >
              <Plus size={24} strokeWidth={2.5} />
            </button>
          );
        }

        const isActive = activePage === tab.name;

        return (
          <button
            key={tab.name}
            type="button"
            onClick={() => onPageChange(tab.name)}
            className={`${styles.navItem} ${isActive ? styles.activeItem : ""}`}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className={styles.navLabel}>{tab.name}</span>
            {isActive && <div className={styles.dotIndicator} />}
          </button>
        );
      })}
    </nav>
  );
}
