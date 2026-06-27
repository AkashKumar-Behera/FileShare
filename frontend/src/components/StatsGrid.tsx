"use client";

import React from "react";
import styles from "./StatsGrid.module.css";
import { ArrowUp, ArrowDown, Clock, XCircle } from "lucide-react";

export default function StatsGrid() {
  return (
    <div className={styles.grid}>
      {/* Total Transfers Card */}
      <div className={styles.card}>
        <div className={`${styles.iconWrapper} ${styles.totalIcon}`}>
          <ArrowUp size={20} strokeWidth={2.5} />
        </div>
        <div className={styles.content}>
          <span className={styles.title}>Total Transfers</span>
          <span className={styles.value}>24</span>
          <span className={`${styles.subtext} ${styles.trendUp}`}>
            <span>↑ 8%</span>
            <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
              this week
            </span>
          </span>
        </div>
      </div>

      {/* Completed Card */}
      <div className={styles.card}>
        <div className={`${styles.iconWrapper} ${styles.completedIcon}`}>
          <ArrowDown size={20} strokeWidth={2.5} />
        </div>
        <div className={styles.content}>
          <span className={styles.title}>Completed</span>
          <span className={styles.value}>18</span>
          <span className={styles.subtext}>75% success rate</span>
        </div>
      </div>

      {/* In Progress Card */}
      <div className={styles.card}>
        <div className={`${styles.iconWrapper} ${styles.inProgressIcon}`}>
          <Clock size={20} strokeWidth={2.5} />
        </div>
        <div className={styles.content}>
          <span className={styles.title}>In Progress</span>
          <span className={styles.value}>2</span>
          <span className={`${styles.subtext} ${styles.trendLink}`}>
            2 active transfers
          </span>
        </div>
      </div>

      {/* Failed Card */}
      <div className={styles.card}>
        <div className={`${styles.iconWrapper} ${styles.failedIcon}`}>
          <XCircle size={20} strokeWidth={2.5} />
        </div>
        <div className={styles.content}>
          <span className={styles.title}>Failed</span>
          <span className={styles.value}>1</span>
          <span className={`${styles.subtext} ${styles.failedLink}`}>
            View details
          </span>
        </div>
      </div>
    </div>
  );
}
