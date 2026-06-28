"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

export const useSkiperThemeToggle = (
  onToggleCallback?: (nextDark: boolean) => void
) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDark(document.documentElement.classList.contains("dark"));
    }
  }, []);

  const updateStyles = useCallback((css: string) => {
    if (typeof window === "undefined") return;
    let styleEl = document.getElementById("skiper-theme-styles") as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "skiper-theme-styles";
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = css;
  }, []);

  const toggleTheme = useCallback(() => {
    const nextDark = !isDark;
    setIsDark(nextDark);

    const animationCss = `
      ::view-transition-group(root) { animation-duration: 0.8s; animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
      ::view-transition-new(root) { animation-name: reveal-theme-new; }
      ::view-transition-old(root), .dark::view-transition-old(root) { animation: none; z-index: -1; }
      .dark::view-transition-new(root) { animation-name: reveal-theme-new; }
      @keyframes reveal-theme-new {
        from { clip-path: circle(0% at 100% 0%); }
        to { clip-path: circle(150% at 100% 0%); }
      }
    `;
    updateStyles(animationCss);

    const switchTheme = () => {
      if (nextDark) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      if (onToggleCallback) onToggleCallback(nextDark);
    };

    if (typeof document !== "undefined" && (document as any).startViewTransition) {
      (document as any).startViewTransition(switchTheme);
    } else {
      switchTheme();
    }
  }, [isDark, updateStyles, onToggleCallback]);

  return { isDark, toggleTheme };
};

// Skiper4 ThemeToggleButton2 Component (Sun/Moon clip-path smooth morph animation)
export const SkiperThemeToggleButton = ({
  onClick,
  isDark
}: {
  onClick: () => void;
  isDark: boolean;
}) => {
  return (
    <button
      type="button"
      className="themeToggleBtn"
      onClick={onClick}
      aria-label="Toggle theme"
      title="Toggle Dark Mode"
      style={{
        width: "38px",
        height: "38px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isDark ? "var(--bg-card)" : "var(--bg-card)",
        color: "var(--text-primary)",
        cursor: "pointer",
        padding: "6px",
        border: "1px solid var(--border-color)",
        transition: "all 0.3s ease"
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        fill="currentColor"
        strokeLinecap="round"
        viewBox="0 0 32 32"
        style={{ width: "24px", height: "24px" }}
      >
        <clipPath id="skiper-btn-2-navbar">
          <motion.path
            initial={false}
            animate={{ y: isDark ? 10 : 0, x: isDark ? -12 : 0 }}
            transition={{ ease: "easeInOut", duration: 0.35 }}
            d="M0-5h30a1 1 0 0 0 9 13v24H0Z"
          />
        </clipPath>
        <g clipPath="url(#skiper-btn-2-navbar)">
          <motion.circle
            initial={false}
            animate={{ r: isDark ? 10 : 8 }}
            transition={{ ease: "easeInOut", duration: 0.35 }}
            cx="16"
            cy="16"
            r={isDark ? 10 : 8}
          />
          <motion.g
            initial={false}
            animate={{
              rotate: isDark ? -100 : 0,
              scale: isDark ? 0.5 : 1,
              opacity: isDark ? 0 : 1,
            }}
            transition={{ ease: "easeInOut", duration: 0.35 }}
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ opacity: isDark ? 0 : 1 }}
          >
            <path d="M16 5.5v-4" />
            <path d="M16 30.5v-4" />
            <path d="M1.5 16h4" />
            <path d="M26.5 16h4" />
            <path d="m23.4 8.6 2.8-2.8" />
            <path d="m5.7 26.3 2.9-2.9" />
            <path d="m5.8 5.8 2.8 2.8" />
            <path d="m23.4 23.4 2.9 2.9" />
          </motion.g>
        </g>
      </svg>
    </button>
  );
};
