import React from "react";
import styles from "./StatsGrid.module.css";
import { ArrowUp, ArrowDown, Clock, XCircle } from "lucide-react";

interface StatsGridProps {
  transfers: {
    status: string;
  }[];
}

export default function StatsGrid({ transfers }: StatsGridProps) {
  const totalCount = transfers.length;
  const completedCount = transfers.filter(t => t.status === "Completed").length;
  const inProgressCount = transfers.filter(t => t.status === "Transferring" || t.status === "Pending").length;
  const failedCount = transfers.filter(t => t.status === "Failed").length;

  return (
    <div className={styles.grid}>
      {/* Total Transfers Card */}
      <div className={styles.card}>
        <div className={`${styles.iconWrapper} ${styles.totalIcon}`}>
          <ArrowUp size={20} strokeWidth={2.5} />
        </div>
        <div className={styles.content}>
          <span className={styles.title}>Total Transfers</span>
          <span className={styles.value}>{totalCount}</span>
          <span className={`${styles.subtext} ${styles.trendUp}`}>
            <span>Real-time</span>
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
          <span className={styles.value}>{completedCount}</span>
          <span className={styles.subtext}>
            {totalCount > 0 ? `${Math.round((completedCount / totalCount) * 100)}%` : "0%"} success rate
          </span>
        </div>
      </div>

      {/* In Progress Card */}
      <div className={styles.card}>
        <div className={`${styles.iconWrapper} ${styles.inProgressIcon}`}>
          <Clock size={20} strokeWidth={2.5} />
        </div>
        <div className={styles.content}>
          <span className={styles.title}>In Progress</span>
          <span className={styles.value}>{inProgressCount}</span>
          <span className={`${styles.subtext} ${styles.trendLink}`}>
            {inProgressCount} active transfers
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
          <span className={styles.value}>{failedCount}</span>
          <span className={`${styles.subtext} ${styles.failedLink}`}>
            {failedCount} failed attempts
          </span>
        </div>
      </div>
    </div>
  );
}
