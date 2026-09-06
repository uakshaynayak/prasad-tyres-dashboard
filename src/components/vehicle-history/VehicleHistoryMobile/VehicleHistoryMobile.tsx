"use client";

import { useState } from "react";
import type { VehicleData } from "../VehicleHistoryDesktop/VehicleHistoryDesktop";
import { VEHICLE_DB } from "../VehicleHistoryDesktop/VehicleHistoryDesktop";
import styles from "./VehicleHistoryMobile.module.css";

// ── Timeline dot colors ────────────────────────────────────────
// green = payment, navy = delivery, gray = received

type TimelineColor = "green" | "navy" | "gray";

function getTimelineColor(action: VehicleData["activityLog"][number]["action"]): TimelineColor {
  if (action === "Payment Received")   return "green";
  if (action === "Tyres Delivered")    return "navy";
  return "gray";
}

function TimelineDot({ color }: { color: TimelineColor }) {
  const bg = color === "green" ? "#16a34a" : color === "navy" ? "#0f4c81" : "#94a3b8";
  return (
    <span className={styles.dot} style={{ background: bg }} aria-hidden="true" />
  );
}

function ActionIcon({ action }: { action: VehicleData["activityLog"][number]["action"] }) {
  const color: TimelineColor = getTimelineColor(action);
  const bg = color === "green" ? "#f0fdf4" : color === "navy" ? "#eff6ff" : "#f1f5f9";
  const fg = color === "green" ? "#16a34a" : color === "navy" ? "#0f4c81" : "#64748b";

  return (
    <span className={styles.actionIcon} style={{ background: bg, color: fg }}>
      {action === "Payment Received" ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ) : action === "Tyres Delivered" ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 3h15l3 4.5V17H1V3z" /><circle cx="5.5" cy="17.5" r="2.5" /><circle cx="14.5" cy="17.5" r="2.5" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      )}
    </span>
  );
}

// ── Component ──────────────────────────────────────────────────

export function VehicleHistoryMobile() {
  const [query, setQuery] = useState("KA-19-ME-5544");
  const [vehicle, setVehicle] = useState<VehicleData>(VEHICLE_DB["KA-19-ME-5544"]);
  const [notFound, setNotFound] = useState(false);

  function handleSearch() {
    const key = query.trim().toUpperCase();
    const found = VEHICLE_DB[key];
    if (found) {
      setVehicle(found);
      setNotFound(false);
    } else {
      setNotFound(true);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch();
  }

  const s = vehicle?.stats;

  return (
    <div className={styles.root}>
      {/* Search */}
      <div className={styles.searchRow}>
        <input
          type="text"
          className={styles.searchInput}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setNotFound(false); }}
          onKeyDown={handleKeyDown}
          placeholder="Enter vehicle number..."
        />
        <button className={styles.searchBtn} onClick={handleSearch}>Search</button>
      </div>

      {notFound && (
        <div className={styles.notFound}>Vehicle &ldquo;{query.trim().toUpperCase()}&rdquo; not found.</div>
      )}

      {vehicle && (
        <>
          {/* Vehicle summary card */}
          <div className={styles.vehicleCard}>
            <div className={styles.vehicleTop}>
              <div>
                <p className={styles.vehicleNumber}>{vehicle.vehicleNumber}</p>
                <p className={styles.vehicleModel}>{vehicle.model}</p>
              </div>
              <span className={styles.activeBadge}>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 6.5l3 3 5-5" stroke="#16a34a" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Active
              </span>
            </div>

            <hr className={styles.divider} />

            <div className={styles.metricsRow}>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Total Tyres</span>
                <span className={styles.metricValue}>{s.totalReceived}</span>
              </div>
              <div className={[styles.metric, styles.metricCenter].join(" ")}>
                <span className={styles.metricLabel}>Pending</span>
                <span className={[styles.metricValue, styles.metricAmber].join(" ")}>{s.pendingAtCentre}</span>
              </div>
              <div className={[styles.metric, styles.metricRight].join(" ")}>
                <span className={styles.metricLabel}>Balance</span>
                <span className={[styles.metricValue, styles.metricRed].join(" ")}>{s.outstandingBalance}</span>
              </div>
            </div>
          </div>

          {/* Activity timeline */}
          <p className={styles.timelineHeading}>Activity Timeline</p>

          <div className={styles.timeline}>
            {vehicle.activityLog.map((entry, idx) => {
              const color = getTimelineColor(entry.action);
              const isLast = idx === vehicle.activityLog.length - 1;
              return (
                <div key={entry.id} className={styles.timelineItem}>
                  {/* Left: dot + connector */}
                  <div className={styles.dotCol}>
                    <TimelineDot color={color} />
                    {!isLast && <span className={styles.connector} />}
                  </div>

                  {/* Right: card */}
                  <div className={styles.timelineCard}>
                    <div className={styles.cardTop}>
                      <div className={styles.cardLeft}>
                        <ActionIcon action={entry.action} />
                        <div>
                          <p className={styles.cardAction}>{entry.action}</p>
                          <p className={styles.cardDetails}>{entry.details}</p>
                        </div>
                      </div>
                      <div className={styles.cardRight}>
                        {entry.amount !== "—" ? (
                          <span className={entry.isPayment ? styles.amountPayment : styles.amountNeutral}>
                            {entry.isPayment ? "+" : ""}{entry.amount}
                          </span>
                        ) : entry.status ? (
                          <span className={[styles.tlBadge, styles[`tlBadge--${entry.status.toLowerCase()}`]].join(" ")}>
                            {entry.status === "Pending" ? "Pending Pay" : entry.status}
                          </span>
                        ) : null}
                        <span className={styles.cardDate}>{entry.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
